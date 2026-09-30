/**
 * Internet App - retro web browser.
 *
 * Most sites refuse to be shown in an iframe (X-Frame-Options / frame-ancestors),
 * so the address bar routes each URL to something that can be shown:
 *   - YouTube / Spotify / Vimeo links  -> their official embed players
 *   - your own GitHub repos / profile  -> Project Viewer / Projects.exe
 *   - Wikipedia, archive.org, your site -> loaded directly
 *   - anything else                    -> latest Wayback Machine copy
 * The Time machine switches every page to its Wayback copy from a chosen year.
 */

import { Icons } from '../icons.js?v=15';
import { Profile, githubUrl, featuredProjects } from '../config.js?v=15';
import { t, loc, lang } from '../i18n.js?v=15';
import { WindowManager } from '../managers/WindowManager.js?v=15';
import { ProjectViewerApp } from './ProjectViewerApp.js?v=15';

const TIME_MACHINE_YEARS = ['2015', '2010', '2005', '2000', '1996'];
const FRAMEABLE_HOSTS = ['wikipedia.org', 'wikimedia.org', 'wiktionary.org', 'archive.org'];
const HOME = 'about:home';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const wikiSearch = query => `https://${lang === 'pl' ? 'pl' : 'en'}.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`;
const wayback = (url, year) => `https://web.archive.org/web/${year}if_/${url}`;
const hostMatches = (host, domain) => host === domain || host.endsWith(`.${domain}`);

function ownHosts() {
    const hosts = [];
    try { if (Profile.siteUrl) hosts.push(new URL(Profile.siteUrl).hostname); } catch { /* ignore */ }
    return hosts.concat(Profile.browser?.frameable || []);
}

function toUrl(input) {
    const text = String(input || '').trim();
    if (!text || text === HOME) return null;
    if (/^[a-z]+:\/\//i.test(text)) return new URL(text);
    if (!text.includes(' ') && /\.[a-z]{2,}(\/|$|:|\?)/i.test(text)) return new URL(`https://${text}`);
    return { search: text };
}

function embedFor(url) {
    const host = url.hostname.replace(/^www\.|^m\./, '');
    const path = url.pathname.split('/').filter(Boolean);
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        const id = url.searchParams.get('v') || (['shorts', 'embed', 'live'].includes(path[0]) ? path[1] : null);
        if (id) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
    }
    if (host === 'youtu.be' && path[0]) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(path[0])}`;
    if (host === 'open.spotify.com') {
        const parts = path[0]?.startsWith('intl-') ? path.slice(1) : path;
        if (['track', 'album', 'playlist', 'episode', 'show', 'artist'].includes(parts[0]) && parts[1]) {
            return `https://open.spotify.com/embed/${parts[0]}/${encodeURIComponent(parts[1])}`;
        }
    }
    if (host === 'vimeo.com' && /^\d+$/.test(path[0] || '')) return `https://player.vimeo.com/video/${path[0]}`;
    return null;
}

// Decide how to show an address. Returns { type, src, display, note }.
function resolve(input, year) {
    let url;
    try {
        url = toUrl(input);
    } catch {
        url = { search: input };
    }
    if (!url) return { type: 'home', display: HOME };
    if (url.search !== undefined && !(url instanceof URL)) {
        return { type: 'frame', src: wikiSearch(url.search), display: url.search };
    }
    if (!['http:', 'https:'].includes(url.protocol)) return { type: 'home', display: HOME };

    const display = url.href;
    const host = url.hostname;
    const path = url.pathname.split('/').filter(Boolean);
    const me = Profile.contact.github.toLowerCase();

    if (hostMatches(host, 'github.com') && path[0]?.toLowerCase() === me) {
        if (path[1]) {
            const repository = Profile.projects.find(project => project.name.toLowerCase() === path[1].toLowerCase())
                || { name: path[1], url: `https://github.com/${path[0]}/${path[1]}`, description: '' };
            return { type: 'app', app: 'viewer', repository, display };
        }
        return { type: 'app', app: 'projects', display };
    }

    const embed = embedFor(url);
    if (embed) return { type: 'frame', src: embed, display };

    if (year && !hostMatches(host, 'archive.org')) {
        return { type: 'frame', src: wayback(display, year), display, note: t('browser.archivedYear', { year }), live: display };
    }
    if ([...FRAMEABLE_HOSTS, ...ownHosts()].some(domain => hostMatches(host, domain))) return { type: 'frame', src: display, display };
    return { type: 'frame', src: wayback(display, new Date().getFullYear()), display, note: t('browser.archived'), live: display };
}

