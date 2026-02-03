/**
 * Portfolio OS - Main Entry Point
 * Windows 3.1 Style Interactive Desktop Environment
 */

import { WindowManager } from './managers/WindowManager.js';
import { SoundManager } from './managers/SoundManager.js';
import { DesktopGridManager } from './managers/DesktopGridManager.js';
import { DesktopIcon } from './components/DesktopIcon.js';
import { Icons } from './icons.js';
import { Apps } from './apps/index.js';
import { ControlApp } from './apps/ControlApp.js';

// ===========================================
// TASKBAR & START MENU MANAGER
// ===========================================

class TaskbarManager {
    static windowButtons = new Map();
    static startMenuOpen = false;
    static logoClickCount = 0;

    static init() {
        // Start button
        const startBtn = document.querySelector('.start-button');
        startBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            TaskbarManager.toggleStartMenu();
        });

        // Close start menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
                TaskbarManager.closeStartMenu();
            }
        });

        // Start menu items
        document.querySelectorAll('.start-item').forEach(item => {
            item.addEventListener('click', () => {
                const appId = item.dataset.app;
                if (appId) {
                    WindowManager.createWindow(appId);
                    TaskbarManager.closeStartMenu();
                    SoundManager.play('open');
                }
            });
        });

        // Easter egg: Click on Start Menu logo
        const logo = document.querySelector('.start-menu-logo');
        logo?.addEventListener('click', () => {
            TaskbarManager.logoClickCount++;
            if (TaskbarManager.logoClickCount >= 5) {
                TaskbarManager.logoClickCount = 0;
                TaskbarManager.showSecretCredits();
            }
        });

        // Sound toggle button
        const soundBtn = document.querySelector('.taskbar-tray .tray-icon');
        
        // Initialize sound icon based on current state
        if (soundBtn) {
            const initialEnabled = SoundManager.enabled;
            soundBtn.textContent = initialEnabled ? '🔊' : '🔇';
            soundBtn.title = initialEnabled ? 'Sound: ON' : 'Sound: OFF';
        }
        
        soundBtn?.addEventListener('click', () => {
            const enabled = SoundManager.toggle();
            soundBtn.textContent = enabled ? '🔊' : '🔇';
            soundBtn.title = enabled ? 'Sound: ON' : 'Sound: OFF';
        });

        // Sync sound icon when changed from Control Panel
        SoundManager.addChangeListener((enabled) => {
            if (soundBtn) {
                soundBtn.textContent = enabled ? '🔊' : '🔇';
                soundBtn.title = enabled ? 'Sound: ON' : 'Sound: OFF';
            }
        });

        // Listen for window events
        WindowManager.onWindowChange = TaskbarManager.updateTaskbar;
    }

    static showSecretCredits() {
        SoundManager.play('chord');
        const popup = document.createElement('div');
        popup.className = 'credits-popup';
        popup.innerHTML = `
            <div class="credits-content">
                <h2>🎮 SECRET CREDITS 🎮</h2>
                <p>Portfolio OS v1.0.2026</p>
                <p>━━━━━━━━━━━━━━━━━━━</p>
                <p><strong>Lead Developer:</strong> You!</p>
                <p><strong>Inspiration:</strong> Windows 3.1</p>
                <p><strong>Coffee consumed:</strong> ∞</p>
                <p><strong>Bugs fixed:</strong> Yes</p>
                <p><strong>Easter eggs:</strong> Many 🥚</p>
                <p>━━━━━━━━━━━━━━━━━━━</p>
                <p style="font-size:10px">Try: Konami Code, Terminal commands...</p>
                <button class="win-btn" onclick="this.parentElement.parentElement.remove()">Cool!</button>
            </div>
        `;
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); display: flex;
            align-items: center; justify-content: center; z-index: 99999;
        `;
        popup.querySelector('.credits-content').style.cssText = `
            background: linear-gradient(135deg, #000080, #0000AA);
            border: 3px outset #FFF; padding: 30px; text-align: center;
            font-family: 'MS Sans Serif', sans-serif; color: #FFF;
            box-shadow: 5px 5px 0 #000;
        `;
        document.body.appendChild(popup);
    }

    static toggleStartMenu() {
        const menu = document.querySelector('.start-menu');
        if (!menu) return;
        
        TaskbarManager.startMenuOpen = !TaskbarManager.startMenuOpen;
        menu.classList.toggle('open', TaskbarManager.startMenuOpen);
        SoundManager.play('click');
    }

    static closeStartMenu() {
        const menu = document.querySelector('.start-menu');
        if (menu && TaskbarManager.startMenuOpen) {
            menu.classList.remove('open');
            TaskbarManager.startMenuOpen = false;
        }
    }

    static updateTaskbar() {
        const container = document.querySelector('.taskbar-windows');
        if (!container) return;

        container.innerHTML = '';

        // Add button for each open window
        WindowManager.windows.forEach((win, id) => {
            const app = Apps[id];
            if (!app) return;

            const btn = document.createElement('button');
            btn.className = 'taskbar-window-btn';
            if (WindowManager.activeWindow === id) {
                btn.classList.add('active');
            }
            
            btn.innerHTML = `<span class="taskbar-window-icon">${app.icon}</span><span>${app.title}</span>`;
            
            btn.addEventListener('click', () => {
                const windowEl = document.querySelector(`#window-${id}`);
                if (windowEl) {
                    // If minimized, use proper restore method
                    if (windowEl.classList.contains('minimized')) {
                        WindowManager.restoreWindow(id);
                    } else {
                        // Just bring to front
                        WindowManager.bringToFront(id);
                    }
                }
            });

            container.appendChild(btn);
        });
    }

    static addWindow(id, title, icon) {
        TaskbarManager.updateTaskbar();
    }

    static removeWindow(id) {
        TaskbarManager.updateTaskbar();
    }
}

