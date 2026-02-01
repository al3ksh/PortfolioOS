/**
 * Window Manager - Handles multiple windows, z-index, focus
 */

import { Window } from '../components/Window.js';
import { Apps } from '../apps/index.js';

class WindowManagerClass {
    constructor() {
        this.windows = new Map();
        this.zIndexCounter = 100;
        this.activeWindowId = null;
        this.container = null;
        this.minimizedTray = null;
        this.closeAttempts = 0; // For BSOD easter egg
        this.onWindowChange = null; // Callback for taskbar updates
    }

    get activeWindow() {
        return this.activeWindowId;
    }

    /**
     * Get window instance by ID
     */
    getWindowInstance(windowId) {
        return this.windows.get(windowId) || null;
    }

    init() {
        this.container = document.getElementById('windowsContainer');
        this.minimizedTray = document.getElementById('minimizedTray');
        
        // Click on desktop to deactivate windows
        document.getElementById('desktop').addEventListener('mousedown', (e) => {
            if (e.target.id === 'desktop' || e.target.classList.contains('desktop-icons')) {
                this.deactivateAll();
            }
        });
    }

    /**
     * Notify listeners about window changes
     */
    notifyChange() {
        if (typeof this.onWindowChange === 'function') {
            this.onWindowChange();
        }
    }

    /**
     * Create and open a new window
     */
    createWindow(appId, options = {}) {
        // Check if window already exists
        if (this.windows.has(appId) && !options.allowMultiple) {
            const existingWindow = this.windows.get(appId);
            if (existingWindow.isMinimized) {
                existingWindow.restore();
            }
            this.bringToFront(appId);
            return existingWindow;
        }

        const app = Apps[appId];
        if (!app) {
            console.error(`App "${appId}" not found`);
            return null;
        }

        // Load saved position from localStorage
        const savedPos = Window.loadPosition(appId);
        
        const windowConfig = {
            id: options.allowMultiple ? `${appId}-${Date.now()}` : appId,
            title: app.title,
            icon: app.icon,
            width: savedPos?.width || app.width || 400,
            height: savedPos?.height || app.height || 300,
            minWidth: app.minWidth || 200,
            minHeight: app.minHeight || 150,
            x: options.x ?? savedPos?.x ?? 100 + (this.windows.size * 30),
            y: options.y ?? savedPos?.y ?? 80 + (this.windows.size * 30),
            resizable: app.resizable !== false,
            hasMenu: app.hasMenu !== false,
            menuItems: app.menuItems || ['File', 'Help'],
            menuConfig: app.menuConfig || undefined,
            content: app.render(),
            onInit: app.onInit,
            onClose: app.onClose,
            onMenuAction: app.onMenuAction,
            ...options
        };

        const window = new Window(windowConfig);
        this.windows.set(windowConfig.id, window);
        this.container.appendChild(window.element);
        
        window.onInit?.();
        this.bringToFront(windowConfig.id);
        this.notifyChange();
        this.saveOpenWindows();

        return window;
    }

    /**
     * Close a window
     */
    closeWindow(windowId) {
        const window = this.windows.get(windowId);
        if (!window) return;

        // Track portfolio close attempts for BSOD
        if (windowId === 'portfolio') {
            this.closeAttempts++;
            if (this.closeAttempts >= 3) {
                this.triggerBSOD();
                return;
            }
        }

        window.onClose?.();
        
        // Animate close
        window.element.style.animation = 'window-close 0.15s ease-in forwards';
        setTimeout(() => {
            window.element.remove();
        }, 150);
        
        this.windows.delete(windowId);
        
        // Remove from minimized tray if present
        this.removeFromTray(windowId);

        // Activate next window
        if (this.activeWindowId === windowId) {
            this.activeWindowId = null;
            const remainingWindows = Array.from(this.windows.values());
            if (remainingWindows.length > 0) {
                const topWindow = remainingWindows.reduce((a, b) => 
                    a.zIndex > b.zIndex ? a : b
                );
                this.bringToFront(topWindow.id);
            }
        }
        
        this.notifyChange();
        this.saveOpenWindows();
    }

    /**
     * Minimize a window
     */
    minimizeWindow(windowId) {
        const window = this.windows.get(windowId);
        if (!window) return;

        window.minimize();
        this.addToTray(windowId, window);
        
        // Deactivate
        if (this.activeWindowId === windowId) {
            this.activeWindowId = null;
            window.element.classList.remove('active');
        }
        
        this.notifyChange();
        this.saveOpenWindows();
    }

