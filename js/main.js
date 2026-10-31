/**
 * Portfolio OS - Main Entry Point
 * Windows 3.1 Style Interactive Desktop Environment
 */

import { WindowManager } from './managers/WindowManager.js?v=16';
import { SoundManager } from './managers/SoundManager.js?v=16';
import { DesktopGridManager } from './managers/DesktopGridManager.js?v=16';
import { StorageManager } from './managers/StorageManager.js?v=16';
import { DialogManager } from './managers/DialogManager.js?v=16';
import { DesktopIcon } from './components/DesktopIcon.js?v=16';
import { TaskbarPreview } from './components/TaskbarPreview.js?v=16';
import { Icons } from './icons.js?v=16';
import { ScreenSaver } from './managers/ScreenSaver.js?v=16';
import { BiosSetup } from './components/BiosSetup.js?v=16';
import { getSetting } from './settings.js?v=16';
import { lang, t, setLanguage, applyStaticTranslations } from './i18n.js?v=16';

function replaceDataIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const key = el.getAttribute('data-icon');
        if (Icons[key]) {
            el.innerHTML = Icons[key];
            el.setAttribute('data-icon-replaced', '');
        }
    });
}
import { Apps } from './apps/index.js?v=16';
import { ControlApp } from './apps/ControlApp.js?v=16';

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

        startBtn?.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!TaskbarManager.startMenuOpen) TaskbarManager.toggleStartMenu();
                document.querySelector('.start-item')?.focus();
            }
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
                } else if (item.dataset.action === 'shutdown') {
                    TaskbarManager.closeStartMenu();
                    TaskbarManager.shutDown();
                }
            });
            item.addEventListener('keydown', (event) => {
                const items = [...document.querySelectorAll('.start-item')];
                const currentIndex = items.indexOf(item);
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    const nextIndex = event.key === 'ArrowDown'
                        ? (currentIndex + 1) % items.length
                        : (currentIndex - 1 + items.length) % items.length;
                    items[nextIndex]?.focus();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    TaskbarManager.closeStartMenu();
                    startBtn?.focus();
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

        // Language toggle (EN/PL indicator, like the Windows language bar)
        const langBtn = document.getElementById('langToggle');
        if (langBtn) {
            langBtn.innerHTML = lang === 'pl' ? Icons.flagPL : Icons.flagEN;
            langBtn.addEventListener('click', () => setLanguage(lang === 'en' ? 'pl' : 'en'));
        }

        // Sound toggle button
        const soundBtn = document.querySelector('.taskbar-tray .tray-icon');
        
        // Initialize sound icon based on current state
        if (soundBtn) {
            const initialEnabled = SoundManager.enabled;
            soundBtn.innerHTML = initialEnabled ? Icons.statusSpeakerOn : Icons.statusSpeakerOff;
            soundBtn.title = initialEnabled ? 'Sound: ON' : 'Sound: OFF';
        }
        
        soundBtn?.addEventListener('click', () => {
            const enabled = SoundManager.toggle();
                soundBtn.innerHTML = enabled ? Icons.statusSpeakerOn : Icons.statusSpeakerOff;
            soundBtn.title = enabled ? 'Sound: ON' : 'Sound: OFF';
        });

        // Sync sound icon when changed from Control Panel
        SoundManager.addChangeListener((enabled) => {
            if (soundBtn) {
            soundBtn.innerHTML = enabled ? Icons.statusSpeakerOn : Icons.statusSpeakerOff;
                soundBtn.title = enabled ? 'Sound: ON' : 'Sound: OFF';
            }
        });

        // Listen for window events
        WindowManager.onWindowChange = TaskbarManager.updateTaskbar;
    }

    // Start > Shut Down: the Windows 95 dialog with a way back to the landing page
    static shutDown() {
        const choices = ['home', 'restart', 'off'];
        const dialog = DialogManager.createDialog({
            title: t('shutdown.title'),
            content: `
                <div class="shutdown-dialog">
                    <span class="shutdown-icon">${Icons.smShutdown}</span>
                    <fieldset class="shutdown-choices">
                        <legend>${t('shutdown.question')}</legend>
                        ${choices.map((choice, i) => `<label><input type="radio" name="shutdown" value="${choice}"${i === 0 ? ' checked' : ''}> ${t(`shutdown.${choice}`)}</label>`).join('')}
                    </fieldset>
                </div>
            `,
            buttons: [
                { label: t('shutdown.ok'), action: 'ok', primary: true },
                { label: t('shutdown.cancel'), action: 'cancel' }
            ],
            onClose: (action) => {
                if (action === 'ok') TaskbarManager.runShutdown(dialog.querySelector('input[name="shutdown"]:checked')?.value);
            }
        });
        DialogManager.show(dialog);
    }

    static runShutdown(choice) {
        // Leaving on purpose: no "open windows" prompt
        document.documentElement.dataset.reloading = 'true';
        if (choice === 'home') {
            // Chose the landing page, so stop skipping it on the next visit
            try { localStorage.removeItem('osVisited'); } catch { /* storage blocked */ }
            location.href = lang === 'pl' ? 'pl.html' : './';
            return;
        }
        sessionStorage.removeItem('hasBooted');
        if (choice === 'restart') {
            location.reload();
            return;
        }
        SoundManager.play('close');
        const screen = document.createElement('div');
        screen.className = 'shutdown-screen';
        screen.setAttribute('role', 'button');
        screen.tabIndex = 0;
        const [title, line] = TaskbarManager.shutdownLine();
        // Text is drawn as real pixels, scaled by whole numbers to fit the screen
        const text = (value, options, maxScale) => {
            const bitmap = TaskbarManager.pixelText(value, options);
            const scale = Math.max(1, Math.min(maxScale, Math.floor(window.innerWidth * 0.9 / bitmap.width)));
            return `<img src="${bitmap.url}" alt="${value.replace(/"/g, '&quot;')}" width="${bitmap.width * scale}" height="${bitmap.height * scale}">`;
        };
        screen.innerHTML = `
            <canvas class="sd-scene" width="160" height="56" aria-hidden="true"></canvas>
            <h1 class="sd-title">${text(title, { size: 11, color: '#F0F0F0', shadow: '#0000AA' }, 3)}</h1>
            <p class="sd-line">${text(line, { size: 11, color: '#FF9A1F' }, 2)}</p>
            <p class="sd-again">${text(t('shutdown.again'), { size: 11, color: '#6A6A6A' }, 2)}<span class="sd-cursor"></span></p>
        `;
        const restart = () => location.reload();
        screen.addEventListener('click', restart);
        screen.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') restart();
        });
        document.body.appendChild(screen);
        TaskbarManager.playShutdownScene(screen.querySelector('.sd-scene'));
        screen.focus();
    }

    // A random goodbye; a real Snake high score gets its own roast
    static shutdownLine() {
        const lines = [...t('shutdown.lines')];
        let snake = 0;
        try { snake = parseInt(localStorage.getItem('snakeHighScore') || '0', 10); } catch { /* storage blocked */ }
        if (snake > 0) lines.push(t('shutdown.snake').map(text => text.replace('{n}', snake)));
        return lines[Math.floor(Math.random() * lines.length)];
    }

    // Draws text without anti-aliasing, so it scales up into crisp pixels. Bold is the old bitmap-font
    // trick (the same text again 1px to the right), plus an optional 1px drop shadow.
    static pixelText(text, { size = 11, color = '#FFF', shadow = null, bold = false } = {}) {
        const font = `${size}px Tahoma, Verdana, sans-serif`;
        const measure = document.createElement('canvas').getContext('2d');
        measure.font = font;
        const width = Math.ceil(measure.measureText(text).width) + 3;
        const height = Math.ceil(size * 1.35) + 1;
        const layer = (fill) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.font = font;
            ctx.textBaseline = 'top';
            ctx.fillStyle = fill;
            ctx.fillText(text, 0, Math.round(size * 0.12));
            if (bold) ctx.fillText(text, 1, Math.round(size * 0.12));
            const image = ctx.getImageData(0, 0, width, height);
            for (let i = 3; i < image.data.length; i += 4) image.data[i] = image.data[i] >= 140 ? 255 : 0;
            ctx.putImageData(image, 0, 0);
            return canvas;
        };
        const out = document.createElement('canvas');
        out.width = width + 1;
        out.height = height + 1;
        const ctx = out.getContext('2d');
        if (shadow) ctx.drawImage(layer(shadow), 1, 1);
        ctx.drawImage(layer(color), 0, 0);
        return { canvas: out, url: out.toDataURL(), width: out.width, height: out.height };
    }

    // Pixel scene on a 160x56 canvas, played frame by frame at 12 fps like an old sprite game:
    // a little guy carries the computer to the bin and throws it in
    static playShutdownScene(canvas) {
        const scale = Math.max(1, Math.min(4, Math.floor(window.innerWidth * 0.92 / canvas.width)));
        canvas.style.width = `${canvas.width * scale}px`;
        canvas.style.height = `${canvas.height * scale}px`;
        const ctx = canvas.getContext('2d');
        const px = (x, y, w, h, fill) => { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); };

        // The computer as a sprite, with its three turns pre-drawn so it spins in 90° steps
        const colors = { B: '#D4CBB0', D: '#A69C80', N: '#0000AA', W: '#FFFFFF', L: '#AAAAFF', G: '#00E000' };
        const crt = [
            'BBBBBBBBBBBB',
            'BBNNNNNNNNBB',
            'BBNWWWWNNNBB',
            'BBNNNNNNNNBB',
            'BBNLLLLLLNBB',
            'BBNNNNNNNNBB',
            'BBNNNNNNNNBB',
            'BBBBBBBBBBGB',
            'DDDDDDDDDDDD',
            '....DDDD....'
        ];
        const turn = rows => [...rows[0]].map((_, x) => rows.map(row => row[x]).reverse().join(''));
        const crtTurns = [crt, turn(crt), turn(turn(crt)), turn(turn(turn(crt)))];
        // Drawn around its centre, so the turns stay in place
        const drawCrt = (rows, cx, cy) => {
            const left = Math.round(cx - rows[0].length / 2), top = Math.round(cy - rows.length / 2);
            rows.forEach((row, y) => [...row].forEach((c, x) => { if (colors[c]) px(left + x, top + y, 1, 1, colors[c]); }));
        };
        const glyph = ['###', '#.#', '###', '..#', '###'];
        const clang = TaskbarManager.pixelText(t('shutdown.clang'), { size: 11, color: '#FFE066', shadow: '#8A5A00', bold: true });
        const skin = '#F1C27D', shirt = '#00A0A0', pants = '#2B2B7A';

        const drawGuy = (x, pose, step, f) => {
            const at = (dx, dy, w, h, fill) => px(x + dx, dy, w, h, fill);
            at(3, 33, 5, 1, '#3B2414'); at(3, 34, 5, 4, skin); at(6, 35, 1, 1, '#000');
            at(3, 38, 5, 6, shirt);
            if (step) { at(2, 44, 2, 5, pants); at(7, 44, 2, 5, pants); at(1, 49, 3, 1, '#222'); at(7, 49, 3, 1, '#222'); }
            else { at(3, 44, 2, 5, pants); at(6, 44, 2, 5, pants); at(3, 49, 3, 1, '#222'); at(6, 49, 3, 1, '#222'); }
            if (pose === 'carry') { at(2, 31, 1, 8, shirt); at(8, 31, 1, 8, shirt); at(2, 30, 1, 1, skin); at(8, 30, 1, 1, skin); }
            if (pose === 'windup') { at(1, 34, 1, 5, shirt); at(7, 34, 1, 5, shirt); at(1, 33, 1, 1, skin); at(7, 33, 1, 1, skin); }
            if (pose === 'throw') { at(2, 38, 1, 5, shirt); at(8, 37, 1, 1, shirt); at(9, 36, 1, 1, shirt); at(10, 35, 1, 1, shirt); at(11, 34, 1, 1, skin); }
            if (pose === 'down') { at(2, 38, 1, 5, shirt); at(8, 38, 1, 5, shirt); at(2, 43, 1, 1, skin); at(8, 43, 1, 1, skin); }
            if (f >= 42) {
                at(11, 24, 13, 7, '#F0F0F0'); at(11, 31, 2, 2, '#F0F0F0');
                [13, 17].forEach(left => glyph.forEach((row, y) => [...row].forEach((on, gx) => { if (on === '#') at(left + gx, 25 + y, 1, 1, '#000'); })));
            }
        };

        const drawBin = (shake, lid) => {
            const at = (x, y, w, h, fill) => px(x + shake, y, w, h, fill);
            if (lid !== 'closed') at(117, 32, 16, 2, '#1A1A1A');
            return () => {
                // Stepped sides instead of a slanted line
                at(116, 34, 18, 6, '#C0C0C0'); at(117, 40, 16, 5, '#C0C0C0'); at(118, 45, 14, 5, '#C0C0C0');
                at(133, 34, 1, 6, '#808080'); at(132, 40, 1, 5, '#808080'); at(131, 45, 1, 5, '#808080');
                at(116, 34, 18, 1, '#FFFFFF');
                [120, 124, 128].forEach(x => at(x, 37, 1, 11, '#808080'));
                if (lid === 'closed' || lid === 'bounce') {
                    const y = lid === 'bounce' ? -2 : 0;
                    at(115, 31 + y, 20, 3, '#A0A0A0'); at(115, 31 + y, 20, 1, '#E0E0E0'); at(122, 29 + y, 6, 2, '#808080');
                } else if (lid === 'half') {
                    for (let i = 0; i < 14; i++) at(133 - i, 31 - i, 3, 3, i === 0 ? '#808080' : '#A0A0A0');
                } else {
                    at(133, 12, 3, 22, '#A0A0A0'); at(133, 12, 1, 22, '#E0E0E0'); at(136, 19, 2, 6, '#808080');
                }
            };
        };

        // f = frame number: walk 0-23, wind-up 24-26, throw 27-34, lid slam + CLANG 36, then the guy is pleased with himself
        const frame = (f) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            px(0, 50, 160, 1, '#3A3A3A');
            const gx = 4 + Math.min(f, 24) * 3;
            const pose = f < 24 ? 'carry' : f < 27 ? 'windup' : f < 34 ? 'throw' : 'down';
            drawGuy(gx, pose, f < 24 && Math.floor(f / 2) % 2 === 1, f);

            const lid = f >= 30 && f <= 34 ? 'open' : f === 29 || f === 35 ? 'half' : f === 37 ? 'bounce' : 'closed';
            const shake = [1, -1, 1][f - 36] || 0;
            const binFront = drawBin(shake, lid);
            if (f < 24) drawCrt(crtTurns[0], gx + 5, 26);
            else if (f < 27) drawCrt(crtTurns[0], gx + 2, 28);
            else if (f <= 34) {
                const p = (f - 26) / 8;
                drawCrt(crtTurns[(f - 26) % 4], 78 + 47 * p, 28 + 9 * p - 88 * p * (1 - p));
            }
            binFront();

            if (f >= 36 && f < 44) {
                const out = Math.floor((f - 36) / 2), up = Math.floor((f - 36) / 3);
                px(113 - out, 31 - up, 2, 2, '#BBBBBB'); px(136 + out, 30 - up, 2, 2, '#BBBBBB');
                px(111 - out * 2, 36 - up, 1, 1, '#999999'); px(140 + out * 2, 35 - up, 1, 1, '#999999');
            }
            if (f >= 36 && f < 56) {
                const y = 17 - Math.floor(clang.height / 2) + (f === 36 ? 2 : 0) - (f >= 50 ? Math.floor((f - 50) / 2) : 0);
                ctx.drawImage(clang.canvas, 125 - Math.floor(clang.width / 2), y);
            }
        };

        const LAST = 60;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { frame(LAST); return; }
        frame(0);
        setTimeout(() => {
            let f = 0;
            const timer = setInterval(() => {
                frame(++f);
                if (f >= LAST) clearInterval(timer);
            }, 1000 / 12);
        }, 300);
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
        document.querySelector('.start-button')?.setAttribute('aria-expanded', String(TaskbarManager.startMenuOpen));
        SoundManager.play('click');
    }

    static closeStartMenu() {
        const menu = document.querySelector('.start-menu');
        if (menu && TaskbarManager.startMenuOpen) {
            menu.classList.remove('open');
            TaskbarManager.startMenuOpen = false;
            document.querySelector('.start-button')?.setAttribute('aria-expanded', 'false');
        }
    }

    static updateTaskbar() {
        const container = document.querySelector('.taskbar-windows');
        if (!container) return;

        // The buttons are rebuilt, so a preview would point at a detached one
        TaskbarPreview.hide();
        container.innerHTML = '';

        // Add button for each open window
        WindowManager.windows.forEach((win, id) => {
            const app = Apps[id];
            if (!app) return;

            const btn = document.createElement('button');
            btn.className = 'taskbar-window-btn';
            btn.dataset.windowId = id;
            if (WindowManager.activeWindow === id) {
                btn.classList.add('active');
            }
            
            // Apps such as Notepad rename their window ("Notepad - notes.txt")
            const title = win?.title || app.title;
            btn.innerHTML = `<span class="taskbar-window-icon">${app.icon}</span><span></span>`;
            btn.lastElementChild.textContent = title;
            btn.title = title;
            btn.setAttribute('aria-label', title);
            
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
            TaskbarPreview.attach(btn, id);

            container.appendChild(btn);
        });

        // On narrow screens the strip scrolls, so keep the active window's button visible
        container.querySelector('.taskbar-window-btn.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    static addWindow(id, title, icon) {
        TaskbarManager.updateTaskbar();
    }

    static removeWindow(id) {
        TaskbarManager.updateTaskbar();
    }
}

