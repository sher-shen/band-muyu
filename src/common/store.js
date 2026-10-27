// 数据持久化：
//   today   = { date: 'YYYY-MM-DD', count: N }   当天计数
//   history = { 'YYYY-MM-DD': N, ... }           以前每天的最终计数
// 不依赖后台定时器：每次读写时比较日期，跨过零点就把旧数值归档并清零。
// 所有读写排进同一个队列串行执行，避免快速连敲 / 跨零点时读到旧值或写乱序。
import storage from '@system.storage'

let queue = Promise.resolve()

function enqueue(job) {
  const p = queue.then(job)
  queue = p.catch(() => {})
  return p
}

export function todayStr() {
  const d = new Date()
  const pad = n => (n < 10 ? '0' + n : '' + n)
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

function rawGet(key, fallback) {
  return new Promise(resolve => {
    storage.get({
      key,
      default: '',
      success: data => {
        try {
          resolve(data ? JSON.parse(data) : fallback)
        } catch (e) {
          resolve(fallback)
        }
      },
      fail: () => resolve(fallback)
    })
  })
}

function rawSet(key, value) {
  return new Promise(resolve => {
    storage.set({
      key,
      value: JSON.stringify(value),
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

// 读当天记录；若日期已变，归档旧日并返回新的一天
export function loadToday() {
  return enqueue(async () => {
    const now = todayStr()
    const today = await rawGet('today', { date: now, count: 0 })
    if (today.date === now) return today

    const history = await rawGet('history', {})
    if (today.count > 0) history[today.date] = today.count
    await rawSet('history', history)

    const fresh = { date: now, count: 0 }
    await rawSet('today', fresh)
    return fresh
  })
}

export function saveToday(today) {
  return enqueue(() => rawSet('today', today))
}

// 返回 [{date, count}]，最新在前，含今天
export async function loadHistory() {
  const today = await loadToday()
  const history = await enqueue(() => rawGet('history', {}))
  const list = Object.keys(history)
    .sort()
    .reverse()
    .map(date => ({ date, count: Number(history[date]) || 0 }))
  list.unshift({ date: today.date + '（今天）', count: today.count })
  return list
}

// 总计 = 历史各天之和 + 今天
export async function loadTotal(today) {
  const history = await enqueue(() => rawGet('history', {}))
  let sum = today.count
  Object.keys(history).forEach(k => (sum += Number(history[k]) || 0))
  return sum
}

export function clearHistory() {
  return enqueue(() => rawSet('history', {}))
}
