// 3D 街機遊戲機 - 修復版本
class ArcadeMachine3D {
    constructor() {
        this.container = document.getElementById('arcade-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arcadeModel = null;
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: -Math.PI / 2};
        this.currentRotation = { x: 0, y: -Math.PI / 2};
        this.isDragging = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.hasDragged = false;
        this.clock = new THREE.Clock();
        this.loader = null;
        
        // 懸停效果相關變數
        this.isHovering = false;
        this.hoverIntensity = 0;
        this.particles = null;
        this.hoverLights = [];
        
        // 音效系統初始化
        this.audioContext = null;
        this.audioInitialized = false;
        this.initAudioSystem();
        
        console.log('開始初始化3D街機...');
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createParticleSystem();
        this.loadArcadeModel();
        this.setupControls();
        this.setupHoverEffects();
        this.initCameraController();
        this.initSimpleCameraSwitch();
        this.createViewAngleDisplay();
        this.animate();
        
        // 延遲創建遊戲選擇器，確保3D場景完全載入
        setTimeout(() => {
            this.createGameSelector();
        }, 1000);
        console.log('3D街機初始化完成！');
    }
    
    initAudioSystem() {
        // 初始化音效系統
        try {
            // 檢查瀏覽器是否支持 Web Audio API
            if (typeof window.AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined') {
                console.warn('⚠️ 瀏覽器不支持 Web Audio API，音效功能將被禁用');
                return;
            }
            
            // 創建單一的 AudioContext 實例
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 檢查 AudioContext 狀態
            if (this.audioContext.state === 'suspended') {
                console.log('🔊 AudioContext 處於暫停狀態，需要用戶交互後才能播放音效');
            }
            
            this.audioInitialized = true;
            console.log('✅ 音效系統初始化成功');
            
        } catch (error) {
            console.error('❌ 音效系統初始化失敗:', error);
            this.audioInitialized = false;
        }
    }
    
    ensureAudioContext() {
        // 確保 AudioContext 可用
        if (!this.audioInitialized || !this.audioContext) {
            console.warn('⚠️ AudioContext 未初始化，嘗試重新初始化...');
            this.initAudioSystem();
            return false;
        }
        
        // 如果 AudioContext 被暫停，嘗試恢復
        if (this.audioContext.state === 'suspended') {
            console.log('🔊 嘗試恢復 AudioContext...');
            this.audioContext.resume().then(() => {
                console.log('✅ AudioContext 已恢復');
            }).catch(error => {
                console.error('❌ 恢復 AudioContext 失敗:', error);
            });
            return false;
        }
        
        return true;
    }
    