// ===========================================
// SCREEN SAVER - MATRIX RAIN
// ===========================================

class ScreenSaver {
    static timeout = 60000; // 1 minute of inactivity
    static timer = null;
    static active = false;
    static canvas = null;
    static ctx = null;
    static animationId = null;
    static columns = [];
    static fontSize = 16;
    static chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    static init() {
        ScreenSaver.canvas = document.getElementById('screenSaverCanvas');
        if (ScreenSaver.canvas) {
            ScreenSaver.ctx = ScreenSaver.canvas.getContext('2d');
            ScreenSaver.resize();
            window.addEventListener('resize', ScreenSaver.resize);
        }

        // Reset timer on any activity
        ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, ScreenSaver.resetTimer);
        });

        // Click to deactivate
        document.querySelector('.screen-saver')?.addEventListener('click', () => {
            ScreenSaver.deactivate();
        });

        ScreenSaver.resetTimer();
    }

    static resize() {
        if (ScreenSaver.canvas) {
            ScreenSaver.canvas.width = window.innerWidth;
            ScreenSaver.canvas.height = window.innerHeight;
            ScreenSaver.initMatrix();
        }
    }

    static resetTimer() {
        if (ScreenSaver.active) {
            ScreenSaver.deactivate();
        }

        clearTimeout(ScreenSaver.timer);
        ScreenSaver.timer = setTimeout(() => {
            ScreenSaver.activate();
        }, ScreenSaver.timeout);
    }

    static activate() {
        ScreenSaver.active = true;
        const saverEl = document.querySelector('.screen-saver');
        if (saverEl) {
            saverEl.classList.add('active');
        }
        ScreenSaver.initMatrix();
        ScreenSaver.animate();
    }

    static deactivate() {
        ScreenSaver.active = false;
        const saverEl = document.querySelector('.screen-saver');
        if (saverEl) {
            saverEl.classList.remove('active');
        }
        if (ScreenSaver.animationId) {
            cancelAnimationFrame(ScreenSaver.animationId);
        }
        ScreenSaver.resetTimer();
    }

    static initMatrix() {
        const columnCount = Math.floor(window.innerWidth / ScreenSaver.fontSize);
        ScreenSaver.columns = [];
        for (let i = 0; i < columnCount; i++) {
            ScreenSaver.columns.push({
                y: Math.random() * -100,
                speed: 0.5 + Math.random() * 0.5,
                chars: []
            });
        }
    }

    static animate() {
        if (!ScreenSaver.active || !ScreenSaver.ctx) return;

        const ctx = ScreenSaver.ctx;
        const width = ScreenSaver.canvas.width;
        const height = ScreenSaver.canvas.height;

        // Fade effect - creates trail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${ScreenSaver.fontSize}px monospace`;

        ScreenSaver.columns.forEach((col, i) => {
            // Random character
            const char = ScreenSaver.chars[Math.floor(Math.random() * ScreenSaver.chars.length)];
            const x = i * ScreenSaver.fontSize;
            const y = col.y * ScreenSaver.fontSize;

            // Head character (bright green/white)
            ctx.fillStyle = '#FFF';
            ctx.fillText(char, x, y);

            // Trail characters (fading green)
            for (let j = 1; j < 20; j++) {
                const trailY = y - j * ScreenSaver.fontSize;
                if (trailY > 0) {
                    const alpha = 1 - (j / 20);
                    ctx.fillStyle = `rgba(0, 255, 70, ${alpha})`;
                    const trailChar = ScreenSaver.chars[Math.floor(Math.random() * ScreenSaver.chars.length)];
                    ctx.fillText(trailChar, x, trailY);
                }
            }

            // Move column down
            col.y += col.speed;

            // Reset when off screen
            if (col.y * ScreenSaver.fontSize > height + 200) {
                col.y = Math.random() * -20;
                col.speed = 0.5 + Math.random() * 0.5;
            }
        });

        ScreenSaver.animationId = requestAnimationFrame(ScreenSaver.animate);
    }
}

