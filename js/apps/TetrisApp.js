/**
 * Tetris - falling blocks, Guideline style:
 * SRS rotation with wall kicks, 7-bag randomizer, lock delay, DAS/ARR and a ghost piece.
 * The board scales to the window height, so nothing is cut off on short screens.
 */

import { Icons } from '../icons.js?v=15';
import { SoundManager } from '../managers/SoundManager.js?v=15';

const COLS = 10;
const VISIBLE = 20;
const HIDDEN = 4;               // buffer rows above the visible board
const ROWS = VISIBLE + HIDDEN;
const SPAWN_Y = 2;

const LOCK_DELAY = 500;         // ms on the ground before the piece locks
const MAX_LOCK_RESETS = 15;     // moves/rotations that may restart the lock timer
const DAS = 200;                // ms before auto-repeat starts
const ARR = 60;                 // ms between auto-repeat steps
const SOFT_DROP_FACTOR = 20;
const LINE_POINTS = [0, 100, 300, 500, 800];

const NEXT_COUNT = 3;
const NEXT_CELL = 16;
const NEXT_SLOT = 44;
const NEXT_WIDTH = 80;

const MIN_CELL = 13;
const MAX_CELL = 34;

const getThemeColor = (varName) => getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '';

const rotateCW = (m) => m[0].map((_, x) => m.map((_, y) => m[m.length - 1 - y][x]));

const makePiece = (color, box, spawnX) => {
    const rot = [box];
    for (let i = 1; i < 4; i++) rot.push(rotateCW(rot[i - 1]));
    const cells = rot.map(m => {
        const out = [];
        m.forEach((row, y) => row.forEach((v, x) => { if (v) out.push([x, y]); }));
        return out;
    });
    return { color, cells, spawnX };
};

const PIECES = {
    I: makePiece('#00FFFF', [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], 3),
    O: makePiece('#FFFF00', [[1,1],[1,1]], 4),
    T: makePiece('#AA00FF', [[0,1,0],[1,1,1],[0,0,0]], 3),
    J: makePiece('#0000FF', [[1,0,0],[1,1,1],[0,0,0]], 3),
    L: makePiece('#FF8800', [[0,0,1],[1,1,1],[0,0,0]], 3),
    S: makePiece('#00FF00', [[0,1,1],[1,1,0],[0,0,0]], 3),
    Z: makePiece('#FF0000', [[1,1,0],[0,1,1],[0,0,0]], 3)
};
const TYPES = Object.keys(PIECES);

// SRS wall kick offsets as [x, y] with y pointing up (as in the Guideline); flipped to screen coordinates on use
const KICKS_JLSTZ = {
    '0>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    '1>0': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    '1>2': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
    '2>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    '2>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    '3>2': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    '3>0': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    '0>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]]
};
const KICKS_I = {
    '0>1': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
    '1>0': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
    '1>2': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
    '2>1': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
    '2>3': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
    '3>2': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
    '3>0': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
    '0>3': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]]
};