// ===========================================
// KONAMI CODE EASTER EGG
// ===========================================

class KonamiCode {
    static sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    static position = 0;

    static init() {
        if (sessionStorage.getItem('konamiWallpaper') === '1') {
            document.getElementById('desktop')?.classList.add('konami-wallpaper');
        }
        document.addEventListener('keydown', (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (key === KonamiCode.sequence[KonamiCode.position]) {
                KonamiCode.position++;

                if (KonamiCode.position === KonamiCode.sequence.length) {
                    KonamiCode.activate();
                    KonamiCode.position = 0;
                }
            } else {
                KonamiCode.position = key === 'ArrowUp' ? Math.min(KonamiCode.position, 2) || 1 : 0;
            }
        });
    }

    // Toggles a hidden synthwave wallpaper, shakes the desktop and cheers via the face.
    static activate() {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;
        const enabled = !desktop.classList.contains('konami-wallpaper');

        SoundManager.play('powerup');
        desktop.classList.remove('konami-shake');
        void desktop.offsetWidth;
        desktop.classList.add('konami-shake');
        setTimeout(() => desktop.classList.remove('konami-shake'), 700);

        desktop.classList.toggle('konami-wallpaper', enabled);
        if (enabled) sessionStorage.setItem('konamiWallpaper', '1');
        else sessionStorage.removeItem('konamiWallpaper');

        document.dispatchEvent(new CustomEvent('face:react', {
            detail: enabled
                ? { mood: 'wow', text: t('face.say.konami') }
                : { mood: 'wink', text: t('face.say.konamiOff') }
        }));
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
        this.skipRequested = false;
        this.finished = false;
        this.lines = [
            { el: document.getElementById('bootLine1'), memoryTest: true, delay: 400 },
            { el: document.getElementById('bootLine2'), text: 'Loading Portfolio OS v1.0...', delay: 600 },
            { el: document.getElementById('bootLine3'), text: 'Starting Desktop Manager...', delay: 400 }
        ];
        
        // Set up global error handler
        this.setupErrorHandler();
        this.setupSkipHandler();
    }

