/**
 * Mines App - Classic game with safe first click, chording and touch flagging
 */

import { Icons } from '../icons.js?v=16';
import { SoundManager } from '../managers/SoundManager.js?v=16';
import { WindowManager } from '../managers/WindowManager.js?v=16';
import { Leaderboard } from '../leaderboard.js?v=16';

const DIFFICULTIES = {
    beginner: { width: 9, height: 9, mines: 10 },
    intermediate: { width: 16, height: 16, mines: 40 },
    expert: { width: 30, height: 16, mines: 99 }
};

const CELL = 20;
const LONG_PRESS_MS = 450;

// 11x11 pixel sprites rendered as crisp SVG
const SPRITE_COLORS = { k: '#000', w: '#fff', r: '#E00000', x: '#E00000' };
const MINE_ROWS = [
    '.....k.....',
    '.k...k...k.',
    '..k.kkk.k..',
    '...kkkkk...',
    '..kkwwkkk..',
    'kkkkwwkkkkk',
    '..kkkkkkk..',
    '...kkkkk...',
    '..k.kkk.k..',
    '.k...k...k.',
    '.....k.....'
];
const FLAG_ROWS = [
    '....rr.....',
    '....rrrr...',
    '....rrrrrr.',
    '....rrrr...',
    '....rr.....',
    '....k......',
    '....k......',
    '..kkkkk....',
    '.kkkkkkk...',
    '...........',
    '...........'
];

