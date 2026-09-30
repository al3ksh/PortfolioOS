/**
 * BIOS Setup - blue setup screen opened with DEL during boot (or `bios` in the Terminal).
 * Settings are real: theme, CRT, sound, language, quick boot and screen saver.
 */

import { Profile } from '../config.js?v=15';
import { lang, setLanguage } from '../i18n.js?v=15';
import { SoundManager } from '../managers/SoundManager.js?v=15';
import { SCREENSAVERS } from '../screensavers.js?v=15';
import { getSetting, setSetting } from '../settings.js?v=15';

const ON_OFF = [['true', 'Enabled'], ['false', 'Disabled']];
const THEMES = [['default', 'Teal'], ['dark', 'Dark'], ['hotdog', 'Hot Dog'], ['matrix', 'Matrix'], ['clouds', 'Clouds'], ['win95', 'Win 95'], ['win98', 'Win 98'], ['macos', 'Classic Mac'], ['ubuntu', 'Ubuntu']];

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const pad = value => String(value).padStart(2, '0');
const timeText = now => `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
const dateText = now => `[${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}]`;

function readValues() {
    return {
        autoTheme: getSetting('autoTheme') === 'false' ? 'false' : 'true',
        theme: getSetting('portfolio-theme') || 'default',
        crt: getSetting('crtEffect') === 'true' ? 'true' : 'false',
        sound: String(SoundManager.enabled),
        language: lang,
        quickBoot: getSetting('quickBoot') === 'true' ? 'true' : 'false',
        screensaver: getSetting('screensaver'),
        screensaverDelay: getSetting('screensaverDelay'),
        bootDevice: getSetting('bootDevice') || 'hdd'
    };
}

const DEFAULT_VALUES = {
    autoTheme: 'true', theme: 'default', crt: 'false', sound: 'false',
    quickBoot: 'false', screensaver: 'matrix', screensaverDelay: '1', bootDevice: 'hdd'
};

function infoItems() {
    const now = new Date();
    const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'unknown';
    return [
        { label: 'System Time', info: timeText(now), live: 'time' },
        { label: 'System Date', info: dateText(now), live: 'date' },
        { label: 'BIOS Version', info: 'PortfolioOS BIOS 1.2' },
        { label: 'Processor', info: `Human Brain @ variable MHz (${navigator.hardwareConcurrency || '?'} threads)` },
        { label: 'System Memory', info: `640 KB (${memory} reported)` },
        { label: 'Display', info: `${window.screen.width} x ${window.screen.height}` },
        { label: 'Registered To', info: Profile.name }
    ];
}

const TABS = [
    { name: 'Main', items: infoItems },
    {
        name: 'Advanced',
        items: () => [
            { label: 'Auto Theme (day/night)', key: 'autoTheme', options: ON_OFF, help: 'Dark theme from 19:00 to 7:00, light otherwise. Overrides the theme below.' },
            { label: 'Desktop Theme', key: 'theme', options: THEMES, help: 'Colour scheme of the desktop. Used when Auto Theme is disabled.' },
            { label: 'CRT Scanlines', key: 'crt', options: ON_OFF, help: 'Draws scanlines like an old monitor.' },
            { label: 'System Sounds', key: 'sound', options: ON_OFF, help: 'Clicks and chimes. Off by default.' },
            { label: 'Language', key: 'language', options: [['en', 'English'], ['pl', 'Polski']], help: 'Language of the portfolio. Changing it reloads the page.' }
        ]
    },
    {
        name: 'Boot',
        items: () => [
            { label: 'Quick Boot', key: 'quickBoot', options: ON_OFF, help: 'Skip the memory check animation on start.' },
            { label: '1st Boot Device', key: 'bootDevice', options: [['hdd', 'Hard Disk'], ['floppy', 'Floppy A:'], ['cdrom', 'CD-ROM'], ['network', 'Network']], help: 'Where to boot from. (It always boots the portfolio anyway.)' },
            { label: 'Screen Saver', key: 'screensaver', options: [['none', '(None)'], ...Object.entries(SCREENSAVERS).map(([key, saver]) => [key, saver.label])], help: 'Shown after the desktop has been idle.' },
            { label: 'Screen Saver Delay', key: 'screensaverDelay', options: [['1', '1 min'], ['3', '3 min'], ['5', '5 min'], ['10', '10 min']], help: 'Idle time before the screen saver starts.' }
        ]
    },
    {
        name: 'Exit',
        items: () => [
            { label: 'Save Changes and Exit', action: 'save', help: 'Save the configuration and continue booting.' },
            { label: 'Discard Changes and Exit', action: 'discard', help: 'Continue booting without saving.' },
            { label: 'Load Setup Defaults', action: 'defaults', help: 'Restore the factory settings. Save to keep them.' }
        ]
    }
];

function applyValues(values) {
    setSetting('autoTheme', values.autoTheme);
    setSetting('portfolio-theme', values.theme);
    setSetting('crtEffect', values.crt);
    setSetting('quickBoot', values.quickBoot);
    setSetting('screensaver', values.screensaver);
    setSetting('screensaverDelay', values.screensaverDelay);
    setSetting('bootDevice', values.bootDevice);
    SoundManager.enabled = values.sound === 'true';
}

export const BiosSetup = {
    isOpen: false,

    open() {
        return new Promise((resolve) => {
            BiosSetup.isOpen = true;
            const state = { tab: 0, row: -1, values: readValues(), dialog: null };
            const screen = document.createElement('div');
            screen.className = 'bios-screen';
            screen.setAttribute('role', 'dialog');
            screen.setAttribute('aria-modal', 'true');
            screen.setAttribute('aria-label', 'BIOS Setup Utility');
            document.body.appendChild(screen);

            const items = () => TABS[state.tab].items();
            const selectable = () => items().map((item, index) => (item.info ? -1 : index)).filter(index => index >= 0);

            const fixRow = () => {
                const rows = selectable();
                if (!rows.length) state.row = -1;
                else if (!rows.includes(state.row)) state.row = rows[0];
            };

            const optionLabel = (item) => {
                const option = item.options.find(([value]) => value === state.values[item.key]);
                return option ? option[1] : item.options[0][1];
            };

            const change = (item, step = 1) => {
                const index = item.options.findIndex(([value]) => value === state.values[item.key]);
                const next = (index + step + item.options.length) % item.options.length;
                state.values[item.key] = item.options[next][0];
            };

            const clock = setInterval(() => {
                const now = new Date();
                const time = screen.querySelector('[data-live="time"]');
                const date = screen.querySelector('[data-live="date"]');
                if (time) time.textContent = timeText(now);
                if (date) date.textContent = dateText(now);
            }, 1000);

            function close(result) {
                clearInterval(clock);
                document.removeEventListener('keydown', onKey, true);
                screen.remove();
                BiosSetup.isOpen = false;
                if (result === 'save') {
                    applyValues(state.values);
                    if (state.values.language !== lang) {
                        setLanguage(state.values.language);
                        return;
                    }
                }
                resolve(result);
            }

            function runAction(action) {
                if (action === 'defaults') {
                    state.values = { ...DEFAULT_VALUES, language: state.values.language };
                    state.dialog = { text: 'Setup defaults loaded. Save to keep them.', buttons: [['ok', 'OK']] };
                } else if (action === 'save') {
                    state.dialog = { text: 'Save configuration and exit?', buttons: [['save', 'Yes'], ['cancel', 'No']] };
                } else {
                    state.dialog = { text: 'Quit without saving?', buttons: [['discard', 'Yes'], ['cancel', 'No']] };
                }
                render();
            }

            function answerDialog(answer) {
                state.dialog = null;
                if (answer === 'save' || answer === 'discard') close(answer);
                else render();
            }

            // Every dynamic value below goes through escapeHtml().
            function render() {
                fixRow();
                const list = items();
                const current = list[state.row];
                const html = `
                    <div class="bios-title">PortfolioOS BIOS Setup Utility</div>
                    <nav class="bios-tabs" role="tablist">
                        ${TABS.map((tab, index) => `<button type="button" role="tab" class="bios-tab${index === state.tab ? ' is-active' : ''}" aria-selected="${index === state.tab}" data-tab="${index}">${tab.name}</button>`).join('')}
                    </nav>
                    <div class="bios-body">
                        <div class="bios-items">
                            ${list.map((item, index) => `
                                <button type="button" class="bios-item${index === state.row ? ' is-selected' : ''}${item.info ? ' is-info' : ''}" data-row="${index}" ${item.info ? 'tabindex="-1"' : ''}>
                                    <span class="bios-item-label">${escapeHtml(item.label)}</span>
                                    <span class="bios-item-value" ${item.live ? `data-live="${item.live}"` : ''}>${escapeHtml(item.info ?? (item.options ? `[${optionLabel(item)}]` : ''))}</span>
                                </button>`).join('')}
                        </div>
                        <aside class="bios-help">
                            <div class="bios-help-title">Item Specific Help</div>
                            <p>${escapeHtml(current?.help || 'Use the arrow keys to move between menus and items.')}</p>
                            <p class="bios-help-note">Settings are remembered after this visit only if you accepted local storage.</p>
                        </aside>
                    </div>
                    <footer class="bios-legend">
                        <span>↑↓ Select Item</span><span>←→ Select Menu</span><span>Enter/+/- Change</span>
                        <button type="button" data-legend="save">F10 Save and Exit</button>
                        <button type="button" data-legend="discard">Esc Exit</button>
                    </footer>
                    ${state.dialog ? `
                        <div class="bios-dialog" role="alertdialog" aria-label="${escapeHtml(state.dialog.text)}">
                            <p>${escapeHtml(state.dialog.text)}</p>
                            <div>${state.dialog.buttons.map(([value, label]) => `<button type="button" data-dialog="${value}">[ ${label} ]</button>`).join('')}</div>
                        </div>` : ''}
                `;
                screen.replaceChildren();
                screen.insertAdjacentHTML('beforeend', html);
                (screen.querySelector('.bios-dialog button') || screen.querySelector('.bios-item.is-selected'))?.focus({ preventScroll: true });
            }

            function onKey(event) {
                event.stopPropagation();
                const key = event.key;
                if (state.dialog) {
                    const first = state.dialog.buttons[0][0];
                    if (key === 'Enter' || key.toLowerCase() === 'y') answerDialog(first);
                    else if (key === 'Escape' || key.toLowerCase() === 'n') answerDialog('cancel');
                    event.preventDefault();
                    return;
                }
                const rows = selectable();
                const item = items()[state.row];
                if (key === 'ArrowLeft' || key === 'ArrowRight') {
                    state.tab = (state.tab + (key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
                    state.row = -1;
                } else if (key === 'ArrowUp' || key === 'ArrowDown') {
                    const position = rows.indexOf(state.row);
                    if (rows.length) state.row = rows[(position + (key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length];
                } else if (key === 'Enter' || key === '+' || key === '-' || key === ' ') {
                    event.preventDefault();
                    if (item?.action) return runAction(item.action);
                    if (item?.options) change(item, key === '-' ? -1 : 1);
                } else if (key === 'F10') {
                    event.preventDefault();
                    return runAction('save');
                } else if (key === 'Escape') {
                    event.preventDefault();
                    return runAction('discard');
                } else {
                    return;
                }
                event.preventDefault();
                render();
            }

            screen.addEventListener('click', (event) => {
                const target = event.target.closest('button');
                if (!target) return;
                if (target.dataset.dialog) return answerDialog(target.dataset.dialog);
                if (target.dataset.legend) return runAction(target.dataset.legend);
                if (target.dataset.tab) {
                    state.tab = Number(target.dataset.tab);
                    state.row = -1;
                    return render();
                }
                if (target.dataset.row) {
                    const row = Number(target.dataset.row);
                    const item = items()[row];
                    if (item.info) return;
                    const wasSelected = state.row === row;
                    state.row = row;
                    if (item.action) return runAction(item.action);
                    if (item.options && wasSelected) change(item);
                    render();
                }
            });

            document.addEventListener('keydown', onKey, true);
            render();
        });
    }
};

export default BiosSetup;