    setupSkipHandler() {
        document.addEventListener('keydown', (event) => {
            const activeTag = document.activeElement?.tagName;
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag);

            if (!this.bootScreen || this.bootScreen.classList.contains('hidden') || isTyping) {
                return;
            }

            if ((event.key === 'Delete' || event.key === 'F2') && this.biosWindowOpen) {
                event.preventDefault();
                this.enterBios();
            } else if (event.code === 'Space' || event.key === 'Enter') {
                event.preventDefault();
                this.requestSkip();
            }
        });

        const hint = document.getElementById('biosHint');
        hint?.addEventListener('click', () => this.enterBios());
        hint?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                this.enterBios();
            }
        });
    }

    // Like a real POST screen, the "Press DEL" prompt is only shown (and DEL only
    // works) while the memory test runs. `bios` in the Terminal passes force.
    setBiosWindow(open) {
        this.biosWindowOpen = open;
        const hint = document.getElementById('biosHint');
        if (hint) hint.hidden = !open;
    }

    async enterBios(force = false) {
        if (this.finished || BiosSetup.isOpen || !(force || this.biosWindowOpen)) return;
        this.setBiosWindow(false);
        this.skipRequested = true;
        await BiosSetup.open();
        this.finishBoot();
    }

    requestSkip() {
        if (this.finished || this.skipRequested) return;
        this.skipRequested = true;
        this.finishBoot();
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
                ${Icons.statusWarning} SYSTEM ERROR - Boot Failed
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
                ">${Icons.statusRestart} Restart System</button>
                <button onclick="sessionStorage.clear(); localStorage.clear(); location.reload()" style="
                    background: #333;
                    color: #FF5;
                    border: 1px solid #FF5;
                    padding: 8px 20px;
                    font-family: 'Courier New', monospace;
                    cursor: pointer;
                ">${Icons.statusWrench} Reset & Restart</button>
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
            // Saving can be switched off on the Cookies page; respect that choice
            StorageManager.wrapLocalStorage();

            // `bios` in the Terminal reboots straight into setup
            if (sessionStorage.getItem('enterBios')) {
                sessionStorage.removeItem('enterBios');
                await this.enterBios(true);
                return;
            }

            // Check if already booted this session
            if (sessionStorage.getItem('hasBooted')) {
                this.skipBoot();
                return;
            }

            if (getSetting('quickBoot') === 'true') {
                this.finishBoot();
                return;
            }

            await this.typeLines();
            if (this.skipRequested || this.finished) return;
            await this.sleep(500);
            if (this.skipRequested || this.finished) return;
            this.finishBoot();
        } catch (error) {
            this.showBootError(error.message, error.stack, null);
        }
    }

    async typeLines() {
        for (const line of this.lines) {
            if (this.skipRequested) return;
            if (line.memoryTest) {
                this.setBiosWindow(true);
                await this.memoryTest(line.el);
                await this.sleep(line.delay);
                this.setBiosWindow(false);
            } else {
                await this.typeLine(line.el, line.text);
                await this.sleep(line.delay);
            }
        }
    }

    async memoryTest(element) {
        if (!element) return;
        await this.typeLine(element, 'Checking Memory... ');
        for (let kb = 64; kb <= 640; kb += 64) {
            if (this.skipRequested) return;
            element.textContent = `Checking Memory... ${kb}K`;
            await this.sleep(110);
        }
        element.textContent = 'Checking Memory... 640K OK';
    }

    async typeLine(element, text) {
        if (!element) return;
        
        for (let i = 0; i <= text.length; i++) {
            if (this.skipRequested) return;
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
            if (this.finished) return;
            this.finished = true;
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

        // The landing page sends returning visitors straight here (blocked when saving is off)
        try { localStorage.setItem('osVisited', '1'); } catch { /* storage blocked */ }
        
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
        
        // Replace data-icon placeholders with SVG icons
        replaceDataIcons();
        
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
        // Reloads started by the OS itself (language switch, `bios`) set data-reloading.
        window.addEventListener('beforeunload', (e) => {
            if (document.documentElement.dataset.reloading) return;
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
        { appId: 'projects', title: 'Projects.exe', icon: Icons.projects },
        { appId: 'network', title: 'Network.exe', icon: Icons.network },
        { appId: 'readme', title: 'README.TXT', icon: Icons.readme },
        { appId: 'contact', title: 'Contact.exe', icon: Icons.contact },
        { appId: 'notepad', title: 'Notepad.exe', icon: Icons.notepad },
        { appId: 'terminal', title: 'Terminal.exe', icon: Icons.terminal },
        { appId: 'explorer', title: 'Explorer.exe', icon: Icons.explorer },
        { appId: 'browser', title: 'Internet.exe', icon: Icons.browser },
        { appId: 'simplemode', title: 'Simple View', icon: Icons.simplemode },
        { appId: 'paint', title: 'Paint.exe', icon: Icons.paint },
        { appId: 'calc', title: 'Calc.exe', icon: Icons.calc },
        { appId: 'tunes', title: 'Tunes.exe', icon: Icons.tunes },
        { appId: 'mines', title: 'Mines.exe', icon: Icons.mines },
        { appId: 'snake', title: 'Snake.exe', icon: Icons.snake },
        { appId: 'tetris', title: 'Blocks.exe', icon: Icons.tetris },
        { appId: 'sysinfo', title: 'System Info', icon: Icons.sysinfo },
        { appId: 'taskmgr', title: 'Task Manager', icon: Icons.taskmgr },
        { appId: 'control', title: 'Control.cpl', icon: Icons.control },
        { appId: 'recycle', title: 'Recycle Bin', icon: Icons.recycle }
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

    const locale = lang === 'pl' ? 'pl-PL' : 'en-US';
    const shortDate = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
    const longDate = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' });
    const dayName = new Intl.DateTimeFormat(locale, { weekday: 'long' });

    function updateClock() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        if (dateEl) {
            dateEl.textContent = shortDate.format(now);
        }
        const calTime = document.querySelector('.calendar-popup .calendar-time');
        if (calTime) {
            calTime.textContent = now.toLocaleTimeString('en-GB');
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
                    <span class="calendar-day-name">${dayName.format(now)}</span>
                    <button type="button" class="calendar-full-date" data-cal="today" title="${lang === 'pl' ? 'Dzisiaj' : 'Today'}">${longDate.format(now)}</button>
                </div>
                <div class="calendar-time">${now.toLocaleTimeString('en-GB')}</div>
                <div class="calendar-nav">
                    <button type="button" class="calendar-nav-btn" data-cal="-1" aria-label="${lang === 'pl' ? 'Poprzedni miesiąc' : 'Previous month'}">◀</button>
                    <span class="calendar-month-name" aria-live="polite"></span>
                    <button type="button" class="calendar-nav-btn" data-cal="1" aria-label="${lang === 'pl' ? 'Następny miesiąc' : 'Next month'}">▶</button>
                </div>
                <div class="calendar-grid" role="grid"></div>
            `;
            document.body.appendChild(popup);

            let shown = new Date(now.getFullYear(), now.getMonth(), 1);
            renderCalendarMonth(popup, shown);
            popup.addEventListener('click', (e) => {
                const step = e.target.closest('[data-cal]')?.dataset.cal;
                if (!step) return;
                const today = new Date();
                shown = step === 'today'
                    ? new Date(today.getFullYear(), today.getMonth(), 1)
                    : new Date(shown.getFullYear(), shown.getMonth() + Number(step), 1);
                renderCalendarMonth(popup, shown);
            });

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

/** Fills the popup's grid with the month that starts at `first`; weeks start on Monday in Polish. */
function renderCalendarMonth(popup, first) {
    const locale = lang === 'pl' ? 'pl-PL' : 'en-US';
    const weekStart = lang === 'pl' ? 1 : 0;
    const today = new Date();
    const isToday = d => d.toDateString() === today.toDateString();

    popup.querySelector('.calendar-month-name').textContent =
        new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(first);

    // 2024-01-01 was a Monday, so day i of that week has getDay() === (i + 1) % 7
    const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
    const heads = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(2024, 0, 1 + ((weekStart + 6 + i) % 7));
        return `<span class="calendar-weekday" role="columnheader">${narrow.format(day)}</span>`;
    });

    // Always six rows so the popup does not jump in height between months
    const offset = (first.getDay() - weekStart + 7) % 7;
    const cells = Array.from({ length: 42 }, (_, i) => {
        const day = new Date(first.getFullYear(), first.getMonth(), 1 - offset + i);
        const classes = ['calendar-day'];
        if (day.getMonth() !== first.getMonth()) classes.push('other-month');
        if (isToday(day)) classes.push('today');
        return `<span class="${classes.join(' ')}" role="gridcell"${isToday(day) ? ' aria-current="date"' : ''}>${day.getDate()}</span>`;
    });

    popup.querySelector('.calendar-grid').innerHTML = heads.join('') + cells.join('');
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
    applyStaticTranslations();
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
