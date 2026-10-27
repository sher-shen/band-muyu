# 功德木鱼（小米手环 Vela 快应用）

敲木鱼计数：今日 / 总计、长按清零、按天记录历史（零点自动切换）。

## 目录
- `src/manifest.json` 应用配置（包名 com.zw.muyu，designWidth 336）
- `src/pages/index` 主页：今日/总计、木鱼、长按清零、历史入口
- `src/pages/history` 每日历史：返回按钮 / 右滑返回、长按清空历史
- `src/common/store.js` 存储（today / history，读写串行队列，跨零点惰性归档）
- `src/common/hold.js` 自制长按（800ms，移动超 12px 取消）
- `src/common/muyu.png` 木鱼图（220×170，透明底）

## 常用命令
- `npm install` 安装工具链（aiot-toolkit 2.0.5）
- `npx aiot build` 打包 → `dist/com.zw.muyu.debug.<版本>.rpk`
- `./run-emu.sh [pages/history]` 重启模拟器加载最新代码并截图到 `shot/latest.png`
  （模拟器 Vela_Band：vela-watch-5.0，336×480，装在 `~/.vela`，约 2.9GB）

## 装到手环
用 AstroBox（github.com/AstralSightStudios/AstroBox-NG）蓝牙连接手环，导入 dist 下的 .rpk 安装。
需要手环的 authkey，按 AstroBox / BandBBS 教程获取。

## 注意
- 震动只能在真机上验证，模拟器没有。
- 数据只存在手环本地，不同步到小米运动健康。
