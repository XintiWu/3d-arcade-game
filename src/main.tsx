import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 設置React應用已載入的標記
(window as any).ReactAppLoaded = true;
console.log('⚛️ React應用開始載入...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('✅ React應用載入完成！');
