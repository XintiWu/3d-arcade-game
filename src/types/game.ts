export interface GameState {
  gameMode: 'pacman' | 'space_invaders' | 'snake';
  score: number;
  lives: number;
  gameWidth: number;
  gameHeight: number;
  gameCompleted: boolean;
  currentLevel: number;
  maxLevel: number;
  levelCompleted: boolean;
  keys: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    space: boolean;
  };
  pacman?: PacmanState;
  spaceInvaders?: SpaceInvadersState;
  snake?: SnakeState;
}

export interface PacmanState {
  x: number;
  y: number;
  direction: number; // 0:右, 1:下, 2:左, 3:上
  nextDirection: number;
  speed: number;
  mouthOpen: boolean;
  mouthTimer: number;
  dots: Dot[];
  level: number;
}

export interface Dot {
  x: number;
  y: number;
  eaten: boolean;
  letter: number;
}

export interface SpaceInvadersState {
  invaders: Invader[];
  player: {
    x: number;
    y: number;
  };
  bullets: Bullet[];
  invaderBullets: Bullet[];
  direction: number;
  moveTimer: number;
  shootTimer: number;
  explosions: Explosion[];
  lastShotTime?: number;
  level: number;
}

export interface Invader {
  x: number;
  y: number;
  alive: boolean;
  letter: number;
}

export interface Bullet {
  x: number;
  y: number;
  speed: number;
  id: number;
}

export interface Explosion {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  timer: number;
  color: string;
}

export interface ViewMode {
  name: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
}

export interface SnakeState {
  snake: SnakeSegment[];
  food: Food;
  direction: number; // 0:右, 1:下, 2:左, 3:上
  nextDirection: number;
  speed: number;
  gameOver: boolean;
  gridSize: number;
  level: number;
  targetScore: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface Food {
  x: number;
  y: number;
  letter: number;
}

export interface CameraState {
  currentViewMode: 'overview' | 'gameplay';
  isTransitioning: boolean;
  viewModes: {
    overview: ViewMode;
    gameplay: ViewMode;
  };
}

