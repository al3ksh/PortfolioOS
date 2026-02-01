/**
 * README App - Welcome/Onboarding text
 */

import { Icons } from '../icons.js';

export const ReadmeApp = {
    id: 'readme',
    title: 'README.TXT',
    icon: Icons.readme,
    width: 500,
    height: 520,
    hasMenu: false,
    resizable: true,

    render() {
        return `
            <div class="readme-content">
                <p>═══════════════════════════════════════════</p>
                <p>         <span class="highlight">PORTFOLIO OS v1.0</span></p>
                <p>═══════════════════════════════════════════</p>
                <br>
                <p>Welcome to my digital portfolio!</p>
                <br>
                <p>This operating system was created</p>
                <p>to showcase my web development</p>
                <p>skills in an interactive way.</p>
                <br>
                <p>HOW TO USE:</p>
                <p>────────────────────</p>
                <p>• Double click = open application</p>
                <p>• Drag window = move it around</p>
                <p>• Buttons [-][□][×] = window controls</p>
                <p>• Start Menu = access everything</p>
                <br>
                <p>AVAILABLE APPLICATIONS:</p>
                <p>────────────────────</p>
                <p>📁 PORTFOLIO.EXE - My projects & bio</p>
                <p>📝 NOTEPAD.EXE  - Notepad with save</p>
                <p>🎵 TUNES.EXE    - Background music</p>
                <p>💣 MINES.EXE    - Classic Minesweeper</p>
                <p>🐍 SNAKE.EXE    - Classic Snake</p>
                <p>🧱 TETRIS.EXE   - Classic Tetris</p>
                <p>🎨 PAINT.EXE    - Draw & paint</p>
                <p>🖩 CALC.EXE     - Calculator</p>
                <p>💻 TERMINAL.EXE - Command line</p>
                <p>📊 TASKMGR.EXE  - Task Manager</p>
                <p>📂 EXPLORER.EXE - File browser</p>
                <p>ℹ️ SYSINFO.EXE  - System info</p>
                <p>📧 CONTACT.EXE  - Contact form</p>
                <p>⚙️ CONTROL.CPL  - Control Panel</p>
                <br>
                <p>THEMES:</p>
                <p>────────────────────</p>
                <p>Available in Control Panel:</p>
                <p>Teal, Dark, Hotdog Stand, Matrix,</p>
                <p>Clouds, Win95, Win98, macOS, Ubuntu</p>
                <p>+ Auto-theme (dark mode 19:00-7:00)</p>
                <br>
                <details class="readme-spoiler">
                    <summary>🔐 HIDDEN SECRETS (SPOILER)</summary>
                    <div class="spoiler-content">
                        <br>
                        <p>Easter Eggs to discover:</p>
                        <p>────────────────────</p>
                        <p>🎬 Close Portfolio.exe 3 times</p>
                        <p>   → Dramatic animation!</p>
                        <br>
                        <p>📺 Matrix Screensaver</p>
                        <p>   → Control Panel → Screen Saver</p>
                        <br>
                        <p>🎮 Hidden Terminal commands:</p>
                        <p>   → "matrix" - Matrix effect</p>
                        <p>   → "hack" - Hacker simulation</p>
                        <p>   → "fortune" - Fortune cookie</p>
                        <p>   → "cowsay" - Talking cow</p>
                        <p>   → "sl" - Train goes choo</p>
                        <br>
                        <p>🖼️ CRT Effect in Control Panel</p>
                        <p>   → Retro monitor vibes</p>
                        <br>
                        <p>🔊 System sounds</p>
                        <p>   → Enable in Control Panel</p>
                        <br>
                        <p>⌨️ Keyboard shortcuts:</p>
                        <p>   → F11 = Fullscreen</p>
                    </div>
                </details>
                <br>
                <p>═══════════════════════════════════════════</p>
                <p>       (C) 2026 Portfolio OS Team</p>
                <p>═══════════════════════════════════════════</p>
            </div>
        `;
    }
};

export default ReadmeApp;
