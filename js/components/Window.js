/**
 * Window Component - Draggable, resizable window
 */

import { Icons } from '../icons.js';
import { WindowManager } from '../managers/WindowManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class Window {
    constructor(config) {
        this.id = config.id;
        this.title = config.title;
        this.icon = config.icon || '';
        this.width = config.width || 400;
        this.height = config.height || 300;
        this.minWidth = config.minWidth || 200;
        this.minHeight = config.minHeight || 150;
        this.x = config.x || 100;
        this.y = config.y || 100;
        this.zIndex = config.zIndex || 100;
        this.resizable = config.resizable !== false;
        this.hasMenu = config.hasMenu !== false;
        this.menuItems = config.menuItems || ['File', 'Help'];
        this.menuConfig = config.menuConfig || this.getDefaultMenuConfig();
        this.content = config.content || '';
        this.onInit = config.onInit;
        this.onClose = config.onClose;
        this.onMenuAction = config.onMenuAction;
        
        this.isMinimized = false;
        this.isMaximized = false;
        this.savedPosition = null;
        this.activeMenu = null;

        this.element = this.render();
        this.attachEvents();
        
        SoundManager.play('open');
    }

    /**
     * Default menu configuration for all windows
     */
    getDefaultMenuConfig() {
        return {
            'File': [
                { label: 'New', action: 'new', shortcut: 'Ctrl+N' },
                { label: 'Open...', action: 'open', shortcut: 'Ctrl+O' },
                { label: 'Save', action: 'save', shortcut: 'Ctrl+S' },
                { divider: true },
                { label: 'Exit', action: 'close', shortcut: 'Alt+F4' }
            ],
            'Edit': [
                { label: 'Undo', action: 'undo', shortcut: 'Ctrl+Z' },
                { label: 'Redo', action: 'redo', shortcut: 'Ctrl+Y' },
                { divider: true },
                { label: 'Cut', action: 'cut', shortcut: 'Ctrl+X' },
                { label: 'Copy', action: 'copy', shortcut: 'Ctrl+C' },
                { label: 'Paste', action: 'paste', shortcut: 'Ctrl+V' },
                { divider: true },
                { label: 'Select All', action: 'selectAll', shortcut: 'Ctrl+A' }
            ],
            'View': [
                { label: 'Toolbar', action: 'toggleToolbar', checked: true },
                { label: 'Status Bar', action: 'toggleStatusBar', checked: true },
                { divider: true },
                { label: 'Refresh', action: 'refresh', shortcut: 'F5' }
            ],
            'Help': [
                { label: 'Help Topics', action: 'helpTopics', shortcut: 'F1' },
                { divider: true },
                { label: 'About...', action: 'about' }
            ]
        };
    }

    render() {
        const win = document.createElement('div');
        win.className = 'window active opening';
        win.id = `window-${this.id}`;
        win.style.cssText = `
            left: ${this.x}px;
            top: ${this.y}px;
            width: ${this.width}px;
            height: ${this.height}px;
            z-index: ${this.zIndex};
        `;
        
        // Remove opening class after animation
        setTimeout(() => {
            win.classList.remove('opening');
        }, 200);

        win.innerHTML = `
            <!-- Title Bar -->
            <div class="title-bar">
                <div class="title-bar-icon">${this.icon}</div>
                <span class="title-bar-text">${this.title}</span>
                <div class="title-bar-controls">
                    <button class="control-btn" data-action="minimize" title="Minimize">
                        ${Icons.minimize}
                    </button>
                    <button class="control-btn" data-action="maximize" title="Maximize">
                        ${Icons.maximize}}
                    </button>
                    <button class="control-btn" data-action="close" title="Close">
                        ${Icons.close}
                    </button>
                </div>
            </div>

            ${this.hasMenu ? `
            <!-- Menu Bar -->
            <div class="menu-bar">
                ${this.menuItems.map(item => `
                    <div class="menu-item-wrapper" data-menu="${item.toLowerCase()}">
                        <span class="menu-item">
                            <u>${item[0]}</u>${item.slice(1)}
                        </span>
                        <div class="menu-dropdown">
                            ${this.renderMenuDropdown(item)}
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Content -->
            <div class="window-content">
                <div class="window-content-inner">
                    ${this.content}
                </div>
            </div>

            ${this.resizable ? '<div class="resize-handle"></div>' : ''}
        `;

        return win;
    }

    attachEvents() {
        // Window controls
        this.element.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                SoundManager.play('click');
                const action = btn.dataset.action;
                
                if (action === 'minimize') {
                    WindowManager.minimizeWindow(this.id);
                } else if (action === 'maximize') {
                    WindowManager.toggleMaximize(this.id);
                } else if (action === 'close') {
                    WindowManager.closeWindow(this.id);
                }
            });
        });

        // Focus on click
        this.element.addEventListener('mousedown', (e) => {
            WindowManager.bringToFront(this.id);
        });

        // Drag functionality
        this.initDrag();

        // Resize functionality
        if (this.resizable) {
            this.initResize();
        }

        // Menu items with dropdowns
        this.initMenus();
    }

    /**
     * Render dropdown menu items
     */
    renderMenuDropdown(menuName) {
        const items = this.menuConfig[menuName] || [];
        return items.map(item => {
            if (item.divider) {
                return '<div class="menu-dropdown-divider"></div>';
            }
            const checkMark = item.checked ? '✓ ' : '';
            const shortcut = item.shortcut ? `<span class="menu-shortcut">${item.shortcut}</span>` : '';
            const disabled = item.disabled ? 'disabled' : '';
            return `
                <div class="menu-dropdown-item ${disabled}" data-action="${item.action}">
                    <span class="menu-dropdown-label">${checkMark}${item.label}</span>
                    ${shortcut}
                </div>
            `;
        }).join('');
    }

    /**
     * Initialize menu dropdown behavior
     */
    initMenus() {
        const menuBar = this.element.querySelector('.menu-bar');
        if (!menuBar) return;

        const menuWrappers = menuBar.querySelectorAll('.menu-item-wrapper');
        let menuOpen = false;

        // Close all menus
        const closeAllMenus = () => {
            menuWrappers.forEach(w => w.classList.remove('active'));
            menuOpen = false;
        };

        // Click on menu item
        menuWrappers.forEach(wrapper => {
            const menuItem = wrapper.querySelector('.menu-item');
            
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                SoundManager.play('click');
                
                const wasActive = wrapper.classList.contains('active');
                closeAllMenus();
                
                if (!wasActive) {
                    wrapper.classList.add('active');
                    menuOpen = true;
                }
            });

            // Hover to switch menus when one is open
            menuItem.addEventListener('mouseenter', () => {
                if (menuOpen && !wrapper.classList.contains('active')) {
                    closeAllMenus();
                    wrapper.classList.add('active');
                    menuOpen = true;
                }
            });

            // Dropdown item click
            wrapper.querySelectorAll('.menu-dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (item.classList.contains('disabled')) return;
                    
                    SoundManager.play('click');
                    const action = item.dataset.action;
                    closeAllMenus();
                    this.handleMenuAction(action, wrapper.dataset.menu);
                });
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuBar.contains(e.target)) {
                closeAllMenus();
            }
        });

        // Close menu on window blur
        this.element.addEventListener('mousedown', (e) => {
            if (!menuBar.contains(e.target)) {
                closeAllMenus();
            }
        });
    }

    /**
     * Handle menu action
     */
    handleMenuAction(action, menuName) {
        // Built-in actions
        switch(action) {
            case 'close':
                WindowManager.closeWindow(this.id);
                return;
            case 'about':
                this.showAboutDialog();
                return;
            case 'helpTopics':
                WindowManager.createWindow('readme');
                return;
        }

        // Custom handler from config
        if (this.onMenuAction) {
            this.onMenuAction(action, menuName);
        }
    }

    /**
     * Update checked state for menu items
     * @param {string} menuName - The menu category (e.g., 'View')
     * @param {string|string[]} actionsToCheck - Action(s) to set as checked
     * @param {boolean} exclusive - If true, only the specified actions are checked, others unchecked
     */
    updateMenuChecked(menuName, actionsToCheck, exclusive = true) {
        const menuConfig = this.menuConfig[menuName];
        if (!menuConfig) return;

        const actionsArray = Array.isArray(actionsToCheck) ? actionsToCheck : [actionsToCheck];

        // Update the config
        menuConfig.forEach(item => {
            if (item.divider) return;
            if (exclusive) {
                item.checked = actionsArray.includes(item.action);
            } else if (actionsArray.includes(item.action)) {
                item.checked = !item.checked;
            }
        });

        // Re-render the dropdown (use lowercase for data-menu attribute)
        const wrapper = this.element.querySelector(`.menu-item-wrapper[data-menu="${menuName.toLowerCase()}"]`);
        if (wrapper) {
            const dropdown = wrapper.querySelector('.menu-dropdown');
            if (dropdown) {
                dropdown.innerHTML = this.renderMenuDropdown(menuName);
                
                // Re-attach click handlers
                dropdown.querySelectorAll('.menu-dropdown-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (item.classList.contains('disabled')) return;
                        
                        SoundManager.play('click');
                        const action = item.dataset.action;
                        wrapper.classList.remove('active');
                        this.handleMenuAction(action, menuName);
                    });
                });
            }
        }
    }

    /**
     * Toggle a single menu item's checked state
     */
    toggleMenuChecked(menuName, action) {
        this.updateMenuChecked(menuName, action, false);
    }

    /**
     * Show about dialog
     */
    showAboutDialog() {
        const existingDialog = this.element.querySelector('.about-dialog');
        if (existingDialog) {
            existingDialog.remove();
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'about-dialog';
        dialog.innerHTML = `
            <div class="about-dialog-content">
                <div class="about-icon">${this.icon || '📁'}</div>
                <h3>${this.title}</h3>
                <p>Portfolio OS v1.0</p>
                <p>© 2024 All Rights Reserved</p>
                <p style="margin-top: 10px; font-size: 11px; color: #666;">
                    Windows 3.1 Style Portfolio
                </p>
                <button class="about-ok-btn">OK</button>
            </div>
        `;

        dialog.querySelector('.about-ok-btn').addEventListener('click', () => {
            SoundManager.play('click');
            dialog.remove();
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                SoundManager.play('click');
                dialog.remove();
            }
        });

        this.element.appendChild(dialog);
    }

    initDrag() {
        const titleBar = this.element.querySelector('.title-bar');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        const onDragStart = (e) => {
            if (e.target.closest('.control-btn')) return;
            if (this.isMaximized) return;

            // Handle both mouse and touch
            const point = e.touches ? e.touches[0] : e;

            isDragging = true;
            startX = point.clientX;
            startY = point.clientY;
            initialX = this.element.offsetLeft;
            initialY = this.element.offsetTop;

            // Add dragging class for visual feedback
            this.element.classList.add('dragging');

            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragEnd);
            document.addEventListener('touchmove', onDragMove, { passive: false });
            document.addEventListener('touchend', onDragEnd);
            
            this.element.style.transition = 'none';
        };

        const onDragMove = (e) => {
            if (!isDragging) return;
            
            // Prevent scrolling on touch
            if (e.touches) e.preventDefault();

            const point = e.touches ? e.touches[0] : e;
            const dx = point.clientX - startX;
            const dy = point.clientY - startY;

            let newX = initialX + dx;
            let newY = initialY + dy;

            // Boundary constraints (account for taskbar)
            const maxX = window.innerWidth - 100;
            const maxY = window.innerHeight - 80; // Leave room for taskbar
            
            newX = Math.max(-this.element.offsetWidth + 100, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            this.element.style.left = `${newX}px`;
            this.element.style.top = `${newY}px`;
            this.x = newX;
            this.y = newY;
        };

        const onDragEnd = () => {
            isDragging = false;
            this.element.classList.remove('dragging');
            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('mouseup', onDragEnd);
            document.removeEventListener('touchmove', onDragMove);
            document.removeEventListener('touchend', onDragEnd);
            this.element.style.transition = '';
            
            // Save position to localStorage
            this.savePosition();
        };

        titleBar.addEventListener('mousedown', onDragStart);
        titleBar.addEventListener('touchstart', onDragStart, { passive: true });
    }

    initResize() {
        const handle = this.element.querySelector('.resize-handle');
        if (!handle) return;

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        handle.addEventListener('mousedown', (e) => {
            if (this.isMaximized) return;
            
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = this.element.offsetWidth;
            startHeight = this.element.offsetHeight;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            
            e.preventDefault();
        });

        const onMouseMove = (e) => {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            const newWidth = Math.max(this.minWidth, startWidth + dx);
            const newHeight = Math.max(this.minHeight, startHeight + dy);

            this.element.style.width = `${newWidth}px`;
            this.element.style.height = `${newHeight}px`;
            this.width = newWidth;
            this.height = newHeight;
            
            // Save to localStorage
            this.savePosition();
        };

        const onMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    minimize() {
        this.isMinimized = true;
        // Animate then hide
        this.element.style.animation = 'minimize-out 0.15s ease-in forwards';
        setTimeout(() => {
            this.element.classList.add('minimized');
            this.element.style.animation = '';
        }, 150);
    }

    restore() {
        this.isMinimized = false;
        this.element.classList.remove('minimized');
        this.element.classList.add('restoring');
        setTimeout(() => {
            this.element.classList.remove('restoring');
        }, 150);
    }

    toggleMaximize() {
        const maxBtn = this.element.querySelector('[data-action="maximize"]');
        
        if (this.isMaximized) {
            // Restore
            this.element.classList.remove('maximized');
            this.element.style.left = `${this.savedPosition.x}px`;
            this.element.style.top = `${this.savedPosition.y}px`;
            this.element.style.width = `${this.savedPosition.width}px`;
            this.element.style.height = `${this.savedPosition.height}px`;
            maxBtn.innerHTML = Icons.maximize;
            this.isMaximized = false;
        } else {
            // Maximize
            this.savedPosition = {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };
            this.element.classList.add('maximized');
            maxBtn.innerHTML = Icons.restore;
            this.isMaximized = true;
        }
    }

    setContent(html) {
        const contentInner = this.element.querySelector('.window-content-inner');
        if (contentInner) {
            contentInner.innerHTML = html;
        }
    }

    getContentElement() {
        return this.element.querySelector('.window-content-inner');
    }

    /**
     * Save window position to localStorage
     */
    savePosition() {
        const positions = JSON.parse(localStorage.getItem('windowPositions') || '{}');
        positions[this.id] = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
        localStorage.setItem('windowPositions', JSON.stringify(positions));
    }

    /**
     * Load saved position from localStorage
     */
    static loadPosition(id) {
        const positions = JSON.parse(localStorage.getItem('windowPositions') || '{}');
        return positions[id] || null;
    }
}

export default Window;