export const TetrisApp = {
    id: 'tetris',
    title: 'Tetris',
    icon: Icons.tetris,
    width: 380,
    height: 610,
    hasMenu: true,
    menuItems: ['Game', 'Help'],
    resizable: false,

    // Game state
    canvas: null,
    ctx: null,
    nextCanvas: null,
    nextCtx: null,
    win: null,
    main: null,
    cell: 20,
    board: [],
    piece: null,
    bag: [],
    queue: [],
    score: 0,
    level: 1,
    lines: 0,
    running: false,
    gameOver: false,
    isPaused: false,
    gravity: 1000,
    dropTimer: 0,
    lockTimer: 0,
    lockResets: 0,
    lowestY: 0,
    softDrop: false,
    heldDir: 0,
    dasTimer: 0,
    arrTimer: 0,
    keysDown: {},
    raf: 0,
    lastTime: 0,
    colors: { bg: '#111', grid: '#222', at: -Infinity },

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
        switch (action) {
            case 'newGame':
                TetrisApp.startGame();
                break;
            case 'pause':
                TetrisApp.togglePause();
                break;
            case 'howToPlay':
                import('../managers/DialogManager.js?v=15').then(({ DialogManager }) => {
                    DialogManager.alert(
                        'How to Play Tetris:\n\n' +
                        '• ← → (or A D) move, hold to slide\n' +
                        '• ↑ or X rotate clockwise\n' +
                        '• Z rotate counter-clockwise\n' +
                        '• ↓ (or S) soft drop\n' +
                        '• SPACE hard drop\n' +
                        '• P or ESC pause, F2 new game\n' +
                        '• Touch: tap rotates, drag moves,\n' +
                        '   hold = soft drop, flick down = hard drop\n\n' +
                        'Clear lines to score and speed up!',
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
                                <p>Press SPACE, tap or click to start</p>
                            </div>
                        </div>
                    </div>
                    <div class="tetris-sidebar">
                        <div class="tetris-next">
                            <div class="tetris-label">NEXT</div>
                            <canvas id="tetrisNextCanvas" width="${NEXT_WIDTH}" height="${NEXT_COUNT * NEXT_SLOT}"></canvas>
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
            </div>
        `;
    },

    onInit() {
        const win = document.querySelector('#window-tetris');
        const container = win?.querySelector('.window-content-inner');
        if (!container) return;

        const T = TetrisApp;
        T.win = win;
        T.canvas = container.querySelector('#tetrisCanvas');
        T.ctx = T.canvas?.getContext('2d');
        T.nextCanvas = container.querySelector('#tetrisNextCanvas');
        T.nextCtx = T.nextCanvas?.getContext('2d');
        T.main = container.querySelector('.tetris-main');
        T.board = T.emptyBoard();
        T.queue = [];
        T.piece = null;
        T.running = false;
        T.gameOver = false;
        T.isPaused = false;
        T.releaseKeys();

        container.querySelector('#tetrisNewGame')?.addEventListener('click', () => T.startGame());
        container.querySelector('#tetrisPause')?.addEventListener('click', () => T.togglePause());
        container.querySelector('#tetrisOverlay')?.addEventListener('click', () => {
            if (T.isPaused) T.togglePause();
            else T.startGame();
        });

        T.keyDownHandler = (e) => T.onKeyDown(e);
        T.keyUpHandler = (e) => T.onKeyUp(e);
        T.blurHandler = () => T.releaseKeys();
        T.visHandler = () => { if (document.hidden) T.autoPause(); };
        document.addEventListener('keydown', T.keyDownHandler);
        document.addEventListener('keyup', T.keyUpHandler);
        window.addEventListener('blur', T.blurHandler);
        document.addEventListener('visibilitychange', T.visHandler);

        T.initTouch(container.querySelector('.tetris-board-wrapper') || T.canvas);

        if (typeof ResizeObserver !== 'undefined' && T.main) {
            T.resizeObserver = new ResizeObserver(() => T.fit());
            T.resizeObserver.observe(T.main);
        }
        T.fit();
        T.updateStats();
        T.drawNext();
        T.startLoop();
    },

    onClose() {
        const T = TetrisApp;
        cancelAnimationFrame(T.raf);
        T.raf = 0;
        T.running = false;
        T.resizeObserver?.disconnect();
        T.resizeObserver = null;
        document.removeEventListener('keydown', T.keyDownHandler);
        document.removeEventListener('keyup', T.keyUpHandler);
        window.removeEventListener('blur', T.blurHandler);
        document.removeEventListener('visibilitychange', T.visHandler);
        T.releaseKeys();
        T.win = null;
    },

    /* ---------- Layout ---------- */

    // Pick the largest cell size that fits the window, so the board is never cut off
    fit() {
        const T = TetrisApp;
        if (!T.main || !T.canvas) return;
        const sidebar = T.main.querySelector('.tetris-sidebar');
        T.main.classList.toggle('compact', T.main.clientHeight < 385);
        const gap = parseFloat(getComputedStyle(T.main).columnGap) || 12;
        const availW = T.main.clientWidth - (sidebar?.offsetWidth || 0) - gap - 6;
        const availH = T.main.clientHeight - 6;
        if (availW <= 0 || availH <= 0) return;
        const cell = Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(Math.min(availW / COLS, availH / VISIBLE))));
        T.cell = cell;
        if (T.canvas.width !== COLS * cell || T.canvas.height !== VISIBLE * cell) {
            T.canvas.width = COLS * cell;
            T.canvas.height = VISIBLE * cell;
        }
        T.draw();
    },

    /* ---------- Input ---------- */

    isActive() {
        const win = TetrisApp.win;
        return !!win && document.body.contains(win) && win.classList.contains('active') && !win.classList.contains('minimized');
    },

    onKeyDown(e) {
        const T = TetrisApp;
        if (!T.isActive() || e.ctrlKey || e.altKey || e.metaKey) return;

        if (e.code === 'F2') {
            e.preventDefault();
            T.startGame();
            return;
        }
        if (e.code === 'Space' && (!T.running || T.gameOver)) {
            e.preventDefault();
            T.startGame();
            return;
        }
        if (e.code === 'KeyP' || e.code === 'Escape') {
            if (T.running && !T.gameOver) {
                e.preventDefault();
                T.togglePause();
            }
            return;
        }
        if (!T.running || T.isPaused || T.gameOver || !T.piece) return;

        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                e.preventDefault();
                if (!e.repeat) T.pressDir(-1);
                break;
            case 'ArrowRight':
            case 'KeyD':
                e.preventDefault();
                if (!e.repeat) T.pressDir(1);
                break;
            case 'ArrowDown':
            case 'KeyS':
                e.preventDefault();
                T.softDrop = true;
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'KeyX':
                e.preventDefault();
                if (!e.repeat) T.rotate(1);
                break;
            case 'KeyZ':
            case 'KeyQ':
                e.preventDefault();
                if (!e.repeat) T.rotate(-1);
                break;
            case 'Space':
                e.preventDefault();
                if (!e.repeat) T.hardDrop();
                break;
        }
    },

    onKeyUp(e) {
        const T = TetrisApp;
        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                T.keysDown.left = false;
                T.refreshDir();
                break;
            case 'ArrowRight':
            case 'KeyD':
                T.keysDown.right = false;
                T.refreshDir();
                break;
            case 'ArrowDown':
            case 'KeyS':
                T.softDrop = false;
                break;
        }
    },

    pressDir(dir) {
        const T = TetrisApp;
        T.keysDown[dir < 0 ? 'left' : 'right'] = true;
        T.heldDir = dir;
        T.dasTimer = 0;
        T.arrTimer = 0;
        T.shift(dir);
    },

    // After a release, keep sliding if the opposite key is still held
    refreshDir() {
        const T = TetrisApp;
        const next = T.keysDown.left && !T.keysDown.right ? -1 : T.keysDown.right && !T.keysDown.left ? 1 : 0;
        if (next !== T.heldDir) {
            T.heldDir = next;
            T.dasTimer = 0;
            T.arrTimer = 0;
        }
    },

    releaseKeys() {
        const T = TetrisApp;
        T.keysDown = {};
        T.heldDir = 0;
        T.softDrop = false;
    },

    initTouch(element) {
        if (!element) return;
        const T = TetrisApp;
        let startX = 0, startY = 0, startT = 0, anchorX = 0;
        let moved = false, hold = null;

        const stopHold = () => {
            clearTimeout(hold);
            hold = null;
            T.softDrop = false;
        };
        const playing = () => T.running && !T.isPaused && !T.gameOver && T.piece;

        element.addEventListener('touchstart', (e) => {
            if (!playing()) return;
            const t = e.touches[0];
            startX = anchorX = t.clientX;
            startY = t.clientY;
            startT = performance.now();
            moved = false;
            // Hold in place to soft drop
            hold = setTimeout(() => { if (!moved) T.softDrop = true; }, 220);
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (!playing()) return;
            const t = e.touches[0];
            const step = Math.max(T.cell * 1.1, 16);
            while (t.clientX - anchorX >= step) { T.shift(1); anchorX += step; moved = true; }
            while (anchorX - t.clientX >= step) { T.shift(-1); anchorX -= step; moved = true; }
            if (Math.abs(t.clientY - startY) > 14 || Math.abs(t.clientX - startX) > 14) clearTimeout(hold);
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            const wasSoft = T.softDrop;
            stopHold();
            if (!playing() || wasSoft) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            const dt = performance.now() - startT;

            if (!moved && Math.abs(dx) < 14 && Math.abs(dy) < 14) {
                T.rotate(1);                                  // tap
            } else if (!moved && dy > T.cell * 2 && Math.abs(dy) > Math.abs(dx) * 1.5 && dt < 350) {
                T.hardDrop();                                 // flick down
            } else if (!moved && dy < -T.cell * 1.5 && Math.abs(dy) > Math.abs(dx)) {
                T.rotate(1);                                  // swipe up
            }
        }, { passive: true });

        element.addEventListener('touchcancel', stopHold, { passive: true });
    },

    /* ---------- Game flow ---------- */

    emptyBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    },

    startGame() {
        const T = TetrisApp;
        T.board = T.emptyBoard();
        T.score = 0;
        T.level = 1;
        T.lines = 0;
        T.gameOver = false;
        T.isPaused = false;
        T.running = true;
        T.bag = [];
        T.queue = [];
        T.gravity = T.gravityFor(1);
        T.releaseKeys();
        T.updateStats();
        T.hideOverlay();
        T.spawn();
        T.startLoop();
        SoundManager.play('click');
    },

    startLoop() {
        const T = TetrisApp;
        cancelAnimationFrame(T.raf);
        T.lastTime = performance.now();
        T.raf = requestAnimationFrame((ts) => T.loop(ts));
    },

    loop(ts) {
        const T = TetrisApp;
        if (!T.win || !document.body.contains(T.win)) return;
        const dt = Math.min(ts - T.lastTime, 100);
        T.lastTime = ts;

        if (T.running && !T.isPaused && !T.gameOver) {
            if (T.win.classList.contains('minimized')) T.autoPause();
            else T.update(dt);
        }
        T.draw();
        T.raf = requestAnimationFrame((next) => T.loop(next));
    },

    // Guideline gravity curve: milliseconds per row at a given level
    gravityFor(level) {
        return Math.max(16, 1000 * Math.pow(0.8 - (level - 1) * 0.007, level - 1));
    },

    update(dt) {
        const T = TetrisApp;
        if (!T.piece) return;

        // Auto-repeat for held left/right
        if (T.heldDir) {
            T.dasTimer += dt;
            if (T.dasTimer >= DAS) {
                T.arrTimer += dt;
                while (T.arrTimer >= ARR) {
                    T.arrTimer -= ARR;
                    if (!T.shift(T.heldDir)) { T.arrTimer = 0; break; }
                }
            }
        }

        // Gravity (or soft drop)
        const interval = T.softDrop ? Math.max(T.gravity / SOFT_DROP_FACTOR, 20) : T.gravity;
        T.dropTimer += dt;
        while (T.dropTimer >= interval) {
            T.dropTimer -= interval;
            if (!T.stepDown()) { T.dropTimer = 0; break; }
            if (T.softDrop) { T.score += 1; T.updateStats(); }
        }

        // Lock delay while resting on something
        const p = T.piece;
        if (T.fits(p.type, p.rot, p.x, p.y + 1)) {
            T.lockTimer = 0;
        } else {
            T.lockTimer += dt;
            if (T.lockTimer >= LOCK_DELAY) T.lock();
        }
    },

    /* ---------- Pieces ---------- */

    refillBag() {
        const bag = [...TYPES];
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        TetrisApp.bag = bag;
    },

    takeType() {
        const T = TetrisApp;
        if (!T.bag.length) T.refillBag();
        return T.bag.pop();
    },

    spawn() {
        const T = TetrisApp;
        while (T.queue.length < NEXT_COUNT + 1) T.queue.push(T.takeType());
        const type = T.queue.shift();
        T.piece = { type, rot: 0, x: PIECES[type].spawnX, y: SPAWN_Y };
        T.dropTimer = 0;
        T.lockTimer = 0;
        T.lockResets = 0;
        T.lowestY = T.piece.y;
        T.drawNext();

        if (!T.fits(type, 0, T.piece.x, T.piece.y)) {
            T.endGame();
            return;
        }
        // Guideline: a new piece drops one row straight away
        T.stepDown();
    },

    cells(type, rot, x, y) {
        return PIECES[type].cells[rot].map(([cx, cy]) => [x + cx, y + cy]);
    },

    fits(type, rot, x, y) {
        const board = TetrisApp.board;
        for (const [cx, cy] of TetrisApp.cells(type, rot, x, y)) {
            if (cx < 0 || cx >= COLS || cy < 0 || cy >= ROWS) return false;
            if (board[cy][cx]) return false;
        }
        return true;
    },

    // Called after a successful shift or rotation
    onMoved() {
        const T = TetrisApp;
        const p = T.piece;
        if (T.fits(p.type, p.rot, p.x, p.y + 1)) {
            T.lockTimer = 0;
        } else if (T.lockResets < MAX_LOCK_RESETS) {
            T.lockTimer = 0;
            T.lockResets++;
        }
    },

    shift(dir) {
        const T = TetrisApp;
        const p = T.piece;
        if (!p || !T.fits(p.type, p.rot, p.x + dir, p.y)) return false;
        p.x += dir;
        T.onMoved();
        return true;
    },

    stepDown() {
        const T = TetrisApp;
        const p = T.piece;
        if (!p || !T.fits(p.type, p.rot, p.x, p.y + 1)) return false;
        p.y++;
        if (p.y > T.lowestY) {
            T.lowestY = p.y;
            T.lockResets = 0;
        }
        return true;
    },

    rotate(dir) {
        const T = TetrisApp;
        const p = T.piece;
        if (!p || p.type === 'O') return false;
        const to = (p.rot + (dir > 0 ? 1 : 3)) % 4;
        const kicks = (p.type === 'I' ? KICKS_I : KICKS_JLSTZ)[`${p.rot}>${to}`];
        for (const [kx, ky] of kicks) {
            const nx = p.x + kx;
            const ny = p.y - ky;                              // kick tables have y up, the board has y down
            if (T.fits(p.type, to, nx, ny)) {
                p.rot = to;
                p.x = nx;
                p.y = ny;
                if (p.y > T.lowestY) { T.lowestY = p.y; T.lockResets = 0; }
                T.onMoved();
                SoundManager.play('click');
                return true;
            }
        }
        return false;
    },

    ghostY() {
        const p = TetrisApp.piece;
        let y = p.y;
        while (TetrisApp.fits(p.type, p.rot, p.x, y + 1)) y++;
        return y;
    },

    hardDrop() {
        const T = TetrisApp;
        if (!T.piece) return;
        const target = T.ghostY();
        T.score += (target - T.piece.y) * 2;
        T.piece.y = target;
        T.lock();
    },

    lock() {
        const T = TetrisApp;
        const p = T.piece;
        if (!p) return;
        const color = PIECES[p.type].color;
        let allHidden = true;
        for (const [cx, cy] of T.cells(p.type, p.rot, p.x, p.y)) {
            T.board[cy][cx] = color;
            if (cy >= HIDDEN) allHidden = false;
        }
        T.piece = null;
        T.clearLines();
        T.updateStats();
        if (allHidden) {
            T.endGame();
            return;
        }
        T.spawn();
    },

    clearLines() {
        const T = TetrisApp;
        let cleared = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (T.board[y].every(c => c !== 0)) {
                T.board.splice(y, 1);
                T.board.unshift(Array(COLS).fill(0));
                cleared++;
                y++;
            }
        }
        if (!cleared) return;

        T.score += LINE_POINTS[cleared] * T.level;
        T.lines += cleared;
        T.level = Math.floor(T.lines / 10) + 1;
        T.gravity = T.gravityFor(T.level);
        SoundManager.play('chord');
    },

    /* ---------- Pause / game over ---------- */

    togglePause() {
        const T = TetrisApp;
        if (!T.running || T.gameOver) return;
        T.isPaused = !T.isPaused;
        if (T.isPaused) {
            T.releaseKeys();
            T.showOverlay(`<h3>${Icons.statusPause} PAUSED</h3><p>Press P or click to continue</p>`);
        } else {
            T.hideOverlay();
            T.lastTime = performance.now();
        }
        SoundManager.play('click');
    },

    autoPause() {
        const T = TetrisApp;
        if (T.running && !T.isPaused && !T.gameOver) T.togglePause();
    },

    endGame() {
        const T = TetrisApp;
        T.running = false;
        T.gameOver = true;
        T.piece = null;
        T.releaseKeys();
        SoundManager.play('error');
        T.showOverlay(`
            <h3>${Icons.statusSkull} GAME OVER</h3>
            <p>Score: ${T.score}</p>
            <p>Level: ${T.level}</p>
            <p>Press SPACE to play again</p>
        `);
    },

    showOverlay(html) {
        const overlay = TetrisApp.win?.querySelector('#tetrisOverlay');
        const message = overlay?.querySelector('.tetris-message');
        if (!overlay || !message) return;
        message.replaceChildren();
        message.insertAdjacentHTML('beforeend', html);
        overlay.style.display = 'flex';
    },

    hideOverlay() {
        const overlay = TetrisApp.win?.querySelector('#tetrisOverlay');
        if (overlay) overlay.style.display = 'none';
    },

    updateStats() {
        const win = TetrisApp.win;
        if (!win) return;
        win.querySelector('#tetrisScore').textContent = TetrisApp.score;
        win.querySelector('#tetrisLevel').textContent = TetrisApp.level;
        win.querySelector('#tetrisLines').textContent = TetrisApp.lines;
    },

    /* ---------- Drawing ---------- */

    themeColors() {
        const T = TetrisApp;
        const now = performance.now();
        if (now - T.colors.at > 1000) {
            T.colors = {
                bg: getThemeColor('--canvas-grid-alt') || '#111',
                grid: getThemeColor('--canvas-grid') || '#222',
                at: now
            };
        }
        return T.colors;
    },

    draw() {
        const T = TetrisApp;
        const ctx = T.ctx;
        if (!ctx) return;
        const size = T.cell;
        const w = COLS * size;
        const h = VISIBLE * size;
        const colors = T.themeColors();

        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= COLS; x++) { ctx.moveTo(x * size + 0.5, 0); ctx.lineTo(x * size + 0.5, h); }
        for (let y = 0; y <= VISIBLE; y++) { ctx.moveTo(0, y * size + 0.5); ctx.lineTo(w, y * size + 0.5); }
        ctx.stroke();

        for (let y = HIDDEN; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const color = T.board[y]?.[x];
                if (color) T.drawBlock(ctx, x * size, (y - HIDDEN) * size, size, color);
            }
        }

        const p = T.piece;
        if (p && T.running) {
            const color = PIECES[p.type].color;
            const gy = T.ghostY();
            ctx.globalAlpha = 0.25;
            for (const [cx, cy] of T.cells(p.type, p.rot, p.x, gy)) {
                if (cy >= HIDDEN) T.drawBlock(ctx, cx * size, (cy - HIDDEN) * size, size, color);
            }
            ctx.globalAlpha = 1;
            for (const [cx, cy] of T.cells(p.type, p.rot, p.x, p.y)) {
                if (cy >= HIDDEN) T.drawBlock(ctx, cx * size, (cy - HIDDEN) * size, size, color);
            }
        }
    },

    drawBlock(ctx, px, py, size, color) {
        const bevel = Math.max(2, Math.round(size / 7));
        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, size - 2, size - 2);

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(px + 1, py + 1, size - 2, bevel);
        ctx.fillRect(px + 1, py + 1, bevel, size - 2);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(px + size - 1 - bevel, py + 1, bevel, size - 2);
        ctx.fillRect(px + 1, py + size - 1 - bevel, size - 2, bevel);
    },

    drawNext() {
        const T = TetrisApp;
        const ctx = T.nextCtx;
        if (!ctx) return;
        ctx.fillStyle = getThemeColor('--canvas-grid-alt') || '#222';
        ctx.fillRect(0, 0, NEXT_WIDTH, NEXT_COUNT * NEXT_SLOT);

        T.queue.slice(0, NEXT_COUNT).forEach((type, i) => {
            const cells = PIECES[type].cells[0];
            const xs = cells.map(c => c[0]);
            const ys = cells.map(c => c[1]);
            const minX = Math.min(...xs), maxX = Math.max(...xs);
            const minY = Math.min(...ys), maxY = Math.max(...ys);
            const ox = (NEXT_WIDTH - (maxX - minX + 1) * NEXT_CELL) / 2 - minX * NEXT_CELL;
            const oy = i * NEXT_SLOT + (NEXT_SLOT - (maxY - minY + 1) * NEXT_CELL) / 2 - minY * NEXT_CELL;
            for (const [cx, cy] of cells) {
                T.drawBlock(ctx, ox + cx * NEXT_CELL, oy + cy * NEXT_CELL, NEXT_CELL, PIECES[type].color);
            }
        });
    }
};
