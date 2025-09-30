import React, { useRef, useEffect, useState } from 'react';

interface SimpleReactIslandProps {
  onGameStateChange?: (gameState: any) => void;
}

export const SimpleReactIsland: React.FC<SimpleReactIslandProps> = ({ onGameStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [gameMode, setGameMode] = useState<'pacman' | 'space_invaders'>('pacman');
  const [score, setScore] = useState(0);

  // 繪製遊戲畫面
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製遊戲內容
    if (gameMode === 'pacman') {
      drawPacmanGame(ctx);
    } else {
      drawSpaceInvadersGame(ctx);
    }

    // 繪製UI
    drawUI(ctx);

    // 通知父組件
    if (onGameStateChange) {
      onGameStateChange({ gameMode, score, lives: 3 });
    }
  }, [gameMode, score, onGameStateChange]);

  const drawPacmanGame = (ctx: CanvasRenderingContext2D) => {
    // 繪製Pacman
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(200, 150, 20, 0, Math.PI * 2);
    ctx.fill();

    // 繪製一些點
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(50 + i * 30, 100, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawSpaceInvadersGame = (ctx: CanvasRenderingContext2D) => {
    // 繪製太空侵略者
    ctx.fillStyle = '#FF0000';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(100 + i * 40, 100, 20, 20);
    }

    // 繪製玩家
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(190, 250, 20, 10);
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Mode: ${gameMode.toUpperCase()}`, 10, 40);
  };

  const handleSwitchMode = () => {
    setGameMode(prev => prev === 'pacman' ? 'space_invaders' : 'pacman');
  };

  const handleResetGame = () => {
    setScore(0);
  };

  const handleAddScore = () => {
    setScore(prev => prev + 10);
  };

  if (isMinimized) {
    return (
      <div className="react-island-minimized">
        <button className="react-toggle-btn" onClick={() => setIsMinimized(false)}>
          ⚛️ 顯示 React 小島
        </button>
      </div>
    );
  }

  return (
    <div className="react-island">
      <div className="react-island-header">
        <h3>⚛️ React 遊戲小島</h3>
        <button className="react-minimize-btn" onClick={() => setIsMinimized(true)}>
          —
        </button>
      </div>
      
      <div className="react-canvas-container">
        <canvas ref={canvasRef} width="400" height="300" className="react-game-canvas" />
      </div>
      
      <div className="react-controls">
        <button
          className={`react-btn ${gameMode === 'pacman' ? 'active' : ''}`}
          onClick={() => setGameMode('pacman')}
        >
          🍒 Pacman
        </button>
        <button
          className={`react-btn ${gameMode === 'space_invaders' ? 'active' : ''}`}
          onClick={() => setGameMode('space_invaders')}
        >
          👾 Space Invaders
        </button>
        <button className="react-btn" onClick={handleResetGame}>
          🔄 Reset Game
        </button>
        <button className="react-btn" onClick={handleAddScore}>
          ➕ Add Score
        </button>
      </div>
      
      <div className="react-game-stats">
        <div className="stat-item">
          <span className="stat-label">模式:</span> 
          <span className="stat-value">{gameMode.toUpperCase()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">分數:</span> 
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">生命:</span> 
          <span className="stat-value">3</span>
        </div>
      </div>
    </div>
  );
};