    /**
     * Restore a window from minimized state
     */
    restoreWindow(windowId) {
        const window = this.windows.get(windowId);
        if (!window) return;

        window.restore();
        this.removeFromTray(windowId);
        this.bringToFront(windowId);
        this.notifyChange();
        this.saveOpenWindows();
    }

    /**
     * Toggle maximize state
     */
    toggleMaximize(windowId) {
        const window = this.windows.get(windowId);
        if (!window) return;

        window.toggleMaximize();
        this.saveOpenWindows();
    }

    /**
     * Bring window to front (highest z-index)
     */
    bringToFront(windowId) {
        const window = this.windows.get(windowId);
        if (!window) return;

        // Deactivate previous active window
        if (this.activeWindowId && this.activeWindowId !== windowId) {
            const prevWindow = this.windows.get(this.activeWindowId);
            if (prevWindow) {
                prevWindow.element.classList.remove('active');
            }
        }

        // Activate new window
        this.zIndexCounter++;
        window.zIndex = this.zIndexCounter;
        window.element.style.zIndex = this.zIndexCounter;
        window.element.classList.add('active');
        this.activeWindowId = windowId;
        
        this.notifyChange();
    }

    /**
     * Deactivate all windows
     */
    deactivateAll() {
        this.windows.forEach(window => {
            window.element.classList.remove('active');
        });
        this.activeWindowId = null;
    }

    /**
     * Add minimized window to tray
     */
    addToTray(windowId, window) {
        const trayIcon = document.createElement('div');
        trayIcon.className = 'minimized-icon';
        trayIcon.dataset.windowId = windowId;
        trayIcon.innerHTML = `
            <span class="mini-icon">${window.icon || ''}</span>
            <span class="mini-title">${window.title}</span>
        `;
        trayIcon.addEventListener('click', () => this.restoreWindow(windowId));
        this.minimizedTray.appendChild(trayIcon);
    }

    /**
     * Remove from minimized tray
     */
    removeFromTray(windowId) {
        const trayIcon = this.minimizedTray.querySelector(`[data-window-id="${windowId}"]`);
        if (trayIcon) {
            trayIcon.remove();
        }
    }

    /**
     * Trigger BSOD easter egg
     */
    triggerBSOD() {
        const bsod = document.getElementById('bsodScreen');
        bsod.classList.remove('hidden');

        const handler = () => {
            bsod.classList.add('hidden');
            this.closeAttempts = 0;
            document.removeEventListener('keydown', handler);
            document.removeEventListener('click', handler);
        };

        setTimeout(() => {
            document.addEventListener('keydown', handler, { once: true });
            document.addEventListener('click', handler, { once: true });
        }, 500);
    }

    /**
     * Get window by ID
     */
    getWindow(windowId) {
        return this.windows.get(windowId);
    }

    /**
     * Save list of open windows to localStorage
     */
    saveOpenWindows() {
        const openWindows = [];
        this.windows.forEach((win, id) => {
            // Don't save temporary windows
            if (!id.includes('-')) {
                openWindows.push({
                    id: id,
                    minimized: win.isMinimized,
                    maximized: win.isMaximized,
                    zIndex: win.zIndex
                });
            }
        });
        localStorage.setItem('openWindows', JSON.stringify(openWindows));
    }

    /**
     * Load and restore open windows from localStorage
     */
    restoreOpenWindows() {
        const saved = localStorage.getItem('openWindows');
        if (!saved) return false;
        
        try {
            const openWindows = JSON.parse(saved);
            if (!openWindows || openWindows.length === 0) return false;
            
            // Sort by zIndex to restore in correct order
            openWindows.sort((a, b) => a.zIndex - b.zIndex);
            
            openWindows.forEach(winData => {
                const win = this.createWindow(winData.id);
                if (win) {
                    if (winData.minimized) {
                        this.minimizeWindow(winData.id);
                    } else if (winData.maximized) {
                        this.toggleMaximize(winData.id);
                    }
                }
            });
            
            return true;
        } catch (e) {
            console.error('Failed to restore windows:', e);
            return false;
        }
    }

    /**
     * Clear all saved state
     */
    clearSavedState() {
        localStorage.removeItem('openWindows');
        localStorage.removeItem('windowPositions');
    }

    /**
     * Check if there's saved state to restore
     */
    hasSavedState() {
        const saved = localStorage.getItem('openWindows');
        if (!saved) return false;
        try {
            const windows = JSON.parse(saved);
            return windows && windows.length > 0;
        } catch {
            return false;
        }
    }
}

// Singleton instance
export const WindowManager = new WindowManagerClass();
export default WindowManager;
