import React, { useState } from 'react';

const SimpleApp: React.FC = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('React應用正在運行！');

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '40px',
        borderRadius: '15px',
        border: '2px solid #10b981',
        textAlign: 'center',
        minWidth: '400px'
      }}>
        <h1 style={{ color: '#10b981', marginBottom: '20px' }}>
          ⚛️ React TypeScript 遊戲
        </h1>
        
        <p style={{ marginBottom: '20px', fontSize: '18px' }}>
          {message}
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <p>計數器: {count}</p>
          <button
            onClick={() => setCount(count + 1)}
            style={{
              background: 'rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              border: '2px solid #10b981',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              margin: '0 10px'
            }}
          >
            +1
          </button>
          <button
            onClick={() => setCount(0)}
            style={{
              background: 'rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              margin: '0 10px'
            }}
          >
            重置
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setMessage('🍒 Pacman 模式啟動！')}
            style={{
              background: 'rgba(255, 215, 0, 0.3)',
              color: '#ffd700',
              border: '2px solid #ffd700',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              margin: '0 5px'
            }}
          >
            🍒 Pacman
          </button>
          <button
            onClick={() => setMessage('👾 Space Invaders 模式啟動！')}
            style={{
              background: 'rgba(59, 130, 246, 0.3)',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              margin: '0 5px'
            }}
          >
            👾 Space Invaders
          </button>
        </div>
        
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          padding: '15px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>狀態:</strong> React應用正常運行
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>時間:</strong> {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;
