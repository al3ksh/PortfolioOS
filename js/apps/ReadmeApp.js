/**
 * README App - Welcome/Onboarding text
 */

import { Icons } from '../icons.js?v=15';
import { t } from '../i18n.js?v=15';

const lines = key => t(key).map(line => `<p>${line}</p>`).join('');
import { Profile, githubUrl } from '../config.js?v=15';

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
                <p>${t('readme.welcome')}</p>
                <br>
                ${lines('readme.intro')}
                <br>
                <p>${t('readme.howTo')}</p>
                <p>────────────────────</p>
                ${lines('readme.howToItems')}
                <br>
                <p>${t('readme.apps')}</p>
                <p>────────────────────</p>
                ${lines('readme.appItems')}
                <br>
                <p>${t('readme.themes')}</p>
                <p>────────────────────</p>
                ${lines('readme.themeItems')}
                <br>
                <details class="readme-spoiler">
                    <summary>${t('readme.secrets')}</summary>
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
                        <p>   → "neofetch" - System summary</p>
                        <p>   → "open website" - Open a link</p>
                        <p>   → "github" - Open GitHub profile</p>
                        <p>   → "clear" / "history" - Terminal basics</p>
                        <p>   → "hack" - Hacker simulation</p>
                        <p>   → "sudo", "format c:", "ping girlfriend" - Safe fake commands</p>
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
