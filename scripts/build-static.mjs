#!/usr/bin/env node
/**
 * Generates the static pages from js/config.js:
 *   index.html, pl.html landing page (English / Polish), works without JavaScript
 *   os.html             the desktop: meta tags (without JavaScript it sends visitors back to the landing page)
 *   cv.html, cv.pl.html printable CV
 *   contact-sent(.pl).html, contact-error(.pl).html  replies for the no-JS contact form
 *   privacy, terms, cookies (.pl).html  legal pages in the landing page's window
 *
 * Usage: node scripts/build-static.mjs [--config js/config.js] [--out .]
 * No dependencies; runs on Node 18+.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEGAL_UPDATED, LEGAL_PAGES, LEGAL_STRINGS, legalFile, legalContent } from './legal.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name, fallback) => {
    const index = args.indexOf(`--${name}`);
    return index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : fallback;
};
const CONFIG_PATH = option('config', path.join(ROOT, 'js/config.js'));
const OUT_DIR = option('out', ROOT);

// config.js and strings.js are plain ES modules without imports; load them as data URLs
// so this works whether or not the project has a package.json with "type": "module".
async function loadModule(file) {
    const source = await readFile(file, 'utf8');
    return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

const { Profile } = await loadModule(CONFIG_PATH);
const { STRINGS } = await loadModule(path.join(ROOT, 'js/strings.js'));
const { Icons } = await loadModule(path.join(ROOT, 'js/icons.js'));

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const loc = (value, lang) => (value && typeof value === 'object' && !Array.isArray(value)
    ? value[lang] ?? value.en ?? Object.values(value)[0] ?? ''
    : value ?? '');

const tr = (lang, key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
const githubUrl = (pathname = '') => `https://github.com/${Profile.contact.github}${pathname}`;
const siteUrl = String(Profile.siteUrl || 'https://example.com').replace(/\/+$/, '');
const featured = () => Profile.projects.filter(project => project.featured);

// Projects follow GitHub the same way the desktop does: live repositories, pins as
// featured. Pins need GITHUB_TOKEN or the live site's /api/pinned; without either the
// config flags stay. --offline (or githubSync: false) keeps Profile.projects as written.
if (Profile.githubSync !== false && !args.includes('--offline')) {
    const { fetchRepositories, fetchPinnedGraphQL, fetchPinnedFromSite, mergeProjects } = await loadModule(path.join(ROOT, 'js/github.js'));
    const user = Profile.contact.github;
    const token = process.env.GITHUB_TOKEN;
    try {
        const [live, pinned] = await Promise.all([
            fetchRepositories(user),
            token ? fetchPinnedGraphQL(user, token).catch(() => null) : fetchPinnedFromSite(siteUrl)
        ]);
        Profile.projects = mergeProjects(Profile.projects, live, pinned);
        console.log(`Projects: ${live.length} repositories from GitHub, featured: ${featured().map(project => project.name).join(', ')}${pinned ? ' (pinned)' : ' (config)'}`);
    } catch (error) {
        console.warn(`Projects: GitHub unavailable, using the config list - ${error.message}`);
    }
}
const year = new Date().getFullYear();

const LOGO = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><rect x="0" y="0" width="16" height="1" fill="#000"/><rect x="0" y="1" width="1" height="1" fill="#000"/><rect x="1" y="1" width="13" height="1" fill="#FFF"/><rect x="14" y="1" width="1" height="1" fill="#808080"/><rect x="15" y="1" width="1" height="1" fill="#000"/><rect x="0" y="2" width="1" height="1" fill="#000"/><rect x="1" y="2" width="1" height="1" fill="#FFF"/><rect x="2" y="2" width="12" height="1" fill="#000"/><rect x="14" y="2" width="1" height="1" fill="#808080"/><rect x="15" y="2" width="1" height="1" fill="#000"/><rect x="0" y="3" width="1" height="1" fill="#000"/><rect x="1" y="3" width="1" height="1" fill="#FFF"/><rect x="2" y="3" width="1" height="1" fill="#000"/><rect x="3" y="3" width="2" height="1" fill="#FFE070"/><rect x="5" y="3" width="1" height="1" fill="#008080"/><rect x="6" y="3" width="6" height="1" fill="#000080"/><rect x="12" y="3" width="1" height="1" fill="#008080"/><rect x="13" y="3" width="1" height="1" fill="#000"/><rect x="14" y="3" width="1" height="1" fill="#808080"/><rect x="15" y="3" width="1" height="1" fill="#000"/><rect x="0" y="4" width="1" height="1" fill="#000"/><rect x="1" y="4" width="1" height="1" fill="#FFF"/><rect x="2" y="4" width="1" height="1" fill="#000"/><rect x="3" y="4" width="2" height="1" fill="#C09000"/><rect x="5" y="4" width="1" height="1" fill="#008080"/><rect x="6" y="4" width="6" height="1" fill="#FFF"/><rect x="12" y="4" width="1" height="1" fill="#008080"/><rect x="13" y="4" width="1" height="1" fill="#000"/><rect x="14" y="4" width="1" height="1" fill="#808080"/><rect x="15" y="4" width="1" height="1" fill="#000"/><rect x="0" y="5" width="1" height="1" fill="#000"/><rect x="1" y="5" width="1" height="1" fill="#FFF"/><rect x="2" y="5" width="1" height="1" fill="#000"/><rect x="3" y="5" width="3" height="1" fill="#008080"/><rect x="6" y="5" width="6" height="1" fill="#FFF"/><rect x="12" y="5" width="1" height="1" fill="#008080"/><rect x="13" y="5" width="1" height="1" fill="#000"/><rect x="14" y="5" width="1" height="1" fill="#808080"/><rect x="15" y="5" width="1" height="1" fill="#000"/><rect x="0" y="6" width="1" height="1" fill="#000"/><rect x="1" y="6" width="1" height="1" fill="#FFF"/><rect x="2" y="6" width="1" height="1" fill="#000"/><rect x="3" y="6" width="2" height="1" fill="#FFF"/><rect x="5" y="6" width="1" height="1" fill="#008080"/><rect x="6" y="6" width="6" height="1" fill="#FFF"/><rect x="12" y="6" width="1" height="1" fill="#008080"/><rect x="13" y="6" width="1" height="1" fill="#000"/><rect x="14" y="6" width="1" height="1" fill="#808080"/><rect x="15" y="6" width="1" height="1" fill="#000"/><rect x="0" y="7" width="1" height="1" fill="#000"/><rect x="1" y="7" width="1" height="1" fill="#FFF"/><rect x="2" y="7" width="1" height="1" fill="#000"/><rect x="3" y="7" width="2" height="1" fill="#FFF"/><rect x="5" y="7" width="8" height="1" fill="#008080"/><rect x="13" y="7" width="1" height="1" fill="#000"/><rect x="14" y="7" width="1" height="1" fill="#808080"/><rect x="15" y="7" width="1" height="1" fill="#000"/><rect x="0" y="8" width="1" height="1" fill="#000"/><rect x="1" y="8" width="1" height="1" fill="#FFF"/><rect x="2" y="8" width="1" height="1" fill="#000"/><rect x="3" y="8" width="10" height="1" fill="#008080"/><rect x="13" y="8" width="1" height="1" fill="#000"/><rect x="14" y="8" width="1" height="1" fill="#808080"/><rect x="15" y="8" width="1" height="1" fill="#000"/><rect x="0" y="9" width="1" height="1" fill="#000"/><rect x="1" y="9" width="1" height="1" fill="#FFF"/><rect x="2" y="9" width="1" height="1" fill="#000"/><rect x="3" y="9" width="10" height="1" fill="#C0C0C0"/><rect x="13" y="9" width="1" height="1" fill="#000"/><rect x="14" y="9" width="1" height="1" fill="#808080"/><rect x="15" y="9" width="1" height="1" fill="#000"/><rect x="0" y="10" width="1" height="1" fill="#000"/><rect x="1" y="10" width="1" height="1" fill="#FFF"/><rect x="2" y="10" width="12" height="1" fill="#000"/><rect x="14" y="10" width="1" height="1" fill="#808080"/><rect x="15" y="10" width="1" height="1" fill="#000"/><rect x="0" y="11" width="1" height="1" fill="#000"/><rect x="1" y="11" width="1" height="1" fill="#FFF"/><rect x="2" y="11" width="10" height="1" fill="#C0C0C0"/><rect x="12" y="11" width="1" height="1" fill="#00E000"/><rect x="13" y="11" width="1" height="1" fill="#C0C0C0"/><rect x="14" y="11" width="1" height="1" fill="#808080"/><rect x="15" y="11" width="1" height="1" fill="#000"/><rect x="0" y="12" width="1" height="1" fill="#000"/><rect x="1" y="12" width="14" height="1" fill="#808080"/><rect x="15" y="12" width="1" height="1" fill="#000"/><rect x="0" y="13" width="16" height="1" fill="#000"/><rect x="5" y="14" width="1" height="1" fill="#000"/><rect x="6" y="14" width="4" height="1" fill="#C0C0C0"/><rect x="10" y="14" width="1" height="1" fill="#808080"/><rect x="11" y="14" width="1" height="1" fill="#000"/><rect x="3" y="15" width="10" height="1" fill="#000"/></svg>';

const AVATAR = `╔══════════╗
║  ◉    ◉  ║
║    ▼     ║
║  ╰────╯  ║
╚══════════╝`;

function description(lang) {
    return lang === 'pl'
        ? `${Profile.name} - ${loc(Profile.title, lang)}. Portfolio z projektami, doświadczeniem i kontaktem.`
        : `${Profile.name}, ${loc(Profile.title, lang)} portfolio with selected projects, experience and contact details.`;
}

// schema.org Person, so search engines can connect the site to the name.
function structuredData(lang) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: Profile.name,
        jobTitle: loc(Profile.title, lang),
        description: loc(Profile.about, lang),
        url: `${siteUrl}/`,
        image: `${siteUrl}/og-image.png`,
        email: `mailto:${Profile.contact.email}`,
        sameAs: [githubUrl()],
        knowsAbout: Profile.skills.map(skill => loc(skill, lang))
    };
    if (Profile.education?.length) {
        data.alumniOf = Profile.education.map(edu => ({ '@type': 'EducationalOrganization', name: loc(edu.school, lang) }));
    }
    // Keep "</script>" inside strings from closing the tag.
    return JSON.stringify(data).replace(/</g, '\\u003c');
}

function metaTags(lang, pageUrl, { title = `${Profile.name} | ${loc(Profile.title, lang)}`, alternates = true } = {}) {
    return `<meta name="description" content="${esc(description(lang))}">
    <link rel="canonical" href="${esc(pageUrl)}">
    <script type="application/ld+json">${structuredData(lang)}</script>
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description(lang))}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${esc(pageUrl)}">
    <meta property="og:image" content="${esc(siteUrl)}/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="${lang === 'pl' ? 'pl_PL' : 'en_US'}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${esc(siteUrl)}/og-image.png">${alternates ? `
    <link rel="alternate" hreflang="en" href="${esc(siteUrl)}/">
    <link rel="alternate" hreflang="pl" href="${esc(siteUrl)}/pl.html">
    <link rel="alternate" hreflang="x-default" href="${esc(siteUrl)}/">` : ''}
    <title>${esc(title)}</title>`;
}

function replaceBetween(source, name, content) {
    const start = `<!-- ${name}:start -->`;
    const end = `<!-- ${name}:end -->`;
    const from = source.indexOf(start);
    const to = source.indexOf(end);
    if (from < 0 || to < from) throw new Error(`os.html is missing the ${name} markers`);
    return `${source.slice(0, from + start.length)}\n    ${content}\n    ${source.slice(to)}`;
}

function standalonePage(lang, { title, body, head = '', css = 'css/static.css' }) {
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${head}
    <title>${esc(title)}</title>
    <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(LOGO.replace(' aria-hidden="true"', ' xmlns="http://www.w3.org/2000/svg"'))}">
    <link rel="stylesheet" href="${css}?v=18">${css === 'css/static.css' ? `
    <script>try{if(localStorage.getItem('homeTheme')==='light')document.documentElement.dataset.theme='light'}catch(e){}</script>` : ''}
</head>
<body>
${body}
</body>
</html>
`;
}

// ---------- Landing page (index.html / pl.html) ----------

// GitHub's language colours, for the dot next to each project
const LANG_COLORS = { javascript: '#f1e05a', typescript: '#3178c6', python: '#3572a5', 'c++': '#f34b7d', c: '#555555', 'c#': '#178600', java: '#b07219', html: '#e34c26', css: '#663399', shell: '#89e051', lua: '#000080', qml: '#44a51c', rust: '#dea584', assembly: '#6e4c13', ejs: '#a91e50', go: '#00add8', php: '#4f5d95' };

// Desktop icons shown in the "Boot PortfolioOS" box
const OS_APPS = [
    ['notepad', { en: 'Notepad', pl: 'Notatnik' }], ['terminal', 'Terminal'], ['mines', { en: 'Minesweeper', pl: 'Saper' }],
    ['tunes', 'Tunes'], ['paint', 'Paint'], ['browser', 'Internet'], ['snake', { en: 'Snake', pl: 'Wąż' }], ['tetris', 'Blocks']
];

// The OS icons are long pixel-art SVGs: put each one in the page once and <use> it
function sprite(names) {
    return `<svg class="sprite" aria-hidden="true">${names.map(name => {
        const svg = Icons[name];
        const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
        const crisp = svg.includes('crispEdges') ? ' shape-rendering="crispEdges"' : '';
        let inner = svg.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
        // The one-colour GitHub mark follows the text colour, so it shows in the dark look too
        if (name === 'socialGithub') inner = inner.replace(/fill="#333"/g, 'fill="currentColor"');
        return `<symbol id="i-${name}" viewBox="${viewBox}"${crisp}>${inner}</symbol>`;
    }).join('')}</svg>`;
}

const icon = (name, cls = '') => `<svg class="ico${cls ? ` ${cls}` : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

// PortfolioOS needs JavaScript. Links to it point at the #no-js banner; the script at
// the end of frame() puts the real address in once JavaScript runs. Each link has a
// twin pointing at #no-js-again and CSS swaps them after a click, so every click
// changes the hash and replays the banner. The script removes the twins.
const bootLink = (lang, attrs, inner) => ['#no-js', '#no-js-again'].map((hash, i) =>
    `<a ${attrs} href="${hash}" data-boot="os.html?lang=${lang}"${i ? ' data-boot-again' : ''}>${inner}</a>`).join('');

// Underline the first letter like a Windows menu accelerator
const accel = text => `<u>${esc(text.charAt(0))}</u>${esc(text.slice(1))}`;

function renderHome(lang) {
    const t = key => tr(lang, key);
    const L = value => esc(loc(value, lang));
    const email = Profile.contact.email;
    const boot = `os.html?lang=${lang}`;
    const cv = lang === 'pl' ? 'cv.pl.html' : 'cv.html';
    const objects = n => t('landing.objects').replace('{n}', n);

    // Featured first, the rest in config order
    const projects = [...featured(), ...Profile.projects.filter(project => !project.featured)];
    // One chip per repository language, most used first
    const counts = new Map();
    projects.forEach(project => project.language && counts.set(project.language, (counts.get(project.language) || 0) + 1));
    const chips = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const liveUrl = project => project.demo
        || (project.name.toLowerCase() === 'portfolioos' ? boot : Profile.links?.[project.name.toLowerCase()]);

    const items = projects.map((project) => {
        const live = liveUrl(project);
        const repo = esc(project.url || githubUrl());
        const language = project.language || '';
        const color = LANG_COLORS[language.toLowerCase()] ?? '#808080';
        const meta = [
            language && `<span class="lang"><i style="background:${color}"></i>${esc(language)}</span>`,
            project.tech && project.tech !== language && `<span>${esc(project.tech)}</span>`,
            project.pushed
                ? `<span>${esc(new Date(project.pushed).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }))}</span>`
                : project.updated && `<span>${esc(project.updated)}</span>`
        ].filter(Boolean).join('');
        return `
                    <article class="item${project.featured ? ' is-featured' : ''}" data-lang="${esc(language.toLowerCase())}">
                        <div class="item-icon">${icon('projects')}${project.featured ? `<span class="badge" title="${t('landing.featured')}">&#9733;</span>` : ''}</div>
                        <div class="item-body">
                            <h3><a href="${repo}" target="_blank" rel="noopener">${esc(project.name)}</a></h3>
                            <p>${L(project.description)}</p>
                            ${meta ? `<div class="item-meta">${meta}</div>` : ''}
                            <div class="item-actions">${!live ? '' : live === boot ? bootLink(lang, 'class="btn small"', `${t('landing.live')} &#9656;`) : `<a class="btn small" href="${esc(live)}" target="_blank" rel="noopener">${t('landing.live')} &#9656;</a>`}<a class="btn small" href="${repo}" target="_blank" rel="noopener">${icon('socialGithub')}${t('landing.repo')}</a></div>
                        </div>
                    </article>`;
    }).join('');

    const entry = (date, title, where, text, latest) => `
                            <li class="entry">
                                <span class="date">${L(date)}</span>
                                <div><h4>${L(title)}</h4><div class="where">${L(where)}${latest ? ` <span class="tag">${t('landing.latest')}</span>` : ''}</div>${text ? `<p>${L(text)}</p>` : ''}</div>
                            </li>`;

    const subjects = ['job', 'project', 'general', 'feedback'];
    const needsJs = Boolean(Profile.turnstileSiteKey);

    return frame(lang, {
        head: metaTags(lang, `${siteUrl}/${lang === 'pl' ? 'pl.html' : ''}`),
        icons: ['projects', 'secUser', 'secBriefcase', 'secGraduation', 'secLightbulb', 'sysUptime', 'secMail', 'socialGithub', 'socialDiscord', 'actDownload', 'actSend', ...OS_APPS.map(([name]) => name)],
        title: t('landing.title'),
        flags: { en: './', pl: 'pl.html' },
        skipToOs: true,
        content: `
            <section id="about" class="group" aria-labelledby="about-title">
                <h2 class="legend" id="about-title">${icon('secUser')}${t('landing.about')}</h2>
                <div class="about">
                    <pre class="avatar" aria-hidden="true">${AVATAR}</pre>
                    <div class="intro">
                        <h1>${esc(Profile.name)}</h1>
                        <p class="role">${L(Profile.title)}</p>
                        <p class="bio">${L(Profile.about)}</p>
                        <div class="actions">
                            <a class="btn" href="${cv}">${icon('actDownload')}${t('landing.cv')}</a>
                            <a class="btn" href="#contact">${icon('secMail')}${t('landing.contact')}</a>
                            ${bootLink(lang, 'class="btn default"', `${LOGO}${t('landing.boot')} &#9656;`)}
                        </div>
                    </div>
                    <aside class="props" aria-labelledby="props-title">
                        <h3 id="props-title">${t('landing.spec')}</h3>
                        <dl>
                            <dt>${t('landing.role')}:</dt><dd>${L(Profile.title)}</dd>
                            <dt>${t('landing.based')}:</dt><dd>${L(Profile.location)}</dd>
                            <dt>${t('landing.stack')}:</dt><dd>${Profile.skills.slice(0, 5).map(L).join(', ')}&hellip;</dd>
                            <dt>${t('landing.langs')}:</dt><dd>${Profile.cv?.languages?.length
                                ? Profile.cv.languages.map(language => `${L(language.name)}${language.level ? ` (${L(language.level)})` : ''}`).join(', ')
                                : t('landing.langsValue')}</dd>${Profile.openToWork === false ? '' : `
                            <dt>${t('landing.status')}:</dt><dd><span class="status"><i></i>${t('landing.open')}</span></dd>`}
                        </dl>
                    </aside>
                </div>
            </section>

            <section id="works" class="group" aria-labelledby="works-title">
                <h2 class="legend" id="works-title">${icon('projects')}${t('landing.works')}</h2>
                <div class="explorer">
                    ${chips.length > 1 ? `<div class="toolbar filter" role="group" aria-label="${t('landing.filter')}" hidden>
                        ${featured().length ? `<button class="chip" type="button" data-lang="pinned" aria-pressed="false">&#9733; ${t('landing.pinned')} <small>${featured().length}</small></button>` : ''}<button class="chip" type="button" data-lang="" aria-pressed="true">${t('landing.all')} <small>${projects.length}</small></button>${chips.map(([language, count]) => `<button class="chip" type="button" data-lang="${esc(language.toLowerCase())}" aria-pressed="false">${esc(language)} <small>${count}</small></button>`).join('')}
                    </div>` : ''}
                    <div class="address"><span>${lang === 'pl' ? 'Adres' : 'Address'}</span><code>C:\\Portfolio\\${t('landing.works')}\\</code></div>
                    <div class="items">${items}
                        <p class="empty" hidden>${t('landing.noMatch')}</p>
                    </div>
                    <div class="explorer-status">
                        <span data-count="${esc(t('landing.objects'))}">${objects(projects.length)}</span>
                        <a href="${esc(githubUrl('?tab=repositories'))}" target="_blank" rel="noopener">${t('landing.allRepos')} &#8599;</a>
                    </div>
                </div>
            </section>

            <section id="changelog" class="group" aria-labelledby="changelog-title">
                <h2 class="legend" id="changelog-title">${icon('sysUptime')}${t('landing.changelog')}</h2>
                <div class="log">
                    <div class="pane">
                        <h3 class="pane-head">${icon('secBriefcase')}${t('section.experience')}</h3>
                        <ol class="list">${Profile.experience.map((job, i) => entry(job.date, job.role, job.company, job.description, i === 0)).join('')}
                        </ol>
                    </div>
                    <div class="log-side">
                        <div class="pane">
                            <h3 class="pane-head">${icon('secGraduation')}${t('section.education')}</h3>
                            <ol class="list">${Profile.education.map(edu => entry(edu.date, edu.degree, edu.school)).join('')}
                            </ol>
                        </div>${Profile.interests?.length ? `
                        <div class="pane">
                            <h3 class="pane-head">${icon('secLightbulb')}${t('landing.extras')}</h3>
                            <ul class="tags">${Profile.interests.map(item => `<li>${L(item)}</li>`).join('')}</ul>
                        </div>` : ''}
                    </div>
                </div>
            </section>

            <section id="contact" class="group" aria-labelledby="contact-title">
                <h2 class="legend" id="contact-title">${icon('secMail')}${t('landing.contactTitle')}</h2>
                <div class="contact">
                    <div class="contact-info">
                        <h3>${t('landing.contactHead')}</h3>
                        <p>${t('landing.contactText')}</p>
                        <ul class="pane contact-links">
                            <li>${icon('secMail')}<b>E-mail</b><a href="mailto:${esc(email)}">${esc(email)}</a><button class="btn small" type="button" data-copy-email="${esc(email)}" data-copied="${esc(t('landing.copied'))}" hidden>${t('landing.copy')}</button></li>
                            <li>${icon('socialGithub')}<b>GitHub</b><a href="${esc(githubUrl())}" target="_blank" rel="noopener">${esc(Profile.contact.github)}</a></li>${Profile.contact.discord ? `
                            <li>${icon('socialDiscord')}<b>Discord</b><span>${esc(Profile.contact.discord)}</span></li>` : ''}
                            <li>${icon('actDownload')}<b>CV</b><a href="${cv}">${t('landing.cv')}</a></li>
                        </ul>
                    </div>
                    <div class="dialog">
                        <div class="titlebar small">${icon('secMail')}<span class="titlebar-text">${t('landing.card')}</span><span class="controls" aria-hidden="true"><span>&times;</span></span></div>
                        <form class="postcard${needsJs ? ' needs-js' : ''}" action="/api/contact" method="post"${needsJs ? ` data-sitekey="${esc(Profile.turnstileSiteKey)}"` : ''}
                            data-sending="${esc(t('landing.sending'))}" data-sent="${esc(t('landing.sent'))}" data-error="${esc(t('landing.error'))}" data-email="${esc(email)}">
                            <input type="hidden" name="lang" value="${lang}">
                            <label class="hp" aria-hidden="true">Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
                            <div class="two">
                                <label>${t('landing.name')}:<input name="name" required maxlength="100" autocomplete="name"></label>
                                <label>${t('landing.email')}:<input type="email" name="email" required maxlength="254" autocomplete="email"></label>
                            </div>
                            <label>${t('landing.subject')}:<select name="subject">${subjects.map(key => `<option value="${key}">${t(`contact.subject.${key}`)}</option>`).join('')}</select></label>
                            <label>${t('landing.message')}:<textarea name="message" required maxlength="5000"></textarea></label>
                            ${needsJs ? '<div class="turnstile"></div>' : ''}
                            <p class="form-note">${t('contact.privacy')} <a href="${legalFile('privacy', lang)}">${t('contact.privacyLink')}</a></p>
                            <div class="form-foot">
                                <p class="form-status" role="status" aria-live="polite"></p>
                                <button class="btn default" type="submit">${icon('actSend')}${t('landing.send')}</button>
                            </div>
                        </form>${needsJs ? `
                        <noscript><p class="no-js-note">${t('static.formNeedsJs')} <a href="mailto:${esc(email)}">${esc(email)}</a></p></noscript>` : ''}
                    </div>
                </div>
            </section>

            <section class="group boot" aria-labelledby="boot-title">
                <h2 class="legend" id="boot-title">${LOGO}PortfolioOS</h2>
                <div class="boot-row">
                    ${bootLink(lang, `class="mini-desktop" aria-label="${t('landing.boot')}"`, OS_APPS.map(([name, label]) => `<span class="desk-icon">${icon(name)}<span>${L(label)}</span></span>`).join(''))}
                    <div class="boot-text">
                        <h3>${t('landing.bootHead')}</h3>
                        <p>${t('landing.bootText')}</p>
                        ${bootLink(lang, 'class="btn default"', `${LOGO}${t('landing.boot')} &#9656;`)}
                    </div>
                </div>
            </section>`
    });
}

// Tray button of the light/dark switch: the moon shows in the dark look, the sun in the light one
const THEME_ICONS = '<svg class="ico-moon" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path fill="#FFE066" d="M5 2h2v1h-2zM4 3h3v1h-3zM3 4h4v1h-4zM2 5h5v1h-5zM2 6h5v1h-5zM2 7h5v1h-5zM2 8h6v1h-6zM2 9h8v1h-8zM2 10h12v1h-12zM3 11h10v1h-10zM4 12h8v1h-8zM5 13h6v1h-6z"/></svg>'
    + '<svg class="ico-sun" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path fill="#E8A000" d="M6 5h4v1h-4zM5 6h6v4h-6zM6 10h4v1h-4zM7 0h2v3h-2zM7 13h2v3h-2zM0 7h3v2h-3zM13 7h3v2h-3zM2 2h1v1h-1zM3 3h1v1h-1zM13 2h1v1h-1zM12 3h1v1h-1zM3 12h1v1h-1zM2 13h1v1h-1zM12 12h1v1h-1zM13 13h1v1h-1z"/></svg>';

// The window, menu bar, status bar and taskbar shared by the landing page and the
// legal pages. `home` is where the menu links point ('' on the landing page itself),
// `flags` the English and Polish version of the current page.
function frame(lang, { head, icons, title, flags, content, home = '', current = '', skipToOs = false }) {
    const t = key => tr(lang, key);
    const legal = LEGAL_STRINGS[lang];
    const boot = `os.html?lang=${lang}`;
    // Someone who already entered PortfolioOS (main.js sets osVisited) goes straight
    // back to it when they open the site again. Links within the site, reloads, Back,
    // #section links and saving switched off still show this page; crawlers and
    // no-JS visitors never have the flag.
    const skip = skipToOs ? `
    <script>try{var n=performance.getEntriesByType('navigation')[0];if(localStorage.getItem('osVisited')&&localStorage.getItem('storagePrefs')!=='no'&&!location.hash&&(!n||n.type==='navigate')&&document.referrer.indexOf(location.origin+'/')!==0)location.replace('${lang === 'pl' ? boot : 'os.html'}')}catch(e){}</script>` : '';
    const nav = ['about', 'works', 'changelog', 'contact'];
    const flag = (code, label) => `<a href="${flags[code]}" hreflang="${code}" lang="${code}" title="${label}"${lang === code ? ' aria-current="page"' : ''}>${Icons[`flag${code.toUpperCase()}`]}${code.toUpperCase()}</a>`;

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${head}
    <meta name="theme-color" content="#1a1a2e">
    <script>document.documentElement.classList.add('js');try{if(localStorage.getItem('homeTheme')==='light')document.documentElement.dataset.theme='light'}catch(e){}</script>${skip}
    <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(LOGO.replace(' aria-hidden="true"', ' xmlns="http://www.w3.org/2000/svg"'))}">
    <link rel="stylesheet" href="css/home.css?v=18">
    <script type="module" src="js/home.js?v=18"></script>
</head>
<body>
    ${sprite(icons)}
    <a class="skip" href="#main">${t('landing.skip')}</a>

    <div class="win" id="top">
        <header class="titlebar">
            ${LOGO}
            <span class="titlebar-text">${esc(title)} - ${esc(Profile.name)}</span>
            <span class="controls" aria-hidden="true"><span class="min">_</span><span>&#9633;</span><span>&times;</span></span>
        </header>
        <nav class="menubar nav" aria-label="${esc(Profile.name)}">
            ${nav.map((id, i) => `<a href="${home}#${id}" data-id="${id}">${accel(t('landing.nav')[i])}</a>`).join('')}
            <span class="menubar-right">
                ${flag('en', 'English')}
                ${flag('pl', 'Polski')}
            </span>
        </nav>

        <main id="main" class="client">${content}
        </main>

        <footer class="statusbar">
            <span>${t('landing.ready')}</span>
            <span class="legal">${LEGAL_PAGES.map(page => `<a href="${legalFile(page, lang)}"${page === current ? ' aria-current="page"' : ''}>${legal[page]}</a>`).join('')}</span>
            <span class="copy">&copy; ${year} ${esc(Profile.name)}</span>
            <span>${lang.toUpperCase()}</span>
        </footer>
    </div>

    <nav class="taskbar" aria-label="Taskbar">
        ${bootLink(lang, `class="start" title="${t('landing.boot')}"`, `${LOGO}<b>Start</b>`)}
        <a class="task" href="#top">${LOGO}<span>${esc(title)}</span></a>
        <span class="tray">
            <button class="tray-btn" type="button" data-theme-toggle aria-pressed="true" title="${t('landing.dark')}" aria-label="${t('landing.dark')}" hidden>${THEME_ICONS}</button>
            <time data-clock>${year}</time>
        </span>
    </nav>

    <div class="boot-error" id="no-js" role="alert" tabindex="-1">
        <div class="titlebar small">${LOGO}<span class="titlebar-text">${t('landing.noJsTitle')}</span></div>
        <p><span class="boot-error-icon" aria-hidden="true">&times;</span>${t('landing.noJs')}</p>
        <span id="no-js-again"></span>
    </div>
    <script>document.querySelectorAll('a[data-boot]').forEach(function(a){if('bootAgain' in a.dataset)a.remove();else a.href=a.dataset.boot})</script>
</body>
</html>
`;
}

// ---------- Privacy policy, terms of use, cookies ----------

const LEGAL_ICONS = { privacy: 'fileLock', terms: 'fileText', cookies: 'fileConfig' };

function renderLegal(lang, page) {
    const s = LEGAL_STRINGS[lang];
    const home = lang === 'pl' ? 'pl.html' : './';
    const portfolioRepo = Profile.projects.find(project => project.name.toLowerCase() === 'portfolioos')?.url || githubUrl();
    const ctx = {
        name: esc(Profile.name),
        email: esc(Profile.contact.email),
        site: esc(siteUrl.replace(/^https?:\/\//, '')),
        repo: esc(portfolioRepo),
        links: { privacy: legalFile('privacy', lang), cookies: legalFile('cookies', lang) }
    };
    const doc = legalContent(page, lang, ctx);
    const updated = new Date(`${LEGAL_UPDATED}T12:00:00Z`).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // The cookies page gets a small control panel for the data PortfolioOS saves
    const storage = `
                        <div class="pane storage" data-storage data-count="${esc(s.storageCount)}" data-on="${esc(s.storageOn)}" data-off="${esc(s.storageOff)}" data-cleared="${esc(s.storageCleared)}" data-blocked="${esc(s.storageBlocked)}">
                            <h3 class="pane-head">${icon('fileConfig')}${s.storageTitle}</h3>
                            <p class="storage-nojs">${s.storageNoJs}</p>
                            <div class="storage-ui" hidden>
                                <label class="check"><input type="checkbox" data-storage-toggle> ${s.storageToggle}</label>
                                <div class="storage-row"><span data-storage-count></span><button class="btn small" type="button" data-storage-clear>${icon('actTrash')}${s.storageClear}</button></div>
                                <p class="storage-status" role="status" aria-live="polite"></p>
                            </div>
                        </div>`;

    const sections = doc.sections.map(([heading, html], i) => `
                        <section class="doc-section" id="s${i + 1}">
                            <h2>${i + 1}. ${heading}</h2>
                            ${html}${page === 'cookies' && i === 1 ? storage : ''}
                        </section>`).join('');

    const url = file => `${esc(siteUrl)}/${file}`;
    const head = `<meta name="description" content="${esc(`${doc.title} - ${Profile.name}`)}">
    <link rel="canonical" href="${url(legalFile(page, lang))}">
    <link rel="alternate" hreflang="en" href="${url(legalFile(page, 'en'))}">
    <link rel="alternate" hreflang="pl" href="${url(legalFile(page, 'pl'))}">
    <title>${esc(`${doc.title} | ${Profile.name}`)}</title>`;

    return frame(lang, {
        head,
        icons: [...Object.values(LEGAL_ICONS), 'actTrash'],
        title: s[page],
        flags: { en: legalFile(page, 'en'), pl: legalFile(page, 'pl') },
        home,
        current: page,
        content: `
            <section class="group legal-sheet" aria-labelledby="legal-title">
                <nav class="tabs" aria-label="${esc(`${s.privacy}, ${s.terms}, ${s.cookies}`)}">
                    ${LEGAL_PAGES.map(name => `<a class="tab" href="${legalFile(name, lang)}"${name === page ? ' aria-current="page"' : ''}>${icon(LEGAL_ICONS[name])}${s[name]}</a>`).join('')}
                </nav>
                <div class="sheet">
                    <article class="doc">
                        <h1 id="legal-title">${doc.title}</h1>
                        <p class="updated">${s.updated}: <time datetime="${LEGAL_UPDATED}">${updated}</time></p>
                        ${doc.intro}
                        <nav class="toc" aria-label="${s.contents}">
                            <ol>${doc.sections.map(([heading], i) => `<li><a href="#s${i + 1}">${heading}</a></li>`).join('')}</ol>
                        </nav>${sections}
                    </article>
                    <div class="sheet-foot"><a class="btn default" href="${home}">&#9666; ${s.back}</a></div>
                </div>
            </section>`
    });
}

// ---------- CV ----------

const CV_ICONS = {
    location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2zM8 19H5V9.5h3V19zM6.5 8.2a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5zM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5S12.8 13 12.8 14.3V19h-3V9.5h2.9v1.3a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.6 2 3.6 4.7V19z"/></svg>'
};

// "https://www.linkedin.com/in/name/" -> "linkedin.com/in/name"
const bareUrl = url => String(url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

// Escaped text that may break only after "/" or before "@" (never at a hyphen inside a nickname)
const breakable = text => esc(text).split(/(?<=\/)|(?=@)/).map(part => `<span class="cv-nowrap">${part}</span>`).join('<wbr>');

function renderCv(lang) {
    const t = key => tr(lang, key);
    const L = value => esc(loc(value, lang));
    const other = lang === 'pl' ? 'cv.html' : 'cv.pl.html';
    const back = lang === 'pl' ? 'pl.html' : './';
    const site = bareUrl(siteUrl);
    const interests = Profile.interests || [];
    const consent = t('cv.consent');
    const cv = Profile.cv || {};
    const skillGroups = cv.skills || [{ items: Profile.skills }];
    const languages = cv.languages || [];
    const { phone, linkedin } = Profile.contact;

    const contact = [
        ['location', L(Profile.location), null],
        ['phone', esc(phone || ''), phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null],
        ['email', breakable(Profile.contact.email), `mailto:${Profile.contact.email}`],
        ['linkedin', linkedin ? breakable(bareUrl(linkedin)) : '', linkedin],
        ['github', breakable(`github.com/${Profile.contact.github}`), githubUrl()],
        ['web', breakable(site), siteUrl]
    ].filter(([, text]) => text);

    const body = `    <nav class="cv-toolbar" aria-label="CV">
        <a href="${back}">${t('cv.back')}</a>
        <a href="${other}" hreflang="${lang === 'pl' ? 'en' : 'pl'}">${t('cv.otherLanguage')}</a>
        <button class="cv-print" type="button" onclick="window.print()">${t('cv.save')}</button>
        <noscript><style>.cv-print { display: none; }</style><span class="cv-hint">${t('cv.printHint')}</span></noscript>
    </nav>

    <article class="cv-sheet">
        <header class="cv-header">
            <h1>${esc(Profile.name)}</h1>
            <p class="cv-title">${L(cv.title || Profile.title)}</p>
        </header>

        <div class="cv-columns">
            <aside class="cv-sidebar">
                <section class="cv-section">
                    <h2>${t('cv.contact')}</h2>
                    <ul class="cv-contact">
                        ${contact.map(([icon, text, href]) => `<li>${CV_ICONS[icon]}${href ? `<a href="${esc(href)}">${text}</a>` : `<span>${text}</span>`}</li>`).join('')}
                    </ul>
                </section>

                <section class="cv-section">
                    <h2>${t('section.skills')}</h2>
${skillGroups.map(group => `                    <div class="cv-skill-group">${group.group ? `
                        <h3>${L(group.group)}</h3>` : ''}
                        <ul class="cv-skills">${group.items.map(skill => `<li>${L(skill)}</li>`).join('')}</ul>
                    </div>`).join('\n')}
                </section>
${languages.length ? `
                <section class="cv-section">
                    <h2>${t('cv.languages')}</h2>
                    <ul class="cv-languages">
                        ${languages.map(item => `<li><span>${L(item.name)}</span><span class="cv-level">${L(item.level)}</span></li>`).join('')}
                    </ul>
                </section>
` : ''}${interests.length ? `
                <section class="cv-section">
                    <h2>${t('section.interests')}</h2>
                    <ul class="cv-interests">
                        ${interests.map(item => `<li>${L(item)}</li>`).join('')}
                    </ul>
                </section>
` : ''}            </aside>

            <main class="cv-main">
                <section class="cv-section">
                    <h2>${t('cv.profile')}</h2>
                    <p class="cv-profile">${L(cv.profile || Profile.about)}</p>
                </section>

                <section class="cv-section">
                    <h2>${t('section.experience')}</h2>
                    <div class="cv-timeline">
${Profile.experience.map(job => `                        <div class="cv-entry">
                            <div class="cv-entry-head"><span class="cv-entry-title">${L(job.role)}</span><span class="cv-entry-date">${L(job.date)}</span></div>
                            <div class="cv-entry-sub">${L(job.company)}</div>
                            <p class="cv-entry-desc">${L(job.description)}</p>
                        </div>`).join('')}
                    </div>
                </section>

                <section class="cv-section">
                    <h2>${t('section.projects')}</h2>
                    <div class="cv-projects">
${featured().map(project => ({ ...project, ...cv.projects?.[project.name] })).map(project => `                        <div class="cv-project">
                            <div class="cv-project-head">
                                <span><a class="cv-project-name" href="${esc(project.url)}">${esc(project.name)}</a>${project.tech || project.language ? `<span class="cv-project-tech">${esc(project.tech || project.language)}</span>` : ''}</span>
                                ${project.url ? `<a class="cv-project-url" href="${esc(project.url)}">${breakable(bareUrl(project.url))}</a>` : ''}
                            </div>
                            <p class="cv-entry-desc">${L(project.description)}</p>
                        </div>`).join('')}
                    </div>
                </section>

                <section class="cv-section">
                    <h2>${t('section.education')}</h2>
                    <div class="cv-timeline">
${Profile.education.map(edu => `                        <div class="cv-entry">
                            <div class="cv-entry-head"><span class="cv-entry-title">${L(edu.degree)}</span><span class="cv-entry-date">${L(edu.date)}</span></div>
                            <div class="cv-entry-sub">${L(edu.school)}</div>
                        </div>`).join('')}
                    </div>
                </section>
            </main>
        </div>
${consent ? `
        <footer class="cv-consent">${esc(consent)}</footer>
` : ''}    </article>`;

    return standalonePage(lang, {
        title: `${Profile.name} - CV`,
        head: `<meta name="description" content="${esc(`${Profile.name} - CV`)}">
    <link rel="canonical" href="${esc(siteUrl)}/${lang === 'pl' ? 'cv.pl.html' : 'cv.html'}">`,
        body,
        css: 'css/cv.css'
    });
}

// ---------- Contact form replies ----------

function renderReply(lang, kind) {
    const t = key => tr(lang, key);
    const back = lang === 'pl' ? 'pl.html#contact' : './#contact';
    const body = `<div class="static-page">
    <main class="static-main">
        <div class="static-window static-dialog" role="alertdialog" aria-labelledby="reply-title">
            <div class="static-titlebar">${LOGO}<span class="static-titlebar-text" id="reply-title">${t(`${kind}.title`)}</span></div>
            <div class="static-dialog-body">
                <span class="static-dialog-icon" aria-hidden="true">${kind === 'sent' ? '✉' : '⚠'}</span>
                <div>
                    <p>${t(`${kind}.body`)}</p>
                    ${kind === 'error' ? `<p><a href="mailto:${esc(Profile.contact.email)}">${esc(Profile.contact.email)}</a></p>` : ''}
                    <a class="static-button" href="${back}">${t('sent.back')}</a>
                </div>
            </div>
        </div>
    </main>
</div>`;
    return standalonePage(lang, { title: `${t(`${kind}.title`)} | ${Profile.name}`, head: '<meta name="robots" content="noindex">', body });
}

// ---------- 404 and sitemap ----------

function renderNotFound() {
    const body = `<div class="static-page">
    <main class="static-main">
        <div class="static-window static-dialog" role="alertdialog" aria-labelledby="notfound-title">
            <div class="static-titlebar">${LOGO}<span class="static-titlebar-text" id="notfound-title">${tr('en', 'notfound.title')}</span></div>
            <div class="static-dialog-body">
                <span class="static-dialog-icon" aria-hidden="true">⚠</span>
                <div>
                    <p>${tr('en', 'notfound.body')}</p>
                    <p lang="pl">${tr('pl', 'notfound.body')}</p>
                    <a class="static-button" href="/">${tr('en', 'sent.back')}</a>
                </div>
            </div>
        </div>
    </main>
</div>`;
    return standalonePage('en', { title: `404 | ${Profile.name}`, head: '<meta name="robots" content="noindex">', body });
}

function renderSitemap() {
    const today = new Date().toISOString().slice(0, 10);
    const alternates = `
        <xhtml:link rel="alternate" hreflang="en" href="${esc(siteUrl)}/"/>
        <xhtml:link rel="alternate" hreflang="pl" href="${esc(siteUrl)}/pl.html"/>`;
    const urls = [
        ['/', '1.0', alternates],
        ['/pl.html', '0.9', alternates],
        ['/cv.html', '0.7', ''],
        ['/cv.pl.html', '0.6', ''],
        ...LEGAL_PAGES.flatMap(page => {
            const pair = `
        <xhtml:link rel="alternate" hreflang="en" href="${esc(siteUrl)}/${legalFile(page, 'en')}"/>
        <xhtml:link rel="alternate" hreflang="pl" href="${esc(siteUrl)}/${legalFile(page, 'pl')}"/>`;
            return [[`/${legalFile(page, 'en')}`, '0.3', pair], [`/${legalFile(page, 'pl')}`, '0.3', pair]];
        })
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(([loc_, priority, extra]) => `    <url>
        <loc>${esc(siteUrl)}${loc_}</loc>
        <lastmod>${today}</lastmod>
        <priority>${priority}</priority>${extra}
    </url>`).join('\n')}
</urlset>
`;
}

// ---------- Write files ----------

async function main() {
    await mkdir(OUT_DIR, { recursive: true });
    const outputs = {};

    // index.html (English) and pl.html (Polish) are the landing page; os.html is the
    // desktop (os.html?lang=pl starts it in Polish). It needs JavaScript, so its
    // canonical page is the landing page, which works without it.
    outputs['index.html'] = renderHome('en');
    outputs['pl.html'] = renderHome('pl');
    let os = await readFile(path.join(ROOT, 'os.html'), 'utf8');
    os = replaceBetween(os, 'meta', metaTags('en', `${siteUrl}/`, { title: `PortfolioOS | ${Profile.name}`, alternates: false }));
    outputs['os.html'] = replaceBetween(os, 'lang', '');
    outputs['404.html'] = renderNotFound();
    outputs['robots.txt'] = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
    outputs['sitemap.xml'] = renderSitemap();

    outputs['cv.html'] = renderCv('en');
    outputs['cv.pl.html'] = renderCv('pl');
    outputs['contact-sent.html'] = renderReply('en', 'sent');
    outputs['contact-sent.pl.html'] = renderReply('pl', 'sent');
    outputs['contact-error.html'] = renderReply('en', 'error');
    outputs['contact-error.pl.html'] = renderReply('pl', 'error');
    for (const page of LEGAL_PAGES) {
        for (const lang of ['en', 'pl']) outputs[legalFile(page, lang)] = renderLegal(lang, page);
    }

    for (const [name, content] of Object.entries(outputs)) {
        await writeFile(path.join(OUT_DIR, name), content, 'utf8');
    }
    console.log(`Static pages for ${Profile.name} written to ${OUT_DIR}: ${Object.keys(outputs).join(', ')}`);
}

await main();
