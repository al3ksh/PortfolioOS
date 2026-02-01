/**
 * Control Panel App - Settings / Theme switcher
 */

import { Icons } from '../icons.js';
import { SoundManager } from '../managers/SoundManager.js';
import { WindowManager } from '../managers/WindowManager.js';

export const ControlApp = {
    id: 'control',
    title: 'Control Panel',
    icon: Icons.control,
    width: 450,
    height: 550,
    hasMenu: false,
    resizable: true,
    minWidth: 400,
    minHeight: 500,

    currentTheme: 'default',
    crtEnabled: false,
    autoTheme: true,

    render() {
        ControlApp.crtEnabled = localStorage.getItem('crtEffect') === 'true';
        ControlApp.autoTheme = localStorage.getItem('autoTheme') !== 'false';
        
        return `
            <div class="control-container">
                <div class="control-section">
                    <h3>🎨 Desktop Wallpaper</h3>
                    <label class="win-checkbox" style="margin-bottom: 8px;">
                        <input type="checkbox" id="autoThemeEnabled" ${ControlApp.autoTheme ? 'checked' : ''}>
                        Auto theme (Dark 19:00-7:00, Light otherwise)
                    </label>
                    <div class="theme-options expanded">
                        <div class="theme-option ${ControlApp.currentTheme === 'default' ? 'selected' : ''}" data-theme="default">
                            <div class="theme-preview teal"></div>
                            <span class="theme-name">Teal</span>
                        </div>
                        <div class="theme-option ${ControlApp.currentTheme === 'dark' ? 'selected' : ''}" data-theme="dark">
                            <div class="theme-preview dark"></div>
                            <span class="theme-name">Dark</span>
                        </div>
                        <div class="theme-option ${ControlApp.currentTheme === 'hotdog' ? 'selected' : ''}" data-theme="hotdog">
                            <div class="theme-preview hotdog"></div>
                            <span class="theme-name">Hot Dog</span>
                        </div>
                        <div class="theme-option ${ControlApp.currentTheme === 'matrix' ? 'selected' : ''}" data-theme="matrix">
                            <div class="theme-preview matrix"></div>
                            <span class="theme-name">Matrix</span>
                        </div>
                        <div class="theme-option ${ControlApp.currentTheme === 'clouds' ? 'selected' : ''}" data-theme="clouds">
                            <div class="theme-preview clouds"></div>
                            <span class="theme-name">Clouds</span>
                        </div>
                        <div class="theme-option ${ControlApp.currentTheme === 'win95' ? 'selected' : ''}" data-theme="win95">
                            <div class="theme-preview win95"></div>
                            <span class="theme-name">Win 95</span>
                        </div>
                        <div class="theme-option ${ControlApp.currentTheme === 'win98' ? 'selected' : ''}" data-theme="win98">
                            <div class="theme-preview win98"></div>
                            <span class="theme-name">Win 98</span>
                        </div>
                        <div class="theme-option ${ControlApp.currentTheme === 'macos' ? 'selected' : ''}" data-theme="macos">
                            <div class="theme-preview macos"></div>
                            <span class="theme-name">Classic Mac</span>
                        </div>
                        <div class="theme-option ${ControlApp.currentTheme === 'ubuntu' ? 'selected' : ''}" data-theme="ubuntu">
                            <div class="theme-preview ubuntu"></div>
                            <span class="theme-name">Ubuntu</span>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <h3>📺 Display Effects</h3>
                    <label class="win-checkbox">
                        <input type="checkbox" id="crtEnabled" ${ControlApp.crtEnabled ? 'checked' : ''}>
                        CRT Scanline Effect (retro monitor look)
                    </label>
                </div>

                <div class="control-section">
                    <h3>🔊 Sound Settings</h3>
                    <label class="win-checkbox">
                        <input type="checkbox" id="soundEnabled" ${SoundManager.enabled ? 'checked' : ''}>
                        Enable system sounds
                    </label>
                    <div style="margin-top: 10px;">
                        <label style="font-size: 12px;">Volume:</label>
                        <input type="range" class="win-slider" id="volumeSlider" 
                            min="0" max="100" value="${SoundManager.volume * 100}" 
                            style="width: 150px; margin-left: 10px;">
                    </div>
                </div>

                <div class="control-section">
                    <h3>💾 Session Management</h3>
                    <p style="font-size: 11px; color: #808080; margin-bottom: 8px;">
                        Window positions and open apps are saved automatically.
                    </p>
                    <button class="win-btn" id="clearSessionBtn">🗑️ Clear Saved Session</button>
                </div>

                <div class="control-section">
                    <h3>ℹ️ About</h3>
                    <div class="inset-panel">
                        <p style="font-size: 12px; margin-bottom: 5px;"><strong>Portfolio OS v1.0</strong></p>
                        <p style="font-size: 11px; color: #808080;">
                            A Windows 3.1 inspired portfolio<br>
                            Built with vanilla JavaScript<br>
                            © 2026 Aleks Szotek
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    onInit() {
        const window = document.querySelector('#window-control');
        if (!window) return;

        // Theme selection
        window.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                ControlApp.setTheme(theme);
                
                // Disable auto theme when manually selecting
                ControlApp.autoTheme = false;
                localStorage.setItem('autoTheme', 'false');
                const autoCheckbox = window.querySelector('#autoThemeEnabled');
                if (autoCheckbox) autoCheckbox.checked = false;
                
                // Update UI
                window.querySelectorAll('.theme-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                
                SoundManager.play('click');
            });
        });

        // Auto theme toggle
        const autoThemeCheckbox = window.querySelector('#autoThemeEnabled');
        autoThemeCheckbox?.addEventListener('change', (e) => {
            ControlApp.autoTheme = e.target.checked;
            localStorage.setItem('autoTheme', e.target.checked);
            if (e.target.checked) {
                ControlApp.applyAutoTheme();
                // Update UI to show current auto-selected theme
                ControlApp.updateThemeUI();
            }
            SoundManager.play('click');
        });

        // Sound toggle
        const soundCheckbox = window.querySelector('#soundEnabled');
        soundCheckbox?.addEventListener('change', (e) => {
            SoundManager.enabled = e.target.checked;
            if (SoundManager.enabled) SoundManager.play('click');
        });

        // Sync checkbox when sound is changed from taskbar
        SoundManager.addChangeListener((enabled) => {
            if (soundCheckbox) {
                soundCheckbox.checked = enabled;
            }
        });

        // CRT Effect toggle
        const crtCheckbox = window.querySelector('#crtEnabled');
        crtCheckbox?.addEventListener('change', (e) => {
            ControlApp.crtEnabled = e.target.checked;
            document.body.classList.toggle('crt-effect', e.target.checked);
            localStorage.setItem('crtEffect', e.target.checked);
            SoundManager.play('click');
        });

        // Volume slider
        const volumeSlider = window.querySelector('#volumeSlider');
        volumeSlider?.addEventListener('input', (e) => {
            SoundManager.setVolume(e.target.value / 100);
        });

        // Clear session button
        const clearBtn = window.querySelector('#clearSessionBtn');
        clearBtn?.addEventListener('click', async () => {
            const { DialogManager } = await import('../managers/DialogManager.js');
            const confirmed = await DialogManager.confirm(
                'Clear all saved window positions and session data?\n\nThis will reset to default on next refresh.',
                'Clear Session Data'
            );
            if (confirmed) {
                WindowManager.clearSavedState();
                SoundManager.play('click');
                await DialogManager.alert('Session data cleared! Refresh to see default layout.', 'Success');
            }
        });
    },

    setTheme(themeName) {
        ControlApp.currentTheme = themeName;
        
        // Remove all theme classes
        document.body.removeAttribute('data-theme');
        
        if (themeName !== 'default') {
            document.body.setAttribute('data-theme', themeName);
        }

        // Save to localStorage
        localStorage.setItem('portfolio-theme', themeName);
    },

    updateThemeUI() {
        // Update theme selection UI in Control Panel
        const window = document.querySelector('#window-control');
        if (!window) return;
        
        window.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.theme === ControlApp.currentTheme) {
                option.classList.add('selected');
            }
        });
    },

    applyAutoTheme() {
        const hour = new Date().getHours();
        // Dark theme from 19:00 (7pm) to 7:00 (7am)
        const isDarkTime = hour >= 19 || hour < 7;
        const theme = isDarkTime ? 'dark' : 'default';
        ControlApp.setTheme(theme);
        ControlApp.currentTheme = theme;
    },

    loadSavedTheme() {
        // Check auto theme first
        const autoTheme = localStorage.getItem('autoTheme');
        ControlApp.autoTheme = autoTheme !== 'false'; // Default true
        
        if (ControlApp.autoTheme) {
            ControlApp.applyAutoTheme();
        } else {
            const saved = localStorage.getItem('portfolio-theme');
            if (saved) {
                ControlApp.currentTheme = saved;
                ControlApp.setTheme(saved);
            }
        }
        
        // Load CRT effect
        const crtSaved = localStorage.getItem('crtEffect');
        if (crtSaved === 'true') {
            ControlApp.crtEnabled = true;
            document.body.classList.add('crt-effect');
        }
    }
};

export default ControlApp;