// ===========================================
// KONAMI CODE EASTER EGG
// ===========================================

class KonamiCode {
    static sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    static position = 0;

    static init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === KonamiCode.sequence[KonamiCode.position]) {
                KonamiCode.position++;

                if (KonamiCode.position === KonamiCode.sequence.length) {
                    KonamiCode.activate();
                    KonamiCode.position = 0;
                }
            } else {
                KonamiCode.position = 0;
            }
        });
    }

    static activate() {
        SoundManager.play('chord');
        
        // Show special message
        const desktop = document.getElementById('desktop');
        const popup = document.createElement('div');
        popup.className = 'konami-popup';
        popup.innerHTML = `
            <div class="konami-content">
                <h2>🎮 KONAMI CODE ACTIVATED! 🎮</h2>
                <p>You found the secret! Here's a virtual high-five! 🖐️</p>
                <p>Fun fact: The Konami Code was created in 1986.</p>
                <button class="win-btn" onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        // Add styles inline for the popup
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = popup.querySelector('.konami-content');
        content.style.cssText = `
            background: #C0C0C0;
            border: 3px outset #FFF;
            padding: 30px;
            text-align: center;
            font-family: 'MS Sans Serif', sans-serif;
            box-shadow: 5px 5px 0 #000;
        `;
        
        desktop?.appendChild(popup);

        // Rainbow effect on desktop
        document.body.style.animation = 'rainbow 2s linear';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 2000);
    }
}

// ===========================================
// BOOT SEQUENCE
// ===========================================

class BootSequence {
    constructor() {
        this.bootScreen = document.getElementById('bootScreen');
        this.desktop = document.getElementById('desktop');
        this.bootText = this.bootScreen?.querySelector('.boot-text');
        this.lines = [
            { el: document.getElementById('bootLine1'), text: 'Checking Memory... 640K OK', delay: 300 },
            { el: document.getElementById('bootLine2'), text: 'Loading Portfolio OS v1.0...', delay: 600 },
            { el: document.getElementById('bootLine3'), text: 'Starting Desktop Manager...', delay: 400 }
        ];
        
        // Set up global error handler
        this.setupErrorHandler();
    }

    setupErrorHandler() {
        // Catch unhandled errors
        window.onerror = (message, source, lineno, colno, error) => {
            this.showBootError(message, source, lineno);
            return true;
        };

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.showBootError(event.reason?.message || 'Promise rejected', event.reason?.stack || 'Unknown');
        });
    }

    showBootError(message, source, line) {
        // Only show if boot screen is visible (not yet booted)
        if (this.bootScreen?.classList.contains('hidden')) return;
        
        // Hide cursor
        const cursor = document.getElementById('bootCursor');
        if (cursor) cursor.style.display = 'none';

        // Create error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'boot-error';
        errorDiv.innerHTML = `
            <p style="color: #FF5555; margin-top: 20px;">
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            </p>
            <p style="color: #FF5555;">
                ⚠️ SYSTEM ERROR - Boot Failed
            </p>
            <p style="color: #FF5555;">
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            </p>
            <p style="color: #AAAAAA; margin-top: 10px; font-size: 12px;">
                Error: ${this.escapeHtml(message?.toString().substring(0, 100))}
            </p>
            <p style="color: #666666; font-size: 11px;">
                ${source ? `Source: ${this.escapeHtml(source.split('/').pop())}` : ''}
                ${line ? ` (line ${line})` : ''}
            </p>
            <p style="color: #FFFF55; margin-top: 20px;">
                System files may be corrupted or damaged.
            </p>
            <p style="color: #FFFFFF; margin-top: 15px;">
                Press F5 to restart, or click below:
            </p>
            <div style="margin-top: 15px;">
                <button onclick="location.reload()" style="
                    background: #333;
                    color: #0F0;
                    border: 1px solid #0F0;
                    padding: 8px 20px;
                    font-family: 'Courier New', monospace;
                    cursor: pointer;
                    margin-right: 10px;
                ">🔄 Restart System</button>
                <button onclick="sessionStorage.clear(); localStorage.clear(); location.reload()" style="
                    background: #333;
                    color: #FF5;
                    border: 1px solid #FF5;
                    padding: 8px 20px;
                    font-family: 'Courier New', monospace;
                    cursor: pointer;
                ">🔧 Reset & Restart</button>
            </div>
            <p style="color: #666666; margin-top: 20px; font-size: 10px;">
                Tip: Reset clears saved data and may fix corrupted settings.
            </p>
        `;

        if (this.bootText) {
            this.bootText.appendChild(errorDiv);
        }

        console.error('Boot Error:', message, source, line);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    async start() {
        try {
            // Check if already booted this session
            if (sessionStorage.getItem('hasBooted')) {
                this.skipBoot();
                return;
            }

            await this.typeLines();
            await this.sleep(500);
            
            // Flash effect
            this.bootScreen.style.background = '#FFF';
            await this.sleep(100);
            this.bootScreen.style.background = '#000';
            await this.sleep(100);
            
            this.finishBoot();
        } catch (error) {
            this.showBootError(error.message, error.stack, null);
        }
    }

    async typeLines() {
        for (const line of this.lines) {
            await this.typeLine(line.el, line.text);
            await this.sleep(line.delay);
        }
    }

    async typeLine(element, text) {
        if (!element) return;
        
        for (let i = 0; i <= text.length; i++) {
            element.textContent = text.slice(0, i);
            await this.sleep(20);
        }
    }

    skipBoot() {
        try {
            if (this.bootScreen) this.bootScreen.classList.add('hidden');
            if (this.desktop) this.desktop.classList.remove('hidden');
            this.initDesktop();
        } catch (error) {
            // Show boot screen again to display error
            if (this.bootScreen) this.bootScreen.classList.remove('hidden');
            if (this.desktop) this.desktop.classList.add('hidden');
            this.showBootError(error.message, error.stack, null);
        }
    }

    finishBoot() {
        try {
            sessionStorage.setItem('hasBooted', 'true');
            
            if (this.bootScreen) this.bootScreen.classList.add('hidden');
            if (this.desktop) this.desktop.classList.remove('hidden');
            
            this.initDesktop();
        } catch (error) {
            // Show boot screen again to display error
            sessionStorage.removeItem('hasBooted');
            if (this.bootScreen) this.bootScreen.classList.remove('hidden');
            if (this.desktop) this.desktop.classList.add('hidden');
            this.showBootError(error.message, error.stack, null);
        }
    }

    initDesktop() {
        // Set boot time for system uptime tracking (if not already set)
        if (!sessionStorage.getItem('bootTime')) {
            sessionStorage.setItem('bootTime', new Date().toISOString());
        }
        
        // Initialize managers
        SoundManager.init();
        WindowManager.init();
        TaskbarManager.init();
        ScreenSaver.init();
        KonamiCode.init();
        
        // Load saved theme
        ControlApp.loadSavedTheme();
        
        // Initialize desktop grid for icons
        DesktopGridManager.init();
        
        // Create desktop icons
        createDesktopIcons();
        
        // Start system clock
        startSystemClock();
        
        // Setup beforeunload protection
        this.setupBeforeUnload();
        
        // Try to restore previous session or open Portfolio
        setTimeout(() => {
            const restored = WindowManager.restoreOpenWindows();
            
            if (!restored) {
                // No saved session - open Portfolio centered (NOT maximized)
                WindowManager.createWindow('portfolio', {
                    x: 50,
                    y: 30
                });
            }
        }, 300);

        // Add desktop click handler to deselect icons
        document.getElementById('desktop')?.addEventListener('click', (e) => {
            if (e.target.id === 'desktop') {
                document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
                    icon.classList.remove('selected');
                });
            }
        });
    }

    setupBeforeUnload() {
        // Warn user before leaving if there are open windows
        window.addEventListener('beforeunload', (e) => {
            if (WindowManager.windows.size > 0) {
                e.preventDefault();
                e.returnValue = 'You have open windows. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ===========================================
// DESKTOP ICONS
// ===========================================

function createDesktopIcons() {
    const container = document.getElementById('desktopIcons');
    if (!container) return;

    const iconConfigs = [
        { appId: 'portfolio', title: 'Portfolio.exe', icon: Icons.portfolio },
        { appId: 'readme', title: 'README.TXT', icon: Icons.readme },
        { appId: 'contact', title: 'Contact.exe', icon: Icons.contact },
        { appId: 'notepad', title: 'Notepad.exe', icon: Icons.notepad },
        { appId: 'terminal', title: 'Terminal.exe', icon: Icons.terminal },
        { appId: 'explorer', title: 'Explorer.exe', icon: Icons.explorer },
        { appId: 'browser', title: 'Internet Explorer', icon: Icons.browser },
        { appId: 'simplemode', title: 'Simple View', icon: Icons.simplemode },
        { appId: 'paint', title: 'Paint.exe', icon: Icons.paint },
        { appId: 'calc', title: 'Calc.exe', icon: Icons.calc },
        { appId: 'tunes', title: 'Tunes.exe', icon: Icons.tunes },
        { appId: 'mines', title: 'Mines.exe', icon: Icons.mines },
        { appId: 'snake', title: 'Snake.exe', icon: Icons.snake },
        { appId: 'tetris', title: 'Tetris.exe', icon: Icons.tetris },
        { appId: 'sysinfo', title: 'System Info', icon: Icons.sysinfo },
        { appId: 'taskmgr', title: 'Task Manager', icon: Icons.taskmgr },
        { appId: 'control', title: 'Control.cpl', icon: Icons.control }
    ];

    iconConfigs.forEach((config, index) => {
        const icon = new DesktopIcon({
            id: `icon-${config.appId}`,
            appId: config.appId,
            title: config.title,
            icon: config.icon
        });
        container.appendChild(icon.element);
    });
}

// ===========================================
// SYSTEM CLOCK
// ===========================================

function startSystemClock() {
    const clockEl = document.getElementById('clockTime');
    const dateEl = document.getElementById('clockDate');
    const clockWrapper = document.getElementById('clockWrapper');
    if (!clockEl) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function updateClock() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        if (dateEl) {
            dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}`;
        }
    }

    // Calendar popup
    if (clockWrapper) {
        clockWrapper.addEventListener('click', () => {
            let popup = document.querySelector('.calendar-popup');
            if (popup) {
                popup.remove();
                return;
            }

            const now = new Date();
            popup = document.createElement('div');
            popup.className = 'calendar-popup';
            popup.innerHTML = `
                <div class="calendar-header">
                    <span class="calendar-day-name">${days[now.getDay()]}</span>
                    <span class="calendar-full-date">${fullMonths[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}</span>
                </div>
                <div class="calendar-time">${now.toLocaleTimeString('en-GB')}</div>
            `;
            document.body.appendChild(popup);

            // Close on click outside
            setTimeout(() => {
                document.addEventListener('click', function closeCalendar(e) {
                    if (!popup.contains(e.target) && !clockWrapper.contains(e.target)) {
                        popup.remove();
                        document.removeEventListener('click', closeCalendar);
                    }
                });
            }, 10);
        });
    }

    updateClock();
    setInterval(updateClock, 1000);
}

// ===========================================
// KEYBOARD SHORTCUTS
// ===========================================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+O - Open Portfolio
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            WindowManager.createWindow('portfolio');
        }
        
        // Ctrl+N - New Notepad
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            WindowManager.createWindow('notepad');
        }
        
        // F1 - Help (README)
        if (e.key === 'F1') {
            e.preventDefault();
            WindowManager.createWindow('readme');
        }

        // Ctrl+T - Terminal
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            WindowManager.createWindow('terminal');
        }
    });
}

// ===========================================
// START APPLICATION
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    const boot = new BootSequence();
    boot.start();
    initKeyboardShortcuts();
});

// Export for external use
export { TaskbarManager, ScreenSaver };

// Export for debugging
window.PortfolioOS = {
    WindowManager,
    SoundManager,
    Apps
};
