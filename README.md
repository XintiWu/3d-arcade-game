# 🎮 3D 街機遊戲

點擊網址：**https://xintiwu.github.io/3d-arcade-game/**

一個使用 React、TypeScript 和 Three.js 製作的 3D 街機遊戲，包含貪食蛇、吃豆人和太空侵略者三種遊戲。

## 遊戲介紹

- **3D 街機模型**：使用 Three.js 渲染的 3D 街機機器
- **三種遊戲模式**：
  - 🍒 **Pacman**：控制吃豆人收集 CHLOE 字母豆子
  - 👾 **Space Invaders**：射擊消滅 XINTI 侵略者
  - 🐍 **Snake**：控制貪食蛇吃紅蘋果升級尾巴
- **多關卡系統**：每種遊戲都有 10 個關卡，難度遞增
- **視角切換**：支援概覽模式和遊戲模式視角

## 🚀 快速開始

### 環境要求

- Node.js 16.0 或更高版本 (前往 [https://nodejs.org](https://nodejs.org) 下載並安裝)
- npm 或 yarn

## 🚀 快速開始

### 最快的方法：用cursor打開，請他幫你運行這個專案

### 方法一：使用 Vite 開發服務器
```bash
# 1. 下載專案
git clone https://github.com/XintiWu/wp1141.git
cd wp1141/hw2

# 2. 安裝依賴
npm install

# 3. 啟動遊戲
npm run dev

# 4. 開啟瀏覽器
# 訪問顯示的本地地址 (通常是 http://localhost:5173)
```
### 方法二：使用 Live Server 
1. 下載專案到本地
2. 使用 VS Code 的 Live Server 擴展，或任何靜態文件服務器
3. 直接打開 `index.html` 檔案
4. 訪問 `http://127.0.0.1:5500/` 或類似地址

## 🎮 遊戲操作

- **旋轉街機**：按住滑鼠左鍵拖拽
- **進入遊戲**：點擊街機螢幕
- **退出遊戲**：ESC 鍵
- **切換遊戲**：G 鍵

- **A/D 或 ←/→**：左右移動
- **W/S 或 ↑/↓**：上下移動
- **空白鍵**：射擊（Space Invaders）
- **ESC**：退出遊戲

### 貪食蛇
- 移動：方向鍵或 WASD、H鍵重新開始
- 目標：吃蘋果讓蛇變長，不要咬到自己尾巴和撞到邊界

### 吃豆人
- 移動：方向鍵或 WASD
- 目標：收集所有 CHLOE 字母豆子

### 太空侵略者
- 移動：A/D 鍵或方向鍵
- 射擊：空白鍵
- 目標：消滅所有 XINTI 侵略者

## 📋 系統需求

- Node.js 16.0 或更高版本 (僅 Vite 方法需要)
- 支援 WebGL 的現代瀏覽器
- 靜態文件服務器 (Live Server 方法)

## 🔧 故障排除

如果遇到問題：
1. 確保瀏覽器支援 WebGL
2. 檢查瀏覽器控制台是否有錯誤
3. 確保所有檔案都在正確位置
4. 如果使用 Vite：確保 Node.js 版本正確
5. 清除快取：`npm cache clean --force`
6. 重新安裝：`rm -rf node_modules && npm install`

---

**祝您遊戲愉快！** 🎮
打不開的話請聯絡我 xinti0331@gmail.com 
