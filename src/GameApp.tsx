import React, { useRef, useEffect, useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { useCameraController } from './hooks/useCameraController';
import { ArcadeMachine3D } from './components/ArcadeMachine3D';
import { GameUI } from './components/GameUI';
import { GameSelector } from './components/GameSelector';

const GameApp: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { gameState, initGame, switchGameMode, resetGame, nextLevel } = useGameLogic();
  const { cameraState, switchToOverview, switchToGameplay } = useCameraController();
  const [isLoading, setIsLoading] = useState(true);

  // 初始化遊戲
  useEffect(() => {
    console.log('🎮 初始化遊戲...');
    initGame('pacman');
    setIsLoading(false);
  }, [initGame]);

  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '40px',
          borderRadius: '15px',
          border: '2px solid #10b981',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#10b981', marginBottom: '20px' }}>
            ⚛️ 載入中...
          </h1>
          <p>正在初始化3D遊戲機...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* 主要的3D街機遊戲 */}
      <div ref={containerRef} className="arcade-container" />
      <ArcadeMachine3D 
        gameState={gameState}
        cameraState={cameraState}
        containerRef={containerRef}
      />
      <GameUI
        gameState={gameState}
        onSwitchGameMode={switchGameMode}
        onResetGame={resetGame}
        onNextLevel={nextLevel}
        onSwitchToOverview={switchToOverview}
        onSwitchToGameplay={switchToGameplay}
      />
      
      {/* 遊戲選擇面板 */}
      <GameSelector
        currentGame={gameState.gameMode}
        onGameSelect={switchGameMode}
      />
    </div>
  );
};

export default GameApp;
