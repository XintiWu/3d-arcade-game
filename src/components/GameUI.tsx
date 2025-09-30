import React from 'react';
import { GameState } from '../types/game';

interface GameUIProps {
  gameState: GameState;
  onSwitchGameMode: (mode: 'pacman' | 'space_invaders' | 'snake') => void;
  onResetGame: () => void;
  onNextLevel: () => void;
  onSwitchToOverview: () => void;
  onSwitchToGameplay: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  onSwitchGameMode,
  onResetGame,
  onNextLevel,
  onSwitchToOverview,
  onSwitchToGameplay,
}) => {
  return (
    <div className="game-ui">
      {/* 遊戲信息面板 */}
      <div className="game-info">
        <h2>🎮 3D街機遊戲</h2>
        <div className="stats">
          <div className="stat">
            <span className="label">分數:</span>
            <span className="value">{gameState.score}</span>
          </div>
          <div className="stat">
            <span className="label">生命:</span>
            <span className="value">{gameState.lives}</span>
          </div>
          <div className="stat">
            <span className="label">關卡:</span>
            <span className="value">{gameState.currentLevel} / {gameState.maxLevel}</span>
          </div>
          <div className="stat">
            <span className="label">模式:</span>
            <span className="value">
              {gameState.gameMode === 'pacman' ? '🍒 Pacman' : 
               gameState.gameMode === 'space_invaders' ? '👾 Space Invaders' : '🐍 Snake'}
            </span>
          </div>
          {gameState.gameMode === 'snake' && gameState.snake && (
            <div className="stat">
              <span className="label">蛇身長度:</span>
              <span className="value">{gameState.snake.snake.length} / 20</span>
            </div>
          )}
        </div>
      </div>

      {/* 遊戲控制按鈕 */}
      <div className="game-controls">
        <h3>🎯 遊戲控制</h3>
        <div className="control-buttons">
          <button
            className={`game-mode-btn ${gameState.gameMode === 'pacman' ? 'active' : ''}`}
            onClick={() => onSwitchGameMode('pacman')}
          >
            🍒 Pacman
          </button>
          <button
            className={`game-mode-btn ${gameState.gameMode === 'space_invaders' ? 'active' : ''}`}
            onClick={() => onSwitchGameMode('space_invaders')}
          >
            👾 Space Invaders
          </button>
          <button
            className={`game-mode-btn ${gameState.gameMode === 'snake' ? 'active' : ''}`}
            onClick={() => onSwitchGameMode('snake')}
          >
            🐍 Snake
          </button>
          <button className="reset-btn" onClick={onResetGame}>
            🔄 重置遊戲
          </button>
        </div>
      </div>

      {/* 視角控制 */}
      <div className="camera-controls">
        <h3>📷 視角控制</h3>
        <div className="camera-buttons">
          <button className="camera-btn" onClick={onSwitchToOverview}>
            🌍 概覽模式
          </button>
          <button className="camera-btn" onClick={onSwitchToGameplay}>
            🎮 遊戲模式
          </button>
        </div>
      </div>

      {/* 遊戲說明 */}
      <div className="game-instructions">
        <h3>遊戲說明：</h3>
        <div className="instructions-content">
          <div className="general-instructions">
            <p>• 按著左鍵可旋轉遊戲機</p>
            <p>• 點擊遊戲機進入遊戲</p>
          </div>
          
          <div className="game-specific-instructions">
            <p>• 貪食蛇：吃蘋果讓蛇變長 不要咬到自己和撞到邊界</p>
            <p>• 吃豆人：控制方向吃完CHLOE豆子</p>
            <p>• 太空侵略者：空白鍵發射子彈 消滅XINTI侵略者</p>
          </div>
        </div>
      </div>

      {/* 關卡完成狀態 */}
      {gameState.levelCompleted && (
        <div className="level-completed">
          <h2>🎉 恭喜完成第 {gameState.currentLevel} 關！</h2>
          <p>當前分數: {gameState.score}</p>
          <p>調試: levelCompleted = {gameState.levelCompleted.toString()}</p>
          {gameState.currentLevel < gameState.maxLevel ? (
            <div className="level-actions">
              <button className="next-level-btn" onClick={onNextLevel}>
                🚀 進入下一關 (第 {gameState.currentLevel + 1} 關)
              </button>
              <button className="restart-btn" onClick={onResetGame}>
                🔄 重新開始
              </button>
            </div>
          ) : (
            <div className="game-completed">
              <h3>🏆 恭喜完成所有關卡！</h3>
              <p>最終分數: {gameState.score}</p>
              <button className="restart-btn" onClick={onResetGame}>
                🎮 重新開始
              </button>
            </div>
          )}
        </div>
      )}

      {/* 遊戲完成狀態 */}
      {gameState.gameCompleted && (
        <div className="game-completed">
          <h2>🏆 恭喜完成所有關卡！</h2>
          <p>最終分數: {gameState.score}</p>
          <button className="restart-btn" onClick={onResetGame}>
            🎮 重新開始
          </button>
        </div>
      )}
    </div>
  );
};
