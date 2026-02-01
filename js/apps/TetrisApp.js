/**
 * Tetris Game App - Classic falling blocks
 */

import { Icons } from '../icons.js';
import { SoundManager } from '../managers/SoundManager.js';

export const TetrisApp = {
    id: 'tetris',
    title: 'Tetris',
    icon: Icons.tetris,
    width: 360,
    height: 520,
    hasMenu: true,
    menuItems: ['Game', 'Help'],
    resizable: false,

    // Game constants
    COLS: 10,
    ROWS: 20,
    BLOCK_SIZE: 20,

    // Game state
    canvas: null,
    ctx: null,
    nextCanvas: null,
    nextCtx: null,
    board: [],
    currentPiece: null,
    nextPiece: null,
    gameLoop: null,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    dropInterval: 1000,

    // Tetromino shapes
    PIECES: [
        { shape: [[1,1,1,1]], color: '#00FFFF' },           // I
        { shape: [[1,1],[1,1]], color: '#FFFF00' },         // O
        { shape: [[0,1,0],[1,1,1]], color: '#AA00FF' },     // T
        { shape: [[1,0,0],[1,1,1]], color: '#0000FF' },     // J
        { shape: [[0,0,1],[1,1,1]], color: '#FF8800' },     // L
        { shape: [[0,1,1],[1,1,0]], color: '#00FF00' },     // S
        { shape: [[1,1,0],[0,1,1]], color: '#FF0000' }      // Z
    ],

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
            { label: 'About Tetris', action: 'about' }
        ]
    },

    onMenuAction(action) {
        switch(action) {
            case 'newGame':
                TetrisApp.startGame();
                break;
            case 'pause':
                TetrisApp.togglePause();
                break;
            case 'howToPlay':
                import('../managers/DialogManager.js').then(({ DialogManager }) => {
                    DialogManager.alert(
                        'How to Play Tetris:\n\n' +
                        '• ← → to move piece\n' +
                        '• ↑ or W to rotate\n' +
                        '• ↓ to soft drop\n' +
                        '• SPACE for hard drop\n' +
                        '• P to pause\n\n' +
                        'Clear lines to score!',
                        'How to Play'
                    );
                });
                break;
        }
    },

    render() {
        return `
            <div class="tetris-container">
                <div class="tetris-main">
                    <div class="tetris-board-wrapper">
                        <canvas id="tetrisCanvas" width="200" height="400"></canvas>
                        <div class="tetris-overlay" id="tetrisOverlay">
                            <div class="tetris-message">
                                <h3>TETRIS</h3>
                                <p>Press SPACE or tap to start</p>
                            </div>
                        </div>
                    </div>
                    <div class="tetris-sidebar">
                        <div class="tetris-next">
                            <div class="tetris-label">NEXT</div>
                            <canvas id="tetrisNextCanvas" width="80" height="80"></canvas>
                        </div>
                        <div class="tetris-stats">
                            <div class="tetris-stat">
                                <span class="tetris-label">SCORE</span>
                                <span id="tetrisScore">0</span>
                            </div>
                            <div class="tetris-stat">
                                <span class="tetris-label">LEVEL</span>
                                <span id="tetrisLevel">1</span>
                            </div>
                            <div class="tetris-stat">
                                <span class="tetris-label">LINES</span>
                                <span id="tetrisLines">0</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tetris-controls">
                    <button class="win-btn" id="tetrisNewGame">New</button>
                    <button class="win-btn" id="tetrisPause">Pause</button>
                </div>
                <div class="mobile-controls" id="tetrisMobileControls">
                    <div class="mobile-controls-row">
                        <button class="mobile-btn" data-action="rotate">&#8635;</button>
                    </div>
                    <div class="mobile-controls-row">
                        <button class="mobile-btn" data-action="left">&#9664;</button>
                        <button class="mobile-btn" data-action="down">&#9660;</button>
                        <button class="mobile-btn" data-action="right">&#9654;</button>
                    </div>
                    <div class="mobile-controls-row">
                        <button class="mobile-btn wide" data-action="drop">DROP</button>
                    </div>
                </div>
            </div>
        `;
    },

    onInit() {
        const container = document.querySelector('#window-tetris .window-content-inner');
        if (!container) return;

        TetrisApp.canvas = container.querySelector('#tetrisCanvas');
        TetrisApp.ctx = TetrisApp.canvas?.getContext('2d');
        TetrisApp.nextCanvas = container.querySelector('#tetrisNextCanvas');
        TetrisApp.nextCtx = TetrisApp.nextCanvas?.getContext('2d');
        
        // Buttons
        container.querySelector('#tetrisNewGame')?.addEventListener('click', () => TetrisApp.startGame());
        container.querySelector('#tetrisPause')?.addEventListener('click', () => TetrisApp.togglePause());
        container.querySelector('#tetrisOverlay')?.addEventListener('click', () => TetrisApp.startGame());

        // Keyboard
        TetrisApp.keyHandler = (e) => {
            if (!document.querySelector('#window-tetris')) return;
            
            if (e.code === 'Space' && (TetrisApp.gameOver || !TetrisApp.gameLoop)) {
                e.preventDefault();
                TetrisApp.startGame();
                return;
            }
            
            if (e.code === 'KeyP') {
                TetrisApp.togglePause();
                return;
            }
            
            if (TetrisApp.isPaused || TetrisApp.gameOver || !TetrisApp.currentPiece) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    TetrisApp.movePiece(-1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    TetrisApp.movePiece(1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    TetrisApp.movePiece(0, 1);
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    TetrisApp.rotatePiece();
                    e.preventDefault();
                    break;
                case 'Space':
                    TetrisApp.hardDrop();
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', TetrisApp.keyHandler);
        
        // Mobile touch controls
        container.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (TetrisApp.isPaused || TetrisApp.gameOver || !TetrisApp.currentPiece) return;
                
                const action = btn.dataset.action;
                if (action === 'left') TetrisApp.movePiece(-1, 0);
                if (action === 'right') TetrisApp.movePiece(1, 0);
                if (action === 'down') TetrisApp.movePiece(0, 1);
                if (action === 'rotate') TetrisApp.rotatePiece();
                if (action === 'drop') TetrisApp.hardDrop();
            });
        });
        
        TetrisApp.drawEmpty();
    },

    onClose() {
        clearInterval(TetrisApp.gameLoop);
        TetrisApp.gameLoop = null;
        document.removeEventListener('keydown', TetrisApp.keyHandler);
    },

    drawEmpty() {
        if (!TetrisApp.ctx) return;
        TetrisApp.ctx.fillStyle = '#111';
        TetrisApp.ctx.fillRect(0, 0, 200, 400);
        
        // Grid lines
        TetrisApp.ctx.strokeStyle = '#222';
        for (let x = 0; x <= TetrisApp.COLS; x++) {
            TetrisApp.ctx.beginPath();
            TetrisApp.ctx.moveTo(x * TetrisApp.BLOCK_SIZE, 0);
            TetrisApp.ctx.lineTo(x * TetrisApp.BLOCK_SIZE, 400);
            TetrisApp.ctx.stroke();
        }
        for (let y = 0; y <= TetrisApp.ROWS; y++) {
            TetrisApp.ctx.beginPath();
            TetrisApp.ctx.moveTo(0, y * TetrisApp.BLOCK_SIZE);
            TetrisApp.ctx.lineTo(200, y * TetrisApp.BLOCK_SIZE);
            TetrisApp.ctx.stroke();
        }
    },

    startGame() {
        clearInterval(TetrisApp.gameLoop);
        
        // Reset state
        TetrisApp.board = Array(TetrisApp.ROWS).fill(null).map(() => Array(TetrisApp.COLS).fill(0));
        TetrisApp.score = 0;
        TetrisApp.level = 1;
        TetrisApp.lines = 0;
        TetrisApp.gameOver = false;
        TetrisApp.isPaused = false;
        TetrisApp.dropInterval = 1000;
        
        TetrisApp.nextPiece = TetrisApp.randomPiece();
        TetrisApp.spawnPiece();
        TetrisApp.updateStats();
        
        // Hide overlay
        const overlay = document.querySelector('#tetrisOverlay');
        if (overlay) overlay.style.display = 'none';
        
        TetrisApp.gameLoop = setInterval(() => TetrisApp.update(), TetrisApp.dropInterval);
        SoundManager.play('click');
    },

    togglePause() {
        if (TetrisApp.gameOver || !TetrisApp.gameLoop) return;
        
        TetrisApp.isPaused = !TetrisApp.isPaused;
        
        const overlay = document.querySelector('#tetrisOverlay');
        const message = overlay?.querySelector('.tetris-message');
        
        if (TetrisApp.isPaused) {
            if (overlay) overlay.style.display = 'flex';
            if (message) message.innerHTML = '<h3>⏸️ PAUSED</h3><p>Press P to continue</p>';
        } else {
            if (overlay) overlay.style.display = 'none';
        }
        
        SoundManager.play('click');
    },

    randomPiece() {
        const piece = TetrisApp.PIECES[Math.floor(Math.random() * TetrisApp.PIECES.length)];
        return {
            shape: piece.shape.map(row => [...row]),
            color: piece.color,
            x: Math.floor((TetrisApp.COLS - piece.shape[0].length) / 2),
            y: 0
        };
    },

    spawnPiece() {
        TetrisApp.currentPiece = TetrisApp.nextPiece;
        TetrisApp.nextPiece = TetrisApp.randomPiece();
        TetrisApp.drawNextPiece();
        
        // Check game over
        if (TetrisApp.collision(0, 0)) {
            TetrisApp.endGame();
        }
    },

    collision(offsetX, offsetY, shape = TetrisApp.currentPiece?.shape) {
        if (!TetrisApp.currentPiece || !shape) return true;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = TetrisApp.currentPiece.x + x + offsetX;
                    const newY = TetrisApp.currentPiece.y + y + offsetY;
                    
                    if (newX < 0 || newX >= TetrisApp.COLS || newY >= TetrisApp.ROWS) {
                        return true;
                    }
                    
                    if (newY >= 0 && TetrisApp.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    movePiece(dx, dy) {
        if (!TetrisApp.collision(dx, dy)) {
            TetrisApp.currentPiece.x += dx;
            TetrisApp.currentPiece.y += dy;
            TetrisApp.draw();
            return true;
        }
        return false;
    },

    rotatePiece() {
        if (!TetrisApp.currentPiece) return;
        
        // Rotate matrix 90 degrees clockwise
        const shape = TetrisApp.currentPiece.shape;
        const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
        
        if (!TetrisApp.collision(0, 0, rotated)) {
            TetrisApp.currentPiece.shape = rotated;
            TetrisApp.draw();
            SoundManager.play('click');
        }
    },

    hardDrop() {
        while (TetrisApp.movePiece(0, 1)) {
            TetrisApp.score += 2;
        }
        TetrisApp.lockPiece();
    },

    update() {
        if (TetrisApp.isPaused || TetrisApp.gameOver) return;
        
        if (!TetrisApp.movePiece(0, 1)) {
            TetrisApp.lockPiece();
        }
    },

    lockPiece() {
        if (!TetrisApp.currentPiece) return;
        
        // Add piece to board
        const shape = TetrisApp.currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = TetrisApp.currentPiece.y + y;
                    const boardX = TetrisApp.currentPiece.x + x;
                    if (boardY >= 0) {
                        TetrisApp.board[boardY][boardX] = TetrisApp.currentPiece.color;
                    }
                }
            }
        }
        
        TetrisApp.clearLines();
        TetrisApp.spawnPiece();
        TetrisApp.draw();
    },

    clearLines() {
        let linesCleared = 0;
        
        for (let y = TetrisApp.ROWS - 1; y >= 0; y--) {
            if (TetrisApp.board[y].every(cell => cell !== 0)) {
                TetrisApp.board.splice(y, 1);
                TetrisApp.board.unshift(Array(TetrisApp.COLS).fill(0));
                linesCleared++;
                y++; // Check same row again
            }
        }
        
        if (linesCleared > 0) {
            // Scoring: 100, 300, 500, 800 for 1-4 lines
            const points = [0, 100, 300, 500, 800];
            TetrisApp.score += points[linesCleared] * TetrisApp.level;
            TetrisApp.lines += linesCleared;
            
            // Level up every 10 lines
            const newLevel = Math.floor(TetrisApp.lines / 10) + 1;
            if (newLevel > TetrisApp.level) {
                TetrisApp.level = newLevel;
                TetrisApp.dropInterval = Math.max(100, 1000 - (TetrisApp.level - 1) * 100);
                clearInterval(TetrisApp.gameLoop);
                TetrisApp.gameLoop = setInterval(() => TetrisApp.update(), TetrisApp.dropInterval);
            }
            
            TetrisApp.updateStats();
            SoundManager.play('chord');
        }
    },

    draw() {
        if (!TetrisApp.ctx) return;
        const ctx = TetrisApp.ctx;
        const size = TetrisApp.BLOCK_SIZE;
        
        // Clear
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, 200, 400);
        
        // Draw board
        for (let y = 0; y < TetrisApp.ROWS; y++) {
            for (let x = 0; x < TetrisApp.COLS; x++) {
                if (TetrisApp.board[y][x]) {
                    TetrisApp.drawBlock(ctx, x, y, TetrisApp.board[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (TetrisApp.currentPiece) {
            const shape = TetrisApp.currentPiece.shape;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        TetrisApp.drawBlock(
                            ctx,
                            TetrisApp.currentPiece.x + x,
                            TetrisApp.currentPiece.y + y,
                            TetrisApp.currentPiece.color
                        );
                    }
                }
            }
        }
        
        // Draw grid
        ctx.strokeStyle = '#222';
        for (let x = 0; x <= TetrisApp.COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * size, 0);
            ctx.lineTo(x * size, 400);
            ctx.stroke();
        }
        for (let y = 0; y <= TetrisApp.ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * size);
            ctx.lineTo(200, y * size);
            ctx.stroke();
        }
    },

    drawBlock(ctx, x, y, color) {
        const size = TetrisApp.BLOCK_SIZE;
        
        // Main color
        ctx.fillStyle = color;
        ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
        
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x * size + 1, y * size + 1, size - 2, 3);
        ctx.fillRect(x * size + 1, y * size + 1, 3, size - 2);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x * size + size - 4, y * size + 1, 3, size - 2);
        ctx.fillRect(x * size + 1, y * size + size - 4, size - 2, 3);
    },

    drawNextPiece() {
        if (!TetrisApp.nextCtx || !TetrisApp.nextPiece) return;
        const ctx = TetrisApp.nextCtx;
        
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, 80, 80);
        
        const shape = TetrisApp.nextPiece.shape;
        const offsetX = (80 - shape[0].length * 20) / 2;
        const offsetY = (80 - shape.length * 20) / 2;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    ctx.fillStyle = TetrisApp.nextPiece.color;
                    ctx.fillRect(offsetX + x * 20 + 1, offsetY + y * 20 + 1, 18, 18);
                }
            }
        }
    },

    updateStats() {
        document.querySelector('#tetrisScore').textContent = TetrisApp.score;
        document.querySelector('#tetrisLevel').textContent = TetrisApp.level;
        document.querySelector('#tetrisLines').textContent = TetrisApp.lines;
    },

    endGame() {
        clearInterval(TetrisApp.gameLoop);
        TetrisApp.gameLoop = null;
        TetrisApp.gameOver = true;
        
        SoundManager.play('error');
        
        const overlay = document.querySelector('#tetrisOverlay');
        const message = overlay?.querySelector('.tetris-message');
        
        if (overlay) overlay.style.display = 'flex';
        if (message) {
            message.innerHTML = `
                <h3>💀 GAME OVER</h3>
                <p>Score: ${TetrisApp.score}</p>
                <p>Level: ${TetrisApp.level}</p>
                <p>Press SPACE to play again</p>
            `;
        }
    }
};
