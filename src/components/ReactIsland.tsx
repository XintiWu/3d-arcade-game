import React, { useRef, useEffect, useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { useCameraController } from '../hooks/useCameraController';

interface ReactIslandProps {
  onGameStateChange?: (gameState: any) => void;
}

export const ReactIsland: React.FC<ReactIslandProps> = ({ onGameStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { gameState, switchGameMode, resetGame } = useGameLogic();
  const { switchToOverview, switchToGameplay } = useCameraController();

  // 遊戲畫布尺寸
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 300;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 初始化畫布
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // 繪製初始畫面
    drawGame(ctx);

    // 通知父組件遊戲狀態變化
    if (onGameStateChange) {
      onGameStateChange(gameState);
    }
  }, [gameState, onGameStateChange]);

  // 繪製遊戲畫面
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // 清空畫布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState.gameMode === 'pacman' && gameState.pacman) {
      drawPacmanGame(ctx);
    } else if (gameState.gameMode === 'space_invaders' && gameState.spaceInvaders) {
      drawSpaceInvadersGame(ctx);
    } else {
      drawDefaultScreen(ctx);
    }
  };

  // 繪製預設畫面
  const drawDefaultScreen = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚛️ React TypeScript', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.fillText('遊戲小島', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('選擇遊戲模式開始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  };

  // 繪製 Pacman 遊戲
  const drawPacmanGame = (ctx: CanvasRenderingContext2D) => {
    const pacman = gameState.pacman!;
    
    // 背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 繪製點點
    pacman.dots.forEach(dot => {
      if (!dot.eaten) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // 繪製字母
        ctx.fillStyle = '#FFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCharCode(dot.letter), dot.x, dot.y + 5);
      }
    });

    // 繪製 Pacman
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // 繪製嘴巴
    if (pacman.mouthOpen) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pacman.x, pacman.y, 15, pacman.direction * Math.PI / 2 - 0.3, pacman.direction * Math.PI / 2 + 0.3);
      ctx.lineTo(pacman.x, pacman.y);
      ctx.fill();
    }

    // 繪製UI
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`React 分數: ${gameState.score}`, 10, 25);
  };

  // 繪製 Space Invaders 遊戲
  const drawSpaceInvadersGame = (ctx: CanvasRenderingContext2D) => {
    const spaceInvaders = gameState.spaceInvaders!;
    
    // 背景
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 繪製星星
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 23) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // 繪製侵略者
    spaceInvaders.invaders.forEach(invader => {
      if (invader.alive) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(invader.x - 10, invader.y - 8, 20, 16);

        // 繪製字母
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCharCode(invader.letter), invader.x, invader.y + 3);
      }
    });

    // 繪製玩家
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(spaceInvaders.player.x - 15, spaceInvaders.player.y - 5, 30, 10);

    // 繪製子彈
    ctx.fillStyle = '#FFFF00';
    spaceInvaders.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x - 2, bullet.y - 5, 4, 10);
    });

    // 繪製爆炸效果
    ctx.fillStyle = '#FF6B6B';
    spaceInvaders.explosions.forEach(explosion => {
      ctx.globalAlpha = explosion.opacity;
      ctx.fillRect(explosion.x - 10, explosion.y - 10, 20, 20);
      ctx.globalAlpha = 1;
    });

    // 繪製UI
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`React 分數: ${gameState.score}`, 10, 25);
  };

  const handleSwitchToPacman = () => {
    switchGameMode('pacman');
  };

  const handleSwitchToSpaceInvaders = () => {
    switchGameMode('space_invaders');
  };

  const handleResetGame = () => {
    resetGame();
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <div className="react-island-minimized">
        <button 
          onClick={toggleVisibility}
          className="react-toggle-btn"
        >
          ⚛️ 顯示 React 小島
        </button>
      </div>
    );
  }

  return (
    <div className="react-island">
      <div className="react-island-header">
        <h3>⚛️ React TypeScript 遊戲小島</h3>
        <button 
          onClick={toggleVisibility}
          className="react-minimize-btn"
        >
          ✕
        </button>
      </div>
      
      <div className="react-canvas-container">
        <canvas 
          ref={canvasRef}
          className="react-game-canvas"
        />
      </div>
      
      <div className="react-controls">
        <button 
          className={`react-btn ${gameState.gameMode === 'pacman' ? 'active' : ''}`}
          onClick={handleSwitchToPacman}
        >
          🍒 React Pacman
        </button>
        <button 
          className={`react-btn ${gameState.gameMode === 'space_invaders' ? 'active' : ''}`}
          onClick={handleSwitchToSpaceInvaders}
        >
          👾 React Space Invaders
        </button>
        <button 
          className="react-btn"
          onClick={handleResetGame}
        >
          🔄 重置遊戲
        </button>
      </div>
      
      <div className="react-game-stats">
        <div className="stat-item">
          <span className="stat-label">遊戲狀態:</span>
          <span className="stat-value">{gameState.gameCompleted ? '完成' : '進行中'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">分數:</span>
          <span className="stat-value">{gameState.score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">生命:</span>
          <span className="stat-value">{gameState.lives}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">模式:</span>
          <span className="stat-value">
            {gameState.gameMode === 'pacman' ? '🍒 Pacman' : '👾 Space Invaders'}
          </span>
        </div>
      </div>
    </div>
  );
};
