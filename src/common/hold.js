// 自己实现“长按”：touchstart 起计时，按满 HOLD_MS 触发；提前松手或手指移出 MOVE_PX 则取消。
// 系统的 onlongpress 在模拟器上不触发，故不用它。
// 用法：模板里 ontouchstart / ontouchmove / ontouchend 分别调 holdStart / holdMove / holdCancel，
// 页面 onHide / onDestroy 里也要调 holdCancel，防止离开页面后计时器照样触发。
const HOLD_MS = 800
const MOVE_PX = 12

function point(e) {
  const t = e && e.touches && e.touches[0]
  return t ? { x: t.clientX, y: t.clientY } : null
}

export function holdStart(vm, flag, e, action) {
  holdCancel(vm, flag)
  vm[flag] = true
  vm['_' + flag + 'At'] = point(e)
  vm['_' + flag] = setTimeout(() => {
    vm['_' + flag] = null
    vm[flag] = false
    action()
  }, HOLD_MS)
}

// 手指轻微抖动不算移开
export function holdMove(vm, flag, e) {
  const a = vm['_' + flag + 'At']
  const b = point(e)
  if (!a || !b) return
  if (Math.abs(b.x - a.x) > MOVE_PX || Math.abs(b.y - a.y) > MOVE_PX) holdCancel(vm, flag)
}

export function holdCancel(vm, flag) {
  if (vm['_' + flag]) clearTimeout(vm['_' + flag])
  vm['_' + flag] = null
  vm[flag] = false
}