function visitCount() {
    let count = Number(localStorage.getItem('homeVisits') || sessionStorage.getItem('homeVisits') || 0);
    if (!sessionStorage.getItem('homeVisitCounted')) {
        count += 1;
        sessionStorage.setItem('homeVisitCounted', '1');
        sessionStorage.setItem('homeVisits', String(count));
        localStorage.setItem('homeVisits', String(count));
    }
    return Math.max(count, 1);
}

function renderHome() {
    const first = Profile.firstName || Profile.name;
    const counter = String(visitCount()).padStart(6, '0').split('').map(digit => `<span>${digit}</span>`).join('');
    const coolLinks = [
        [t('home.random'), `https://${lang === 'pl' ? 'pl' : 'en'}.wikipedia.org/wiki/Special:Random`],
        [t('home.google99'), wayback('http://www.google.com/', '1999')],
        [t('home.yahoo96'), wayback('http://www.yahoo.com/', '1996')],
        [t('home.spacejam'), wayback('http://www.spacejam.com/', '1996')],
        [t('home.youtube05'), wayback('http://www.youtube.com/', '2005')]
    ];

    return `
        <div class="retro-home">
            <div class="retro-marquee" aria-hidden="true"><span>${escapeHtml(t('home.marquee'))}</span></div>
            <h1 class="retro-title">${escapeHtml(t('home.welcome', { name: first }))}</h1>
            <div class="retro-construction"><span>${escapeHtml(t('home.construction'))}</span></div>

            <div class="retro-grid">
                <section class="retro-box">
                    <h2>${t('home.about')}</h2>
                    <p><strong>${escapeHtml(Profile.name)}</strong> - ${escapeHtml(loc(Profile.title))}</p>
                    <ul>${Profile.bio.map(line => `<li>${escapeHtml(loc(line))}</li>`).join('')}</ul>
                    <p><a href="mailto:${escapeHtml(Profile.contact.email)}">${t('home.email')}</a></p>
                </section>

                <section class="retro-box">
                    <h2>${t('home.projects')}</h2>
                    <ul>${featuredProjects().map(project => `<li><a href="#" data-go="${escapeHtml(project.url)}">${escapeHtml(project.name)}</a> - ${escapeHtml(loc(project.description))}</li>`).join('')}</ul>
                    <p><a href="#" data-go="${escapeHtml(githubUrl())}">github.com/${escapeHtml(Profile.contact.github)}</a></p>
                </section>

                <section class="retro-box">
                    <h2>${t('home.cool')}</h2>
                    <ul>${coolLinks.map(([label, url]) => `<li><a href="#" data-go="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`).join('')}</ul>
                </section>

                <section class="retro-box">
                    <h2>${t('home.search')}</h2>
                    <form class="retro-search" data-search>
                        <input type="search" class="win-input" aria-label="${escapeHtml(t('home.search'))}" placeholder="FPV, Windows 95, ...">
                        <button class="win-btn" type="submit">${t('home.searchButton')}</button>
                    </form>
                    <p class="retro-tip">${t('home.tip')}</p>
                </section>
            </div>

            <div class="retro-counter">
                ${t('home.visitor')} <span class="retro-digits">${counter}</span> ${t('home.times')}
            </div>

            <div class="retro-badges" aria-hidden="true">
                <span class="badge-88 badge-blue">BEST VIEWED<br>INTERNET 3.1</span>
                <span class="badge-88 badge-green">MADE WITH<br>NOTEPAD</span>
                <span class="badge-88 badge-black">HTML<br>3.2 OK</span>
                <span class="badge-88 badge-red">NO FRAMES*<br>*except this</span>
            </div>

            <div class="retro-webring">« ${t('home.webring')} »</div>
            <p class="retro-footer">${t('home.updated')}: ${new Date(document.lastModified).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US')}</p>
        </div>
    `;
}

export const BrowserApp = {
    id: 'browser',
    title: 'Internet.exe',
    icon: Icons.browser,
    width: 900,
    height: 680,
    minWidth: 420,
    minHeight: 380,
    hasMenu: true,
    menuItems: ['File', 'View', 'Favorites', 'Help'],

    menuConfig: {
        File: [
            { label: 'Open Location...', action: 'openUrl', shortcut: 'Ctrl+L' },
            { divider: true },
            { label: 'Close', action: 'close', shortcut: 'Alt+F4' }
        ],
        View: [
            { label: 'Refresh', action: 'refresh', shortcut: 'F5' },
            { label: 'Stop', action: 'stop' }
        ],
        Favorites: [
            { label: 'Home Page', action: 'goHome' },
            { divider: true },
            { label: 'Wikipedia', action: 'goWiki' },
            { label: 'Google (1999)', action: 'goGoogle' },
            { label: 'My GitHub', action: 'goGitHub' }
        ],
        Help: [
            { label: 'About Internet', action: 'about' }
        ]
    },

    history: [],
    index: -1,
    year: '',

    render() {
        return `
            <div class="browser-container">
                <div class="browser-toolbar">
                    <div class="browser-nav-buttons">
                        <button class="browser-nav-btn" type="button" data-nav="back" title="${t('browser.back')}" aria-label="${t('browser.back')}" disabled>${Icons.navBack}</button>
                        <button class="browser-nav-btn" type="button" data-nav="forward" title="${t('browser.forward')}" aria-label="${t('browser.forward')}" disabled>${Icons.navForward}</button>
                        <button class="browser-nav-btn" type="button" data-nav="refresh" title="${t('browser.refresh')}" aria-label="${t('browser.refresh')}">${Icons.ctxRefresh}</button>
                        <button class="browser-nav-btn" type="button" data-nav="home" title="${t('browser.home')}" aria-label="${t('browser.home')}">${Icons.navHome}</button>
                    </div>
                    <form class="browser-address-bar" data-address>
                        <span class="address-icon">${Icons.navGlobe}</span>
                        <input type="text" class="browser-url-input" placeholder="${escapeHtml(t('browser.placeholder'))}" value="${HOME}" aria-label="URL" spellcheck="false">
                        <button class="browser-go-btn" type="submit">${t('browser.go')}</button>
                    </form>
                    <label class="browser-time-machine" title="${t('browser.timeMachine')}">
                        <span>${t('browser.timeMachine')}:</span>
                        <select class="win-select" data-year>
                            <option value="">${t('browser.live')}</option>
                            ${TIME_MACHINE_YEARS.map(year => `<option value="${year}">${year}</option>`).join('')}
                        </select>
                    </label>
                </div>
                <div class="browser-notice" hidden>
                    <span class="browser-notice-text"></span>
                    <a class="browser-notice-link" target="_blank" rel="noopener noreferrer"></a>
                </div>
                <div class="browser-content"></div>
                <div class="browser-statusbar">
                    <span class="browser-status">${t('browser.done')}</span>
                    <span class="browser-security">${Icons.navLock} Internet Zone</span>
                </div>
            </div>
        `;
    },

    el(selector) {
        return document.querySelector(`#window-browser ${selector}`);
    },

    onInit() {
        const windowEl = document.querySelector('#window-browser');
        if (!windowEl) return;
        BrowserApp.history = [];
        BrowserApp.index = -1;
        BrowserApp.year = '';

        windowEl.querySelector('[data-address]').addEventListener('submit', (event) => {
            event.preventDefault();
            BrowserApp.navigate(BrowserApp.el('.browser-url-input').value);
        });
        windowEl.querySelector('.browser-nav-buttons').addEventListener('click', (event) => {
            const action = event.target.closest('[data-nav]')?.dataset.nav;
            if (action === 'back') BrowserApp.go(-1);
            if (action === 'forward') BrowserApp.go(1);
            if (action === 'refresh') BrowserApp.refresh();
            if (action === 'home') BrowserApp.navigate(HOME);
        });
        windowEl.querySelector('[data-year]').addEventListener('change', (event) => {
            BrowserApp.year = event.target.value;
            if (BrowserApp.current() !== HOME) BrowserApp.refresh();
        });
        windowEl.querySelector('.browser-content').addEventListener('click', (event) => {
            const link = event.target.closest('[data-go]');
            if (!link) return;
            event.preventDefault();
            BrowserApp.navigate(link.dataset.go);
        });
        windowEl.querySelector('.browser-content').addEventListener('submit', (event) => {
            if (!event.target.matches('[data-search]')) return;
            event.preventDefault();
            const query = event.target.querySelector('input').value.trim();
            if (query) BrowserApp.navigate(wikiSearch(query));
        });
        windowEl.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key.toLowerCase() === 'l') {
                event.preventDefault();
                BrowserApp.el('.browser-url-input')?.select();
            }
        });

        BrowserApp.navigate(HOME);
    },

    current() {
        return BrowserApp.history[BrowserApp.index] ?? HOME;
    },

    navigate(input) {
        const address = String(input || '').trim() || HOME;
        BrowserApp.history = BrowserApp.history.slice(0, BrowserApp.index + 1);
        BrowserApp.history.push(address);
        BrowserApp.index = BrowserApp.history.length - 1;
        BrowserApp.show(address);
    },

    go(step) {
        const next = BrowserApp.index + step;
        if (next < 0 || next >= BrowserApp.history.length) return;
        BrowserApp.index = next;
        BrowserApp.show(BrowserApp.current());
    },

    refresh() {
        BrowserApp.show(BrowserApp.current());
    },

    show(address) {
        const content = BrowserApp.el('.browser-content');
        if (!content) return;
        const target = resolve(address, BrowserApp.year);
        const input = BrowserApp.el('.browser-url-input');
        const status = BrowserApp.el('.browser-status');
        const notice = BrowserApp.el('.browser-notice');
        if (input) input.value = target.display;
        BrowserApp.el('[data-nav="back"]').disabled = BrowserApp.index <= 0;
        BrowserApp.el('[data-nav="forward"]').disabled = BrowserApp.index >= BrowserApp.history.length - 1;

        notice.hidden = !target.note;
        if (target.note) {
            notice.querySelector('.browser-notice-text').textContent = target.note;
            const link = notice.querySelector('.browser-notice-link');
            link.href = target.live;
            link.textContent = t('browser.openLive');
        }

        content.replaceChildren();
        if (target.type === 'home') {
            // renderHome escapes every value taken from config or the address bar.
            content.insertAdjacentHTML('beforeend', renderHome());
            status.textContent = t('browser.done');
            return;
        }

        if (target.type === 'app') {
            const appName = target.app === 'viewer' ? 'Project Viewer' : 'Projects.exe';
            if (target.app === 'viewer') ProjectViewerApp.open(target.repository);
            else WindowManager.createWindow('projects');
            const message = document.createElement('p');
            message.className = 'browser-app-note';
            message.textContent = t('browser.openedApp', { app: appName });
            content.append(message);
            status.textContent = t('browser.done');
            return;
        }

        const frame = document.createElement('iframe');
        frame.className = 'browser-frame';
        frame.src = target.src;
        frame.title = target.display;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        frame.allowFullscreen = true;
        // No allow-top-navigation: old archived pages must not "frame-bust" the portfolio.
        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation');
        let host = target.display;
        try { host = new URL(target.src).hostname; } catch { /* keep display */ }
        status.textContent = t('browser.loading', { host });
        frame.addEventListener('load', () => {
            if (status.isConnected) status.textContent = t('browser.done');
        });
        content.append(frame);
    },

    onMenuAction(action) {
        switch (action) {
            case 'refresh': BrowserApp.refresh(); break;
            case 'stop': BrowserApp.el('.browser-frame')?.setAttribute('src', 'about:blank'); break;
            case 'goHome': BrowserApp.navigate(HOME); break;
            case 'goWiki': BrowserApp.navigate(`https://${lang === 'pl' ? 'pl' : 'en'}.wikipedia.org/`); break;
            case 'goGoogle': BrowserApp.navigate(wayback('http://www.google.com/', '1999')); break;
            case 'goGitHub': BrowserApp.navigate(githubUrl()); break;
            case 'openUrl': BrowserApp.el('.browser-url-input')?.select(); break;
        }
    }
};

export default BrowserApp;
