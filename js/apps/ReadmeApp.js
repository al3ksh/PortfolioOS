/**
 * README App - a short guide to the desktop
 */

import { Icons } from '../icons.js?v=15';
import { t, loc } from '../i18n.js?v=15';
import { Profile, githubUrl } from '../config.js?v=15';

const GROUPS = [
    { title: 'readme.group.about', apps: [['portfolio', 'Portfolio.exe'], ['projects', 'Projects.exe'], ['network', 'Network.exe'], ['contact', 'Contact.exe'], ['simplemode', 'Simple View']] },
    { title: 'readme.group.tools', apps: [['browser', 'Internet.exe'], ['notepad', 'Notepad.exe'], ['paint', 'Paint.exe'], ['calc', 'Calc.exe'], ['terminal', 'Terminal.exe'], ['explorer', 'Explorer.exe'], ['tunes', 'Tunes.exe']] },
    { title: 'readme.group.games', apps: [['mines', 'Mines.exe'], ['snake', 'Snake.exe'], ['tetris', 'Blocks.exe']], note: 'readme.gamesNote' },
    { title: 'readme.group.system', apps: [['control', 'Control.cpl'], ['sysinfo', 'System Info'], ['taskmgr', 'Task Manager']] }
];

const THEMES = ['Teal', 'Dark', 'Hot Dog', 'Matrix', 'Clouds', 'Steel', 'Dither', 'Aubergine'];
const COMMANDS = ['help', 'neofetch', 'matrix', 'hack', 'fortune', 'cowsay', 'sl', 'party', 'leet', 'coffee', 'sudo', 'format'];

const pairs = key => t(key).map(([term, text]) => `<dt>${term}</dt><dd>${text}</dd>`).join('');
const keys = text => text.replace(/\[([^\]]+)\]/g, '<kbd>$1</kbd>');

function section(title, body) {
    return `<section class="rm-section"><h3>${t(title)}</h3>${body}</section>`;
}

function appCard([id, name], descriptions) {
    return `
        <div class="rm-app">
            <span class="rm-app-icon">${Icons[id]}</span>
            <span class="rm-app-name">${name}</span>
            <span class="rm-app-desc">${descriptions[id]}</span>
        </div>`;
}

export const ReadmeApp = {
    id: 'readme',
    title: 'README.TXT',
    icon: Icons.readme,
    width: 520,
    height: 560,
    hasMenu: false,
    resizable: true,

    render() {
        const descriptions = t('readme.appDesc');
        const groups = GROUPS.map(group => `
            <h4>${t(group.title)}</h4>
            <div class="rm-apps">${group.apps.map(app => appCard(app, descriptions)).join('')}</div>
            ${group.note ? `<p class="rm-note">${t(group.note)}</p>` : ''}`).join('');

        return `
            <div class="readme-content">
                <header class="rm-hero">
                    <span class="rm-hero-icon">${Icons.startMenu}</span>
                    <div>
                        <h2>Portfolio OS</h2>
                        <p>${t('readme.tagline')}</p>
                    </div>
                </header>
                <p class="rm-tip">${keys(t('readme.tip'))}</p>

                ${section('readme.start', `<dl class="rm-list">${pairs('readme.startItems')}</dl>`)}
                ${section('readme.apps', groups)}
                ${section('readme.themes', `
                    <div class="rm-chips">${THEMES.map(name => `<span class="rm-chip">${name}</span>`).join('')}</div>
                    <p>${t('readme.themesNote')}</p>`)}
                ${section('readme.keys', `<dl class="rm-list rm-keys">${t('readme.keyItems').map(([combo, text]) => `<dt>${keys(combo)}</dt><dd>${text}</dd>`).join('')}</dl>`)}

                <details class="readme-spoiler">
                    <summary>${t('readme.secrets')}</summary>
                    <div class="spoiler-content">
                        <dl class="rm-list">${pairs('readme.secretItems')}</dl>
                        <p>${t('readme.commands')}</p>
                        <div class="rm-chips">${COMMANDS.map(name => `<code class="rm-chip">${name}</code>`).join('')}</div>
                    </div>
                </details>

                <footer class="rm-footer">
                    ${t('readme.madeBy', { name: loc(Profile.name) })} ·
                    <a href="${githubUrl()}" target="_blank" rel="noopener noreferrer">GitHub</a>
                </footer>
            </div>
        `;
    }
};

export default ReadmeApp;
