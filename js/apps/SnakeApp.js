/**
 * Snake Game App - Classic snake game
 */

import { Icons } from '../icons.js?v=15';
import { SoundManager } from '../managers/SoundManager.js?v=15';

const getThemeColor = (varName) => getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '';

export const SnakeApp = {
    id: 'snake',
    title: 'Snake',
    icon: Icons.snake,
    width: 440,
    height: 550,
    hasMenu: true,
    menuItems: ['Game', 'Help'],
    resizable: false,

    // Game state
    canvas: null,
    ctx: null,
    snake: [],
    food: null,
    direction: 'right',
    nextDirection: 'right',
    gameLoop: null,
    score: 0,
    highScore: 0,
    gameOver: false,
    isPaused: false,
    gridSize: 20,
    tileCount: 19,

    menuConfig: {
        'Game': [
            { label: 'New Game', action: 'newGame', shortcut: 'F2' },
            { label: 'Pause', action: 'pause', shortcut: 'P' },
            { divider: true },
            { label: 'Exit', action: 'close', shortcut: 'Alt+F4' }
        ],
        'Help': [
            { label: 'How to Play', action: 'howToPlay' },
            { divider: true },
            { label: 'About Snake', action: 'about' }
        ]
    },

    onMenuAction(action) {
        switch(action) {
            case 'newGame':
                SnakeApp.startGame();
                break;
            case 'pause':
                SnakeApp.togglePause();
                break;
            case 'howToPlay':
                import('../managers/DialogManager.js?v=15').then(({ DialogManager }) => {
                    DialogManager.alert(
                        'How to Play Snake:\n\n' +
                        '• Arrow Keys / WASD to move\n' +
                        '• Swipe on canvas to turn (mobile)\n' +
                        '• Eat the red food to grow\n' +
                        "• Don't hit the walls or yourself!\n" +
                        '• Press P to pause\n' +
                        '• Press F2 for new game',
                        'How to Play'
                    );
                });
                break;
        }
    },

    render() {
        SnakeApp.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        
        return `
            <div class="snake-container">
                <div class="snake-header">
                    <div class="snake-score">
                        <span>Score:</span>
                        <span id="snakeScore">0</span>
                    </div>
                    <div class="snake-score">
                        <span>High:</span>
                        <span id="snakeHigh">${SnakeApp.highScore}</span>
                    </div>
                </div>
                <div class="snake-game-area">
                    <canvas id="snakeCanvas" width="380" height="380"></canvas>
                    <div class="snake-overlay" id="snakeOverlay">
                        <div class="snake-message">
                            <h3>SNAKE</h3>
                            <p>Press SPACE, tap or swipe to start</p>
                        </div>
                    </div>
                </div>
                <div class="snake-controls">
                    <button class="win-btn" id="snakeNewGame">New Game</button>
                    <button class="win-btn" id="snakePause">Pause</button>
                </div>
            </div>
        `;
    },

    onInit() {
        const container = document.querySelector('#window-snake .window-content-inner');
        if (!container) return;

        SnakeApp.canvas = container.querySelector('#snakeCanvas');
        SnakeApp.ctx = SnakeApp.canvas?.getContext('2d');

        // Resize canvas to fit container on mobile
        const gameArea = container.querySelector('.snake-game-area');
        if (gameArea && SnakeApp.canvas) {
            const fitCanvas = () => {
                const maxW = gameArea.clientWidth - 6;
                if (maxW < 380) {
                    const scale = maxW / 380;
                    SnakeApp.canvas.style.width = maxW + 'px';
                    SnakeApp.canvas.style.height = Math.floor(380 * scale) + 'px';
                } else {
                    SnakeApp.canvas.style.width = '';
                    SnakeApp.canvas.style.height = '';
                }
            };
            fitCanvas();
            window.addEventListener('resize', fitCanvas);
            SnakeApp._fitCanvas = fitCanvas;
        }
        
        // Button handlers
        container.querySelector('#snakeNewGame')?.addEventListener('click', () => {
            SnakeApp.startGame();
        });
        
        container.querySelector('#snakePause')?.addEventListener('click', () => {
            SnakeApp.togglePause();
        });

        // Click overlay to start or unpause
        container.querySelector('#snakeOverlay')?.addEventListener('click', () => {
            if (SnakeApp.isPaused) {
                SnakeApp.togglePause();
            } else {
                SnakeApp.startGame();
            }
        });

        // Keyboard controls
        SnakeApp.keyHandler = (e) => {
            if (!document.querySelector('#window-snake')) return;
            
            if (e.code === 'Space' && (SnakeApp.gameOver || !SnakeApp.gameLoop)) {
                e.preventDefault();
                SnakeApp.startGame();
                return;
            }
            
            if (e.code === 'KeyP') {
                SnakeApp.togglePause();
                return;
            }
            
            if (SnakeApp.isPaused || SnakeApp.gameOver) return;
            
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    if (SnakeApp.direction !== 'down') SnakeApp.nextDirection = 'up';
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    if (SnakeApp.direction !== 'up') SnakeApp.nextDirection = 'down';
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    if (SnakeApp.direction !== 'right') SnakeApp.nextDirection = 'left';
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    if (SnakeApp.direction !== 'left') SnakeApp.nextDirection = 'right';
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', SnakeApp.keyHandler);

        // Pause when tab hidden, resume when visible
        SnakeApp._visHandler = () => {
            if (document.hidden) {
                if (!SnakeApp.isPaused && !SnakeApp.gameOver && SnakeApp.gameLoop) {
                    SnakeApp._wasRunning = true;
                    SnakeApp.isPaused = true;
                    clearInterval(SnakeApp.gameLoop);
                    SnakeApp.gameLoop = null;
                }
            } else {
                if (SnakeApp._wasRunning && !SnakeApp.gameOver && !SnakeApp.gameLoop) {
                    SnakeApp._wasRunning = false;
                    SnakeApp.isPaused = false;
                    const overlay = document.querySelector('#snakeOverlay');
                    if (overlay) overlay.style.display = 'none';
                    SnakeApp.gameLoop = setInterval(() => SnakeApp.update(), 120);
                }
            }
        };
        document.addEventListener('visibilitychange', SnakeApp._visHandler);
        
        // Swipe gestures on canvas
        SnakeApp.initSwipeGestures(SnakeApp.canvas);
        
        // Draw initial state
        SnakeApp.drawInitial();
    },

    onClose() {
        clearInterval(SnakeApp.gameLoop);
        SnakeApp.gameLoop = null;
        document.removeEventListener('keydown', SnakeApp.keyHandler);
        document.removeEventListener('visibilitychange', SnakeApp._visHandler);
        SnakeApp._wasRunning = false;
    },

    initSwipeGestures(canvas) {
        if (!canvas) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        const MIN_SWIPE = 30;
        const MAX_TIME = 300;
        
        canvas.addEventListener('touchstart', (e) => {
            if (SnakeApp.isPaused || SnakeApp.gameOver) return;
            const t = e.touches[0];
            touchStartX = t.clientX;
            touchStartY = t.clientY;
            touchStartTime = Date.now();
        }, { passive: true });
        
        canvas.addEventListener('touchend', (e) => {
            if (SnakeApp.isPaused || SnakeApp.gameOver) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            const dt = Date.now() - touchStartTime;
            
            if (dt > MAX_TIME) return;
            
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            
            if (Math.max(absDx, absDy) < MIN_SWIPE) return;
            
            if (absDx > absDy) {
                if (dx > 0 && SnakeApp.direction !== 'left') SnakeApp.nextDirection = 'right';
                else if (dx < 0 && SnakeApp.direction !== 'right') SnakeApp.nextDirection = 'left';
            } else {
                if (dy > 0 && SnakeApp.direction !== 'up') SnakeApp.nextDirection = 'down';
                else if (dy < 0 && SnakeApp.direction !== 'down') SnakeApp.nextDirection = 'up';
            }
        }, { passive: true });
    },

    drawInitial() {
        if (!SnakeApp.ctx) return;
        const ctx = SnakeApp.ctx;
        const size = SnakeApp.gridSize;
        const canvasSize = SnakeApp.tileCount * size;
        
        ctx.fillStyle = getThemeColor('--canvas-bg') || '#000';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        // Draw grid
        ctx.strokeStyle = getThemeColor('--canvas-grid') || '#111';
        for (let i = 0; i <= SnakeApp.tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * size, 0);
            ctx.lineTo(i * size, canvasSize);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * size);
            ctx.lineTo(canvasSize, i * size);
            ctx.stroke();
        }
    },

    startGame() {
        clearInterval(SnakeApp.gameLoop);
        
        // Reset state
        SnakeApp.snake = [
            { x: 7, y: 7 },
            { x: 6, y: 7 },
            { x: 5, y: 7 }
        ];
        SnakeApp.direction = 'right';
        SnakeApp.nextDirection = 'right';
        SnakeApp.score = 0;
        SnakeApp.gameOver = false;
        SnakeApp.isPaused = false;
        
        SnakeApp.spawnFood();
        SnakeApp.updateScore();
        
        // Hide overlay
        const overlay = document.querySelector('#snakeOverlay');
        if (overlay) overlay.style.display = 'none';
        
        // Start game loop (150ms = moderate speed)
        SnakeApp.gameLoop = setInterval(() => SnakeApp.update(), 120);
        
        SoundManager.play('click');
    },

    togglePause() {
        if (SnakeApp.gameOver || !SnakeApp.gameLoop) return;
        
        SnakeApp.isPaused = !SnakeApp.isPaused;
        
        const overlay = document.querySelector('#snakeOverlay');
        const message = overlay?.querySelector('.snake-message');
        
        if (SnakeApp.isPaused) {
            if (overlay) overlay.style.display = 'flex';
            if (message) message.innerHTML = '<h3>' + Icons.statusPause + ' PAUSED</h3><p>Press P to continue</p>';
        } else {
            if (overlay) overlay.style.display = 'none';
        }
        
        SoundManager.play('click');
    },

    spawnFood() {
        do {
            SnakeApp.food = {
                x: Math.floor(Math.random() * SnakeApp.tileCount),
                y: Math.floor(Math.random() * SnakeApp.tileCount)
            };
        } while (SnakeApp.snake.some(seg => seg.x === SnakeApp.food.x && seg.y === SnakeApp.food.y));
    },

    update() {
        if (SnakeApp.isPaused || SnakeApp.gameOver) return;
        
        SnakeApp.direction = SnakeApp.nextDirection;
        
        // Calculate new head position
        const head = { ...SnakeApp.snake[0] };
        
        switch(SnakeApp.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check wall collision
        if (head.x < 0 || head.x >= SnakeApp.tileCount || 
            head.y < 0 || head.y >= SnakeApp.tileCount) {
            SnakeApp.endGame();
            return;
        }
        
        // Check self collision
        if (SnakeApp.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            SnakeApp.endGame();
            return;
        }
        
        // Add new head
        SnakeApp.snake.unshift(head);
        
        // Check food collision
        if (head.x === SnakeApp.food.x && head.y === SnakeApp.food.y) {
            SnakeApp.score += 10;
            SnakeApp.updateScore();
            SnakeApp.spawnFood();
            SoundManager.play('chord');
        } else {
            // Remove tail if no food eaten
            SnakeApp.snake.pop();
        }
        
        SnakeApp.draw();
    },

    draw() {
        if (!SnakeApp.ctx) return;
        const ctx = SnakeApp.ctx;
        const size = SnakeApp.gridSize;
        const canvasSize = SnakeApp.tileCount * size;
        
        // Clear
        ctx.fillStyle = getThemeColor('--canvas-bg') || '#000';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        // Draw grid
        ctx.strokeStyle = getThemeColor('--canvas-grid') || '#111';
        for (let i = 0; i <= SnakeApp.tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * size, 0);
            ctx.lineTo(i * size, canvasSize);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * size);
            ctx.lineTo(canvasSize, i * size);
            ctx.stroke();
        }
        
        // Draw food
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(
            SnakeApp.food.x * size + size / 2,
            SnakeApp.food.y * size + size / 2,
            size / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw snake
        SnakeApp.snake.forEach((seg, i) => {
            // Gradient from head to tail
            const green = Math.floor(255 - (i / SnakeApp.snake.length) * 100);
                ctx.fillStyle = i === 0 ? (getThemeColor('--accent-green') || '#00FF00') : `rgb(0, ${green}, 0)`;
            
            ctx.fillRect(
                seg.x * size + 1,
                seg.y * size + 1,
                size - 2,
                size - 2
            );
            
            // Draw eyes on head
            if (i === 0) {
                ctx.fillStyle = '#000';
                const eyeSize = 3;
                let eyeX1, eyeY1, eyeX2, eyeY2;
                
                switch(SnakeApp.direction) {
                    case 'right':
                        eyeX1 = eyeX2 = seg.x * size + size - 5;
                        eyeY1 = seg.y * size + 5;
                        eyeY2 = seg.y * size + size - 5;
                        break;
                    case 'left':
                        eyeX1 = eyeX2 = seg.x * size + 5;
                        eyeY1 = seg.y * size + 5;
                        eyeY2 = seg.y * size + size - 5;
                        break;
                    case 'up':
                        eyeY1 = eyeY2 = seg.y * size + 5;
                        eyeX1 = seg.x * size + 5;
                        eyeX2 = seg.x * size + size - 5;
                        break;
                    case 'down':
                        eyeY1 = eyeY2 = seg.y * size + size - 5;
                        eyeX1 = seg.x * size + 5;
                        eyeX2 = seg.x * size + size - 5;
                        break;
                }
                
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
                ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },

    updateScore() {
        const scoreEl = document.querySelector('#snakeScore');
        const highEl = document.querySelector('#snakeHigh');
        
        if (scoreEl) scoreEl.textContent = SnakeApp.score;
        
        if (SnakeApp.score > SnakeApp.highScore) {
            SnakeApp.highScore = SnakeApp.score;
            localStorage.setItem('snakeHighScore', SnakeApp.highScore);
            if (highEl) highEl.textContent = SnakeApp.highScore;
        }
    },

    endGame() {
        clearInterval(SnakeApp.gameLoop);
        SnakeApp.gameLoop = null;
        SnakeApp.gameOver = true;
        
        SoundManager.play('error');
        
        const overlay = document.querySelector('#snakeOverlay');
        const message = overlay?.querySelector('.snake-message');
        
        if (overlay) overlay.style.display = 'flex';
        if (message) {
            message.innerHTML = `
                <h3>${Icons.statusSkull} GAME OVER</h3>
                <p>Score: ${SnakeApp.score}</p>
                <p>Press SPACE to play again</p>
            `;
        }
    }
};
