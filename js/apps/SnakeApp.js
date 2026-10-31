/**
 * Snake Game App - Smooth snake with speed levels, bonus food and optional wrap-around walls
 */

import { Icons } from '../icons.js?v=16';
import { SoundManager } from '../managers/SoundManager.js?v=16';
import { WindowManager } from '../managers/WindowManager.js?v=16';
import { Leaderboard } from '../leaderboard.js?v=16';

const getThemeColor = (varName) => getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '';

const TILES = 19;
const CELL = 20;
const SIZE = TILES * CELL;

const BASE_STEP = 130;      // ms per move on level 1
const MIN_STEP = 65;        // fastest the snake gets
const STEP_PER_LEVEL = 8;   // ms removed per level
const FOOD_PER_LEVEL = 4;   // apples needed for the next level
const FOOD_POINTS = 10;
const BONUS_EVERY = 5;      // a golden apple shows up after every Nth apple
const BONUS_TTL = 6000;
const BONUS_POINTS = 50;
const QUEUE_MAX = 3;        // buffered turns, so quick U-turns are not lost
const PX = 2;               // size of one sprite pixel on the canvas

const SPRITE_COLORS = {
    r: '#E02020', d: '#901010', w: '#FFFFFF', b: '#7A4A1A', g: '#40C040', y: '#FFD700', o: '#C08000'
};
const APPLE = [
    '....b.gg..',
    '....bgg...',
    '..rrrbrr..',
    '.rwrrrrrr.',
    '.rwrrrrrr.',
    '.rrrrrrrr.',
    '.rrrrrrrd.',
    '.rrrrrrdd.',
    '..rrrrdd..',
    '...rrrr...'
];
const STAR = [
    '....yy....',
    '....yy....',
    '...yyyy...',
    'yyyyyyyyyy',
    '.yyyyyyyy.',
    '..yyyyyy..',
    '..yyyyoo..',
    '.yyyyyyoo.',
    '.yyy..yyy.',
    '.yy....yy.'
];

const DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const KEY_DIRS = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right'
};

