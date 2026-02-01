/**
 * Desktop Icon Component - Grid-based with drag & drop
 */

import { WindowManager } from '../managers/WindowManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { DesktopGridManager } from '../managers/DesktopGridManager.js';

export class DesktopIcon {
    constructor(config) {
        this.id = config.id;
        this.appId = config.appId;
        this.title = config.title;
        this.icon = config.icon;
        this.gridRow = 0;
        this.gridCol = 0;
        
        this.element = this.render();
        this.attachEvents();
        
        // Register with grid manager
        DesktopGridManager.registerIcon(this);
    }

    render() {
        const icon = document.createElement('div');
        icon.className = 'desktop-icon';
        icon.tabIndex = 0;
        icon.dataset.appId = this.appId;
        icon.dataset.iconId = this.id;
        
        icon.innerHTML = `
            <div class="icon-image">${this.icon}</div>
            <span class="icon-label">${this.title}</span>
        `;

        return icon;
    }

    setPosition(x, y, animate = false) {
        if (animate) {
            this.element.style.transition = 'left 0.15s ease, top 0.15s ease';
            setTimeout(() => {
                this.element.style.transition = '';
            }, 150);
        }
        this.element.style.position = 'absolute';
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    attachEvents() {
        let clickCount = 0;
        let clickTimer = null;

        // Click handling
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
            clickCount++;

            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    this.select();
                    clickCount = 0;
                }, 250);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                this.open();
            }
        });

        // Right-click context menu
        this.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.select();
            this.showContextMenu(e.clientX, e.clientY);
        });

        // Keyboard support
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.open();
            }
        });

        // Drag functionality
        this.initDrag();
    }

    initDrag() {
        let isDragging = false;
        let hasMoved = false;
        let startX, startY;
        let offsetX, offsetY;
        let dragClone = null;

        const onMouseDown = (e) => {
            if (e.button !== 0) return; // Only left click
            
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = this.element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (!hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                hasMoved = true;
                
                // Create drag clone
                dragClone = this.element.cloneNode(true);
                dragClone.className = 'desktop-icon dragging-clone';
                dragClone.style.cssText = `
                    position: fixed;
                    pointer-events: none;
                    opacity: 0.8;
                    z-index: 10000;
                    left: ${e.clientX - offsetX}px;
                    top: ${e.clientY - offsetY}px;
                `;
                document.body.appendChild(dragClone);
                
                // Dim original
                this.element.style.opacity = '0.4';
            }

            if (hasMoved && dragClone) {
                dragClone.style.left = `${e.clientX - offsetX}px`;
                dragClone.style.top = `${e.clientY - offsetY}px`;

                // Show drop preview
                const cell = DesktopGridManager.getCellFromPosition(e.clientX, e.clientY);
                DesktopGridManager.showDropPreview(cell.row, cell.col);
            }
        };

        const onMouseUp = (e) => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            // Restore original opacity
            this.element.style.opacity = '';

            // Remove clone and preview
            dragClone?.remove();
            DesktopGridManager.hideDropPreview();

            if (hasMoved) {
                // Calculate target cell
                const cell = DesktopGridManager.getCellFromPosition(e.clientX, e.clientY);
                DesktopGridManager.placeIcon(this.id, cell.row, cell.col);
                SoundManager.play('click');
            }
        };

        this.element.addEventListener('mousedown', onMouseDown);

        // Touch support
        this.element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        }, { passive: true });

        this.element.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: true });

        this.element.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            onMouseUp({ clientX: touch.clientX, clientY: touch.clientY });
        });
    }

    showContextMenu(x, y) {
        // Remove existing menu
        document.querySelector('.icon-context-menu')?.remove();

        const menu = document.createElement('div');
        menu.className = 'icon-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: var(--win-gray);
            border: 2px outset var(--win-light-gray);
            padding: 2px;
            z-index: 10000;
            min-width: 120px;
            font-size: 12px;
        `;

        const items = [
            { label: '📂 Open', action: () => this.open() },
            { type: 'separator' },
            { label: '📋 Properties', action: () => this.showProperties() }
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

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }, { once: true });
        }, 100);
    }

    showProperties() {
        import('../apps/index.js').then(module => {
            const app = module.Apps[this.appId];
            import('../managers/DialogManager.js').then(({ DialogManager }) => {
                DialogManager.info({
                    'Name': this.title,
                    'Type': 'Application',
                    'App ID': this.appId,
                    'Window Size': `${app?.width || 400} × ${app?.height || 300}`
                }, 'Properties');
            });
        });
    }

    select() {
        document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
            icon.classList.remove('selected');
        });
        this.element.classList.add('selected');
        SoundManager.play('click');
    }

    deselect() {
        this.element.classList.remove('selected');
    }

    open() {
        SoundManager.play('open');
        WindowManager.createWindow(this.appId);
    }
}

export default DesktopIcon;