const sprite = (rows) => {
    let rects = '';
    rows.forEach((row, y) => {
        [...row].forEach((c, x) => {
            if (SPRITE_COLORS[c]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${SPRITE_COLORS[c]}"/>`;
        });
    });
    return `<svg viewBox="0 0 11 11" shape-rendering="crispEdges">${rects}</svg>`;
};

const MINE_SVG = sprite(MINE_ROWS);
const FLAG_SVG = sprite(FLAG_ROWS);
// A mine with a red cross over it marks a wrong flag
const WRONG_SVG = sprite(MINE_ROWS.map((row, y) => {
    const chars = [...row];
    chars[y] = 'x';
    chars[10 - y] = 'x';
    return chars.join('');
}));

const counterText = (n) => (n < 0 ? '-' + String(Math.min(99, -n)).padStart(2, '0') : String(Math.min(999, n)).padStart(3, '0'));

export const MinesApp = {
    id: 'mines',
    title: 'Mines',
    icon: Icons.mines,
    width: 250,
    height: 350,
    hasMenu: true,
    menuItems: ['Game', 'Help'],
    resizable: false,

    grid: [],
    gridWidth: 9,
    gridHeight: 9,
    mineCount: 10,
    revealed: 0,
    flagCount: 0,
    started: false,
    gameOver: false,
    timerInterval: null,
    time: 0,
    currentDifficulty: 'beginner',
    flagStamp: 0,
    pressTimer: 0,
    win: null,

    menuConfig: {
        'Game': [
            { label: 'New Game', action: 'newGame', shortcut: 'F2' },
            { divider: true },
            { label: 'Beginner (9×9, 10 mines)', action: 'beginner', checked: true, checkGroup: 'difficulty' },
            { label: 'Intermediate (16×16, 40 mines)', action: 'intermediate', checked: false, checkGroup: 'difficulty' },
            { label: 'Expert (30×16, 99 mines)', action: 'expert', checked: false, checkGroup: 'difficulty' },
            { divider: true },
            { label: 'Best Times...', action: 'bestTimes' },
            { label: 'Leaderboard...', action: 'leaderboard' },
            { divider: true },
            { label: 'Exit', action: 'close', shortcut: 'Alt+F4' }
        ],
        'Help': [
            { label: 'How to Play', action: 'howToPlay', shortcut: 'F1' },
            { divider: true },
            { label: 'About Mines', action: 'about' }
        ]
    },

    onMenuAction(action) {
        switch (action) {
            case 'newGame':
                MinesApp.initGame();
                break;
            case 'beginner':
            case 'intermediate':
            case 'expert':
                MinesApp.setDifficulty(action);
                SoundManager.play('click');
                break;
            case 'bestTimes':
                MinesApp.showBestTimes();
                break;
            case 'leaderboard':
                Leaderboard.show(`mines-${MinesApp.currentDifficulty}`);
                break;
            case 'howToPlay':
                MinesApp.showHowToPlay();
                break;
        }
    },

    setDifficulty(name) {
        const d = DIFFICULTIES[name];
        if (!d) return;
        const M = MinesApp;
        M.currentDifficulty = name;
        M.gridWidth = d.width;
        M.gridHeight = d.height;
        M.mineCount = d.mines;
        localStorage.setItem('minesweeperDifficulty', name);

        WindowManager.getWindowInstance('mines')?.updateMenuChecked('Game', name);

        const win = M.win;
        if (win) {
            // --mine-size can be a calc() on phones, so measure a real cell
            const size = win.querySelector('.mine-cell')?.getBoundingClientRect().width || CELL;
            win.style.width = `${d.width * size + 70}px`;
            win.style.height = `${d.height * size + 170}px`;
        }
        M.initGame();
    },

    showBestTimes() {
        const times = JSON.parse(localStorage.getItem('minesweeperBestTimes') || '{}');
        import('../managers/DialogManager.js?v=16').then(({ DialogManager }) => {
            DialogManager.info({
                'Beginner': times.beginner ? `${times.beginner} seconds` : 'Not yet played',
                'Intermediate': times.intermediate ? `${times.intermediate} seconds` : 'Not yet played',
                'Expert': times.expert ? `${times.expert} seconds` : 'Not yet played'
            }, 'Best Times');
        });
    },

    showHowToPlay() {
        import('../managers/DialogManager.js?v=16').then(({ DialogManager }) => {
            DialogManager.alert(
                'How to Play:\n\n' +
                '• Left-click to reveal a cell\n' +
                '• Right-click (or long-press on a phone) to flag a mine\n' +
                '• Numbers show adjacent mines\n' +
                '• Click a number whose flags are all placed (or middle-click it) to reveal the rest around it\n' +
                '• Your first click is always safe\n' +
                '• Clear all non-mine cells to win!\n\n' +
                'F2 or the face starts a new game.',
                'How to Play'
            );
        });
    },

    render() {
        return `
            <div class="mines-container">
                <div class="mines-header">
                    <div class="mines-counter">010</div>
                    <button class="mines-face" data-action="reset">${Icons.statusSmiley}</button>
                    <div class="mines-timer">000</div>
                </div>
                <div class="mines-grid"></div>
            </div>
        `;
    },

    onInit() {
        const M = MinesApp;
        const win = document.querySelector('#window-mines');
        if (!win) return;
        M.win = win;

        win.querySelector('.mines-face')?.addEventListener('click', () => M.initGame());

        const gridEl = win.querySelector('.mines-grid');
        gridEl.addEventListener('click', (e) => {
            const pos = M.cellPos(e);
            if (!pos) return;
            const cell = M.grid[pos.y][pos.x];
            if (cell.revealed) M.chord(pos.x, pos.y);
            else M.revealCell(pos.x, pos.y);
        });
        gridEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const pos = M.cellPos(e);
            if (pos) M.flagOnce(pos.x, pos.y);
        });
        gridEl.addEventListener('auxclick', (e) => {
            if (e.button !== 1) return;
            e.preventDefault();
            const pos = M.cellPos(e);
            if (pos) M.chord(pos.x, pos.y);
        });
        // Middle click would otherwise start browser auto-scroll
        gridEl.addEventListener('mousedown', (e) => { if (e.button === 1) e.preventDefault(); });

        // Long press flags on touch screens
        gridEl.addEventListener('touchstart', (e) => {
            const pos = M.cellPos(e);
            if (!pos) return;
            clearTimeout(M.pressTimer);
            M.pressTimer = setTimeout(() => {
                M.pressTimer = 0;
                M.flagOnce(pos.x, pos.y);
                M.suppressClick = true;
            }, LONG_PRESS_MS);
        }, { passive: true });
        const cancelPress = () => { clearTimeout(M.pressTimer); M.pressTimer = 0; };
        gridEl.addEventListener('touchmove', cancelPress, { passive: true });
        gridEl.addEventListener('touchend', (e) => {
            cancelPress();
            if (M.suppressClick) {
                M.suppressClick = false;
                e.preventDefault();
            }
        });

        M.keyHandler = (e) => {
            if (e.code !== 'F2' || !M.win?.classList.contains('active') || M.win.classList.contains('minimized')) return;
            e.preventDefault();
            M.initGame();
        };
        document.addEventListener('keydown', M.keyHandler);

        const saved = localStorage.getItem('minesweeperDifficulty');
        M.setDifficulty(DIFFICULTIES[saved] ? saved : 'beginner');
    },

    cellPos(e) {
        const el = (e.target.closest ? e.target : e.target.parentElement)?.closest('.mine-cell');
        if (!el) return null;
        return { x: Number(el.dataset.x), y: Number(el.dataset.y) };
    },

    initGame() {
        const M = MinesApp;
        const win = M.win;
        const gridEl = win?.querySelector('.mines-grid');
        if (!gridEl) return;

        clearInterval(M.timerInterval);
        M.timerInterval = null;
        M.gameOver = false;
        M.started = false;
        M.revealed = 0;
        M.flagCount = 0;
        M.time = 0;

        M.grid = Array.from({ length: M.gridHeight }, () =>
            Array.from({ length: M.gridWidth }, () => ({ mine: false, revealed: false, flagged: false, adjacentMines: 0 }))
        );

        M.setFace(Icons.statusSmiley);
        M.updateCounter();
        win.querySelector('.mines-timer').textContent = '000';

        const container = win.querySelector('.mines-container');
        container.style.setProperty('--cols', M.gridWidth);
        gridEl.style.gridTemplateColumns = `repeat(${M.gridWidth}, var(--mine-size))`;

        const frag = document.createDocumentFragment();
        for (let y = 0; y < M.gridHeight; y++) {
            for (let x = 0; x < M.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                frag.appendChild(cell);
            }
        }
        gridEl.replaceChildren(frag);
    },

    // Mines are placed on the first click, so it can never hit one (nor its neighbours)
    placeMines(safeX, safeY) {
        const M = MinesApp;
        let placed = 0;
        while (placed < M.mineCount) {
            const x = Math.floor(Math.random() * M.gridWidth);
            const y = Math.floor(Math.random() * M.gridHeight);
            if (Math.abs(x - safeX) <= 1 && Math.abs(y - safeY) <= 1) continue;
            if (M.grid[y][x].mine) continue;
            M.grid[y][x].mine = true;
            placed++;
        }
        for (let y = 0; y < M.gridHeight; y++) {
            for (let x = 0; x < M.gridWidth; x++) {
                M.grid[y][x].adjacentMines = M.neighbours(x, y).filter(([nx, ny]) => M.grid[ny][nx].mine).length;
            }
        }
    },

    neighbours(x, y) {
        const out = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (!dx && !dy) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < MinesApp.gridWidth && ny >= 0 && ny < MinesApp.gridHeight) out.push([nx, ny]);
            }
        }
        return out;
    },

    revealCell(x, y) {
        const M = MinesApp;
        if (M.gameOver) return;
        const first = M.grid[y]?.[x];
        if (!first || first.revealed || first.flagged) return;

        if (!M.started) {
            M.started = true;
            M.placeMines(x, y);
            M.startTimer();
        }

        const stack = [[x, y]];
        let hit = null;
        while (stack.length) {
            const [cx, cy] = stack.pop();
            const cell = M.grid[cy][cx];
            if (cell.revealed || cell.flagged) continue;
            cell.revealed = true;
            M.revealed++;
            M.paint(cx, cy);
            if (cell.mine) {
                hit = [cx, cy];
                continue;
            }
            if (cell.adjacentMines === 0) M.neighbours(cx, cy).forEach((n) => stack.push(n));
        }

        if (hit) {
            M.lose(hit[0], hit[1]);
            return;
        }
        if (M.revealed === M.gridWidth * M.gridHeight - M.mineCount) M.win_();
    },

    // Reveal around a number once the right amount of flags is around it
    chord(x, y) {
        const M = MinesApp;
        if (M.gameOver) return;
        const cell = M.grid[y]?.[x];
        if (!cell || !cell.revealed || cell.adjacentMines === 0) return;
        const around = M.neighbours(x, y);
        const flags = around.filter(([nx, ny]) => M.grid[ny][nx].flagged).length;
        if (flags !== cell.adjacentMines) return;
        around.forEach(([nx, ny]) => M.revealCell(nx, ny));
    },

    // Touch long-press and the contextmenu event can both fire, flag only once
    flagOnce(x, y) {
        const now = Date.now();
        if (now - MinesApp.flagStamp < 700) return;
        MinesApp.flagStamp = now;
        MinesApp.toggleFlag(x, y);
    },

    toggleFlag(x, y) {
        const M = MinesApp;
        if (M.gameOver) return;
        const cell = M.grid[y]?.[x];
        if (!cell || cell.revealed) return;

        cell.flagged = !cell.flagged;
        M.flagCount += cell.flagged ? 1 : -1;
        M.paint(x, y);
        M.updateCounter();
        SoundManager.play('click');
    },

    lose(hitX, hitY) {
        const M = MinesApp;
        M.gameOver = true;
        clearInterval(M.timerInterval);
        M.timerInterval = null;

        for (let y = 0; y < M.gridHeight; y++) {
            for (let x = 0; x < M.gridWidth; x++) {
                const cell = M.grid[y][x];
                if (cell.mine && !cell.flagged) {
                    cell.revealed = true;
                    M.paint(x, y);
                } else if (!cell.mine && cell.flagged) {
                    M.paint(x, y, true);
                }
            }
        }
        M.getCellElement(hitX, hitY)?.classList.add('boom');
        M.setFace(Icons.statusDead);
        SoundManager.play('error');
    },

    win_() {
        const M = MinesApp;
        M.gameOver = true;
        clearInterval(M.timerInterval);
        M.timerInterval = null;

        // Flag whatever mines are left, like the original
        for (let y = 0; y < M.gridHeight; y++) {
            for (let x = 0; x < M.gridWidth; x++) {
                const cell = M.grid[y][x];
                if (cell.mine && !cell.flagged) {
                    cell.flagged = true;
                    M.paint(x, y);
                }
            }
        }
        M.flagCount = M.mineCount;
        M.updateCounter();
        M.setFace(Icons.statusCool);
        SoundManager.play('chord');

        const times = JSON.parse(localStorage.getItem('minesweeperBestTimes') || '{}');
        const best = times[M.currentDifficulty];
        const record = !best || M.time < best;
        if (record) {
            times[M.currentDifficulty] = M.time;
            localStorage.setItem('minesweeperBestTimes', JSON.stringify(times));
        }

        const game = `mines-${M.currentDifficulty}`;
        const time = M.time;
        setTimeout(() => {
            import('../managers/DialogManager.js?v=16').then(({ DialogManager }) => {
                DialogManager.alert(
                    `You won in ${time} seconds!${record ? ' New best time!' : ''}\n\nSecret code: WIN31-${time}`,
                    'Congratulations!'
                ).then(() => Leaderboard.offer(game, time));
            });
        }, 600);
    },

    // Redraw one cell from its state
    paint(x, y, wrongFlag = false) {
        const M = MinesApp;
        const el = M.getCellElement(x, y);
        const cell = M.grid[y]?.[x];
        if (!el || !cell) return;

        el.className = 'mine-cell';
        el.removeAttribute('data-value');
        el.replaceChildren();

        if (wrongFlag) {
            el.classList.add('revealed', 'wrong');
            el.insertAdjacentHTML('beforeend', WRONG_SVG);
        } else if (cell.revealed) {
            el.classList.add('revealed');
            if (cell.mine) {
                el.classList.add('mine');
                el.insertAdjacentHTML('beforeend', MINE_SVG);
            } else if (cell.adjacentMines > 0) {
                el.textContent = cell.adjacentMines;
                el.dataset.value = cell.adjacentMines;
            }
        } else if (cell.flagged) {
            el.classList.add('flagged');
            el.insertAdjacentHTML('beforeend', FLAG_SVG);
        }
    },

    getCellElement(x, y) {
        return MinesApp.win?.querySelector(`.mine-cell[data-x="${x}"][data-y="${y}"]`);
    },

    setFace(icon) {
        const face = MinesApp.win?.querySelector('.mines-face');
        if (!face) return;
        face.replaceChildren();
        face.insertAdjacentHTML('beforeend', icon);
    },

    updateCounter() {
        const counter = MinesApp.win?.querySelector('.mines-counter');
        if (counter) counter.textContent = counterText(MinesApp.mineCount - MinesApp.flagCount);
    },

    startTimer() {
        const M = MinesApp;
        clearInterval(M.timerInterval);
        M.timerInterval = setInterval(() => {
            M.time++;
            const timer = M.win?.querySelector('.mines-timer');
            if (timer) timer.textContent = counterText(M.time);
        }, 1000);
    },

    onClose() {
        const M = MinesApp;
        clearInterval(M.timerInterval);
        M.timerInterval = null;
        clearTimeout(M.pressTimer);
        document.removeEventListener('keydown', M.keyHandler);
        M.win = null;
    }
};

export default MinesApp;
