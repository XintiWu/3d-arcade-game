import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GameState, CameraState } from '../types/game';

interface ArcadeMachine3DProps {
  gameState: GameState;
  cameraState: CameraState;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const ArcadeMachine3D: React.FC<ArcadeMachine3DProps> = ({
  gameState,
  cameraState,
  containerRef,
}) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const arcadeModelRef = useRef<THREE.Group | null>(null);
  const gameDisplayRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number>();
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化 Three.js 場景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // 創建相機
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;

    // 創建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 添加到 DOM
    containerRef.current.appendChild(renderer.domElement);

    // 添加燈光
    setupLighting(scene);

    // 創建彩色粒子系統
    createParticleSystem(scene);

    // 載入 3D 模型
    loadArcadeModel(scene);

    // 創建遊戲畫面
    createGameDisplay(scene);

    // 動畫循環
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // 更新相機位置
      updateCameraPosition();
      
      // 更新遊戲畫面
      updateGameDisplay();
      
      // 更新粒子動畫
      updateParticleAnimation();
      
      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小調整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 清理函數
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [containerRef]);

  // 設置燈光
  const setupLighting = (scene: THREE.Scene) => {
    // 環境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // 主方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(3, 3, 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // 點光源 - 遊戲機內部發光
    const pointLight = new THREE.PointLight(0x4a90e2, 0.8, 5);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);

    // 聚光燈 - 遊戲機頂部
    const spotLight = new THREE.SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 4, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.3;
    scene.add(spotLight);
    scene.add(spotLight.target);
  };

  // 載入街機模型
  const loadArcadeModel = (scene: THREE.Scene) => {
    const loader = new GLTFLoader();
    loader.load(
      '/src/arcade.glb',
      (gltf) => {
        console.log('GLB模型載入成功！', gltf);
        const arcadeModel = gltf.scene;
        
        // 調整模型大小和位置
        arcadeModel.scale.set(0.8, 0.8, 0.8);
        arcadeModel.position.set(0, -0.8, 0);
        
        // 啟用陰影和改善材質
        arcadeModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // 改善材質
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.color.setHex(0x2a4a6a);
              child.material.metalness = 0.4;
              child.material.roughness = 0.6;
              child.material.envMapIntensity = 0.5;
            } else if (child.material instanceof THREE.MeshBasicMaterial) {
              child.material.color.setHex(0x2a4a6a);
            }
          }
        });
        
        scene.add(arcadeModel);
        arcadeModelRef.current = arcadeModel as unknown as THREE.Group;
        
        console.log('街機模型已添加到場景！');
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          console.log(`📈 模型載入進度: ${percent}%`);
        }
      },
      (error) => {
        console.error('❌ 載入模型時發生錯誤:', error);
        createFallbackModel(scene);
      }
    );
  };

  // 創建備用模型
  const createFallbackModel = (scene: THREE.Scene) => {
    // 創建街機外殼
    const geometry = new THREE.BoxGeometry(2.2, 3.2, 1.2);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x2a4a6a,
      shininess: 30,
    });
    const arcadeBody = new THREE.Mesh(geometry, material);
    arcadeBody.position.set(0, -0.8, 0);
    arcadeBody.castShadow = true;
    arcadeBody.receiveShadow = true;
    scene.add(arcadeBody);

    // 創建螢幕框架
    const screenGeometry = new THREE.BoxGeometry(1.8, 1.2, 0.1);
    const screenMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const screenFrame = new THREE.Mesh(screenGeometry, screenMaterial);
    screenFrame.position.set(0, 0.2, 0.6);
    scene.add(screenFrame);

    arcadeModelRef.current = arcadeBody as unknown as THREE.Group;
    console.log('🔄 備用模型創建完成');
  };

  // 創建遊戲畫面
  const createGameDisplay = (scene: THREE.Scene) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    
    // 繪製初始畫面
    drawGameScreen(ctx, gameState);
    
    // 創建材質
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    
    // 創建平面
    const geometry = new THREE.PlaneGeometry(1.6, 1.2);
    const gameDisplay = new THREE.Mesh(geometry, material);
    gameDisplay.position.set(0, 0.2, 0.65);
    gameDisplay.rotation.x = -Math.PI / 12;
    
    scene.add(gameDisplay);
    gameDisplayRef.current = gameDisplay;
  };

  // 繪製遊戲畫面
  const drawGameScreen = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    // 清空畫布
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 800, 600);
    
    if (gameState.gameMode === 'pacman' && gameState.pacman) {
      drawPacmanGame(ctx, gameState);
    } else if (gameState.gameMode === 'space_invaders' && gameState.spaceInvaders) {
      drawSpaceInvadersGame(ctx, gameState);
    } else if (gameState.gameMode === 'snake' && gameState.snake) {
      drawSnakeGame(ctx, gameState);
    } else {
      // 預設畫面
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('3D 街機遊戲', 400, 280);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('React TypeScript 版本', 400, 320);
      ctx.font = '18px Arial';
      ctx.fillText('選擇遊戲模式開始遊戲', 400, 360);
    }
  };

  // 繪製 Pacman 遊戲
  const drawPacmanGame = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    const pacman = gameState.pacman!;
    
    // 繪製點點
    pacman.dots.forEach(dot => {
      if (!dot.eaten) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 繪製字母
        ctx.fillStyle = '#FFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCharCode(dot.letter), dot.x, dot.y + 4);
      }
    });
    
    // 繪製 Pacman
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 繪製嘴巴
    if (pacman.mouthOpen) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pacman.x, pacman.y, 10, pacman.direction * Math.PI / 2 - 0.3, pacman.direction * Math.PI / 2 + 0.3);
      ctx.lineTo(pacman.x, pacman.y);
      ctx.fill();
    }
  };

  // 繪製 Space Invaders 遊戲
  const drawSpaceInvadersGame = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    const spaceInvaders = gameState.spaceInvaders!;
    
    // 繪製外星人
    spaceInvaders.invaders.forEach(invader => {
      if (invader.alive) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(invader.x - 15, invader.y - 10, 30, 20);
        
        // 繪製字母
        ctx.fillStyle = '#FFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCharCode(invader.letter), invader.x, invader.y + 5);
      }
    });
    
    // 繪製玩家
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(spaceInvaders.player.x - 25, spaceInvaders.player.y - 5, 50, 10);
    
    // 繪製玩家子彈
    spaceInvaders.bullets.forEach(bullet => {
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(bullet.x - 2, bullet.y - 5, 4, 10);
    });
    
    // 繪製敵人子彈（紅色，更大）
    spaceInvaders.invaderBullets.forEach(bullet => {
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(bullet.x - 4, bullet.y - 8, 8, 16); // 比玩家子彈大一倍
    });
    
    // 繪製爆炸效果
    spaceInvaders.explosions.forEach(explosion => {
      ctx.globalAlpha = explosion.opacity;
      ctx.fillStyle = explosion.color;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  };

  // 繪製貪食蛇遊戲
  const drawSnakeGame = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    const snake = gameState.snake!;
    
    // 繪製網格背景
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += snake.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y < 600; y += snake.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
    
    // 繪製蛇身
    snake.snake.forEach((segment, index) => {
      if (index === 0) {
        // 蛇頭 - 綠色
        ctx.fillStyle = '#00FF00';
      } else {
        // 蛇身 - 淺綠色
        ctx.fillStyle = '#90EE90';
      }
      
      const x = segment.x * snake.gridSize;
      const y = segment.y * snake.gridSize;
      ctx.fillRect(x + 1, y + 1, snake.gridSize - 2, snake.gridSize - 2);
      
      // 繪製蛇頭的朝向
      if (index === 0) {
        ctx.fillStyle = '#000000';
        const centerX = x + snake.gridSize / 2;
        const centerY = y + snake.gridSize / 2;
        const eyeSize = 3;
        
        switch (snake.direction) {
          case 0: // 右
            ctx.fillRect(centerX + 3, centerY - 2, eyeSize, eyeSize);
            ctx.fillRect(centerX + 3, centerY + 2, eyeSize, eyeSize);
            break;
          case 1: // 下
            ctx.fillRect(centerX - 2, centerY + 3, eyeSize, eyeSize);
            ctx.fillRect(centerX + 2, centerY + 3, eyeSize, eyeSize);
            break;
          case 2: // 左
            ctx.fillRect(centerX - 6, centerY - 2, eyeSize, eyeSize);
            ctx.fillRect(centerX - 6, centerY + 2, eyeSize, eyeSize);
            break;
          case 3: // 上
            ctx.fillRect(centerX - 2, centerY - 6, eyeSize, eyeSize);
            ctx.fillRect(centerX + 2, centerY - 6, eyeSize, eyeSize);
            break;
        }
      }
    });
    
    // 繪製食物
    ctx.fillStyle = '#FF0000';
    const foodX = snake.food.x * snake.gridSize;
    const foodY = snake.food.y * snake.gridSize;
    ctx.fillRect(foodX + 2, foodY + 2, snake.gridSize - 4, snake.gridSize - 4);
    
    // 繪製食物上的字母
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      String.fromCharCode(snake.food.letter),
      foodX + snake.gridSize / 2,
      foodY + snake.gridSize / 2 + 4
    );
    
    // 繪製遊戲結束畫面
    if (snake.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('遊戲結束！', 400, 250);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`最終分數: ${gameState.score}`, 400, 300);
      
      ctx.font = '18px Arial';
      ctx.fillText('按重置按鈕重新開始', 400, 350);
    }
  };

  // 更新相機位置
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    
    const currentMode = cameraState.viewModes[cameraState.currentViewMode];
    const camera = cameraRef.current;
    
    // 平滑過渡到目標位置
    camera.position.lerp(
      new THREE.Vector3(currentMode.position.x, currentMode.position.y, currentMode.position.z),
      0.05
    );
    camera.lookAt(currentMode.target.x, currentMode.target.y, currentMode.target.z);
  };

  // 更新遊戲畫面
  const updateGameDisplay = () => {
    if (!gameDisplayRef.current) return;
    
    const material = gameDisplayRef.current.material as THREE.MeshBasicMaterial;
    if (!material.map) return;
    
    const texture = material.map as THREE.CanvasTexture;
    const canvas = texture.image as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    
    drawGameScreen(ctx, gameState);
    texture.needsUpdate = true;
  };

  // 創建彩色粒子系統
  const createParticleSystem = (scene: THREE.Scene) => {
    const particleCount = 200; // 增加粒子數量讓效果更豐富
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // 圍繞遊戲機的環形分佈
      const radius = 3 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      
      // 調整高度分佈，在底部添加更多粒子
      let height;
      if (i < 50) {
        // 前50個粒子專門放在底部
        height = -2 - Math.random() * 1.5;
      } else {
        // 其他粒子保持原本的分佈
        height = (Math.random() - 0.5) * 5;
      }
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      // 隨機顏色（霓虹色系）
      const colorChoice = Math.random();
      if (colorChoice < 0.2) {
        colors[i3] = 1.0; colors[i3 + 1] = 0.2; colors[i3 + 2] = 0.2; // 紅色
      } else if (colorChoice < 0.4) {
        colors[i3] = 0.2; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.2; // 綠色
      } else if (colorChoice < 0.6) {
        colors[i3] = 0.2; colors[i3 + 1] = 0.2; colors[i3 + 2] = 1.0; // 藍色
      } else if (colorChoice < 0.8) {
        colors[i3] = 1.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.2; // 黃色
      } else {
        colors[i3] = 1.0; colors[i3 + 1] = 0.2; colors[i3 + 2] = 1.0; // 紫色
      }
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    particlesRef.current = particleSystem;
    
    console.log('🎆 彩色粒子系統創建完成');
  };

  // 更新粒子動畫
  const updateParticleAnimation = () => {
    if (!particlesRef.current) return;
    
    const time = Date.now() * 0.001;
    
    // 旋轉粒子系統
    particlesRef.current.rotation.y += 0.002;
    particlesRef.current.rotation.x += 0.001;
    
    // 動態調整粒子大小和透明度
    const material = particlesRef.current.material as THREE.PointsMaterial;
    material.size = 0.3 + Math.sin(time) * 0.1;
    material.opacity = 0.8 + Math.sin(time * 0.5) * 0.2;
  };

  return null; // 這個組件只負責3D渲染，不需要返回JSX
};
