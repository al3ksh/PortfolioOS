/**
 * Desktop Icon Component - Grid-based with drag & drop
 */

import { WindowManager } from '../managers/WindowManager.js?v=17';
import { SoundManager } from '../managers/SoundManager.js?v=17';
import { DesktopGridManager } from '../managers/DesktopGridManager.js?v=17';
import { Icons } from '../icons.js?v=17';
import { t } from '../i18n.js?v=17';
import { VFS } from '../vfs.js?v=17';

const RECYCLE_ID = 'icon-recycle';

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
        icon.setAttribute('role', 'button');
        icon.setAttribute('aria-label', this.title);
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
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.open();
            } else if (e.key === 'Delete') {
                e.preventDefault();
                this.throwAway();
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
                const overBin = this.isRecycleCell(cell);
                document.querySelector(`[data-icon-id="${RECYCLE_ID}"]`)?.classList.toggle('drop-target', overBin);
                if (overBin) DesktopGridManager.hideDropPreview();
                else DesktopGridManager.showDropPreview(cell.row, cell.col);
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
                document.querySelector(`[data-icon-id="${RECYCLE_ID}"]`)?.classList.remove('drop-target');
                if (this.isRecycleCell(cell)) {
                    this.throwAway();
                    return;
                }
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

    isRecycleCell(cell) {
        return this.id !== RECYCLE_ID && DesktopGridManager.grid[cell.row]?.[cell.col] === RECYCLE_ID;
    }

    // Into the Recycle Bin: its desktop shortcut goes there, and the desktop drops the icon
    throwAway() {
        if (this.id === RECYCLE_ID) return;
        const path = VFS.shortcutOf(this.appId);
        if (!path) return;
        SoundManager.play('close');
        const bin = document.querySelector(`[data-icon-id="${RECYCLE_ID}"]`);
        bin?.classList.remove('recycle-bump');
        void bin?.offsetWidth;
        bin?.classList.add('recycle-bump');
        setTimeout(() => bin?.classList.remove('recycle-bump'), 600);
        document.dispatchEvent(new CustomEvent('face:react', {
            detail: { mood: 'surprised', text: t('face.say.recycle', { name: this.title }) }
        }));
        VFS.trash(path);
    }

    showContextMenu(x, y) {
        // Remove existing menu
        document.querySelector('.icon-context-menu')?.remove();

        const previousFocus = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const menu = document.createElement('div');
        menu.className = 'icon-context-menu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', `${this.title} actions`);
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            padding: 2px;
            z-index: 10000;
        `;

        const isBin = this.id === RECYCLE_ID;
        const items = [
            { label: t('recycle.open'), icon: Icons.ctxOpen, action: () => this.open() },
            isBin
                ? { label: t('recycle.emptyBin'), icon: Icons.actTrash, disabled: !VFS.bin.length, action: () => import('../apps/RecycleApp.js?v=17').then(({ RecycleApp }) => RecycleApp.emptyBin()) }
                : { label: t('recycle.delete'), icon: Icons.actTrash, action: () => this.throwAway() },
            { type: 'separator' },
            { label: t('recycle.properties'), icon: Icons.ctxProps, action: () => this.showProperties() }
        ];

        items.forEach(item => {
            if (item.type === 'separator') {
                const sep = document.createElement('div');
                sep.className = 'menu-divider';
                sep.setAttribute('role', 'separator');
                menu.appendChild(sep);
            } else {
                const menuItem = document.createElement('button');
                menuItem.type = 'button';
                menuItem.className = 'menu-item';
                menuItem.setAttribute('role', 'menuitem');
                menuItem.innerHTML = `<span class="context-menu-icon" aria-hidden="true">${item.icon || ''}</span><span>${item.label}</span>`;
                menuItem.disabled = Boolean(item.disabled);
                menuItem.addEventListener('click', () => {
                    item.action();
                    menu.remove();
                });
                menu.appendChild(menuItem);
            }
        });

        menu.addEventListener('keydown', (event) => {
            const menuItems = [...menu.querySelectorAll('.menu-item:not([disabled])')];
            const currentIndex = menuItems.indexOf(document.activeElement);

            if (event.key === 'Tab') {
                event.preventDefault();
                const direction = event.shiftKey ? -1 : 1;
                const nextIndex = currentIndex < 0
                    ? 0
                    : (currentIndex + direction + menuItems.length) % menuItems.length;
                menuItems[nextIndex]?.focus({ preventScroll: true });
            } else if (event.key === 'Escape') {
                event.preventDefault();
                menu.remove();
                previousFocus?.focus?.({ preventScroll: true });
            }
        });

        document.body.appendChild(menu);
        menu.querySelector('.menu-item')?.focus({ preventScroll: true });

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }, { once: true });
        }, 100);
    }

    showProperties() {
        import('../apps/index.js?v=17').then(module => {
            const app = module.Apps[this.appId];
            import('../managers/DialogManager.js?v=17').then(({ DialogManager }) => {
                DialogManager.info({
                    [t('dlg.name')]: this.title,
                    [t('dlg.type')]: t('dlg.application'),
                    [t('dlg.appId')]: this.appId,
                    [t('dlg.windowSize')]: `${app?.width || 400} × ${app?.height || 300}`
                }, t('dlg.properties'));
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
