import React from 'react';

interface GameSelectorProps {
  currentGame: 'pacman' | 'space_invaders' | 'snake';
  onGameSelect: (game: 'pacman' | 'space_invaders' | 'snake') => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  currentGame,
  onGameSelect,
}) => {
  const games = [
    {
      id: 'pacman' as const,
      name: 'Pacman',
      emoji: '🍒',
      description: '吃豆人'
    },
    {
      id: 'space_invaders' as const,
      name: 'Space Invaders',
      emoji: '👾',
      description: '太空侵略者'
    },
    {
      id: 'snake' as const,
      name: 'Snake',
      emoji: '🐍',
      description: '貪食蛇'
    }
  ];

  return (
    <div className="game-selector">
      <div className="game-selector-header">
        <h3>🎮 選擇遊戲</h3>
      </div>
      <div className="game-selector-buttons">
        {games.map((game) => (
          <button
            key={game.id}
            className={`game-selector-btn ${currentGame === game.id ? 'active' : ''}`}
            onClick={() => onGameSelect(game.id)}
            title={game.description}
          >
            <span className="game-emoji">{game.emoji}</span>
            <span className="game-name">{game.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