    activateAudioSystem() {
        // 激活音效系統（用戶交互後）
        if (!this.audioInitialized && this.audioContext) {
            console.log('🔊 用戶交互觸發音效系統激活');
            this.audioInitialized = true;
        }
        
        // 如果 AudioContext 被暫停，嘗試恢復
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('✅ 音效系統已激活');
            }).catch(error => {
                console.error('❌ 激活音效系統失敗:', error);
            });
        }
    }
    
    createViewAngleDisplay() {
        // 創建視角位置顯示元素（已隱藏）
        this.viewAngleDisplay = document.createElement('div');
        this.viewAngleDisplay.id = 'view-angle-display';
        this.viewAngleDisplay.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 10px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 1000;
            border: 1px solid #00ff00;
            min-width: 200px;
            display: none;  // 隱藏視角顯示
        `;
        
        this.container.appendChild(this.viewAngleDisplay);
        // this.updateViewAngleDisplay(); // 不更新顯示
    }
    
    createGameSelector() {
        // 創建遊戲選擇面板
        this.gameSelector = document.createElement('div');
        this.gameSelector.id = 'game-selector';
        this.gameSelector.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.95);
            padding: 15px;
            border-radius: 12px;
            border: 2px solid #8b5cf6;
            backdrop-filter: blur(15px);
            min-width: 220px;
            z-index: 1001;
            box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
            font-family: 'JetBrains Mono', monospace;
        `;
        
        this.gameSelector.innerHTML = `
            <div style="margin-bottom: 12px;">
                <h3 style="margin: 0; color: #8b5cf6; font-size: 16px; text-align: center; font-weight: bold;">🎮 選擇遊戲</h3>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button id="snake-btn" class="game-selector-btn" style="
                    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.3s ease;
                    background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3);
                    text-align: left; font-family: 'JetBrains Mono', monospace;
                ">
                    <span style="font-size: 16px; min-width: 20px; text-align: center;">🐍</span>
                    <span style="font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">Snake</span>
                </button>
                <button id="pacman-btn" class="game-selector-btn" style="
                    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.3s ease;
                    background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3);
                    text-align: left; font-family: 'JetBrains Mono', monospace;
                ">
                    <span style="font-size: 16px; min-width: 20px; text-align: center;">🍒</span>
                    <span style="font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">Pacman</span>
                </button>
                <button id="space-invaders-btn" class="game-selector-btn" style="
                    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: none; border-radius: 8px;
                    font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.3s ease;
                    background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3);
                    text-align: left; font-family: 'JetBrains Mono', monospace;
                ">
                    <span style="font-size: 16px; min-width: 20px; text-align: center;">👾</span>
                    <span style="font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">Space Invaders</span>
                </button>
            </div>
        `;
        
        this.container.appendChild(this.gameSelector);
        
        // 添加按鈕事件監聽器
        this.setupGameSelectorEvents();
        
        // 更新當前選中的遊戲按鈕
        this.updateGameSelectorDisplay();
        
        console.log('🎮 遊戲選擇面板創建完成');
    }
    
    setupGameSelectorEvents() {
        // 為遊戲選擇按鈕添加事件監聽器
        const pacmanBtn = document.getElementById('pacman-btn');
        const spaceInvadersBtn = document.getElementById('space-invaders-btn');
        const snakeBtn = document.getElementById('snake-btn');
        
        if (pacmanBtn) {
            pacmanBtn.addEventListener('click', () => {
                this.switchGameMode('pacman');
                this.updateGameSelectorDisplay();
            });
            
            // 添加懸停效果
            pacmanBtn.addEventListener('mouseenter', () => {
                if (this.gameState.gameMode !== 'pacman') {
                    pacmanBtn.style.background = 'rgba(139, 92, 246, 0.25)';
                    pacmanBtn.style.transform = 'translateY(-2px)';
                    pacmanBtn.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.3)';
                    pacmanBtn.style.color = '#c4b5fd';
                }
            });
            
            pacmanBtn.addEventListener('mouseleave', () => {
                if (this.gameState.gameMode !== 'pacman') {
                    pacmanBtn.style.background = 'rgba(139, 92, 246, 0.15)';
                    pacmanBtn.style.transform = 'translateY(0)';
                    pacmanBtn.style.boxShadow = 'none';
                    pacmanBtn.style.color = '#a78bfa';
                }
            });
        }
        
        if (spaceInvadersBtn) {
            spaceInvadersBtn.addEventListener('click', () => {
                this.switchGameMode('space_invaders');
                this.updateGameSelectorDisplay();
            });
            
            // 添加懸停效果
            spaceInvadersBtn.addEventListener('mouseenter', () => {
                if (this.gameState.gameMode !== 'space_invaders') {
                    spaceInvadersBtn.style.background = 'rgba(139, 92, 246, 0.25)';
                    spaceInvadersBtn.style.transform = 'translateY(-2px)';
                    spaceInvadersBtn.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.3)';
                    spaceInvadersBtn.style.color = '#c4b5fd';
                }
            });
            
            spaceInvadersBtn.addEventListener('mouseleave', () => {
                if (this.gameState.gameMode !== 'space_invaders') {
                    spaceInvadersBtn.style.background = 'rgba(139, 92, 246, 0.15)';
                    spaceInvadersBtn.style.transform = 'translateY(0)';
                    spaceInvadersBtn.style.boxShadow = 'none';
                    spaceInvadersBtn.style.color = '#a78bfa';
                }
            });
        }
        
        if (snakeBtn) {
            snakeBtn.addEventListener('click', () => {
                this.switchGameMode('snake');
                this.updateGameSelectorDisplay();
            });
            
            // 添加懸停效果
            snakeBtn.addEventListener('mouseenter', () => {
                if (this.gameState.gameMode !== 'snake') {
                    snakeBtn.style.background = 'rgba(139, 92, 246, 0.25)';
                    snakeBtn.style.transform = 'translateY(-2px)';
                    snakeBtn.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.3)';
                    snakeBtn.style.color = '#c4b5fd';
                }
            });
            
            snakeBtn.addEventListener('mouseleave', () => {
                if (this.gameState.gameMode !== 'snake') {
                    snakeBtn.style.background = 'rgba(139, 92, 246, 0.15)';
                    snakeBtn.style.transform = 'translateY(0)';
                    snakeBtn.style.boxShadow = 'none';
                    snakeBtn.style.color = '#a78bfa';
                }
            });
        }
    }
    
    updateGameSelectorDisplay() {
        // 更新遊戲選擇面板的顯示狀態
        const pacmanBtn = document.getElementById('pacman-btn');
        const spaceInvadersBtn = document.getElementById('space-invaders-btn');
        const snakeBtn = document.getElementById('snake-btn');
        
        // 檢查gameState是否存在
        if (!this.gameState) {
            console.log('⚠️ gameState 尚未初始化，跳過遊戲選擇面板更新');
            return;
        }
        
        // 重置所有按鈕樣式
        [pacmanBtn, spaceInvadersBtn, snakeBtn].forEach(btn => {
            if (btn) {
                btn.style.background = 'rgba(139, 92, 246, 0.15)';
                btn.style.color = '#a78bfa';
                btn.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                btn.style.boxShadow = 'none';
                btn.style.transform = 'translateY(0)';
            }
        });
        
        // 設置當前選中遊戲的按鈕樣式
        let activeBtn = null;
        console.log('🎮 當前遊戲模式:', this.gameState.gameMode);
        
        switch(this.gameState.gameMode) {
            case 'pacman':
                activeBtn = pacmanBtn;
                break;
            case 'space_invaders':
                activeBtn = spaceInvadersBtn;
                break;
            case 'snake':
                activeBtn = snakeBtn;
                break;
        }
        
        if (activeBtn) {
            activeBtn.style.background = 'rgba(139, 92, 246, 0.4)';
            activeBtn.style.color = '#fff';
            activeBtn.style.borderColor = '#8b5cf6';
            activeBtn.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.5)';
            activeBtn.style.transform = 'translateY(-1px)';
            console.log('✅ 已高亮顯示按鈕:', this.gameState.gameMode);
        } else {
            console.log('❌ 未找到對應的按鈕:', this.gameState.gameMode);
        }
    }
    
    updateViewAngleDisplay() {
        if (!this.viewAngleDisplay) return;
        
        const rotationY = this.currentRotation.y;
        const rotationX = this.currentRotation.x;
        const rotationYDegrees = (rotationY * 180 / Math.PI).toFixed(1);
        const rotationXDegrees = (rotationX * 180 / Math.PI).toFixed(1);
        
        // 判斷方向
        let direction = '';
        if (Math.abs(rotationY) < 0.1) direction = '正面 (0°)';
        else if (Math.abs(rotationY - Math.PI/2) < 0.1) direction = '右側 (90°)';
        else if (Math.abs(rotationY + Math.PI/2) < 0.1) direction = '左側 (-90°)';
        else if (Math.abs(rotationY - Math.PI) < 0.1 || Math.abs(rotationY + Math.PI) < 0.1) direction = '背面 (180°)';
        else direction = `自定義 (${rotationYDegrees}°)`;
        
        this.viewAngleDisplay.innerHTML = `
            <div><strong>視角位置顯示</strong></div>
            <div>Y軸旋轉: ${rotationYDegrees}°</div>
            <div>X軸旋轉: ${rotationXDegrees}°</div>
            <div>方向: ${direction}</div>
            <div>相機位置: (${this.camera.position.x.toFixed(2)}, ${this.camera.position.y.toFixed(2)}, ${this.camera.position.z.toFixed(2)})</div>
            <div>目標旋轉: ${(this.targetRotation.y * 180 / Math.PI).toFixed(1)}°</div>
        `;
    }
    
    
    addDebugLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        
        // 輸出到 console
        const consoleMessage = `[${timestamp}] ${message}`;
        if (type === 'error') {
            console.error(consoleMessage);
        } else if (type === 'warning') {
            console.warn(consoleMessage);
        } else if (type === 'success') {
            console.log(`✅ ${consoleMessage}`);
        } else {
            console.log(consoleMessage);
        }
    }
    
    
    createScene() {
        this.scene = new THREE.Scene();
        // 背景保持黑色
        this.scene.background = new THREE.Color(0x000000);
        console.log('場景創建完成');
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0.5, 4);
        console.log('相機創建完成');
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        console.log('渲染器創建完成');
    }
    
    createLights() {
        // 增強環境光，讓機台更明顯
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);
        
        // 主光源
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // 霓虹藍色光源
        const neonLight = new THREE.PointLight(0x3b82f6, 1.0, 10);
        neonLight.position.set(0, 0, 3);
        this.scene.add(neonLight);
        
        // 額外的點光源
        const pointLight = new THREE.PointLight(0xffffff, 0.7, 8);
        pointLight.position.set(-3, 2, 3);
        this.scene.add(pointLight);
        
        // 添加機台正面光源
        const frontLight = new THREE.PointLight(0xffffff, 0.6, 6);
        frontLight.position.set(0, 0, 2);
        this.scene.add(frontLight);
        
        // 懸停效果燈光
        this.createHoverLights();
        
        console.log('燈光創建完成');
    }
    
    createHoverLights() {
        // 創建懸停時的霓虹燈效果 - 調整光源距離和強度以減少反射光點大小
        const hoverLight1 = new THREE.PointLight(0x00ffff, 0, 8);  // 距離從15減少到8
        hoverLight1.position.set(2, 1, 2);
        this.scene.add(hoverLight1);
        this.hoverLights.push(hoverLight1);
        
        const hoverLight2 = new THREE.PointLight(0xff00ff, 0, 8);  // 距離從15減少到8
        hoverLight2.position.set(-2, 1, 2);
        this.scene.add(hoverLight2);
        this.hoverLights.push(hoverLight2);
        
        const hoverLight3 = new THREE.PointLight(0xffff00, 0, 6);  // 距離從12減少到6
        hoverLight3.position.set(0, 2, 1);
        this.scene.add(hoverLight3);
        this.hoverLights.push(hoverLight3);
    }
    
    createParticleSystem() {
        // 檢測當前頁面類型
        const isGameModePage = window.location.pathname.includes('game_mode.html');
        
        // 所有頁面都使用彩色粒子效果
        this.createArcadeParticles();
        
        console.log('🎆 彩色粒子系統創建完成 - 所有頁面都使用彩色效果');
    }
    
    // 清除現有粒子系統
    clearParticleSystem() {
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.particles = null;
            console.log('🗑️ 粒子系統已清除');
        }
    }
    
    // 重新創建粒子系統（用於模式切換）
    recreateParticleSystem() {
        this.clearParticleSystem();
        this.createParticleSystem();
    }
    
    // 🌌 創建環境粒子效果（主頁模式的藍色粒子）
    createAmbientParticles() {
        const particleCount = 120; // 增加粒子數量讓效果更明顯
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 隨機位置
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
            
            // 純藍色系粒子
            colors[i3] = 0.2 + Math.random() * 0.3;
            colors[i3 + 1] = 0.5 + Math.random() * 0.5;
            colors[i3 + 2] = 0.8 + Math.random() * 0.2;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particles);
        
        console.log('🌌 環境粒子系統創建完成');
    }
    
    // 🎮 創建遊戲機周圍的粒子系統（遊戲模式的彩色粒子）
    createArcadeParticles() {
        const particleCount = 150; // 恢復原本的粒子數量
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 圍繞遊戲機的環形分佈
            const radius = 2 + Math.random() * 3;
            const angle = Math.random() * Math.PI * 2;
            
            // 調整高度分佈，在底部添加更多粒子
            let height;
            if (i < 30) {
                // 前30個粒子專門放在底部
                height = -1.5 - Math.random() * 1.0; // 底部區域 -1.5 到 -2.5
            } else {
                // 其他粒子保持原本的分佈
                height = (Math.random() - 0.5) * 4;
            }
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // 隨機顏色（霓虹色系）
            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                colors[i3] = 0.2; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1.0; // 青色
            } else if (colorChoice < 0.66) {
                colors[i3] = 1.0; colors[i3 + 1] = 0.2; colors[i3 + 2] = 1.0; // 紫色
            } else {
                colors[i3] = 1.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.2; // 黃色
            }
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.2, // 預設使用懸停時的大小
            vertexColors: true,
            transparent: true,
            opacity: 0.8, // 預設使用懸停時的透明度
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particles);
        
        // 在遊戲模式頁面中預設啟用懸停效果
        this.isHovering = true;
        
        console.log('🎮 遊戲機粒子系統創建完成 - 預設懸停效果已啟用');
    }
    
    loadArcadeModel() {
        console.log('開始載入GLB模型...');
        
        // 檢查GLTFLoader是否可用
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.error('GLTFLoader未載入！使用備用模型...');
            this.createFallbackModel();
            return;
        }
        
        console.log('✅ GLTFLoader 可用，開始載入模型...');
        this.loader = new THREE.GLTFLoader();
        
        this.loader.load(
            './arcade.glb',
            (gltf) => {
                console.log('GLB模型載入成功！', gltf);
                this.arcadeModel = gltf.scene;
                
                // 調整模型大小
                this.arcadeModel.scale.set(0.6, 0.6, 0.6);
                
                // 創建容器
                this.arcadeContainer = new THREE.Group();
                
                // 計算模型的邊界框
                const scaledBox = new THREE.Box3().setFromObject(this.arcadeModel);
                const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
                
                // 將模型移動到相對於容器的正確位置
                this.arcadeModel.position.set(-scaledCenter.x, -scaledCenter.y, -scaledCenter.z);
                
                // 將模型添加到容器中
                this.arcadeContainer.add(this.arcadeModel);
                
                // 容器本身放在世界中心
                this.arcadeContainer.position.set(0, 0, 0);
                
                // 啟用陰影並調整材質
                this.arcadeModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // 調整材質讓機台更明顯
                        if (child.material) {
                            // 將材質改為深藍色
                            child.material.color = new THREE.Color(0x1a2a4a);
                            // 增加材質的反射
                            child.material.shininess = 100;
                            child.material.specular = new THREE.Color(0x222222);
                        }
                        
                        // 尋找螢幕物體（Object_7 或其他可能的螢幕名稱）
                        if (child.name && (child.name.includes('screen') || child.name.includes('display') || child.name.includes('object7') || child.name === 'Object_7')) {
                            console.log('🎯 找到螢幕物體:', child.name);
                            console.log('🎯 螢幕位置:', child.position.x, child.position.y, child.position.z);
                            console.log('🎯 螢幕旋轉:', child.rotation.x, child.rotation.y, child.rotation.z);
                            console.log('🎯 螢幕尺寸:', child.geometry.boundingBox);
                            
                            // 計算螢幕的實際尺寸
                            const box = child.geometry.boundingBox;
                            const size = new THREE.Vector3();
                            box.getSize(size);
                            console.log('🎯 螢幕實際尺寸:', size.x.toFixed(3), 'x', size.y.toFixed(3), 'x', size.z.toFixed(3));
                            console.log('🎯 螢幕寬高比:', (size.x/size.y).toFixed(2));
                            
                            // 保持螢幕物體的原始材質，不添加黃色覆蓋層
                            // child.material = new THREE.MeshBasicMaterial({ 
                            //     color: 0xffff00,  // 黃色
                            //     transparent: true,
                            //     opacity: 0.8
                            // });
                            
                            // 儲存螢幕物體引用
                            this.screenObject = child;
                        }
                        
                        // 為 Object6 添加黃色覆蓋層
                        if (child.name && (child.name.includes('object6') || child.name === 'Object_6')) {
                            console.log('🎯 找到 Object6 物體:', child.name);
                            console.log('🎯 Object6 位置:', child.position.x, child.position.y, child.position.z);
                            
                            // 將 Object6 設為藍色覆蓋層（與遊戲機主題最配）
                            child.material = new THREE.MeshBasicMaterial({ 
                                color: 0x3b82f6  // 藍色（與網站主題色一致），不透明
                            });
                            
                            console.log('✅ Object6 已添加藍色覆蓋層');
                        }
                        
                        // 輸出所有物體名稱以便調試
                        if (child.name) {
                            // 獲取世界座標
                            const worldPosition = new THREE.Vector3();
                            child.getWorldPosition(worldPosition);
                            
                            // 計算物體尺寸
                            const box = child.geometry.boundingBox;
                            const size = new THREE.Vector3();
                            box.getSize(size);
                            
                            console.log('🔍 模型物體:', child.name);
                            console.log('  - 本地位置:', child.position.x.toFixed(3), child.position.y.toFixed(3), child.position.z.toFixed(3));
                            console.log('  - 世界位置:', worldPosition.x.toFixed(3), worldPosition.y.toFixed(3), worldPosition.z.toFixed(3));
                            console.log('  - 尺寸:', size.x.toFixed(3), 'x', size.y.toFixed(3), 'x', size.z.toFixed(3));
                            console.log('  - 寬高比:', (size.x/size.y).toFixed(2));
                        }
                    }
                });
                
                this.scene.add(this.arcadeContainer);
                
                // 添加遊戲畫面到螢幕
                setTimeout(() => {
                    console.log('🎯 準備調用 addGameDisplay()');
                    this.addGameDisplay();
                }, 100);
                
                console.log('街機模型已添加到場景！');
            },
            (progress) => {
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`📈 模型載入進度: ${percent}%`);
                } else {
                    console.log('📦 正在載入模型檔案...');
                }
            },
            (error) => {
                console.error('❌ 載入模型時發生錯誤:', error);
                console.error('錯誤詳情:', {
                    message: error.message,
                    url: error.url,
                    type: error.type
                });
                console.log('🔄 創建備用模型...');
                this.createFallbackModel();
            }
        );
    }
    
    createFallbackModel() {
        console.log('創建備用模型...');
        const geometry = new THREE.BoxGeometry(2, 3, 1);
        // 改為深藍色機台
        const material = new THREE.MeshPhongMaterial({ color: 0x1a2a4a });
        this.arcadeModel = new THREE.Mesh(geometry, material);
        this.arcadeModel.position.set(0, 0, 0);
        
        // 創建容器
        this.arcadeContainer = new THREE.Group();
        this.arcadeContainer.add(this.arcadeModel);
        this.arcadeContainer.position.set(0, 0, 0);
        
        this.scene.add(this.arcadeContainer);
        
        // 添加更優雅的邊框效果
        this.addElegantBorder(geometry);
        
        console.log('備用模型創建完成');
    }
    
    addElegantBorder(geometry) {
        // 方案1：柔和的發光邊框
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x3b82f6,
            linewidth: 2,
            transparent: true,
            opacity: 0.6
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.arcadeModel.add(wireframe);
        
        // 方案2：添加微妙的環境光暈
        const glowGeometry = new THREE.BoxGeometry(2.1, 3.1, 1.1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.arcadeModel.add(glowMesh);
        
        // 方案3：添加頂部和底部的裝飾線
        this.addDecorativeLines();
    }
    
    addDecorativeLines() {
        // 頂部裝飾線
        const topLineGeometry = new THREE.BoxGeometry(2.2, 0.05, 0.05);
        const topLineMaterial = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.8
        });
        const topLine = new THREE.Mesh(topLineGeometry, topLineMaterial);
        topLine.position.set(0, 1.55, 0);
        this.arcadeModel.add(topLine);
        
        // 底部裝飾線
        const bottomLineGeometry = new THREE.BoxGeometry(2.2, 0.05, 0.05);
        const bottomLineMaterial = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.8
        });
        const bottomLine = new THREE.Mesh(bottomLineGeometry, bottomLineMaterial);
        bottomLine.position.set(0, -1.55, 0);
        this.arcadeModel.add(bottomLine);
        
        // 側面裝飾線
        const sideLineGeometry = new THREE.BoxGeometry(0.05, 3.2, 0.05);
        const sideLineMaterial = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.6
        });
        
        const leftLine = new THREE.Mesh(sideLineGeometry, sideLineMaterial);
        leftLine.position.set(-1.05, 0, 0);
        this.arcadeModel.add(leftLine);
        
        const rightLine = new THREE.Mesh(sideLineGeometry, sideLineMaterial);
        rightLine.position.set(1.05, 0, 0);
        this.arcadeModel.add(rightLine);
    }
    
    addGameDisplay() {
        console.log('🎮 開始創建遊戲畫面顯示系統...');
        
        // 重寫的遊戲畫面顯示系統
        this.createGameScreenDisplay();
    }
    
    // 舊的獨立遊戲畫面函數已移除，避免干擾新的3D遊戲畫面
    
    createGameScreenDisplay() {
        console.log('🎯 開始創建遊戲螢幕顯示系統...');
        
        // 檢查是否找到Object_7螢幕
        if (!this.screenObject) {
            console.log('❌ 未找到Object_7螢幕物體，無法創建遊戲畫面');
            return;
        }
        
        console.log('✅ 找到Object_7螢幕:', this.screenObject.name);
        console.log('📍 螢幕位置:', this.screenObject.position.x.toFixed(3), this.screenObject.position.y.toFixed(3), this.screenObject.position.z.toFixed(3));
        
        // 創建超高解析度遊戲畫面Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1200;  // 大幅提高解析度
        canvas.height = 900;  // 保持4:3比例
        const ctx = canvas.getContext('2d');
        
        console.log('🖼️ 遊戲畫面Canvas尺寸:', canvas.width, 'x', canvas.height, '比例:', (canvas.width/canvas.height).toFixed(2));
        
        // 繪製遊戲內容
        this.drawPixelGame(ctx, canvas.width, canvas.height);
        
        // 創建遊戲畫面材質
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;  // 保持像素風格
        texture.magFilter = THREE.NearestFilter;  // 保持像素風格
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
         const gameMaterial = new THREE.MeshBasicMaterial({ 
             map: texture,
             transparent: false,  // 不透明，更像真實螢幕
             side: THREE.FrontSide  // 只顯示正面
         });
        
        // 獲取Object_7螢幕的詳細信息
        const screenBox = this.screenObject.geometry.boundingBox;
        const screenSize = screenBox.getSize(new THREE.Vector3());
        const screenCenter = screenBox.getCenter(new THREE.Vector3());
        
         console.log('✅ 找到Object_7螢幕，開始創建遊戲畫面');
        
        // 分析螢幕方向，確定遊戲畫面的最佳尺寸
        const width = screenSize.x;
        const height = screenSize.y;
        const depth = screenSize.z;
        
        // 螢幕方向分析完成
        
         // 計算合適的3D遊戲畫面尺寸，保持高解析度但適中大小
         let gameWidth, gameHeight;
         
         // 使用固定大小，避免過大
         gameWidth = 1.1;   // 適中的寬度
         gameHeight = 0.8; // 適中的高度，保持4:3比例
        
        // 創建遊戲畫面網格
        const gameDisplay = new THREE.Mesh(
            new THREE.PlaneGeometry(gameWidth, gameHeight),
            gameMaterial
        );
        
        // 獲取螢幕的世界座標位置
        const worldPosition = new THREE.Vector3();
        this.screenObject.getWorldPosition(worldPosition);
        
        // 計算螢幕的世界座標邊界框
        const worldBox = new THREE.Box3().setFromObject(this.screenObject);
        const worldCenter = worldBox.getCenter(new THREE.Vector3());
        const worldSize = worldBox.getSize(new THREE.Vector3());
        
        // 直接將遊戲畫面放到螢幕的世界座標位置
        gameDisplay.position.set(
            worldCenter.x,  // 使用螢幕的世界X座標
            worldCenter.y,  // 使用螢幕的世界Y座標
            worldCenter.z + worldSize.z / 2 + 0.001  // 貼在螢幕正面表面
        );
        
         // 可調整的旋轉角度，方便調試
         // 嘗試不同的角度來找到最佳效果
         let rotationZ = 0;  // Z軸旋轉
         let rotationX = -10 * Math.PI / 180;  // X軸旋轉-10度
         
         // 常見的角度選項：
         // 0 = 不旋轉
         // Math.PI/2 = 90度
         // Math.PI = 180度
         // -Math.PI/2 = -90度
         
         gameDisplay.rotation.set(rotationX, 0, rotationZ);
         
         // 旋轉角度已設定完成
        
         // 遊戲畫面位置和旋轉已設定完成
         
         // 遊戲畫面創建完成
        
        // 創建遊戲螢幕邊框效果
        this.createGameScreenBorder(gameDisplay, gameWidth, gameHeight);
        
        // 直接將遊戲畫面添加到場景中，使用世界座標
        this.scene.add(gameDisplay);
        console.log('✅ 遊戲畫面已直接添加到場景中（使用世界座標）');
        
        // 初始時隱藏遊戲畫面，只在遊戲視角時顯示
        gameDisplay.visible = false;
        
        // 儲存引用
        this.gameDisplay = gameDisplay;
        this.gameCanvas = canvas;
        
        // 角度調試功能已移除
        this.gameCtx = ctx;
        
        // 開始動畫
        this.animateGameDisplay(gameDisplay, canvas, ctx);
        
        console.log('🎯 遊戲螢幕顯示系統創建完成:');
        console.log('✅ Canvas: 800x600 (4:3比例)');
        console.log('✅ 3D尺寸:', gameWidth.toFixed(3), 'x', gameHeight.toFixed(3), '(' + (gameWidth/gameHeight).toFixed(2) + ':1比例)');
        console.log('✅ 位置:', gameDisplay.position.x.toFixed(3), gameDisplay.position.y.toFixed(3), gameDisplay.position.z.toFixed(3));
        console.log('✅ 旋轉:', gameDisplay.rotation.x.toFixed(3), gameDisplay.rotation.y.toFixed(3), gameDisplay.rotation.z.toFixed(3));
        console.log('✅ 已貼在Object_7螢幕上（初始隱藏）');
    }
    
    // 舊的獨立遊戲畫面動畫函數已移除
    
    // 角度調試功能已移除，角度已設定完成
    
    drawPixelGame(ctx, width, height) {
        // 初始化遊戲狀態
        if (!this.gameState) {
            this.initClassicArcadeGames(width, height);
        }
        
        // 根據遊戲模式繪製不同內容
        switch(this.gameState.gameMode) {
            case 'pacman':
                this.updatePacmanGame();
                this.drawPacmanGame(ctx, width, height);
                break;
            case 'space_invaders':
                this.updateSpaceInvadersGame();
                this.drawSpaceInvadersGame(ctx, width, height);
                break;
            case 'snake':
                // 添加調試信息
                if (!this.snakeDebugShown) {
                    console.log('🐍 進入貪食蛇遊戲模式');
                    console.log('🐍 當前遊戲模式:', this.gameState.gameMode);
                    console.log('🐍 蛇狀態:', this.gameState.snake);
                    console.log('🐍 畫布尺寸:', width, 'x', height);
                    this.snakeDebugShown = true;
                }
                this.updateSnakeGame();
                this.drawSnakeGame(ctx, width, height);
                break;
            default:
                console.log('❌ 未知遊戲模式:', this.gameState.gameMode);
                break;
        }
    }
    
    // ===== 經典街機遊戲初始化 =====
    initClassicArcadeGames(width, height) {
        this.gameState = {
            gameMode: 'snake', // 設為貪食蛇作為初始遊戲
            score: 0,
            lives: 3,
            gameWidth: width,
            gameHeight: height,
            gameCompleted: false, // 防止重複顯示通關畫面
            keys: {
                left: false,
                right: false,
                up: false,
                down: false,
                space: false
            },
            // 小精靈遊戲狀態
            pacman: {
                x: 600,  // 移到畫面中央
                y: 500,  // 移到CHLOE字樣下方
                direction: 0, // 0:右, 1:下, 2:左, 3:上
                nextDirection: 0,
                speed: 3,
                mouthOpen: true,
                mouthTimer: 0,
                dots: [] // 添加dots數組
            },
            // 太空侵略者遊戲狀態
            spaceInvaders: {
                invaders: [],
                player: { x: 600, y: 800 }, // 移到畫面中央下方
                bullets: [],
                invaderBullets: [],
                direction: 1,
                moveTimer: 0,
                shootTimer: 0,
                explosions: [] // 爆炸效果
            },
            // 貪食蛇遊戲狀態
            snake: {
                snake: [],
                food: { x: 0, y: 0, letter: 65 },
                direction: 0, // 0:右, 1:下, 2:左, 3:上
                nextDirection: 0,
                speed: 1,
                gameOver: false,
                gridSize: 40, // 增大網格尺寸，從20改為40
                moveTimer: 0
            },
        };
        
        this.initializeGameBoards();
        this.setupGameControls();
        
        // 更新遊戲選擇面板顯示
        if (this.updateGameSelectorDisplay) {
            this.updateGameSelectorDisplay();
        }
    }
    
    initializeGameBoards() {
        const { width, height } = this.gameState;
        
        // 初始化太空侵略者 - XINTI字樣
        this.initializeXINTIInvaders();
        
        // 初始化小精靈豆子 - CHLOE字樣
        this.initializeCHLOEDots();
        
        // 初始化貪食蛇遊戲
        this.initializeSnakeGame();
    }
    
    // 初始化XINTI字樣的侵略者
    initializeXINTIInvaders() {
        const { width, height } = this.gameState;
        this.gameState.spaceInvaders.invaders = [];
        
        // XINTI字樣的位置和形狀 - 分開並居中
        const letters = [
            // X - 最左側
            {x: 100, y: 100, pattern: [
                [1,0,0,0,0,0,0,1],
                [0,1,0,0,0,0,1,0],
                [0,0,1,0,0,1,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,1,0,0,1,0,0],
                [0,1,0,0,0,0,1,0],
                [1,0,0,0,0,0,0,1]
            ]},
            // I - 左中
            {x: 300, y: 100, pattern: [
                [1,1,1,1,1,1,1,1],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [1,1,1,1,1,1,1,1]
            ]},
            // N - 正中央
            {x: 500, y: 100, pattern: [
                [1,0,0,0,0,0,0,1],
                [1,1,0,0,0,0,0,1],
                [1,0,1,0,0,0,0,1],
                [1,0,0,1,0,0,0,1],
                [1,0,0,0,1,0,0,1],
                [1,0,0,0,0,1,0,1],
                [1,0,0,0,0,0,1,1],
                [1,0,0,0,0,0,0,1]
            ]},
            // T - 右中
            {x: 700, y: 100, pattern: [
                [1,1,1,1,1,1,1,1],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0]
            ]},
            // I - 最右側
            {x: 900, y: 100, pattern: [
                [1,1,1,1,1,1,1,1],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [0,0,0,1,1,0,0,0],
                [1,1,1,1,1,1,1,1]
            ]}
        ];
        
        letters.forEach(letter => {
            letter.pattern.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    if (cell === 1) {
                        this.gameState.spaceInvaders.invaders.push({
                            x: letter.x + colIndex * 20, // 增大間距
                            y: letter.y + rowIndex * 20, // 增大間距
                            alive: true,
                            letter: letters.indexOf(letter)
                        });
                    }
                });
            });
        });
    }
    
    // 初始化CHLOE字樣的豆子
    initializeCHLOEDots() {
        const { width, height } = this.gameState;
        this.gameState.pacman.dots = [];
        
        // CHLOE字樣的位置和形狀 - 大幅分開並居中
        const letters = [
            // C - 最左側
            {x: 100, y: 300, pattern: [
                [0,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [0,1,1,1,1,1,1,1]
            ]},
            // H - 左中
            {x: 300, y: 300, pattern: [
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1]
            ]},
            // L - 正中央
            {x: 500, y: 300, pattern: [
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,1,1]
            ]},
            // O - 右中
            {x: 700, y: 300, pattern: [
                [0,1,1,1,1,1,1,0],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [0,1,1,1,1,1,1,0]
            ]},
            // E - 最右側
            {x: 900, y: 300, pattern: [
                [1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,1,1]
            ]}
        ];
        
        letters.forEach(letter => {
            letter.pattern.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    if (cell === 1) {
                        this.gameState.pacman.dots.push({
                            x: letter.x + colIndex * 20, // 增大間距
                            y: letter.y + rowIndex * 20, // 增大間距
                            eaten: false,
                            letter: letters.indexOf(letter)
                        });
                    }
                });
            });
        });
    }
    
    // 初始化貪食蛇遊戲
    initializeSnakeGame() {
        const { width, height } = this.gameState;
        const snake = this.gameState.snake;
        
        // 初始化蛇身
        snake.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // 初始化食物位置
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        
        // 確保食物不會與蛇身重疊
        let foodX, foodY;
        let attempts = 0;
        do {
            foodX = Math.floor(Math.random() * (width / snake.gridSize));
            foodY = Math.floor(Math.random() * (height / snake.gridSize));
            attempts++;
        } while (
            snake.snake.some(segment => segment.x === foodX && segment.y === foodY) &&
            attempts < 100 // 防止無限循環
        );
        
        // 暫時使用固定位置測試食物
        snake.food = {
            x: 15, // 固定位置
            y: 15, // 固定位置
            letter: randomLetter.charCodeAt(0)
        };
        
        console.log('🍎 使用固定食物位置:', snake.food.x, snake.food.y);
        
        console.log('🍎 食物初始化完成:');
        console.log('  - 食物位置:', snake.food.x, snake.food.y);
        console.log('  - 食物字母:', String.fromCharCode(snake.food.letter));
        console.log('  - 蛇身位置:', snake.snake);
        console.log('  - 網格尺寸:', snake.gridSize);
        console.log('  - 遊戲尺寸:', width, 'x', height);
        console.log('  - 最大網格:', Math.floor(width / snake.gridSize), 'x', Math.floor(height / snake.gridSize));
        
        snake.direction = 0; // 向右
        snake.nextDirection = 0;
        snake.gameOver = false;
        snake.moveTimer = 0;
        
        console.log('🐍 貪食蛇遊戲初始化完成');
    }
    
    setupGameControls() {
        document.addEventListener('keydown', (e) => {
            // 在遊戲視角時阻止上下鍵的預設行為（防止頁面捲動）
            if (this.currentViewMode === 'gameplay') {
                if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || 
                    e.code === 'KeyW' || e.code === 'KeyS') {
                    e.preventDefault();
                }
            }
            
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.gameState.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.gameState.keys.right = true;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.gameState.keys.up = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.gameState.keys.down = true;
                    break;
                case 'Space':
                    e.preventDefault();
                    this.gameState.keys.space = true;
                    break;
                case 'KeyG':
                    this.switchGameMode();
                    break;
                case 'KeyH':
                    // H 鍵重新開始當前遊戲
                    if (this.gameState.gameMode === 'snake' && this.gameState.snake && this.gameState.snake.gameOver) {
                        this.resetSnakeGame();
                        console.log('🔄 重新開始貪食蛇遊戲！');
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.gameState.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.gameState.keys.right = false;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.gameState.keys.up = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.gameState.keys.down = false;
                    break;
                case 'Space':
                    this.gameState.keys.space = false;
                    break;
            }
        });
        
        // 添加滑鼠點擊控制
        this.container.addEventListener('click', (e) => {
            this.addDebugLog('🖱️ 滑鼠點擊事件觸發', 'info');
            // 確保音效系統已激活
            this.activateAudioSystem();
            this.playClickSound();
        });
        
        // 添加鍵盤按鈕音效
        document.addEventListener('keydown', (e) => {
            // 確保音效系統已激活
            this.activateAudioSystem();
            this.playKeySound(e.code);
        });
    }
    
    switchGameMode(mode = null) {
        if (!this.gameState) return;
        
        if (mode) {
            // 直接切換到指定模式
            this.gameState.gameMode = mode;
        } else {
            // 循環切換到下一個模式
            const modes = ['pacman', 'space_invaders', 'snake'];
            const currentIndex = modes.indexOf(this.gameState.gameMode);
            const nextIndex = (currentIndex + 1) % modes.length;
            this.gameState.gameMode = modes[nextIndex];
        }
        
        // 清理可能存在的通關畫面
        this.clearGameCompleteNotification();
        
        // 重置遊戲狀態，讓玩家可以重新開始遊戲
        this.gameState.gameCompleted = false;
        this.gameState.gameOver = false;
        
        // 重置各個遊戲的狀態
        if (this.gameState.snake) {
            this.gameState.snake.gameOver = false;
        }
        
        // 重新初始化遊戲元素
        this.reinitializeGameElements();
        
        // 觸發相機控制器的遊戲模式粒子效果
        if (this.cameraController && this.cameraController.enterGameplayMode) {
            this.cameraController.enterGameplayMode();
            console.log('🎆 手動切換遊戲模式，已啟用粒子效果');
        }
        
        // 更新遊戲選擇面板顯示
        if (this.updateGameSelectorDisplay) {
            this.updateGameSelectorDisplay();
        }
        
        // 只在非主頁顯示遊戲模式通知
        if (!this.isMainPage()) {
            this.showGameModeNotification();
        }
    }
    
    showGameModeNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            border: 2px solid #3b82f6;
            border-radius: 10px;
            padding: 15px 20px;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        `;
        
        let modeText = '';
        switch(this.gameState.gameMode) {
            case 'pacman':
                modeText = '👻 小精靈 (CHLOE)';
                break;
            case 'space_invaders':
                modeText = '👽 太空侵略者 (XINTI)';
                break;
            case 'snake':
                modeText = '🐍 貪食蛇';
                break;
        }
        
        notification.textContent = modeText;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 1000);
    }
    
    // ===== 小精靈遊戲 =====
    updatePacmanGame() {
        const pacman = this.gameState.pacman;
        const keys = this.gameState.keys;
        
        // 處理方向輸入
        if (keys.right) pacman.nextDirection = 0;
        if (keys.down) pacman.nextDirection = 1;
        if (keys.left) pacman.nextDirection = 2;
        if (keys.up) pacman.nextDirection = 3;
        
        // 更新方向
        pacman.direction = pacman.nextDirection;
        
        // 移動小精靈
        switch(pacman.direction) {
            case 0: pacman.x += pacman.speed; break; // 右
            case 1: pacman.y += pacman.speed; break; // 下
            case 2: pacman.x -= pacman.speed; break; // 左
            case 3: pacman.y -= pacman.speed; break; // 上
        }
        
        // 邊界檢查
        if (pacman.x < 0) pacman.x = this.gameState.gameWidth;
        if (pacman.x > this.gameState.gameWidth) pacman.x = 0;
        if (pacman.y < 0) pacman.y = this.gameState.gameHeight;
        if (pacman.y > this.gameState.gameHeight) pacman.y = 0;
        
        // 嘴巴動畫
        pacman.mouthTimer++;
        if (pacman.mouthTimer > 10) {
            pacman.mouthOpen = !pacman.mouthOpen;
            pacman.mouthTimer = 0;
        }
        
        // 檢查是否吃到豆子 - 調整碰撞檢測範圍
        this.gameState.pacman.dots.forEach(dot => {
            if (!dot.eaten && 
                Math.abs(pacman.x - dot.x) < 20 && 
                Math.abs(pacman.y - dot.y) < 20) {
                dot.eaten = true;
                this.gameState.score += 10;
                this.playEatSound();
            }
        });
        
        // 檢查是否吃完了所有豆子
        const allDotsEaten = this.gameState.pacman.dots.every(dot => dot.eaten);
        if (allDotsEaten) {
            this.gameState.score += 100;
            this.switchToNextGameMode(); // 切換到下一個遊戲模式
        }
    }
    
    drawPacmanGame(ctx, width, height) {
        // 黑色背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        // 繪製小精靈
        this.drawPacman(ctx);
        
        // 繪製CHLOE豆子
        this.drawCHLOEDots(ctx);
        
        // 繪製UI
        this.drawClassicGameUI(ctx, width, height);
    }
    
    drawPacman(ctx) {
        const pacman = this.gameState.pacman;
        ctx.fillStyle = '#FFFF00';
        
        ctx.beginPath();
        ctx.arc(pacman.x, pacman.y, 15, 0, Math.PI * 2);
        
        if (pacman.mouthOpen) {
            // 繪製嘴巴
            const angle = pacman.direction * Math.PI / 2;
            ctx.moveTo(pacman.x, pacman.y);
            ctx.lineTo(
                pacman.x + Math.cos(angle + 0.5) * 15,
                pacman.y + Math.sin(angle + 0.5) * 15
            );
            ctx.lineTo(
                pacman.x + Math.cos(angle - 0.5) * 15,
                pacman.y + Math.sin(angle - 0.5) * 15
            );
        }
        
        ctx.fill();
    }
    
    drawCHLOEDots(ctx) {
        this.gameState.pacman.dots.forEach(dot => {
            if (!dot.eaten) {
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 8, 0, Math.PI * 2); // 進一步增大豆子半徑
                ctx.fill();
                
                // 添加發光效果
                ctx.shadowColor = '#FFFF00';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }
    
    drawClassicGameUI(ctx, width, height) {
        // 分數
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 5;
        
        let scoreText = '';
        switch(this.gameState.gameMode) {
            case 'pacman':
                scoreText = `👻 分數: ${this.gameState.score}`;
                break;
            case 'space_invaders':
                scoreText = `👽 分數: ${this.gameState.score}`;
                break;
            case 'snake':
                scoreText = `🐍 分數: ${this.gameState.score}`;
                break;
            case 'tetris':
                scoreText = `🧩 分數: ${this.gameState.score}`;
                break;
        }
        ctx.fillText(scoreText, 15, 30);
        
        // 生命值
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`❤️ 生命: ${this.gameState.lives}`, 15, 55);
        
        // 遊戲模式顯示
        const time = Date.now() * 0.005;
        ctx.fillStyle = `hsl(${180 + Math.sin(time) * 60}, 70%, 60%)`;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`🎯 模式: ${this.gameState.gameMode.toUpperCase()}`, 15, 75);
        
        // 重置陰影
        ctx.shadowBlur = 0;
        
        // 控制說明
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#3b82f6';
        ctx.textAlign = 'left';
        
        switch(this.gameState.gameMode) {
            case 'pacman':
                ctx.fillText('👻 方向鍵移動小精靈，吃掉CHLOE！', 15, height - 45);
                break;
            case 'space_invaders':
                ctx.fillText('👽 方向鍵移動，空白鍵射擊，消滅XINTI！', 15, height - 45);
                break;
            case 'snake':
                ctx.fillText('🐍 方向鍵控制蛇的方向，吃食物讓蛇變長！', 15, height - 45);
                break;
            case 'tetris':
                ctx.fillText('🧩 方向鍵移動旋轉，下鍵加速', 15, height - 45);
                break;
        }
        
        ctx.fillText('🔄 按 G 切換遊戲模式', 15, height - 10);
    }
    
    animateGameDisplay(display, canvas, ctx) {
        const animate = () => {
            // 只在遊戲畫面可見時才更新
            if (display.visible) {
                // 添加遊戲循環調試
                if (!this.gameLoopDebugShown) {
                    console.log('🔄 遊戲循環開始運行');
                    console.log('  - 顯示狀態:', display.visible);
                    console.log('  - 畫布尺寸:', canvas.width, 'x', canvas.height);
                    console.log('  - 當前遊戲模式:', this.gameState?.gameMode);
                    this.gameLoopDebugShown = true;
                }
                
                this.drawPixelGame(ctx, canvas.width, canvas.height);
                display.material.map.needsUpdate = true;
            }
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    setupControls() {
        // 滑鼠控制
        this.container.addEventListener('mousedown', (event) => {
            // 在遊戲視角時禁用拖拽
            if (this.currentViewMode === 'gameplay') {
                this.addDebugLog('🎮 遊戲視角中，禁用拖拽', 'info');
                return;
            }
            
            this.addDebugLog('🖱️ 滑鼠按下開始', 'info');
            this.isDragging = true;
            this.hasDragged = false;
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
            this.dragStartPos.x = event.clientX;
            this.dragStartPos.y = event.clientY;
        });
        
        document.addEventListener('mousemove', (event) => {
            if (!this.isDragging) return;
            
            const deltaX = event.clientX - this.mouse.x;
            const deltaY = event.clientY - this.mouse.y;
            
            // 檢查是否真的在拖拽（移動距離超過閾值）
            const dragDistance = Math.sqrt(
                Math.pow(event.clientX - this.dragStartPos.x, 2) + 
                Math.pow(event.clientY - this.dragStartPos.y, 2)
            );
            
            if (dragDistance > 10) { // 統一使用10像素的閾值
                if (!this.hasDragged) {
                    this.addDebugLog(`🔄 開始拖拽旋轉 (距離: ${dragDistance.toFixed(1)}px)`, 'info');
                }
                this.hasDragged = true;
            }
            
            this.targetRotation.y += deltaX * 0.01;
            this.targetRotation.x += deltaY * 0.01;
            
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        });
        
        document.addEventListener('mouseup', () => {
            this.addDebugLog(`🖱️ 滑鼠放開 (hasDragged: ${this.hasDragged})`, 'info');
            this.isDragging = false;
            // 如果確實拖拽過，延遲重置 hasDragged
            if (this.hasDragged) {
                this.addDebugLog('⏰ 延遲重置拖拽狀態 (100ms)', 'info');
                setTimeout(() => {
                    this.hasDragged = false;
                    this.addDebugLog('✅ 拖拽狀態已重置', 'success');
                }, 100); // 增加延遲時間到100ms
            } else {
                // 如果沒有拖拽，立即重置，避免影響後續點擊
                this.hasDragged = false;
                this.addDebugLog('✅ 無拖拽，立即重置狀態', 'success');
            }
        });
        
        // 觸控控制
        this.container.addEventListener('touchstart', (event) => {
            event.preventDefault();
            
            // 在遊戲視角時禁用觸控拖拽
            if (this.currentViewMode === 'gameplay') {
                return;
            }
            
            this.isDragging = true;
            this.mouse.x = event.touches[0].clientX;
            this.mouse.y = event.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (event) => {
            if (!this.isDragging) return;
            event.preventDefault();
            
            const deltaX = event.touches[0].clientX - this.mouse.x;
            const deltaY = event.touches[0].clientY - this.mouse.y;
            
            this.targetRotation.y += deltaX * 0.01;
            this.targetRotation.x += deltaY * 0.01;
            
            this.mouse.x = event.touches[0].clientX;
            this.mouse.y = event.touches[0].clientY;
        });
        
        document.addEventListener('touchend', () => {
            this.isDragging = false;
        });
        
        // 視窗大小調整
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
        
        console.log('控制設置完成');
    }
    
    setupHoverEffects() {
        // 設置懸停效果
        this.container.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.onHoverStart();
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.onHoverEnd();
        });
        
        console.log('懸停效果設置完成');
    }
    
    onHoverStart() {
        // 懸停開始時的效果
        console.log('遊戲機懸停開始');
        
        // 添加音效提示
        this.playHoverSound();
    }
    
    onHoverEnd() {
        // 懸停結束時的效果
        console.log('遊戲機懸停結束');
    }
    
    playHoverSound() {
        // 創建簡單的音效
        if (!this.ensureAudioContext()) {
            console.log('⚠️ AudioContext 不可用，跳過懸停音效');
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('懸停音效播放失敗:', error);
        }
    }
    
    playClickSound() {
        // 點擊音效
        if (!this.ensureAudioContext()) {
            console.log('⚠️ AudioContext 不可用，跳過點擊音效');
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (error) {
            console.log('點擊音效播放失敗:', error);
        }
    }
    
    playKeySound(keyCode) {
        // 根據不同按鍵播放不同音效
        if (!this.ensureAudioContext()) {
            console.log('⚠️ AudioContext 不可用，跳過按鍵音效');
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            let frequency = 600;
            let duration = 0.1;
            
            // 根據按鍵類型調整音效
            switch(keyCode) {
                case 'ArrowLeft':
                case 'KeyA':
                    frequency = 400;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    frequency = 600;
                    break;
                case 'Space':
                case 'ArrowUp':
                case 'KeyW':
                    frequency = 800;
                    duration = 0.15;
                    break;
                case 'KeyG':
                    frequency = 1000;
                    duration = 0.2;
                    break;
                default:
                    return;
            }
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.log('按鍵音效播放失敗:', error);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // 平滑旋轉（允許在所有視角旋轉）
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.1;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.1;
        
        // 更新視角位置顯示（已關閉）
        // this.updateViewAngleDisplay();
        
        // 機台以自己為中心旋轉（遊戲視角時固定不動）
        if (this.arcadeContainer) {
            // 只在非遊戲視角時才旋轉
            if (this.currentViewMode !== 'gameplay') {
            this.arcadeContainer.rotation.x = this.currentRotation.x;
            this.arcadeContainer.rotation.y = this.currentRotation.y;
            this.arcadeContainer.rotation.z = 0;
            }
            
            // 懸停時的縮放效果（只在非遊戲視角時生效）
            if (this.isHovering && this.currentViewMode !== 'gameplay') {
                this.hoverIntensity += deltaTime * 2;
                const scale = 1 + Math.sin(this.hoverIntensity) * 0.05;
                this.arcadeContainer.scale.set(scale, scale, scale);
            } else {
                this.hoverIntensity = 0;
                this.arcadeContainer.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }
        
        // 懸停燈光效果（只在非遊戲視角時生效）- 調整強度以減少反射光點大小
        if (this.isHovering && this.currentViewMode !== 'gameplay') {
            this.hoverLights.forEach((light, index) => {
                light.intensity = 0.3 + Math.sin(Date.now() * 0.005 + index) * 0.2;  // 強度從0.5+0.3減少到0.3+0.2
            });
        } else {
            this.hoverLights.forEach(light => {
                light.intensity = 0;
            });
        }
        
        // 粒子動畫
        if (this.particles) {
            const isGameModePage = window.location.pathname.includes('game_mode.html');
            
            if (isGameModePage) {
                // 遊戲模式頁面的彩色粒子動畫
                this.particles.rotation.y += deltaTime * 0.1;
                this.particles.rotation.x += deltaTime * 0.05;
                
                // 遊戲模式頁面中粒子始終保持發亮效果
                this.particles.material.opacity = 0.8;
                this.particles.material.size = 0.2;
            } else {
                // 主頁模式（包括遊戲視角）的藍色粒子動畫
                this.particles.rotation.y += deltaTime * 0.1;
                this.particles.rotation.x += deltaTime * 0.05;
                
                // 懸停時粒子更活躍
                if (this.isHovering) {
                    this.particles.material.opacity = 0.9;
                    this.particles.material.size = 0.2;
                } else {
                    this.particles.material.opacity = 0.6;
                    this.particles.material.size = 0.15;
                }
            }
        }
        
        // 自動旋轉（只在非遊戲視角時旋轉）
        if (!this.isDragging && !this.gameState && this.currentViewMode !== 'gameplay') {
            this.targetRotation.y += 0.005;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    initCameraController() {
        // 相機控制功能已整合在 ArcadeMachine3D 類中
        this.cameraController = {
            enterGameplayMode: () => {
                console.log('🎮 進入遊戲模式視角');
                this.moveCameraToPosition('gameplay');
            },
            enterCinematicMode: () => {
                console.log('🎬 進入電影模式視角');
                this.moveCameraToPosition('cinematic');
            }
        };
        console.log('✅ 相機控制器已初始化');
    }
    
    initSimpleCameraSwitch() {
        // 簡化的相機切換功能
        this.currentViewMode = 'overview';
        this.isTransitioning = false;
        
        // 視角定義
        this.viewModes = {
            overview: {
                name: "總覽視角",
                position: { x: 0, y: 0.5, z: 4 },
                target: { x: 0, y: 0, z: 0 },
                fov: 60
            },
            gameplay: {
                name: "遊戲視角", 
                position: { x: 0, y: 0.6, z: 1.5 },
                target: { x: 0, y: 0.5, z: 0 },
                fov: 70
            }
        };
        
        // 添加點擊事件 - 根據當前視角決定切換行為
        this.container.addEventListener('click', (event) => {
            this.addDebugLog('🎯 點擊事件開始處理', 'info');
            
            if (this.isTransitioning) {
                this.addDebugLog('❌ 正在過渡中，忽略點擊', 'warning');
                return;
            }
            
            // 檢查是否真的拖拽過（移動距離超過10像素）
            const dragDistance = Math.sqrt(
                Math.pow(event.clientX - this.dragStartPos.x, 2) + 
                Math.pow(event.clientY - this.dragStartPos.y, 2)
            );
            
            this.addDebugLog(`📏 點擊距離檢查: ${dragDistance.toFixed(1)}px, hasDragged: ${this.hasDragged}`, 'info');
            
            if (dragDistance > 10 || this.hasDragged) {
                this.addDebugLog(`🚫 檢測到拖拽，忽略點擊 (距離: ${dragDistance.toFixed(1)}px, hasDragged: ${this.hasDragged})`, 'warning');
                return;
            }
            
            // 根據當前視角決定切換行為
            if (this.currentViewMode === 'gameplay') {
                this.addDebugLog('🎮 遊戲視角中，點擊回到總覽視角', 'success');
                this.switchViewMode('overview');
            } else {
                this.addDebugLog('📤 總覽視角中，點擊進入遊戲視角', 'success');
                this.switchToGameplayView();
            }
        });
        
        // 鍵盤控制
        document.addEventListener('keydown', (event) => {
            if (this.isTransitioning) return;
            
            switch(event.code) {
                case 'KeyV':
                    this.cycleViewModes();
                    break;
                case 'Escape':
                    this.switchViewMode('overview');
                    break;
            }
        });
        
        console.log('🎮 簡化相機切換功能已初始化');
    }
    
    switchToGameplayView() {
        this.addDebugLog(`🔄 switchToGameplayView 被調用，當前視角: ${this.currentViewMode}`, 'info');
        
        // 檢查相機是否在遊戲視角位置（距離遊戲機較近）
        const cameraDistance = this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        const isInGameplayView = cameraDistance < 2.0; // 遊戲視角距離較近
        
        this.addDebugLog(`📏 相機距離: ${cameraDistance.toFixed(2)}, 是否在遊戲視角: ${isInGameplayView}`, 'info');
        
        if (isInGameplayView) {
            this.addDebugLog('📤 切換到 overview 視角', 'success');
            this.switchViewMode('overview');
        } else {
            this.addDebugLog('📥 切換到 gameplay 視角', 'success');
            this.switchViewMode('gameplay');
        }
    }
    
    switchViewMode(targetMode) {
        this.addDebugLog(`🎬 switchViewMode 被調用: ${this.currentViewMode} -> ${targetMode}`, 'info');
        
        if (!this.camera || this.isTransitioning) {
            this.addDebugLog(`❌ 視角切換被阻止: camera=${!!this.camera}, transitioning=${this.isTransitioning}`, 'warning');
            return;
        }
        
        // 檢查是否重複切換到相同視角
        if (this.currentViewMode === targetMode) {
            this.addDebugLog(`⚠️ 重複切換到相同視角: ${targetMode}`, 'warning');
            return;
        }
        
        this.addDebugLog(`✅ 開始切換視角: ${this.currentViewMode} -> ${targetMode}`, 'success');
        this.isTransitioning = true;
        
        // 不要立即更新 currentViewMode，讓相機移動完成後再更新
        
        const endMode = this.viewModes[targetMode];
        
        // 如果是切換到遊戲視角，先平滑旋轉遊戲機到正面
        if (targetMode === 'gameplay' && this.arcadeContainer) {
            // 設置目標旋轉角度（正面角度）
            this.targetRotation.y = -Math.PI / 2;
            this.targetRotation.x = 0;
            
            // 等待遊戲機旋轉完成後再移動相機
            this.waitForRotationThenMoveCamera(endMode);
        } else {
            // 非遊戲視角，直接移動相機
            if (targetMode === 'overview') {
                // 從遊戲視角回到總覽視角，直接移動，避免先拉近再拉遠
                this.addDebugLog('📤 直接切換到總覽視角', 'success');
                this.moveCameraToPositionDirect(endMode);
            } else {
                this.moveCameraToPosition(endMode);
            }
            
            // 隱藏遊戲畫面
            if (this.gameDisplay) {
                this.gameDisplay.visible = false;
                console.log('3D遊戲畫面已隱藏');
            }
            
            // 隱藏遊戲視角提示
            this.hideGameplayHint();
        }
        
        // 注意：currentViewMode 會在相機動畫完成後更新
        console.log('視角切換開始:', targetMode);
        
        // 觸發事件
        const event = new CustomEvent('cameraViewChanged', {
            detail: { mode: targetMode, viewMode: endMode }
        });
        document.dispatchEvent(event);
    }
    
    waitForRotationThenMoveCamera(endMode) {
        // 檢查旋轉是否完成
        const rotationThreshold = 0.01;
        const isRotationComplete = Math.abs(this.currentRotation.y - this.targetRotation.y) < rotationThreshold &&
                                  Math.abs(this.currentRotation.x - this.targetRotation.x) < rotationThreshold;
        
        if (isRotationComplete) {
            // 旋轉完成，移動相機
            this.moveCameraToPosition(endMode);
            
            // 顯示遊戲畫面
            this.showGameDisplay();
        } else {
            // 繼續等待旋轉完成，使用更短的間隔減少卡頓感
            setTimeout(() => this.waitForRotationThenMoveCamera(endMode), 8); // 約120fps，更流暢
        }
    }
    
    moveCameraToPositionDirect(endMode) {
        // 直接移動相機到目標位置，不使用動畫
        const endPosition = new THREE.Vector3(endMode.position.x, endMode.position.y, endMode.position.z);
        const endTarget = new THREE.Vector3(endMode.target.x, endMode.target.y, endMode.target.z);
        
        this.addDebugLog(`🎯 直接移動相機到: (${endPosition.x}, ${endPosition.y}, ${endPosition.z})`, 'success');
        
        // 直接設置相機位置
        this.camera.position.copy(endPosition);
        this.camera.lookAt(endTarget);
        this.camera.fov = endMode.fov;
        this.camera.updateProjectionMatrix();
        
        // 立即完成過渡
        this.isTransitioning = false;
        
        // 更新當前視角模式
        this.currentViewMode = endMode.name === '遊戲視角' ? 'gameplay' : 'overview';
        
        this.addDebugLog(`✅ 相機直接移動完成，當前視角: ${this.currentViewMode}`, 'success');
    }
    
    moveCameraToPosition(endMode) {
        // 計算相機的最終位置
        let endPosition, endTarget;
        
        if (endMode.name === "遊戲視角") {
            // 遊戲視角：相機移動到您喜歡的位置
            // 遊戲機已經旋轉到 -Math.PI / 2 角度，相機移動到 (0.00, 0.80, 1.20)
            endPosition = new THREE.Vector3(0, 0.8, 1.2);
            endTarget = new THREE.Vector3(0, 0.5, 0);
        } else {
            // 其他視角使用預設位置
            endPosition = new THREE.Vector3(endMode.position.x, endMode.position.y, endMode.position.z);
            endTarget = new THREE.Vector3(endMode.target.x, endMode.target.y, endMode.target.z);
        }
        
        // 平滑移動相機到目標位置
        const startPosition = this.camera.position.clone();
        const startTarget = new THREE.Vector3();
        this.camera.getWorldDirection(startTarget);
        startTarget.add(this.camera.position);
        
        console.log('相機移動:', {
            start: startPosition,
            end: endPosition,
            target: endTarget,
            mode: endMode.name
        });
        
        const duration = 800; // 動畫持續時間（毫秒）
        const startTime = Date.now();
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用緩動函數
            const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            
            // 插值相機位置
            this.camera.position.lerpVectors(startPosition, endPosition, easeProgress);
            
            // 插值相機目標
            const currentTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, easeProgress);
            this.camera.lookAt(currentTarget);
            
            // 插值FOV
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, endMode.fov, easeProgress);
            this.camera.updateProjectionMatrix();
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            } else {
                // 動畫完成
                this.isTransitioning = false;
                
                // 更新當前視角模式
                this.currentViewMode = endMode.name === '遊戲視角' ? 'gameplay' : 'overview';
                
                // 如果是切換到遊戲視角，顯示遊戲畫面
                if (this.currentViewMode === 'gameplay') {
                    this.showGameDisplay();
                }
                
                this.addDebugLog(`✅ 平滑相機移動完成，當前視角: ${this.currentViewMode}`, 'success');
            }
        };
        
        animateCamera();
    }
    
    createGameScreenBorder(gameDisplay, width, height) {
        // 創建遊戲螢幕邊框，模擬真實街機螢幕的邊框
        const borderThickness = 0.01;
        const borderColor = 0x1a1a1a;  // 深灰色邊框
        
        // 頂部邊框
        const topBorder = new THREE.Mesh(
            new THREE.PlaneGeometry(width + borderThickness * 2, borderThickness),
            new THREE.MeshBasicMaterial({ color: borderColor })
        );
        topBorder.position.set(0, height/2 + borderThickness/2, 0.001);
        gameDisplay.add(topBorder);
        
        // 底部邊框
        const bottomBorder = new THREE.Mesh(
            new THREE.PlaneGeometry(width + borderThickness * 2, borderThickness),
            new THREE.MeshBasicMaterial({ color: borderColor })
        );
        bottomBorder.position.set(0, -height/2 - borderThickness/2, 0.001);
        gameDisplay.add(bottomBorder);
        
        // 左側邊框
        const leftBorder = new THREE.Mesh(
            new THREE.PlaneGeometry(borderThickness, height),
            new THREE.MeshBasicMaterial({ color: borderColor })
        );
        leftBorder.position.set(-width/2 - borderThickness/2, 0, 0.001);
        gameDisplay.add(leftBorder);
        
        // 右側邊框
        const rightBorder = new THREE.Mesh(
            new THREE.PlaneGeometry(borderThickness, height),
            new THREE.MeshBasicMaterial({ color: borderColor })
        );
        rightBorder.position.set(width/2 + borderThickness/2, 0, 0.001);
        gameDisplay.add(rightBorder);
        
        console.log('✅ 遊戲螢幕邊框已創建');
    }
    
    createScreenDebugHelpers() {
        if (!this.screenObject) return;
        
        console.log('🔧 創建螢幕調試輔助工具...');
        
        // 創建螢幕中心點標記（綠色球體）
        const centerGeometry = new THREE.SphereGeometry(0.05, 8, 6);
        const centerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const centerMarker = new THREE.Mesh(centerGeometry, centerMaterial);
        centerMarker.position.copy(this.screenObject.position);
        this.arcadeContainer.add(centerMarker);
        
        // 創建螢幕邊界框（紅色線框）
        const boxGeometry = new THREE.BoxGeometry(
            this.screenObject.geometry.boundingBox.max.x - this.screenObject.geometry.boundingBox.min.x,
            this.screenObject.geometry.boundingBox.max.y - this.screenObject.geometry.boundingBox.min.y,
            this.screenObject.geometry.boundingBox.max.z - this.screenObject.geometry.boundingBox.min.z
        );
        const boxMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.copy(this.screenObject.position);
        this.arcadeContainer.add(boxMesh);
        
        // 創建座標軸（X紅 Y綠 Z藍）
        const axesHelper = new THREE.AxesHelper(0.3);
        axesHelper.position.copy(this.screenObject.position);
        this.arcadeContainer.add(axesHelper);
        
        // 創建螢幕表面標記（藍色平面）
        const surfaceGeometry = new THREE.PlaneGeometry(
            this.screenObject.geometry.boundingBox.max.x - this.screenObject.geometry.boundingBox.min.x,
            this.screenObject.geometry.boundingBox.max.y - this.screenObject.geometry.boundingBox.min.y
        );
        const surfaceMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0000ff, 
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        surfaceMesh.position.copy(this.screenObject.position);
        surfaceMesh.position.z += (this.screenObject.geometry.boundingBox.max.z - this.screenObject.geometry.boundingBox.min.z) / 2 + 0.01;
        this.arcadeContainer.add(surfaceMesh);
        
        console.log('✅ 調試輔助工具已創建:');
        console.log('  - 綠色球體: 螢幕中心點');
        console.log('  - 紅色線框: 螢幕邊界框');
        console.log('  - 座標軸: X(紅) Y(綠) Z(藍)');
        console.log('  - 藍色平面: 螢幕表面位置');
    }
    
    showGameDisplay() {
        console.log('🎮 顯示遊戲畫面 - 重寫版本');
        console.log('🎮 當前視角模式:', this.currentViewMode);
        console.log('🎮 相機位置:', this.camera.position.x.toFixed(2), this.camera.position.y.toFixed(2), this.camera.position.z.toFixed(2));
        
        // 檢查Object_7螢幕和遊戲畫面
        if (!this.screenObject) {
            console.log('❌ Object_7螢幕不存在，無法顯示遊戲畫面');
            return;
        }
        
        if (!this.gameDisplay) {
            console.log('❌ 遊戲畫面不存在，重新創建...');
            this.createGameScreenDisplay();
            
            // 等待創建完成後顯示
            setTimeout(() => {
                if (this.gameDisplay) {
                    this.gameDisplay.visible = true;
                    console.log('✅ 重新創建後遊戲畫面已顯示');
                }
            }, 100);
            return;
        }
        
        // 顯示遊戲畫面
        this.gameDisplay.visible = true;
        console.log('✅ 遊戲畫面已顯示在Object_7螢幕上');
        
        // 顯示詳細信息
        console.log('🎮 遊戲畫面狀態:');
        console.log('  - 可見性:', this.gameDisplay.visible);
        console.log('  - 位置:', this.gameDisplay.position.x.toFixed(3), this.gameDisplay.position.y.toFixed(3), this.gameDisplay.position.z.toFixed(3));
        console.log('  - 旋轉:', this.gameDisplay.rotation.x.toFixed(3), this.gameDisplay.rotation.y.toFixed(3), this.gameDisplay.rotation.z.toFixed(3));
        console.log('  - 父物件:', this.gameDisplay.parent ? this.gameDisplay.parent.name : '無');
        
        // 計算與相機的距離
        const worldPosition = new THREE.Vector3();
        this.gameDisplay.getWorldPosition(worldPosition);
        const distanceToCamera = worldPosition.distanceTo(this.camera.position);
        console.log('  - 世界位置:', worldPosition.x.toFixed(3), worldPosition.y.toFixed(3), worldPosition.z.toFixed(3));
        console.log('  - 距離相機:', distanceToCamera.toFixed(3));
        
        // 只在非主頁顯示遊戲視角提示
        if (!this.isMainPage()) {
            this.showGameplayHint();
        }
    }
    
    showGameplayHint() {
        // 移除舊的提示
        const existingHint = document.getElementById('gameplay-hint');
        if (existingHint) {
            existingHint.remove();
        }
        
        // 創建遊戲視角提示
        const hint = document.createElement('div');
        hint.id = 'gameplay-hint';
        hint.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(45, 45, 45, 0.95));
            border: 2px solid #3b82f6;
            border-radius: 15px;
            padding: 15px 25px;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.6);
            text-align: center;
            backdrop-filter: blur(10px);
            animation: gameplayHintPulse 3s ease-in-out infinite;
        `;
        
        hint.innerHTML = `
            <div style="color: #3b82f6; margin-bottom: 5px;">🎮 遊戲視角</div>
            <div style="font-size: 12px; color: #ccc;">點擊螢幕回到總覽畫面</div>
        `;
        
        // 添加CSS動畫
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gameplayHintPulse {
                0%, 100% { 
                    transform: translateX(-50%) scale(1); 
                    opacity: 0.8; 
                }
                50% { 
                    transform: translateX(-50%) scale(1.05); 
                    opacity: 1; 
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(hint);
        
        // 3秒後自動隱藏提示
        setTimeout(() => {
            if (hint && hint.parentNode) {
                hint.style.animation = 'fadeOut 0.5s ease-out forwards';
                setTimeout(() => {
                    if (hint && hint.parentNode) {
                        hint.remove();
                        style.remove();
                    }
                }, 500);
            }
        }, 3000);
        
        // 添加淡出動畫
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; transform: translateX(-50%) scale(1); }
                to { opacity: 0; transform: translateX(-50%) scale(0.9); }
            }
        `;
        document.head.appendChild(fadeOutStyle);
    }
    
    hideGameplayHint() {
        // 隱藏遊戲視角提示
        const existingHint = document.getElementById('gameplay-hint');
        if (existingHint) {
            existingHint.remove();
        }
    }
    
    cycleViewModes() {
        const modes = ['overview', 'gameplay'];
        const currentIndex = modes.indexOf(this.currentViewMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.switchViewMode(modes[nextIndex]);
    }
    
    // ===== 太空侵略者遊戲 =====
    updateSpaceInvadersGame() {
        const game = this.gameState.spaceInvaders;
        const keys = this.gameState.keys;
        
        // 玩家移動
        if (keys.left && game.player.x > 20) game.player.x -= 4;
        if (keys.right && game.player.x < this.gameState.gameWidth - 20) game.player.x += 4;
        
        // 射擊 - 無限制射擊系統
        if (keys.space) {
            // 只控制射擊間隔，不限制子彈數量
            if (!game.lastShotTime) game.lastShotTime = 0;
            const currentTime = Date.now();
            const shootInterval = 100; // 100毫秒間隔，更流暢
            
            if (currentTime - game.lastShotTime > shootInterval) {
                game.bullets.push({ 
                    x: game.player.x, 
                    y: game.player.y - 10, 
                    speed: 6,
                    id: Date.now() + Math.random() // 添加唯一ID
                });
                game.lastShotTime = currentTime;
            this.playShootSound();
            }
        }
        
        // 更新子彈
        game.bullets = game.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });
        
        // 侵略者移動
        game.moveTimer++;
        if (game.moveTimer > 25) { // 從40減少到25，讓侵略者移動更快
            game.moveTimer = 0;
            game.invaders.forEach(invader => {
                if (invader.alive) {
                    invader.x += game.direction * 8;
                    if (invader.x <= 20 || invader.x >= this.gameState.gameWidth - 20) {
                game.direction *= -1;
                        game.invaders.forEach(i => i.y += 15);
                    }
                }
            });
        }
        
        // 侵略者射擊
        game.shootTimer++;
        if (game.shootTimer > 60) { // 侵略者每60幀射擊一次
            game.shootTimer = 0;
            const aliveInvaders = game.invaders.filter(invader => invader.alive);
            if (aliveInvaders.length > 0) {
                // 隨機選擇一個活著的侵略者射擊
                const randomInvader = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
                game.invaderBullets.push({
                    x: randomInvader.x,
                    y: randomInvader.y + 20,
                    speed: 3
                });
            }
        }
        
        // 更新侵略者子彈
        game.invaderBullets = game.invaderBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.gameState.gameHeight;
        });
        
        // 碰撞檢測 - 玩家子彈擊中侵略者
        game.bullets.forEach((bullet, bulletIndex) => {
            game.invaders.forEach((invader, invaderIndex) => {
                if (invader.alive && 
                    bullet.x > invader.x - 15 && bullet.x < invader.x + 15 &&
                    bullet.y > invader.y - 15 && bullet.y < invader.y + 15) {
                    invader.alive = false;
                    game.bullets.splice(bulletIndex, 1);
                    this.gameState.score += 20;
                    this.playHitSound();
                    
                    // 添加爆炸效果
                    this.addExplosion(invader.x, invader.y);
                }
            });
        });
        
        // 碰撞檢測 - 侵略者子彈擊中玩家
        game.invaderBullets.forEach((bullet, bulletIndex) => {
            if (bullet.x > game.player.x - 15 && bullet.x < game.player.x + 15 &&
                bullet.y > game.player.y - 15 && bullet.y < game.player.y + 15) {
                game.invaderBullets.splice(bulletIndex, 1);
                this.gameState.lives--;
                this.playHitSound();
                
                // 添加爆炸效果
                this.addExplosion(game.player.x, game.player.y);
                
                // 檢查遊戲結束
                if (this.gameState.lives <= 0) {
                    this.gameState.gameOver = true;
                }
            }
        });
        
        // 碰撞檢測 - 玩家子彈與侵略者子彈相撞
        game.bullets.forEach((playerBullet, playerBulletIndex) => {
            game.invaderBullets.forEach((invaderBullet, invaderBulletIndex) => {
                if (Math.abs(playerBullet.x - invaderBullet.x) < 10 && 
                    Math.abs(playerBullet.y - invaderBullet.y) < 10) {
                    game.bullets.splice(playerBulletIndex, 1);
                    game.invaderBullets.splice(invaderBulletIndex, 1);
                    this.playHitSound();
                }
            });
        });
        
        // 更新爆炸效果
        game.explosions = game.explosions.filter(explosion => {
            explosion.timer++;
            explosion.radius += explosion.speed;
            explosion.opacity -= 0.02;
            return explosion.timer < 30 && explosion.opacity > 0;
        });
        
        // 檢查是否消滅了所有侵略者
        const allInvadersDead = game.invaders.every(invader => !invader.alive);
        if (allInvadersDead) {
            this.gameState.score += 500;
            this.switchToNextGameMode(); // 切換到下一個遊戲模式
        }
    }
    
    drawSpaceInvadersGame(ctx, width, height) {
        // 太空背景
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, width, height);
        
        // 繪製星星
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 13) % width;
            const y = (i * 17) % height;
            ctx.fillRect(x, y, 1, 1);
        }
        
        // 繪製XINTI侵略者 - 現代化設計
        this.gameState.spaceInvaders.invaders.forEach(invader => {
            if (invader.alive) {
                // 根據字母類型使用不同顏色
                const colors = [
                    { outer: '#ff6b6b', inner: '#ff8e8e', core: '#ffb3b3' }, // X - 紅色系
                    { outer: '#4ecdc4', inner: '#7dd3d0', core: '#a8e6e3' }, // I - 青色系
                    { outer: '#45b7d1', inner: '#6bc5d8', core: '#8dd3df' }, // N - 藍色系
                    { outer: '#96ceb4', inner: '#a8d5c1', core: '#badcce' }, // T - 綠色系
                    { outer: '#feca57', inner: '#fed976', core: '#fee895' }  // I - 黃色系
                ];
                
                const colorSet = colors[invader.letter] || colors[0];
                
                // 外層發光效果
                ctx.shadowColor = colorSet.outer;
                ctx.shadowBlur = 20;
                ctx.fillStyle = colorSet.outer;
                ctx.fillRect(invader.x - 14, invader.y - 14, 28, 28);
                
                // 中層主體
                ctx.shadowBlur = 10;
                ctx.fillStyle = colorSet.inner;
                ctx.fillRect(invader.x - 10, invader.y - 10, 20, 20);
                
                // 內層核心
                ctx.shadowBlur = 0;
                ctx.fillStyle = colorSet.core;
                ctx.fillRect(invader.x - 6, invader.y - 6, 12, 12);
                
                // 添加科技感細節
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(invader.x - 2, invader.y - 2, 4, 4); // 中心亮點
                
                // 添加動態效果
                const time = Date.now() * 0.005;
                const pulse = Math.sin(time + invader.x * 0.01) * 0.2 + 0.8;
                ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
                ctx.fillRect(invader.x - 1, invader.y - 1, 2, 2);
            }
        });
        
        // 繪製玩家 - 增強可見性
        const player = this.gameState.spaceInvaders.player;
        
        // 外層發光效果
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(player.x - 18, player.y - 8, 36, 16);
        
        // 中層主體
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(player.x - 15, player.y - 5, 30, 10);
        
        // 內層亮點
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(player.x - 12, player.y - 2, 24, 4);
        
        // 添加科技感細節
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(player.x - 3, player.y - 7, 6, 2); // 頂部天線
        ctx.fillRect(player.x - 1, player.y + 5, 2, 3); // 底部推進器
        
        // 繪製玩家子彈 - 增強可見性
        this.gameState.spaceInvaders.bullets.forEach(bullet => {
            // 外層發光效果
                ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(bullet.x - 4, bullet.y - 7, 8, 14);
            
            // 中層主體
                ctx.shadowBlur = 8;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(bullet.x - 3, bullet.y - 6, 6, 12);
            
            // 內層核心
                ctx.shadowBlur = 0;
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(bullet.x - 2, bullet.y - 5, 4, 10);
        });
        
        // 繪製侵略者子彈 - 紅色系
        this.gameState.spaceInvaders.invaderBullets.forEach(bullet => {
            // 外層發光效果
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(bullet.x - 3, bullet.y - 5, 6, 10);
            
            // 中層主體
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#ff6666';
            ctx.fillRect(bullet.x - 2, bullet.y - 4, 4, 8);
            
            // 內層核心
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ff8888';
            ctx.fillRect(bullet.x - 1, bullet.y - 3, 2, 6);
            
            // 添加動態效果
            const time = Date.now() * 0.01;
            const pulse = Math.sin(time + bullet.x * 0.1) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
            ctx.fillRect(bullet.x - 1, bullet.y - 2, 2, 4);
        });
        
        // 繪製爆炸效果
        this.drawExplosions(ctx);
        
        this.drawClassicGameUI(ctx, width, height);
    }
    
    // ===== 貪食蛇遊戲 =====
    updateSnakeGame() {
        const snake = this.gameState.snake;
        const keys = this.gameState.keys;
        
        // 如果遊戲結束，檢查是否按 G 鍵重新開始
        if (snake.gameOver) {
            // G 鍵的處理在 switchGameMode() 中，這裡不需要額外處理
            return;
        }
        
        // 處理方向輸入
        if (keys.up && snake.direction !== 1) {
            snake.nextDirection = 3;
        } else if (keys.down && snake.direction !== 3) {
            snake.nextDirection = 1;
        } else if (keys.left && snake.direction !== 0) {
            snake.nextDirection = 2;
        } else if (keys.right && snake.direction !== 2) {
            snake.nextDirection = 0;
        }
        
        // 更新方向
        snake.direction = snake.nextDirection;
        
        // 移動計時器
        snake.moveTimer++;
        if (snake.moveTimer < 4) return; // 加快移動速度，從8改為4
        snake.moveTimer = 0;
        
        // console.log('🐍 蛇移動前:', snake.snake[0]); // 移除調試信息
        
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
        
        // console.log('🐍 蛇移動後:', head, '方向:', snake.direction); // 移除調試信息
        
        // 檢查邊界碰撞
        const maxX = this.gameState.gameWidth / snake.gridSize;
        const maxY = this.gameState.gameHeight / snake.gridSize;
        
        if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
            snake.gameOver = true;
            return;
        }
        
        // 檢查自身碰撞
        for (const segment of snake.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                snake.gameOver = true;
                return;
            }
        }
        
        // 添加新頭部
        snake.snake.unshift(head);
        
        // 檢查食物碰撞
        // console.log('🔍 碰撞檢測:', { // 移除調試信息
        //     snakeHead: { x: head.x, y: head.y },
        //     food: { x: snake.food.x, y: snake.food.y },
        //     collision: head.x === snake.food.x && head.y === snake.food.y
        // });
        
        if (head.x === snake.food.x && head.y === snake.food.y) {
            console.log('🎉 吃到食物！');
            
            // 吃到食物，生成新食物
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            
            let newFoodX, newFoodY;
            let attempts = 0;
            do {
                // 確保食物不會出現在邊界上 (1 到 maxX-2, 1 到 maxY-2)
                newFoodX = Math.floor(Math.random() * (maxX - 2)) + 1;
                newFoodY = Math.floor(Math.random() * (maxY - 2)) + 1;
                attempts++;
            } while (
                snake.snake.some(segment => segment.x === newFoodX && segment.y === newFoodY) &&
                attempts < 100 // 防止無限循環
            );
            
            console.log('🍎 生成新食物:', newFoodX, newFoodY, '字母:', randomLetter);
            
            snake.food = {
                x: newFoodX,
                y: newFoodY,
                letter: randomLetter.charCodeAt(0)
            };
            
            this.gameState.score += 10;
            console.log('📈 分數增加，當前分數:', this.gameState.score);
            
            // 檢查是否達到完成條件（蛇長度達到20）
            if (snake.snake.length >= 20) {
                this.gameState.score += 200;
                this.switchToNextGameMode(); // 切換到下一個遊戲模式
            }
        } else {
            // 沒吃到食物，移除尾部
            snake.snake.pop();
        }
    }
    
    drawSnakeGame(ctx, width, height) {
        const snake = this.gameState.snake;
        
        console.log('🎨 開始繪製貪食蛇遊戲:');
        console.log('  - 畫布尺寸:', width, 'x', height);
        console.log('  - 蛇狀態:', snake);
        console.log('  - 食物狀態:', snake.food);
        
        // 黑色背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        // 繪製網格背景 - 改善效果
        ctx.strokeStyle = '#2A2A2A'; // 更暗的網格線
        ctx.lineWidth = 1;
        
        // 繪製垂直網格線
        for (let x = 0; x < width; x += snake.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // 繪製水平網格線
        for (let y = 0; y < height; y += snake.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // 添加網格交點的小點
        ctx.fillStyle = '#404040';
        for (let x = snake.gridSize; x < width; x += snake.gridSize) {
            for (let y = snake.gridSize; y < height; y += snake.gridSize) {
                ctx.fillRect(x - 1, y - 1, 2, 2);
            }
        }
        
        // 繪製蛇身 - 改善視覺效果
        snake.snake.forEach((segment, index) => {
            const x = segment.x * snake.gridSize;
            const y = segment.y * snake.gridSize;
            
            if (index === 0) {
                // 蛇頭 - 使用更自然的翠綠色
                ctx.fillStyle = '#4CAF50'; // 漂亮的翠綠色
                ctx.fillRect(x + 2, y + 2, snake.gridSize - 4, snake.gridSize - 4);
                
                // 蛇頭高光效果
                ctx.fillStyle = '#81C784'; // 淺綠色高光
                ctx.fillRect(x + 4, y + 4, snake.gridSize - 12, snake.gridSize - 12);
                
                // 蛇頭邊框
                ctx.strokeStyle = '#2E7D32'; // 深綠色邊框
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, snake.gridSize - 4, snake.gridSize - 4);
                
                // 繪製蛇頭的朝向 - 更生動的眼睛
                const centerX = x + snake.gridSize / 2;
                const centerY = y + snake.gridSize / 2;
                
                // 眼睛背景
                ctx.fillStyle = '#FFFFFF';
                const eyeSize = 8;
                
                switch (snake.direction) {
                    case 0: // 右
                        ctx.fillRect(centerX + 4, centerY - 6, eyeSize, eyeSize);
                        ctx.fillRect(centerX + 4, centerY + 2, eyeSize, eyeSize);
                        break;
                    case 1: // 下
                        ctx.fillRect(centerX - 6, centerY + 4, eyeSize, eyeSize);
                        ctx.fillRect(centerX + 2, centerY + 4, eyeSize, eyeSize);
                        break;
                    case 2: // 左
                        ctx.fillRect(centerX - 12, centerY - 6, eyeSize, eyeSize);
                        ctx.fillRect(centerX - 12, centerY + 2, eyeSize, eyeSize);
                        break;
                    case 3: // 上
                        ctx.fillRect(centerX - 6, centerY - 12, eyeSize, eyeSize);
                        ctx.fillRect(centerX + 2, centerY - 12, eyeSize, eyeSize);
                        break;
                }
                
                // 眼睛的瞳孔 - 更圓潤
                ctx.fillStyle = '#000000';
                const pupilSize = 4;
                switch (snake.direction) {
                    case 0: // 右
                        ctx.fillRect(centerX + 6, centerY - 4, pupilSize, pupilSize);
                        ctx.fillRect(centerX + 6, centerY + 4, pupilSize, pupilSize);
                        break;
                    case 1: // 下
                        ctx.fillRect(centerX - 4, centerY + 6, pupilSize, pupilSize);
                        ctx.fillRect(centerX + 4, centerY + 6, pupilSize, pupilSize);
                        break;
                    case 2: // 左
                        ctx.fillRect(centerX - 10, centerY - 4, pupilSize, pupilSize);
                        ctx.fillRect(centerX - 10, centerY + 4, pupilSize, pupilSize);
                        break;
                    case 3: // 上
                        ctx.fillRect(centerX - 4, centerY - 10, pupilSize, pupilSize);
                        ctx.fillRect(centerX + 4, centerY - 10, pupilSize, pupilSize);
                        break;
                }
                
                // 眼睛高光
                ctx.fillStyle = '#FFFFFF';
                const highlightSize = 2;
                switch (snake.direction) {
                    case 0: // 右
                        ctx.fillRect(centerX + 7, centerY - 3, highlightSize, highlightSize);
                        ctx.fillRect(centerX + 7, centerY + 5, highlightSize, highlightSize);
                        break;
                    case 1: // 下
                        ctx.fillRect(centerX - 3, centerY + 7, highlightSize, highlightSize);
                        ctx.fillRect(centerX + 5, centerY + 7, highlightSize, highlightSize);
                        break;
                    case 2: // 左
                        ctx.fillRect(centerX - 9, centerY - 3, highlightSize, highlightSize);
                        ctx.fillRect(centerX - 9, centerY + 5, highlightSize, highlightSize);
                        break;
                    case 3: // 上
                        ctx.fillRect(centerX - 3, centerY - 9, highlightSize, highlightSize);
                        ctx.fillRect(centerX + 5, centerY - 9, highlightSize, highlightSize);
                        break;
                }
            } else {
                // 蛇身 - 使用更自然的綠色
                ctx.fillStyle = '#66BB6A'; // 中綠色
                ctx.fillRect(x + 3, y + 3, snake.gridSize - 6, snake.gridSize - 6);
                
                // 蛇身陰影效果
                ctx.fillStyle = '#43A047'; // 深綠色陰影
                ctx.fillRect(x + 5, y + 5, snake.gridSize - 10, snake.gridSize - 10);
                
                // 移除蛇身邊框
                
                // 添加蛇身的鱗片效果 - 更精緻
                ctx.fillStyle = '#A5D6A7'; // 淺綠色鱗片
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 2; j++) {
                        ctx.fillRect(
                            x + 8 + i * 12, 
                            y + 8 + j * 12, 
                            6, 6
                        );
                    }
                }
            }
        });
        
        // 繪製食物
        if (!snake.food) {
            console.error('❌ 食物對象不存在！');
            return;
        }
        
        ctx.fillStyle = '#FF0000';
        const foodX = snake.food.x * snake.gridSize;
        const foodY = snake.food.y * snake.gridSize;
        
        // 移除調試信息，讓遊戲更流暢
        
        // 繪製蘋果 - 使用更自然的紅色
        // 蘋果主體 - 鮮紅色
        ctx.fillStyle = '#E53935'; // 漂亮的紅色
        ctx.fillRect(foodX + 3, foodY + 3, snake.gridSize - 6, snake.gridSize - 6);
        
        // 蘋果陰影效果
        ctx.fillStyle = '#C62828'; // 深紅色陰影
        ctx.fillRect(foodX + 5, foodY + 5, snake.gridSize - 10, snake.gridSize - 10);
        
        // 蘋果邊框
        ctx.strokeStyle = '#B71C1C'; // 深紅色邊框
        ctx.lineWidth = 2;
        ctx.strokeRect(foodX + 3, foodY + 3, snake.gridSize - 6, snake.gridSize - 6);
        
        // 蘋果高光效果
        ctx.fillStyle = '#FFEBEE'; // 淺紅色高光
        ctx.globalAlpha = 0.6;
        ctx.fillRect(foodX + 6, foodY + 6, snake.gridSize / 3, snake.gridSize / 3);
        ctx.globalAlpha = 1;
        
        // 蘋果葉子（頂部）
        ctx.fillStyle = '#4CAF50'; // 綠色葉子
        ctx.fillRect(foodX + snake.gridSize / 2 - 2, foodY - 2, 4, 6);
        
        // 蘋果莖
        ctx.strokeStyle = '#8D6E63'; // 棕色莖
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(foodX + snake.gridSize / 2, foodY - 2);
        ctx.lineTo(foodX + snake.gridSize / 2, foodY + 2);
        ctx.stroke();
        
        // 移除測試方塊，讓遊戲更乾淨
        // 蘋果不需要字母，保持簡潔美觀
        
        // 繪製遊戲結束畫面
        if (snake.gameOver) {
            // 半透明黑色背景
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, width, height);
            
            // 遊戲結束標題 - 更大更清晰
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 56px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText('遊戲結束！', width / 2, height / 2 - 80);
            ctx.fillText('遊戲結束！', width / 2, height / 2 - 80);
            
            // 最終分數 - 更清晰
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 32px Arial';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(`最終分數: ${this.gameState.score}`, width / 2, height / 2 - 20);
            ctx.fillText(`最終分數: ${this.gameState.score}`, width / 2, height / 2 - 20);
            
            // 操作提示 - 更清晰更明顯
            ctx.fillStyle = '#FFFF00';
            ctx.font = 'bold 32px Arial';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText('按 H 鍵重新開始', width / 2, height / 2 + 30);
            ctx.fillText('按 H 鍵重新開始', width / 2, height / 2 + 30);
            
            // 切換遊戲提示 - 稍微清楚一些
            ctx.fillStyle = '#00FF00';
            ctx.font = 'bold 24px Arial';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText('按 G 鍵切換遊戲', width / 2, height / 2 + 80);
            ctx.fillText('按 G 鍵切換遊戲', width / 2, height / 2 + 80);
        }
        
        this.drawClassicGameUI(ctx, width, height);
    }
    
    // 重置貪食蛇遊戲
    resetSnakeGame() {
        if (!this.gameState.snake) return;
        
        // 重置蛇身到初始位置
        this.gameState.snake.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // 重置遊戲狀態
        this.gameState.snake.direction = 0; // 向右
        this.gameState.snake.nextDirection = 0;
        this.gameState.snake.gameOver = false;
        this.gameState.snake.moveTimer = 0;
        
        // 重置分數
        this.gameState.score = 0;
        
        // 重新生成食物
        this.initializeSnakeFood();
        
        console.log('🔄 貪食蛇遊戲已重置');
    }
    
    // ===== 爆炸效果系統 =====
    addExplosion(x, y) {
        const explosion = {
            x: x,
            y: y,
            radius: 5,
            speed: 2,
            opacity: 1,
            timer: 0,
            color: Math.random() > 0.5 ? '#ff6b6b' : '#4ecdc4'
        };
        this.gameState.spaceInvaders.explosions.push(explosion);
    }
    
    drawExplosions(ctx) {
        this.gameState.spaceInvaders.explosions.forEach(explosion => {
            // 外層發光效果
            ctx.shadowColor = explosion.color;
            ctx.shadowBlur = explosion.radius * 2;
            ctx.fillStyle = explosion.color;
            ctx.globalAlpha = explosion.opacity * 0.6;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 內層核心
            ctx.shadowBlur = explosion.radius;
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = explosion.opacity * 0.8;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, explosion.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            // 中心亮點
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffff00';
            ctx.globalAlpha = explosion.opacity;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, explosion.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // 重置透明度
            ctx.globalAlpha = 1;
        });
    }
    
    // ===== 音效系統 =====
    playEatSound() {
        if (!this.ensureAudioContext()) {
            console.log('⚠️ AudioContext 不可用，跳過吃豆音效');
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('吃豆音效播放失敗:', error);
        }
    }
    
    playShootSound() {
        if (!this.ensureAudioContext()) {
            console.log('⚠️ AudioContext 不可用，跳過射擊音效');
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (error) {
            console.log('射擊音效播放失敗:', error);
        }
    }
    
    playHitSound() {
        if (!this.ensureAudioContext()) {
            console.log('⚠️ AudioContext 不可用，跳過擊中音效');
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('擊中音效播放失敗:', error);
        }
    }
    
    // ===== 簡化的遊戲模式切換系統 =====
    switchToNextGameMode() {
        // 切換到下一個遊戲模式
        const gameModes = ['pacman', 'snake', 'space_invaders'];
        const currentIndex = gameModes.indexOf(this.gameState.gameMode);
        
        if (currentIndex === 0) {
            // 吃豆人完成後，顯示通關畫面然後切換到太空侵略者
            this.showGameComplete();
            
            // 延遲1.5秒後切換到太空侵略者
            setTimeout(() => {
                this.gameState.gameMode = 'space_invaders';
                console.log(`🎮 切換到遊戲模式: ${this.gameState.gameMode}！`);
                
                // 觸發相機控制器的遊戲模式粒子效果
                if (this.cameraController && this.cameraController.enterGameplayMode) {
                    this.cameraController.enterGameplayMode();
                    console.log('🎆 已啟用遊戲模式粒子效果');
                }
                
                // 顯示遊戲模式切換提示
                this.showGameModeSwitchNotification();
                
                // 重新初始化遊戲元素
                this.reinitializeGameElements();
                
                // 更新遊戲選擇器顯示
                if (this.updateGameSelectorDisplay) {
                    this.updateGameSelectorDisplay();
                }
                
                // 播放切換音效
                this.playModeSwitchSound();
            }, 1500);
        } else if (currentIndex === 1) {
            // 蛇完成後，顯示通關畫面然後切換到太空侵略者
            this.showGameComplete();
            
            // 延遲1.5秒後切換到太空侵略者
            setTimeout(() => {
                this.gameState.gameMode = 'space_invaders';
                console.log(`🎮 切換到遊戲模式: ${this.gameState.gameMode}！`);
                
                // 觸發相機控制器的遊戲模式粒子效果
                if (this.cameraController && this.cameraController.enterGameplayMode) {
                    this.cameraController.enterGameplayMode();
                    console.log('🎆 已啟用遊戲模式粒子效果');
                }
                
                // 顯示遊戲模式切換提示
                this.showGameModeSwitchNotification();
                
                // 重新初始化遊戲元素
                this.reinitializeGameElements();
                
                // 更新遊戲選擇器顯示
                if (this.updateGameSelectorDisplay) {
                    this.updateGameSelectorDisplay();
                }
                
                // 播放切換音效
                this.playModeSwitchSound();
            }, 1500);
        } else {
            // 太空侵略者完成後，顯示遊戲過關
            this.showGameComplete();
            
            // 延遲1.5秒後重置到第一關
            setTimeout(() => {
                this.resetToFirstLevel();
            }, 1500);
        }
    }
    
    resetToFirstLevel() {
        console.log('🔄 重置遊戲到第一關...');
        
        // 重置遊戲狀態
        this.gameState.gameMode = 'pacman';
        this.gameState.score = 0;
        this.gameState.lives = 3;
        this.gameState.gameCompleted = false;
        
        // 重新初始化遊戲元素
        this.reinitializeGameElements();
        
        console.log('✅ 遊戲已重置到第一關');
    }
    
    
    shouldShowNotifications() {
        // 檢查是否應該顯示通知
        // 在測試頁面和遊戲模式頁面顯示通知，主頁面不顯示
        const currentPage = window.location.pathname;
        const isTestPage = currentPage.includes('test_') || currentPage.includes('level_system');
        const isGameModePage = currentPage.includes('game_mode.html');
        const isMainPage = currentPage.endsWith('index.html') || currentPage.endsWith('/') || currentPage === '';
        
        // 在主頁面不顯示通知，在測試頁面和遊戲模式頁面顯示通知
        if (isMainPage) {
            return false; // 主頁面不顯示通知
        }
        return isTestPage || isGameModePage; // 測試頁面和遊戲模式頁面顯示通知
    }
    
    isMainPage() {
        // 檢查是否在主頁
        const currentPage = window.location.pathname;
        return currentPage.endsWith('index.html') || currentPage.endsWith('/') || currentPage === '';
    }
    
    reinitializeGameElements() {
        // 重新初始化遊戲元素，保持當前遊戲模式
        switch(this.gameState.gameMode) {
            case 'pacman':
                this.initializeCHLOEDots();
                break;
            case 'space_invaders':
                this.initializeXINTIInvaders();
                break;
            case 'snake':
                this.foodDebugShown = false; // 重置調試標記
                this.snakeDebugShown = false; // 重置調試標記
                this.initializeSnakeGame();
                break;
        }
    }
    
    showGameModeSwitchNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            border: 3px solid #4ECDC4;
            border-radius: 15px;
            padding: 30px 40px;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 24px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 0 30px rgba(78, 205, 196, 0.8);
            text-align: center;
            animation: gameModeSwitchPulse 2s ease-in-out;
        `;
        
        // 添加CSS動畫
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gameModeSwitchPulse {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        let modeText = '';
        let modeIcon = '';
        switch(this.gameState.gameMode) {
            case 'pacman':
                modeText = '👻 小精靈 (CHLOE)';
                modeIcon = '👻';
                break;
            case 'space_invaders':
                modeText = '👽 太空侵略者 (XINTI)';
                modeIcon = '👽';
                break;
            case 'snake':
                modeText = '🐍 貪食蛇';
                modeIcon = '🐍';
                break;
        }
        
        notification.innerHTML = `
            <div style="color: #4ECDC4; margin-bottom: 10px;">${modeIcon} 切換遊戲模式 ${modeIcon}</div>
            <div style="font-size: 18px; color: #fff; margin-bottom: 5px;">${modeText}</div>
            <div style="font-size: 14px; color: #ccc;">完成一次遊戲即可切換到下一個模式</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 1000);
    }
    
    clearGameCompleteNotification() {
        // 清理可能存在的通關畫面元素
        const existingNotifications = document.querySelectorAll('[style*="gameCompletePulse"]');
        existingNotifications.forEach(notification => notification.remove());
        
        // 清理相關的CSS樣式
        const existingStyles = document.querySelectorAll('style');
        existingStyles.forEach(style => {
            if (style.textContent && style.textContent.includes('gameCompletePulse')) {
                style.remove();
            }
        });
        
        console.log('🧹 已清理通關畫面元素');
    }
    
    showGameComplete() {
        // 清理可能存在的通關畫面
        this.clearGameCompleteNotification();
        
        // 暫時設置為已完成，防止在顯示期間重複觸發
        this.gameState.gameCompleted = true;
        
        console.log('🎉 遊戲通關！最終分數:', this.gameState.score);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            border: 3px solid #ffd700;
            border-radius: 20px;
            padding: 40px 50px;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 28px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
            text-align: center;
            animation: gameCompletePulse 1.5s ease-in-out;
        `;
        
        // 添加CSS動畫
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gameCompletePulse {
                0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
                30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                70% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
        
        notification.innerHTML = `
            <div style="color: #ffd700; margin-bottom: 15px; font-size: 32px;">🏆 遊戲通關！🏆</div>
            <div style="font-size: 18px; color: #ccc; margin-bottom: 10px;">最終分數: ${this.gameState.score}</div>
        `;
        
        document.body.appendChild(notification);
        
        // 播放通關音效
        this.playGameCompleteSound();
        
        setTimeout(() => {
            notification.remove();
            style.remove();
            // 重置狀態，讓下一個遊戲也能顯示通關畫面
            this.gameState.gameCompleted = false;
        }, 2000); // 從5秒縮短到2秒
    }
    
    playGameCompleteSound() {
        if (!this.ensureAudioContext()) return;
        
        try {
            // 播放更華麗的通關音效
            const notes = [523, 659, 784, 1047, 1319, 1568]; // C5, E5, G5, C6, E6, G6
            
            notes.forEach((frequency, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + index * 0.15);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.15);
                gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + index * 0.15 + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.15 + 0.3);
                
                oscillator.start(this.audioContext.currentTime + index * 0.15);
                oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.3);
            });
        } catch (error) {
            console.log('通關音效播放失敗:', error);
        }
    }
    
    playModeSwitchSound() {
        if (!this.ensureAudioContext()) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 播放上升音階
            oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.2); // E5
            oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.4); // G5
            oscillator.frequency.setValueAtTime(1047, this.audioContext.currentTime + 0.6); // C6
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.8);
        } catch (error) {
            console.log('模式切換音效播放失敗:', error);
        }
    }
}

// 修復版本的 ArcadeMachine3D 類別已定義
// 初始化將由 arcade3d_loader.js 控制
