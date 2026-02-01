/**
 * Desktop Grid Manager - Handles icon grid layout like modern Windows
 */

import { SoundManager } from './SoundManager.js';

class DesktopGridManagerClass {
    constructor() {
        this.cellWidth = 90;
        this.cellHeight = 90;
        this.padding = 10;
        this.icons = new Map();
        this.grid = []; // 2D array of occupied cells
        this.cols = 0;
        this.rows = 0;
        this.container = null;
    }

    init() {
        this.container = document.getElementById('desktopIcons');
        if (!this.container) return;

        this.calculateGrid();
        
        window.addEventListener('resize', () => this.onResize());
        
        // Right-click context menu on desktop
        document.getElementById('desktop')?.addEventListener('contextmenu', (e) => {
            if (e.target.id === 'desktop' || e.target.classList.contains('desktop-icons')) {
                e.preventDefault();
                this.showDesktopContextMenu(e.clientX, e.clientY);
            }
        });
    }

    calculateGrid() {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;

        const taskbarHeight = 40;
        const availableWidth = window.innerWidth - this.padding * 2;
        const availableHeight = window.innerHeight - taskbarHeight - this.padding * 2;

        this.cols = Math.floor(availableWidth / this.cellWidth);
        this.rows = Math.floor(availableHeight / this.cellHeight);

        // Initialize empty grid
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
    }

    registerIcon(icon) {
        this.icons.set(icon.id, icon);
        
        // Defer placement to allow batch registration
        if (this._placeTimeout) clearTimeout(this._placeTimeout);
        this._placeTimeout = setTimeout(() => this.placeAllIcons(), 50);
    }

    /**
     * Place all registered icons in grid
     */
    placeAllIcons() {
        // First try to load saved positions
        const saved = localStorage.getItem('desktopIconPositions');
        let savedPositions = {};
        
        if (saved) {
            try {
                savedPositions = JSON.parse(saved);
            } catch(e) {}
        }

        // Place icons with saved positions first
        this.icons.forEach((icon, id) => {
            if (savedPositions[id]) {
                const { row, col } = savedPositions[id];
                if (row < this.rows && col < this.cols && !this.grid[row]?.[col]) {
                    this.grid[row][col] = id;
                    const pos = this.getPositionFromCell(row, col);
                    icon.setPosition(pos.x, pos.y, false);
                    icon.gridRow = row;
                    icon.gridCol = col;
                }
            }
        });

        // Place remaining icons in free cells
        this.icons.forEach((icon, id) => {
            if (icon.gridRow === 0 && icon.gridCol === 0 && this.grid[0]?.[0] !== id) {
                const cell = this.findFreeCell();
                this.grid[cell.row][cell.col] = id;
                const pos = this.getPositionFromCell(cell.row, cell.col);
                icon.setPosition(pos.x, pos.y, false);
                icon.gridRow = cell.row;
                icon.gridCol = cell.col;
            }
        });

        this.savePositions();
    }

