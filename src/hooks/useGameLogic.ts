import { useState, useEffect, useCallback } from 'react';
import { GameState, PacmanState, SpaceInvadersState, SnakeState, Dot, Invader, SnakeSegment } from '../types/game';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    gameMode: 'pacman',
    score: 0,
    lives: 3,
    gameWidth: 800,
    gameHeight: 600,
    gameCompleted: false,
    currentLevel: 1,
    maxLevel: 10,
    levelCompleted: false,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false,
    },
  });

  // 初始化遊戲
  const initGame = useCallback((mode: 'pacman' | 'space_invaders' | 'snake', level: number = 1) => {
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      score: 0,
      lives: 3,
      gameCompleted: false,
      currentLevel: level,
      levelCompleted: false,
      keys: {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false,
      },
      // 清除之前的遊戲狀態
      pacman: undefined,
      spaceInvaders: undefined,
      snake: undefined,
    }));

    if (mode === 'pacman') {
      initPacmanGame(level);
    } else if (mode === 'space_invaders') {
      initSpaceInvadersGame(level);
    } else {
      initSnakeGame(level);
    }
  }, []);

  // 初始化 Pacman 遊戲
  const initPacmanGame = useCallback((level: number = 1) => {
    const dots: Dot[] = [];
    const letters = 'CHLOE'.split(''); // 只使用 CHLOE 字母
    
    // 根據關卡調整難度
    const dotCount = Math.min(15 + level * 2, 25); // 每關增加2個點，最多25個
    const speed = 2 + level * 0.5; // 每關增加速度
    
    // 創建點點陣列，使用 CHLOE 字母循環
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        if (dots.length < dotCount) {
          dots.push({
            x: x * 40 + 20,
            y: y * 40 + 20,
            eaten: false,
            letter: letters[dots.length % letters.length]?.charCodeAt(0) || 67, // C
          });
        }
      }
    }
    
    console.log(`🍒 初始化 Pacman 遊戲，關卡 ${level}，點點數量: ${dots.length}`);

    const pacmanState: PacmanState = {
      x: 400,
      y: 300,
      direction: 0,
      nextDirection: 0,
      speed,
      mouthOpen: true,
      mouthTimer: 0,
      dots,
      level,
    };

    setGameState(prev => ({
      ...prev,
      pacman: pacmanState,
    }));
  }, []);

  // 初始化 Space Invaders 遊戲
  const initSpaceInvadersGame = useCallback((level: number = 1) => {
    const invaders: Invader[] = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    // 根據關卡調整難度
    const rows = Math.min(3 + level, 6); // 每關增加一行，最多6行
    const cols = Math.min(8 + level, 12); // 每關增加一列，最多12列
    
    // 創建外星人陣列
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        invaders.push({
          x: col * 60 + 100,
          y: row * 40 + 100,
          alive: true,
          letter: letters[row * cols + col]?.charCodeAt(0) || 65,
        });
      }
    }

    const spaceInvadersState: SpaceInvadersState = {
      invaders,
      player: { x: 400, y: 550 },
      bullets: [],
      invaderBullets: [],
      direction: 1,
      moveTimer: 0,
      shootTimer: 0,
      explosions: [],
      level,
    };

    setGameState(prev => ({
      ...prev,
      spaceInvaders: spaceInvadersState,
    }));
  }, []);

  // 初始化貪食蛇遊戲
  const initSnakeGame = useCallback((level: number = 1) => {
    const gridSize = 20;
    const initialSnake: SnakeSegment[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];

    // 根據關卡調整難度
    const speed = Math.min(1 + level * 0.2, 3); // 每關增加速度，最多3

    const snakeState: SnakeState = {
      snake: initialSnake,
      food: {
        x: Math.floor(Math.random() * (800 / gridSize)),
        y: Math.floor(Math.random() * (600 / gridSize)),
        letter: randomLetter.charCodeAt(0),
      },
      direction: 0, // 向右
      nextDirection: 0,
      speed,
      gameOver: false,
      gridSize,
      level,
      targetScore: 20, // 固定目標：讓蛇長到20節
    };

    setGameState(prev => ({
      ...prev,
      snake: snakeState,
    }));
  }, []);

  // 處理按鍵事件
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    setGameState(prev => ({
      ...prev,
      keys: {
        ...prev.keys,
        left: key === 'arrowleft' || key === 'a',
        right: key === 'arrowright' || key === 'd',
        up: key === 'arrowup' || key === 'w',
        down: key === 'arrowdown' || key === 's',
        space: key === ' ',
      },
    }));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    setGameState(prev => ({
      ...prev,
      keys: {
        ...prev.keys,
        left: key === 'arrowleft' || key === 'a' ? false : prev.keys.left,
        right: key === 'arrowright' || key === 'd' ? false : prev.keys.right,
        up: key === 'arrowup' || key === 'w' ? false : prev.keys.up,
        down: key === 'arrowdown' || key === 's' ? false : prev.keys.down,
        space: key === ' ' ? false : prev.keys.space,
      },
    }));
  }, []);

  // 更新遊戲狀態
  const updateGame = useCallback(() => {
    setGameState(prev => {
      // 如果關卡已完成，停止更新遊戲
      if (prev.levelCompleted) {
        return prev;
      }
      
      if (prev.gameMode === 'pacman' && prev.pacman) {
        return updatePacmanGame(prev);
      } else if (prev.gameMode === 'space_invaders' && prev.spaceInvaders) {
        return updateSpaceInvadersGame(prev);
      } else if (prev.gameMode === 'snake' && prev.snake) {
        return updateSnakeGame(prev);
      }
      return prev;
    });
  }, []);

  // 更新 Pacman 遊戲
  const updatePacmanGame = (prev: GameState): GameState => {
    if (!prev.pacman) return prev;

    const pacman = { ...prev.pacman };
    
    // 更新嘴巴動畫
    pacman.mouthTimer += 0.1;
    pacman.mouthOpen = Math.sin(pacman.mouthTimer) > 0;

    // 移動 Pacman
    if (prev.keys.left && pacman.x > 0) {
      pacman.x -= pacman.speed;
      pacman.direction = 2;
    }
    if (prev.keys.right && pacman.x < prev.gameWidth - 20) {
      pacman.x += pacman.speed;
      pacman.direction = 0;
    }
    if (prev.keys.up && pacman.y > 0) {
      pacman.y -= pacman.speed;
      pacman.direction = 3;
    }
    if (prev.keys.down && pacman.y < prev.gameHeight - 20) {
      pacman.y += pacman.speed;
      pacman.direction = 1;
    }

    // 檢查點點碰撞
    let dotsEatenThisFrame = 0;
    pacman.dots = pacman.dots.map(dot => {
      if (!dot.eaten && 
          Math.abs(pacman.x - dot.x) < 15 && 
          Math.abs(pacman.y - dot.y) < 15) {
        dotsEatenThisFrame++;
        return { ...dot, eaten: true };
      }
      return dot;
    });

    // 檢查是否完成關卡
    const remainingDots = pacman.dots.filter(dot => !dot.eaten).length;
    const eatenDots = pacman.dots.filter(dot => dot.eaten).length;
    const levelCompleted = remainingDots === 0;

    // 如果這幀吃到了點點，立即更新分數
    const newScore = eatenDots * 10;

    // 調試信息
    if (dotsEatenThisFrame > 0) {
      console.log(`🍒 吃到了 ${dotsEatenThisFrame} 個點點，剩餘: ${remainingDots}，完成: ${levelCompleted}`);
    }
    
    // 每10幀輸出一次狀態
    if (Math.floor(Date.now() / 100) % 10 === 0) {
      console.log(`🍒 遊戲狀態 - 剩餘點點: ${remainingDots}，已完成: ${levelCompleted}，分數: ${newScore}`);
    }

    return {
      ...prev,
      pacman,
      score: newScore,
      levelCompleted,
    };
  };

  // 更新 Space Invaders 遊戲
  const updateSpaceInvadersGame = (prev: GameState): GameState => {
    if (!prev.spaceInvaders) return prev;

    const spaceInvaders = { ...prev.spaceInvaders };
    
    // 移動玩家
    if (prev.keys.left && spaceInvaders.player.x > 0) {
      spaceInvaders.player.x -= 5;
    }
    if (prev.keys.right && spaceInvaders.player.x < prev.gameWidth - 50) {
      spaceInvaders.player.x += 5;
    }

    // 移動外星人
    spaceInvaders.moveTimer += 0.1;
    const moveSpeed = 40 + prev.currentLevel * 8; // 超高速移動！
    
    if (spaceInvaders.moveTimer > 0.05) { // 每0.05秒移動一次，移動極其頻繁
      spaceInvaders.moveTimer = 0;
      console.log('👾 外星人移動中，速度:', moveSpeed, '方向:', spaceInvaders.direction);
      
      // 檢查是否需要改變方向或下降
      let shouldChangeDirection = false;
      let shouldMoveDown = false;
      
      for (const invader of spaceInvaders.invaders) {
        if (invader.alive) {
          if (spaceInvaders.direction === 1 && invader.x >= prev.gameWidth - 60) {
            shouldChangeDirection = true;
            shouldMoveDown = true;
            break;
          } else if (spaceInvaders.direction === -1 && invader.x <= 40) {
            shouldChangeDirection = true;
            shouldMoveDown = true;
            break;
          }
        }
      }
      
      if (shouldChangeDirection) {
        spaceInvaders.direction *= -1;
      }
      
      // 移動所有活著的外星人
      let movedCount = 0;
      for (const invader of spaceInvaders.invaders) {
        if (invader.alive) {
          const oldX = invader.x;
          invader.x += spaceInvaders.direction * moveSpeed;
          if (shouldMoveDown) {
            invader.y += 20; // 下降
          }
          movedCount++;
          if (movedCount === 1) { // 只記錄第一個外星人的移動
            console.log(`👾 外星人從 ${oldX} 移動到 ${invader.x}`);
          }
        }
      }
      console.log(`👾 總共移動了 ${movedCount} 個外星人`);
    }

    // 玩家射擊
    if (prev.keys.space) {
      const now = Date.now();
      if (!spaceInvaders.lastShotTime || now - spaceInvaders.lastShotTime > 300) {
        spaceInvaders.bullets.push({
          x: spaceInvaders.player.x + 25,
          y: spaceInvaders.player.y,
          speed: -8,
          id: Date.now(),
        });
        spaceInvaders.lastShotTime = now;
      }
    }

    // 敵人射擊
    spaceInvaders.shootTimer += 0.1;
    if (spaceInvaders.shootTimer > 2) { // 每2秒射擊一次
      spaceInvaders.shootTimer = 0;
      
      // 隨機選擇一個活著的外星人射擊
      const aliveInvaders = spaceInvaders.invaders.filter(invader => invader.alive);
      if (aliveInvaders.length > 0) {
        const randomInvader = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
        spaceInvaders.invaderBullets.push({
          x: randomInvader.x,
          y: randomInvader.y + 20,
          speed: 4,
          id: Date.now(),
        });
      }
    }

    // 更新玩家子彈
    spaceInvaders.bullets = spaceInvaders.bullets.filter(bullet => {
      bullet.y += bullet.speed;
      return bullet.y > -10;
    });

    // 更新敵人子彈
    spaceInvaders.invaderBullets = spaceInvaders.invaderBullets.filter(bullet => {
      bullet.y += bullet.speed;
      return bullet.y < prev.gameHeight + 10;
    });

    // 更新爆炸效果
    spaceInvaders.explosions = spaceInvaders.explosions.filter(explosion => {
      explosion.timer -= 0.1;
      explosion.radius += explosion.speed;
      explosion.opacity -= 0.02;
      return explosion.timer > 0;
    });

    // 檢查外星人是否被擊中
    spaceInvaders.bullets = spaceInvaders.bullets.filter(bullet => {
      const hitInvader = spaceInvaders.invaders.find(invader => 
        invader.alive && 
        Math.abs(bullet.x - invader.x) < 25 && 
        Math.abs(bullet.y - invader.y) < 25
      );

      if (hitInvader) {
        hitInvader.alive = false;
        spaceInvaders.explosions.push({
          x: hitInvader.x,
          y: hitInvader.y,
          radius: 0,
          speed: 2,
          opacity: 1,
          timer: 1,
          color: '#ff0000',
        });
        return false;
      }
      return true;
    });

    // 檢查是否完成關卡
    const remainingInvaders = spaceInvaders.invaders.filter(invader => invader.alive).length;
    const killedInvaders = spaceInvaders.invaders.filter(invader => !invader.alive).length;
    const levelCompleted = remainingInvaders === 0;

    const newState = {
      ...prev,
      spaceInvaders,
      score: killedInvaders * 20, // 每個外星人 20 分
      levelCompleted,
    };
    
    // 添加調試信息
    if (prev.spaceInvaders && spaceInvaders.invaders.length > 0) {
      const firstInvader = spaceInvaders.invaders[0];
      if (firstInvader && firstInvader.alive) {
        console.log('🎮 遊戲狀態更新，第一個外星人位置:', firstInvader.x, firstInvader.y);
      }
    }
    
    return newState;
  };

  // 更新貪食蛇遊戲
  const updateSnakeGame = (prev: GameState): GameState => {
    if (!prev.snake) return prev;

    const snake = { ...prev.snake };
    
    // 處理方向輸入
    if (prev.keys.up && snake.direction !== 1) {
      snake.nextDirection = 3;
    } else if (prev.keys.down && snake.direction !== 3) {
      snake.nextDirection = 1;
    } else if (prev.keys.left && snake.direction !== 0) {
      snake.nextDirection = 2;
    } else if (prev.keys.right && snake.direction !== 2) {
      snake.nextDirection = 0;
    }

    // 更新方向
    snake.direction = snake.nextDirection;

    // 移動蛇頭
    const head = { ...snake.snake[0] };
    switch (snake.direction) {
      case 0: // 右
        head.x += 1;
        break;
      case 1: // 下
        head.y += 1;
        break;
      case 2: // 左
        head.x -= 1;
        break;
      case 3: // 上
        head.y -= 1;
        break;
    }

    // 檢查邊界碰撞
    const maxX = prev.gameWidth / snake.gridSize;
    const maxY = prev.gameHeight / snake.gridSize;
    
    if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
      snake.gameOver = true;
      return {
        ...prev,
        snake,
        levelCompleted: true,
      };
    }

    // 檢查自身碰撞
    for (const segment of snake.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        snake.gameOver = true;
        return {
          ...prev,
          snake,
          levelCompleted: true,
        };
      }
    }

    // 添加新頭部
    snake.snake.unshift(head);

    // 檢查食物碰撞
    let scoreIncrease = 0;
    if (head.x === snake.food.x && head.y === snake.food.y) {
      // 吃到食物，生成新食物
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      
      let newFoodX: number, newFoodY: number;
      do {
        newFoodX = Math.floor(Math.random() * maxX);
        newFoodY = Math.floor(Math.random() * maxY);
      } while (snake.snake.some(segment => segment.x === newFoodX && segment.y === newFoodY));
      
      snake.food = {
        x: newFoodX,
        y: newFoodY,
        letter: randomLetter.charCodeAt(0),
      };
      
      scoreIncrease = 10;
    } else {
      // 沒吃到食物，移除尾部
      snake.snake.pop();
    }

    // 檢查是否達到目標長度完成關卡（20節）
    const newScore = prev.score + scoreIncrease;
    const levelCompleted = snake.snake.length >= 20;

    return {
      ...prev,
      snake,
      score: newScore,
      levelCompleted,
    };
  };

  // 切換遊戲模式
  const switchGameMode = useCallback((mode: 'pacman' | 'space_invaders' | 'snake') => {
    initGame(mode, 1);
  }, [initGame]);

  // 重置遊戲
  const resetGame = useCallback(() => {
    initGame(gameState.gameMode, 1);
  }, [initGame, gameState.gameMode]);

  // 進入下一關
  const nextLevel = useCallback(() => {
    if (gameState.currentLevel < gameState.maxLevel) {
      initGame(gameState.gameMode, gameState.currentLevel + 1);
    } else {
      // 完成所有關卡
      setGameState(prev => ({
        ...prev,
        gameCompleted: true,
        levelCompleted: false,
      }));
    }
  }, [initGame, gameState.gameMode, gameState.currentLevel, gameState.maxLevel]);

  // 添加事件監聽器
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // 遊戲循環
  useEffect(() => {
    const gameLoop = setInterval(() => {
      updateGame();
    }, 16); // 約60fps
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  return {
    gameState,
    initGame,
    switchGameMode,
    resetGame,
    nextLevel,
  };
};
