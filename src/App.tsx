import React, { useRef, useEffect, useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { useCameraController } from './hooks/useCameraController';
import { ArcadeMachine3D } from './components/ArcadeMachine3D';
import { GameUI } from './components/GameUI';
import { SimpleReactIsland } from './components/SimpleReactIsland';
import { GameSelector } from './components/GameSelector';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { gameState, initGame, switchGameMode, resetGame, nextLevel } = useGameLogic();
  const { cameraState, switchToOverview, switchToGameplay } = useCameraController();
  const [showReactIsland, setShowReactIsland] = useState(true);

  // 初始化遊戲
  useEffect(() => {
    initGame('pacman');
  }, [initGame]);

  // 處理React小島的遊戲狀態變化
  const handleReactGameStateChange = (reactGameState: any) => {
    console.log('⚛️ React小島遊戲狀態變化:', reactGameState);
  };

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

      {/* React TypeScript 小島 */}
      {showReactIsland && (
        <SimpleReactIsland
          onGameStateChange={handleReactGameStateChange}
        />
      )}

      {/* 切換React小島顯示的按鈕 */}
      <div className="react-island-toggle">
        <button 
          onClick={() => setShowReactIsland(!showReactIsland)}
          className="toggle-react-btn"
        >
          {showReactIsland ? '⚛️ 隱藏 React 小島' : '⚛️ 顯示 React 小島'}
        </button>
      </div>
    </div>
  );
};

export default App;
