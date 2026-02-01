/**
 * Minesweeper App - Classic game
 */

import { Icons } from '../icons.js';
import { SoundManager } from '../managers/SoundManager.js';

export const MinesApp = {
    id: 'mines',
    title: 'Minesweeper',
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
    gameOver: false,
    flagCount: 0,
    timerInterval: null,
    time: 0,
    currentDifficulty: 'beginner',

    menuConfig: {
        'Game': [
            { label: 'New Game', action: 'newGame', shortcut: 'F2' },
            { divider: true },
            { label: 'Beginner (9×9, 10 mines)', action: 'beginner', checked: true },
            { label: 'Intermediate (16×16, 40 mines)', action: 'intermediate' },
            { label: 'Expert (30×16, 99 mines)', action: 'expert' },
            { divider: true },
            { label: 'Best Times...', action: 'bestTimes' },
            { divider: true },
            { label: 'Exit', action: 'close', shortcut: 'Alt+F4' }
        ],
        'Help': [
            { label: 'How to Play', action: 'howToPlay', shortcut: 'F1' },
            { divider: true },
            { label: 'About Minesweeper', action: 'about' }
        ]
    },

    onMenuAction(action) {
        switch(action) {
            case 'newGame':
                MinesApp.initGame();
                break;
            case 'beginner':
                MinesApp.setDifficulty('beginner', 9, 9, 10);
                break;
            case 'intermediate':
                MinesApp.setDifficulty('intermediate', 16, 16, 40);
                break;
            case 'expert':
                MinesApp.setDifficulty('expert', 30, 16, 99);
                break;
            case 'bestTimes':
                MinesApp.showBestTimes();
                break;
            case 'howToPlay':
                MinesApp.showHowToPlay();
                break;
        }
    },

    setDifficulty(name, width, height, mines) {
        MinesApp.currentDifficulty = name;
        MinesApp.gridWidth = width;
        MinesApp.gridHeight = height;
        MinesApp.mineCount = mines;
        
        // Update menu checkmarks
        const windowEl = document.querySelector('#window-mines');
        if (windowEl) {
            windowEl.querySelectorAll('.menu-dropdown-item').forEach(item => {
                const action = item.dataset.action;
                const label = item.querySelector('.menu-dropdown-label');
                if (['beginner', 'intermediate', 'expert'].includes(action)) {
                    const text = label.textContent.replace(/^✓ /, '');
                    label.textContent = (action === name ? '✓ ' : '') + text;
                }
            });
            
            // Resize window for larger grids
            if (name === 'intermediate') {
                windowEl.style.width = '420px';
                windowEl.style.height = '500px';
            } else if (name === 'expert') {
                windowEl.style.width = '680px';
                windowEl.style.height = '420px';
            } else {
                windowEl.style.width = '250px';
                windowEl.style.height = '350px';
            }
            
            // Update grid class
            const gridEl = windowEl.querySelector('.mines-grid');
            if (gridEl) {
                gridEl.className = `mines-grid size-${height}`;
                gridEl.style.gridTemplateColumns = `repeat(${width}, 20px)`;
            }
        }
        
        MinesApp.initGame();
        SoundManager.play('click');
    },

    showBestTimes() {
        const times = JSON.parse(localStorage.getItem('minesweeperBestTimes') || '{}');
        import('../managers/DialogManager.js').then(({ DialogManager }) => {
            DialogManager.info({
                'Beginner': times.beginner ? `${times.beginner} seconds` : 'Not yet played',
                'Intermediate': times.intermediate ? `${times.intermediate} seconds` : 'Not yet played',
                'Expert': times.expert ? `${times.expert} seconds` : 'Not yet played'
            }, 'Best Times');
        });
    },

    showHowToPlay() {
        import('../managers/DialogManager.js').then(({ DialogManager }) => {
            DialogManager.alert(
                'How to Play:\n\n' +
                '• Left-click to reveal a cell\n' +
                '• Right-click to place/remove a flag\n' +
                '• Numbers show adjacent mines\n' +
                '• Clear all non-mine cells to win!\n\n' +
                'Tips:\n' +
                '• Use flags to mark suspected mines\n' +
                '• Click the face to start a new game',
                'How to Play'
            );
        });
    },

    render() {
        return `
            <div class="mines-container">
                <div class="mines-header">
                    <div class="mines-counter">010</div>
                    <button class="mines-face" data-action="reset">🙂</button>
                    <div class="mines-timer">000</div>
                </div>
                <div class="mines-grid size-9"></div>
            </div>
        `;
    },

    onInit() {
        MinesApp.initGame();
    },

    initGame() {
        const window = document.querySelector('#window-mines');
        if (!window) return;

        MinesApp.gameOver = false;
        MinesApp.revealed = 0;
        MinesApp.flagCount = 0;
        MinesApp.time = 0;
        MinesApp.grid = [];
        
        clearInterval(MinesApp.timerInterval);

        const gridEl = window.querySelector('.mines-grid');
        const faceBtn = window.querySelector('.mines-face');
        const counter = window.querySelector('.mines-counter');
        const timer = window.querySelector('.mines-timer');

        if (!gridEl) return;

        // Reset face
        if (faceBtn) faceBtn.textContent = '🙂';
        if (counter) counter.textContent = String(MinesApp.mineCount).padStart(3, '0');
        if (timer) timer.textContent = '000';

        // Initialize grid
        for (let y = 0; y < MinesApp.gridHeight; y++) {
            MinesApp.grid[y] = [];
            for (let x = 0; x < MinesApp.gridWidth; x++) {
                MinesApp.grid[y][x] = {
                    mine: false,
                    revealed: false,
                    flagged: false,
                    adjacentMines: 0
                };
            }
        }

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < MinesApp.mineCount) {
            const x = Math.floor(Math.random() * MinesApp.gridWidth);
            const y = Math.floor(Math.random() * MinesApp.gridHeight);
            
            if (!MinesApp.grid[y][x].mine) {
                MinesApp.grid[y][x].mine = true;
                minesPlaced++;
            }
        }

        // Calculate adjacent mines
        for (let y = 0; y < MinesApp.gridHeight; y++) {
            for (let x = 0; x < MinesApp.gridWidth; x++) {
                if (!MinesApp.grid[y][x].mine) {
                    MinesApp.grid[y][x].adjacentMines = MinesApp.countAdjacentMines(x, y);
                }
            }
        }

        // Render grid
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${MinesApp.gridWidth}, 20px)`;
        for (let y = 0; y < MinesApp.gridHeight; y++) {
            for (let x = 0; x < MinesApp.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                cell.addEventListener('click', () => MinesApp.revealCell(x, y));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    MinesApp.toggleFlag(x, y);
                });
                
                gridEl.appendChild(cell);
            }
        }

        // Reset button
        faceBtn?.addEventListener('click', () => MinesApp.initGame());
    },

    countAdjacentMines(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < MinesApp.gridWidth && 
                    ny >= 0 && ny < MinesApp.gridHeight) {
                    if (MinesApp.grid[ny][nx].mine) count++;
                }
            }
        }
        return count;
    },

    revealCell(x, y) {
        if (MinesApp.gameOver) return;
        
        const cell = MinesApp.grid[y]?.[x];
        if (!cell || cell.revealed || cell.flagged) return;

        // Start timer on first click
        if (MinesApp.revealed === 0) {
            MinesApp.startTimer();
        }

        cell.revealed = true;
        MinesApp.revealed++;

        const cellEl = MinesApp.getCellElement(x, y);
        cellEl?.classList.add('revealed');

        if (cell.mine) {
            // Game over - hit mine
            MinesApp.gameOver = true;
            cellEl?.classList.add('mine');
            MinesApp.revealAllMines();
            MinesApp.setFace('😵');
            SoundManager.play('error');
            clearInterval(MinesApp.timerInterval);
            
            setTimeout(() => {
                MinesApp.showGameOverDialog(false);
            }, 500);
            return;
        }

        // Show number or empty
        if (cell.adjacentMines > 0) {
            cellEl.textContent = cell.adjacentMines;
            cellEl.dataset.value = cell.adjacentMines;
        } else {
            // Reveal adjacent cells for empty cell
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    MinesApp.revealCell(x + dx, y + dy);
                }
            }
        }

        // Check win condition
        const totalSafe = (MinesApp.gridWidth * MinesApp.gridHeight) - MinesApp.mineCount;
        if (MinesApp.revealed === totalSafe) {
            MinesApp.gameOver = true;
            MinesApp.setFace('😎');
            SoundManager.play('chord');
            clearInterval(MinesApp.timerInterval);
            
            setTimeout(() => {
                MinesApp.showGameOverDialog(true);
            }, 500);
        }
    },

    toggleFlag(x, y) {
        if (MinesApp.gameOver) return;
        
        const cell = MinesApp.grid[y]?.[x];
        if (!cell || cell.revealed) return;

        cell.flagged = !cell.flagged;
        MinesApp.flagCount += cell.flagged ? 1 : -1;

        const cellEl = MinesApp.getCellElement(x, y);
        cellEl?.classList.toggle('flagged', cell.flagged);

        // Update counter
        const counter = document.querySelector('#window-mines .mines-counter');
        if (counter) {
            const remaining = MinesApp.mineCount - MinesApp.flagCount;
            counter.textContent = String(Math.max(0, remaining)).padStart(3, '0');
        }

        SoundManager.play('click');
    },

    getCellElement(x, y) {
        return document.querySelector(`#window-mines .mine-cell[data-x="${x}"][data-y="${y}"]`);
    },

    setFace(emoji) {
        const face = document.querySelector('#window-mines .mines-face');
        if (face) face.textContent = emoji;
    },

    revealAllMines() {
        for (let y = 0; y < MinesApp.gridSize; y++) {
            for (let x = 0; x < MinesApp.gridSize; x++) {
                if (MinesApp.grid[y][x].mine) {
                    const cellEl = MinesApp.getCellElement(x, y);
                    cellEl?.classList.add('revealed', 'mine');
                }
            }
        }
    },

    startTimer() {
        MinesApp.timerInterval = setInterval(() => {
            MinesApp.time++;
            const timer = document.querySelector('#window-mines .mines-timer');
            if (timer) {
                timer.textContent = String(Math.min(999, MinesApp.time)).padStart(3, '0');
            }
        }, 1000);
    },

    showGameOverDialog(won) {
        if (won) {
            // Save best time
            const times = JSON.parse(localStorage.getItem('minesweeperBestTimes') || '{}');
            const currentBest = times[MinesApp.currentDifficulty];
            if (!currentBest || MinesApp.time < currentBest) {
                times[MinesApp.currentDifficulty] = MinesApp.time;
                localStorage.setItem('minesweeperBestTimes', JSON.stringify(times));
            }
        }

        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.innerHTML = `
            <div class="dialog-box">
                <div class="dialog-title-bar">
                    <span class="dialog-title-text">${won ? 'Congratulations!' : 'Game Over'}</span>
                    <button class="dialog-close-btn" data-action="close">×</button>
                </div>
                <div class="dialog-content">
                    <div class="dialog-icon-text">
                        <span class="dialog-question-icon">${won ? '🏆' : '💣'}</span>
                        <div class="dialog-message">
                            ${won 
                                ? `You won in ${MinesApp.time} seconds!<br><br>Secret code: WIN31-${MinesApp.time}` 
                                : 'You hit a mine!<br><br>Better luck next time.'}
                        </div>
                    </div>
                </div>
                <div class="dialog-buttons">
                    <button class="win-btn primary" data-action="ok">Play Again</button>
                </div>
            </div>
        `;

        overlay.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                overlay.remove();
                MinesApp.initGame();
            });
        });

        document.body.appendChild(overlay);
        SoundManager.play(won ? 'chord' : 'error');
    },

    onClose() {
        clearInterval(MinesApp.timerInterval);
    }
};

export default MinesApp;