const parseHex = (hex) => {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 255, 0];
};
const shade = ([r, g, b], f) => `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;

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
    win: null,
    canvas: null,
    ctx: null,
    raf: 0,
    lastTime: 0,
    snake: [],
    dir: 'right',
    queue: [],
    food: null,
    bonus: null,
    score: 0,
    highScore: 0,
    eaten: 0,
    level: 1,
    stepTime: BASE_STEP,
    acc: 0,
    running: false,
    isPaused: false,
    gameOver: false,
    wrap: localStorage.getItem('snakeWrap') === '1',
    popups: [],
    dying: 0,
    overlayTimer: 0,

    menuConfig: {
        'Game': [
            { label: 'New Game', action: 'newGame', shortcut: 'F2' },
            { label: 'Pause', action: 'pause', shortcut: 'P' },
            { divider: true },
            { label: 'Wrap-around walls', action: 'wrap', checked: localStorage.getItem('snakeWrap') === '1' },
            { divider: true },
            { label: 'Leaderboard...', action: 'leaderboard' },
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
        switch (action) {
            case 'newGame':
                SnakeApp.startGame();
                break;
            case 'pause':
                SnakeApp.togglePause();
                break;
            case 'wrap':
                SnakeApp.toggleWrap();
                break;
            case 'leaderboard':
                Leaderboard.show(SnakeApp.boardId());
                break;
            case 'howToPlay':
                import('../managers/DialogManager.js?v=16').then(({ DialogManager }) => {
                    DialogManager.alert(
                        'How to Play Snake:\n\n' +
                        '• Arrow Keys / WASD to move (turns are buffered)\n' +
                        '• Swipe on the board to turn (mobile)\n' +
                        '• Eat apples to grow, the snake speeds up every level\n' +
                        '• Golden apples are worth 50 but vanish quickly\n' +
                        "• Don't hit the walls or yourself!\n" +
                        '• Game > Wrap-around walls lets you pass through the edges\n' +
                        '• P pauses, F2 starts a new game',
                        'How to Play'
                    );
                });
                break;
        }
    },

    render() {
        return `
            <div class="snake-container">
                <div class="snake-header">
                    <div class="snake-score">
                        <span>Score:</span>
                        <span id="snakeScore">0</span>
                    </div>
                    <div class="snake-score">
                        <span>Level:</span>
                        <span id="snakeLevel">1</span>
                    </div>
                    <div class="snake-score">
                        <span>High:</span>
                        <span id="snakeHigh">0</span>
                    </div>
                </div>
                <div class="snake-game-area">
                    <canvas id="snakeCanvas" width="${SIZE}" height="${SIZE}"></canvas>
                    <div class="snake-overlay" id="snakeOverlay">
                        <div class="snake-message"></div>
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
        const win = document.querySelector('#window-snake');
        const container = win?.querySelector('.window-content-inner');
        if (!container) return;

        const S = SnakeApp;
        S.win = win;
        S.canvas = container.querySelector('#snakeCanvas');
        S.ctx = S.canvas?.getContext('2d');

        // Shrink the canvas on narrow screens
        const gameArea = container.querySelector('.snake-game-area');
        if (gameArea && S.canvas) {
            S._fitCanvas = () => {
                const maxW = gameArea.clientWidth - 6;
                if (maxW < SIZE) {
                    S.canvas.style.width = maxW + 'px';
                    S.canvas.style.height = Math.floor(maxW) + 'px';
                } else {
                    S.canvas.style.width = '';
                    S.canvas.style.height = '';
                }
            };
            S._fitCanvas();
            window.addEventListener('resize', S._fitCanvas);
        }

        container.querySelector('#snakeNewGame')?.addEventListener('click', () => S.startGame());
        container.querySelector('#snakePause')?.addEventListener('click', () => S.togglePause());
        container.querySelector('#snakeOverlay')?.addEventListener('click', () => {
            if (S.isPaused) S.togglePause();
            else S.startGame();
        });

        S.keyHandler = (e) => S.onKeyDown(e);
        S.visHandler = () => { if (document.hidden) S.autoPause(); };
        document.addEventListener('keydown', S.keyHandler);
        document.addEventListener('visibilitychange', S.visHandler);

        S.initSwipeGestures(S.canvas);

        S.reset();
        S.showOverlay(S.startHtml());
        cancelAnimationFrame(S.raf);
        S.lastTime = performance.now();
        S.raf = requestAnimationFrame((ts) => S.loop(ts));
    },

    onClose() {
        const S = SnakeApp;
        cancelAnimationFrame(S.raf);
        S.raf = 0;
        S.running = false;
        document.removeEventListener('keydown', S.keyHandler);
        document.removeEventListener('visibilitychange', S.visHandler);
        if (S._fitCanvas) window.removeEventListener('resize', S._fitCanvas);
        S.win = null;
    },

    /* ---------- Input ---------- */

    isActive() {
        const win = SnakeApp.win;
        return !!win && document.body.contains(win) && win.classList.contains('active') && !win.classList.contains('minimized');
    },

    onKeyDown(e) {
        const S = SnakeApp;
        if (!S.isActive() || e.ctrlKey || e.altKey || e.metaKey) return;

        if (e.code === 'F2') {
            e.preventDefault();
            S.startGame();
            return;
        }

        if (e.code === 'KeyP') {
            S.togglePause();
            return;
        }

        const dir = KEY_DIRS[e.code];

        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            if (S.isPaused) S.togglePause();
            else if (!S.running) S.startGame();
            return;
        }

        if (!dir) return;
        e.preventDefault();

        if (S.isPaused) return;
        if (!S.running) {
            // An arrow key on the start screen starts the game in that direction
            if (S.dying > 0) return;
            S.startGame();
        }
        S.turn(dir);
    },

    turn(dir) {
        const S = SnakeApp;
        const last = S.queue.length ? S.queue[S.queue.length - 1] : S.dir;
        if (dir === last || dir === OPPOSITE[last]) return;
        if (S.queue.length < QUEUE_MAX) S.queue.push(dir);
    },

    initSwipeGestures(canvas) {
        if (!canvas) return;
        const MIN_SWIPE = 24;
        let sx = 0;
        let sy = 0;

        canvas.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            sx = t.clientX;
            sy = t.clientY;
        }, { passive: true });

        // Turn as soon as the finger has moved far enough, no need to wait for release
        canvas.addEventListener('touchmove', (e) => {
            if (!SnakeApp.running || SnakeApp.isPaused) return;
            const t = e.touches[0];
            const dx = t.clientX - sx;
            const dy = t.clientY - sy;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < MIN_SWIPE) return;
            if (Math.abs(dx) > Math.abs(dy)) SnakeApp.turn(dx > 0 ? 'right' : 'left');
            else SnakeApp.turn(dy > 0 ? 'down' : 'up');
            sx = t.clientX;
            sy = t.clientY;
        }, { passive: true });
    },

    /* ---------- Game flow ---------- */

    reset() {
        const S = SnakeApp;
        const y = Math.floor(TILES / 2);
        S.snake = [{ x: 8, y }, { x: 7, y }, { x: 6, y }];
        S.dir = 'right';
        S.queue = [];
        S.bonus = null;
        S.score = 0;
        S.eaten = 0;
        S.level = 1;
        S.stepTime = BASE_STEP;
        S.acc = 0;
        S.running = false;
        S.isPaused = false;
        S.gameOver = false;
        S.popups = [];
        S.dying = 0;
        S.overlayTimer = 0;
        S.highScore = parseInt(localStorage.getItem(S.highKey()) || '0', 10);
        S.spawnFood();
        S.updateScore();
    },

    highKey() {
        return SnakeApp.wrap ? 'snakeHighScoreWrap' : 'snakeHighScore';
    },

    startGame() {
        const S = SnakeApp;
        S.reset();
        S.hideOverlay();
        S.running = true;
        SoundManager.play('click');
    },

    toggleWrap() {
        const S = SnakeApp;
        S.wrap = !S.wrap;
        localStorage.setItem('snakeWrap', S.wrap ? '1' : '0');
        WindowManager.getWindowInstance('snake')?.toggleMenuChecked('Game', 'wrap');
        S.reset();
        S.showOverlay(S.startHtml());
    },

    togglePause() {
        const S = SnakeApp;
        if (S.gameOver || !S.running) return;
        S.isPaused = !S.isPaused;
        if (S.isPaused) S.showOverlay(`${Icons.gamePause}<h3>PAUSED</h3><p>Press P or click to continue</p>`);
        else S.hideOverlay();
        SoundManager.play('click');
    },

    autoPause() {
        const S = SnakeApp;
        if (S.running && !S.isPaused && !S.gameOver) S.togglePause();
    },

    startHtml() {
        const mode = SnakeApp.wrap ? 'Wrap-around walls' : 'Solid walls';
        return `<h3>SNAKE</h3><p>Press SPACE, an arrow key or tap to start</p><p class="snake-hint">${mode} &middot; Game menu to change</p>`;
    },

    endGame(won = false) {
        const S = SnakeApp;
        S.running = false;
        S.gameOver = true;
        S.queue = [];

        const record = S.score > S.highScore;
        if (record) {
            S.highScore = S.score;
            localStorage.setItem(S.highKey(), S.highScore);
        }
        S.updateScore();

        SoundManager.play(won ? 'chord' : 'error');
        S.dying = won ? 0 : 650;

        const title = won
            ? '<h3>YOU WIN!</h3>'
            : `${Icons.gameOverSkull}<h3>GAME OVER</h3>`;
        S._overEnd = `
            ${title}
            <p>Score: ${S.score}${record && S.score > 0 ? ' &middot; New high score!' : ''}</p>
            <p>Level ${S.level} &middot; Length ${S.snake.length}</p>
            <p>Press SPACE to play again</p>
        `;
        S.overlayTimer = won ? 1 : S.dying;
        S._overBoard = { game: S.boardId(), score: S.score };
    },

    boardId() {
        return SnakeApp.wrap ? 'snake-wrap' : 'snake-solid';
    },

    /* ---------- Simulation ---------- */

    loop(ts) {
        const S = SnakeApp;
        if (!S.win || !document.body.contains(S.win)) return;
        const dt = Math.min(ts - S.lastTime, 100);
        S.lastTime = ts;

        if (S.running && !S.isPaused) {
            // The snake can't be steered while another window has focus, so wait for the player
            if (!S.isActive()) S.autoPause();
            else S.tick(dt);
        }
        S.fx(dt);
        S.draw(ts);
        S.raf = requestAnimationFrame((next) => S.loop(next));
    },

    tick(dt) {
        const S = SnakeApp;
        S.acc += dt;

        if (S.bonus) {
            S.bonus.ttl -= dt;
            if (S.bonus.ttl <= 0) S.bonus = null;
        }

        while (S.running && S.acc >= S.stepTime) {
            S.acc -= S.stepTime;
            S.step();
        }
    },

    step() {
        const S = SnakeApp;
        if (S.queue.length) S.dir = S.queue.shift();

        const d = DIRS[S.dir];
        const head = { x: S.snake[0].x + d.x, y: S.snake[0].y + d.y };

        if (S.wrap) {
            head.x = (head.x + TILES) % TILES;
            head.y = (head.y + TILES) % TILES;
        } else if (head.x < 0 || head.x >= TILES || head.y < 0 || head.y >= TILES) {
            S.endGame();
            return;
        }

        const eatsFood = head.x === S.food.x && head.y === S.food.y;
        const eatsBonus = !!S.bonus && head.x === S.bonus.x && head.y === S.bonus.y;
        const grows = eatsFood || eatsBonus;

        // The tail cell is free again after the move unless the snake grows
        const body = grows ? S.snake : S.snake.slice(0, -1);
        if (body.some((seg) => seg.x === head.x && seg.y === head.y)) {
            S.endGame();
            return;
        }

        S.snake.unshift(head);
        if (!grows) S.snake.pop();

        if (eatsFood) {
            S.eaten++;
            S.addScore(FOOD_POINTS, head, '#FF3030');
            S.level = 1 + Math.floor(S.eaten / FOOD_PER_LEVEL);
            S.stepTime = Math.max(MIN_STEP, BASE_STEP - (S.level - 1) * STEP_PER_LEVEL);
            if (!S.spawnFood()) {
                S.endGame(true);
                return;
            }
            if (S.eaten % BONUS_EVERY === 0) S.spawnBonus();
            SoundManager.play('chord');
        } else if (eatsBonus) {
            S.addScore(BONUS_POINTS, head, '#FFD700');
            S.bonus = null;
            SoundManager.play('chord');
        }
    },

    addScore(points, cell, color) {
        const S = SnakeApp;
        S.score += points;
        S.updateScore();
        const x = (cell.x + 0.5) * CELL;
        const y = (cell.y + 0.5) * CELL;
        S.popups.push({ x, y, text: `+${points}`, color, life: 800 });
    },

    freeCell() {
        const S = SnakeApp;
        const taken = new Set(S.snake.map((c) => c.y * TILES + c.x));
        if (S.food) taken.add(S.food.y * TILES + S.food.x);
        if (S.bonus) taken.add(S.bonus.y * TILES + S.bonus.x);
        const free = [];
        for (let i = 0; i < TILES * TILES; i++) if (!taken.has(i)) free.push(i);
        if (!free.length) return null;
        const i = free[Math.floor(Math.random() * free.length)];
        return { x: i % TILES, y: Math.floor(i / TILES) };
    },

    spawnFood() {
        const S = SnakeApp;
        S.food = null;
        const cell = S.freeCell();
        if (!cell) return false;
        S.food = cell;
        return true;
    },

    spawnBonus() {
        const S = SnakeApp;
        const cell = S.freeCell();
        if (cell) S.bonus = { ...cell, ttl: BONUS_TTL };
    },

    fx(dt) {
        const S = SnakeApp;
        S.popups = S.popups.filter((p) => {
            p.life -= dt;
            p.y -= dt * 0.025;
            return p.life > 0;
        });
        if (S.dying > 0) S.dying = Math.max(0, S.dying - dt);

        if (S.overlayTimer > 0) {
            S.overlayTimer -= dt;
            if (S.overlayTimer <= 0 && S.gameOver) {
                S.showOverlay(S._overEnd);
                const { game, score } = S._overBoard;
                Leaderboard.offer(game, score, () => S.gameOver);
            }
        }
    },

    /* ---------- Overlay / score ---------- */

    showOverlay(html) {
        const overlay = SnakeApp.win?.querySelector('#snakeOverlay');
        const message = overlay?.querySelector('.snake-message');
        if (!overlay || !message) return;
        message.replaceChildren();
        message.insertAdjacentHTML('beforeend', html);
        overlay.style.display = 'flex';
    },

    hideOverlay() {
        const overlay = SnakeApp.win?.querySelector('#snakeOverlay');
        if (overlay) overlay.style.display = 'none';
    },

    updateScore() {
        const win = SnakeApp.win;
        if (!win) return;
        const high = Math.max(SnakeApp.highScore, SnakeApp.score);
        win.querySelector('#snakeScore').textContent = SnakeApp.score;
        win.querySelector('#snakeLevel').textContent = SnakeApp.level;
        win.querySelector('#snakeHigh').textContent = high;
    },

    /* ---------- Drawing ---------- */

    draw(ts) {
        const S = SnakeApp;
        const ctx = S.ctx;
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const bg = getThemeColor('--canvas-bg') || '#000';
        const grid = getThemeColor('--canvas-grid') || '#111';
        const accent = parseHex(getThemeColor('--accent-green') || '#00FF00');

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, SIZE, SIZE);

        // Plain grid lines, like the classic board
        ctx.fillStyle = grid;
        for (let i = 1; i < TILES; i++) {
            ctx.fillRect(i * CELL, 0, 1, SIZE);
            ctx.fillRect(0, i * CELL, SIZE, 1);
        }

        S.drawWall(ctx);

        if (S.food) S.drawSprite(ctx, APPLE, S.food.x * CELL, S.food.y * CELL);
        if (S.bonus) S.drawBonus(ctx, S.bonus, ts);
        S.drawSnake(ctx, accent);

        // Score popups, rising in whole pixels
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        S.popups.forEach((p) => {
            const x = Math.round(p.x);
            const y = Math.round(p.y);
            ctx.fillStyle = '#000';
            ctx.fillText(p.text, x + 1, y + 1);
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, x, y);
        });
    },

    // Solid red frame for deadly walls, dashed cyan one when the edges wrap
    drawWall(ctx) {
        if (!SnakeApp.wrap) {
            ctx.fillStyle = '#C02020';
            ctx.fillRect(0, 0, SIZE, 2);
            ctx.fillRect(0, SIZE - 2, SIZE, 2);
            ctx.fillRect(0, 0, 2, SIZE);
            ctx.fillRect(SIZE - 2, 0, 2, SIZE);
            return;
        }
        ctx.fillStyle = '#00A8A8';
        for (let i = 0; i < SIZE; i += 8) {
            const len = Math.min(4, SIZE - i);
            ctx.fillRect(i, 0, len, 2);
            ctx.fillRect(i, SIZE - 2, len, 2);
            ctx.fillRect(0, i, 2, len);
            ctx.fillRect(SIZE - 2, i, 2, len);
        }
    },

    drawSprite(ctx, rows, x, y) {
        for (let r = 0; r < rows.length; r++) {
            for (let c = 0; c < rows[r].length; c++) {
                const col = SPRITE_COLORS[rows[r][c]];
                if (!col) continue;
                ctx.fillStyle = col;
                ctx.fillRect(x + c * PX, y + r * PX, PX, PX);
            }
        }
    },

    drawBonus(ctx, b, ts) {
        // Blink during the last two seconds
        if (b.ttl < 2000 && Math.floor(ts / 150) % 2) return;
        const x = b.x * CELL;
        const y = b.y * CELL;
        SnakeApp.drawSprite(ctx, STAR, x, y);
        // Time left as a thin bar along the bottom of the cell
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 1, y + CELL - 2, Math.ceil(((CELL - 2) * b.ttl) / BONUS_TTL), 1);
    },

    drawBlock(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        // Win95-style bevel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(x + 1, y + 1, CELL - 2, 2);
        ctx.fillRect(x + 1, y + 1, 2, CELL - 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x + 1, y + CELL - 3, CELL - 2, 2);
        ctx.fillRect(x + CELL - 3, y + 1, 2, CELL - 2);
    },

    drawSnake(ctx, accent) {
        const S = SnakeApp;
        const flash = S.dying > 0 && Math.floor(S.dying / 100) % 2 === 0;

        // Tail first so the head ends up on top; every other block is a bit darker
        for (let i = S.snake.length - 1; i >= 0; i--) {
            const c = S.snake[i];
            const color = flash ? '#FF4040' : shade(accent, i === 0 ? 1 : i % 2 ? 0.8 : 0.62);
            S.drawBlock(ctx, c.x * CELL, c.y * CELL, color);
        }

        S.drawEyes(ctx, S.snake[0]);
    },

    drawEyes(ctx, head) {
        const S = SnakeApp;
        const d = DIRS[S.dir];
        const cx = head.x * CELL + CELL / 2;
        const cy = head.y * CELL + CELL / 2;
        for (const side of [-1, 1]) {
            const ex = cx + d.x * 3 + -d.y * side * 4;
            const ey = cy + d.y * 3 + d.x * side * 4;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(ex - 2, ey - 2, 4, 4);
            ctx.fillStyle = S.dying > 0 ? '#C00000' : '#000000';
            ctx.fillRect(ex - 1 + d.x, ey - 1 + d.y, 2, 2);
        }
    }
};