    /**
     * Find first available grid position
     */
    findFreeCell() {
        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                if (!this.grid[row][col]) {
                    return { row, col };
                }
            }
        }
        return { row: 0, col: 0 }; // Fallback
    }

    /**
     * Get grid cell from pixel position
     */
    getCellFromPosition(x, y) {
        const col = Math.floor((x - this.padding) / this.cellWidth);
        const row = Math.floor((y - this.padding) / this.cellHeight);
        return {
            col: Math.max(0, Math.min(col, this.cols - 1)),
            row: Math.max(0, Math.min(row, this.rows - 1))
        };
    }

    /**
     * Get pixel position from grid cell
     */
    getPositionFromCell(row, col) {
        return {
            x: this.padding + col * this.cellWidth,
            y: this.padding + row * this.cellHeight
        };
    }

    /**
     * Place icon at grid position
     */
    placeIcon(iconId, row, col) {
        const icon = this.icons.get(iconId);
        if (!icon) return false;

        // Find old position BEFORE removing
        const oldPos = this.findIconPosition(iconId);
        
        // Remove from old position
        this.removeIconFromGrid(iconId);

        // Check if target cell is occupied
        const occupant = this.grid[row]?.[col];
        if (occupant && occupant !== iconId) {
            // Swap positions - move occupant to dragged icon's old position
            if (oldPos) {
                this.grid[oldPos.row][oldPos.col] = occupant;
                const swapIcon = this.icons.get(occupant);
                if (swapIcon) {
                    const pos = this.getPositionFromCell(oldPos.row, oldPos.col);
                    swapIcon.setPosition(pos.x, pos.y, true);
                    swapIcon.gridRow = oldPos.row;
                    swapIcon.gridCol = oldPos.col;
                }
            } else {
                // No old position found, find a free cell for the occupant
                const freeCell = this.findFreeCell();
                this.grid[freeCell.row][freeCell.col] = occupant;
                const swapIcon = this.icons.get(occupant);
                if (swapIcon) {
                    const pos = this.getPositionFromCell(freeCell.row, freeCell.col);
                    swapIcon.setPosition(pos.x, pos.y, true);
                    swapIcon.gridRow = freeCell.row;
                    swapIcon.gridCol = freeCell.col;
                }
            }
        }

        // Place at new position
        this.grid[row][col] = iconId;
        const pos = this.getPositionFromCell(row, col);
        icon.setPosition(pos.x, pos.y, true);
        icon.gridRow = row;
        icon.gridCol = col;

        this.savePositions();
        return true;
    }

    /**
     * Find icon's current grid position
     */
    findIconPosition(iconId) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row]?.[col] === iconId) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    /**
     * Remove icon from grid
     */
    removeIconFromGrid(iconId) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row]?.[col] === iconId) {
                    this.grid[row][col] = null;
                    return;
                }
            }
        }
    }

    /**
     * Auto-arrange all icons
     */
    autoArrange() {
        // Clear grid
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));

        // Place icons in order (column by column like Windows)
        let idx = 0;
        const iconIds = Array.from(this.icons.keys());
        
        for (let col = 0; col < this.cols && idx < iconIds.length; col++) {
            for (let row = 0; row < this.rows && idx < iconIds.length; row++) {
                const iconId = iconIds[idx];
                this.grid[row][col] = iconId;
                const icon = this.icons.get(iconId);
                if (icon) {
                    const pos = this.getPositionFromCell(row, col);
                    icon.setPosition(pos.x, pos.y, true);
                    icon.gridRow = row;
                    icon.gridCol = col;
                }
                idx++;
            }
        }

        this.savePositions();
        SoundManager.play('click');
    }

    /**
     * Sort icons by name
     */
    sortByName() {
        const iconIds = Array.from(this.icons.keys()).sort((a, b) => {
            const iconA = this.icons.get(a);
            const iconB = this.icons.get(b);
            return (iconA?.title || '').localeCompare(iconB?.title || '');
        });

        // Clear and re-place
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));

        let idx = 0;
        for (let col = 0; col < this.cols && idx < iconIds.length; col++) {
            for (let row = 0; row < this.rows && idx < iconIds.length; row++) {
                const iconId = iconIds[idx];
                this.grid[row][col] = iconId;
                const icon = this.icons.get(iconId);
                if (icon) {
                    const pos = this.getPositionFromCell(row, col);
                    icon.setPosition(pos.x, pos.y, true);
                    icon.gridRow = row;
                    icon.gridCol = col;
                }
                idx++;
            }
        }

        this.savePositions();
        SoundManager.play('click');
    }

    /**
     * Save icon positions to localStorage
     */
    savePositions() {
        const positions = {};
        this.icons.forEach((icon, id) => {
            positions[id] = { row: icon.gridRow, col: icon.gridCol };
        });
        localStorage.setItem('desktopIconPositions', JSON.stringify(positions));
    }

    /**
     * Handle window resize
     */
    onResize() {
        // Debounce resize events
        if (this._resizeTimeout) clearTimeout(this._resizeTimeout);
        this._resizeTimeout = setTimeout(() => this.handleResize(), 150);
    }

    handleResize() {
        const oldCols = this.cols;
        const oldRows = this.rows;
        const oldGrid = this.grid.map(row => [...row]); // Deep copy
        
        this.calculateGrid();

        // If grid size changed significantly, need to reorganize
        if (oldCols !== this.cols || oldRows !== this.rows) {
            // Create new empty grid
            this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));

            // Try to place icons at their saved positions, or find new spots
            this.icons.forEach((icon, id) => {
                let placed = false;
                
                // Try original position if still valid
                if (icon.gridRow < this.rows && icon.gridCol < this.cols) {
                    if (!this.grid[icon.gridRow][icon.gridCol]) {
                        this.grid[icon.gridRow][icon.gridCol] = id;
                        const pos = this.getPositionFromCell(icon.gridRow, icon.gridCol);
                        icon.setPosition(pos.x, pos.y, false);
                        placed = true;
                    }
                }
                
                // Find new position if needed
                if (!placed) {
                    const freeCell = this.findFreeCell();
                    this.grid[freeCell.row][freeCell.col] = id;
                    const pos = this.getPositionFromCell(freeCell.row, freeCell.col);
                    icon.setPosition(pos.x, pos.y, false);
                    icon.gridRow = freeCell.row;
                    icon.gridCol = freeCell.col;
                }
            });

            this.savePositions();
        }
    }

    /**
     * Show desktop right-click context menu
     */
    showDesktopContextMenu(x, y) {
        // Remove existing menu
        document.querySelector('.desktop-context-menu')?.remove();

        const menu = document.createElement('div');
        menu.className = 'desktop-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: var(--win-gray);
            border: 2px outset var(--win-light-gray);
            padding: 2px;
            z-index: 10000;
            min-width: 150px;
            font-size: 12px;
        `;

        const items = [
            { label: '🔄 Refresh', action: () => location.reload() },
            { type: 'separator' },
            { label: '📐 Auto Arrange', action: () => this.autoArrange() },
            { label: '🔤 Sort by Name', action: () => this.sortByName() },
            { type: 'separator' },
            { label: '⚙️ Settings', action: () => {
                import('../managers/WindowManager.js').then(m => m.WindowManager.createWindow('control'));
            }},
            { label: 'ℹ️ System Info', action: () => {
                import('../managers/WindowManager.js').then(m => m.WindowManager.createWindow('sysinfo'));
            }}
        ];

        items.forEach(item => {
            if (item.type === 'separator') {
                const sep = document.createElement('div');
                sep.style.cssText = 'height: 1px; background: var(--win-dark-gray); margin: 4px 2px;';
                menu.appendChild(sep);
            } else {
                const menuItem = document.createElement('div');
                menuItem.textContent = item.label;
                menuItem.style.cssText = `
                    padding: 6px 12px;
                    cursor: pointer;
                `;
                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.background = 'var(--win-blue)';
                    menuItem.style.color = 'var(--win-text-white)';
                });
                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.background = '';
                    menuItem.style.color = '';
                });
                menuItem.addEventListener('click', () => {
                    item.action();
                    menu.remove();
                });
                menu.appendChild(menuItem);
            }
        });

        document.body.appendChild(menu);

        // Adjust if off-screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - rect.width - 5) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (window.innerHeight - rect.height - 5) + 'px';
        }

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    /**
     * Show drop preview indicator
     */
    showDropPreview(row, col) {
        this.hideDropPreview();
        
        const pos = this.getPositionFromCell(row, col);
        const preview = document.createElement('div');
        preview.className = 'icon-drop-preview';
        preview.style.cssText = `
            position: absolute;
            left: ${pos.x}px;
            top: ${pos.y}px;
            width: ${this.cellWidth - 10}px;
            height: ${this.cellHeight - 10}px;
            border: 2px dashed var(--win-blue);
            background: rgba(0, 0, 128, 0.1);
            pointer-events: none;
            z-index: 5;
        `;
        this.container?.appendChild(preview);
    }

    hideDropPreview() {
        document.querySelector('.icon-drop-preview')?.remove();
    }
}

export const DesktopGridManager = new DesktopGridManagerClass();
export default DesktopGridManager;
