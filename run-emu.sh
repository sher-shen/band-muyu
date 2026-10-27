#!/bin/bash
# 重启 Vela 模拟器并加载最新代码，截图存到 shot/latest.png
# 用法：./run-emu.sh [起始页，如 pages/history]
# （aiot start --watch 在本机启动后会因调试通道超时崩掉，所以每次改完整体重启）
cd "$(dirname "$0")"
LOG=/tmp/band-muyu-emu.log
pkill -f "aiot start"; pkill -f qemu-system-armel; sleep 2
rm -f "$LOG"
# aiot start 会弹交互选择，喂几个回车选默认，并保持 stdin 不关闭
(printf '\n\n\n'; exec tail -f /dev/null) | npx aiot start ${1:+--start-page "$1"} > "$LOG" 2>&1 &

for i in $(seq 1 120); do
  grep -q "Add package_name: com.zw.muyu" "$LOG" 2>/dev/null && break
  if [ "$i" = 120 ]; then echo "启动超时，看日志：$LOG"; exit 1; fi
  sleep 1
done
sleep 15   # 等页面渲染完（10 秒偶尔还是黑屏）

mkdir -p shot && rm -f shot/*.png
(printf "auth $(cat ~/.emulator_console_auth_token)\r\nscreenrecord screenshot $PWD/shot\r\n"; sleep 2; printf "quit\r\n") | nc 127.0.0.1 5554 >/dev/null
mv shot/Screenshot_*.png shot/latest.png && echo "screenshot: $PWD/shot/latest.png"
