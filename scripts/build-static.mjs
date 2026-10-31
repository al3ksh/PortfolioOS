#!/usr/bin/env node
/**
 * Generates the static pages from js/config.js:
 *   index.html, pl.html landing page (English / Polish), works without JavaScript
 *   os.html             the desktop: meta tags + static portfolio inside <noscript>
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
const year = new Date().getFullYear();

const LOGO = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><rect x="1" y="1" width="14" height="14" fill="#000"/><rect x="2" y="2" width="12" height="10" fill="#008080"/><rect x="2" y="12" width="12" height="2" fill="#C0C0C0"/><rect x="2" y="12" width="3" height="2" fill="#808080"/><rect x="3" y="3" width="3" height="2" fill="#FFFF80"/><rect x="3" y="7" width="2" height="3" fill="#FFF"/><rect x="8" y="4" width="5" height="5" fill="#C0C0C0"/><rect x="8" y="4" width="5" height="1" fill="#000080"/></svg>';

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

// ---------- Static portfolio ----------

function renderStaticPage(lang, links) {
    const t = key => tr(lang, key);
    const L = value => esc(loc(value, lang));
    const projects = [...featured(), ...Profile.projects.filter(project => !project.featured)];
    const subjects = ['general', 'job', 'project', 'feedback', 'bug'];

    return `<div class="static-page" lang="${lang}">
    <a class="static-skip" href="#static-content">${t('static.skip')}</a>
    <main class="static-main">
        <div class="static-window">
            <div class="static-titlebar">
                ${LOGO}
                <span class="static-titlebar-text">Portfolio.exe</span>
                <span class="static-controls" aria-hidden="true"><span>_</span><span>□</span><span>×</span></span>
            </div>
            <nav class="static-menu" aria-label="Portfolio">
                <a href="#about">${t('section.about')}</a>
                <a href="#experience">${t('section.experience')}</a>
                <a href="#projects">${t('section.projects')}</a>
                <a href="#skills">${t('section.skills')}</a>
                <a href="#education">${t('section.education')}</a>
                <a href="#contact">${t('section.contact')}</a>
                <a class="static-menu-right" href="${links.cv}">${t('static.cv')}</a>
                <a href="${links.otherLanguage}" hreflang="${lang === 'pl' ? 'en' : 'pl'}">${t('static.otherLanguage')}</a>
            </nav>
            <p class="static-notice" role="note">${t('static.notice')}</p>
            <div class="static-body" id="static-content">
                <section class="static-card static-hero is-wide" aria-label="${esc(Profile.name)}">
                    <pre class="static-avatar" aria-hidden="true">${AVATAR}</pre>
                    <div>
                        <h1>${esc(Profile.name)}</h1>
                        <p class="static-role">${L(Profile.title)}</p>
                        <ul class="static-bio">${Profile.bio.map(line => `<li>${L(line)}</li>`).join('')}</ul>
                    </div>
                </section>

                <section class="static-card is-wide" id="about">
                    <h2>${t('section.about')}</h2>
                    <p class="static-desc">${L(Profile.about)}</p>
                </section>

                <section class="static-card" id="experience">
                    <h2>${t('section.experience')}</h2>
                    ${Profile.experience.map(job => `<div class="static-item">
                        <div class="static-item-head"><span>${L(job.role)}</span><span class="static-date">${L(job.date)}</span></div>
                        <div class="static-sub">${L(job.company)}</div>
                        <p class="static-desc">${L(job.description)}</p>
                    </div>`).join('')}
                </section>

                <div>
                    <section class="static-card" id="skills">
                        <h2>${t('section.skills')}</h2>
                        <ul class="static-tags">${Profile.skills.map(skill => `<li>${L(skill)}</li>`).join('')}</ul>
                    </section>
                    <section class="static-card" id="education" style="margin-top:8px">
                        <h2>${t('section.education')}</h2>
                        ${Profile.education.map(edu => `<div class="static-item">
                            <div class="static-item-head"><span>${L(edu.degree)}</span><span class="static-date">${L(edu.date)}</span></div>
                            <div class="static-desc">${L(edu.school)}</div>
                        </div>`).join('')}
                    </section>
                </div>

                <section class="static-card is-wide" id="projects">
                    <h2>${t('section.projects')}</h2>
                    <ul class="static-projects">${projects.map(project => `<li${project.featured ? ' class="static-featured"' : ''}>
                        <a href="${esc(project.url)}" rel="noopener noreferrer">${esc(project.name)}</a>
                        <small>${esc(project.tech || project.language || '')}</small>
                        <span class="static-desc">${L(project.description)}</span>
                    </li>`).join('')}</ul>
                    <p class="static-more"><a href="${esc(githubUrl('?tab=repositories'))}" rel="noopener noreferrer">${t('static.allProjects')} →</a></p>
                </section>

                <section class="static-card is-wide" id="contact">
                    <h2>${t('section.contact')}</h2>
                    <p class="static-desc">${t('static.contactIntro')}</p>
                    <ul class="static-links">
                        <li>E-mail: <a href="mailto:${esc(Profile.contact.email)}">${esc(Profile.contact.email)}</a></li>
                        <li>GitHub: <a href="${esc(githubUrl())}" rel="noopener noreferrer">github.com/${esc(Profile.contact.github)}</a></li>
                        <li>Discord: ${esc(Profile.contact.discord)}</li>
                    </ul>
                    ${Profile.turnstileSiteKey
        ? `<p class="static-desc">${t('static.formNeedsJs')} <a href="mailto:${esc(Profile.contact.email)}">${esc(Profile.contact.email)}</a></p>`
        : `<form class="static-form" action="/api/contact" method="post">
                        <input type="hidden" name="lang" value="${lang}">
                        <label class="static-hp" aria-hidden="true">Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
                        <label>${t('contact.name')} <input type="text" name="name" required maxlength="100" autocomplete="name"></label>
                        <label>${t('contact.email')} <input type="email" name="email" required maxlength="254" autocomplete="email"></label>
                        <label class="is-wide">${t('contact.subject')}
                            <select name="subject">${subjects.map(key => `<option value="${key}">${t(`contact.subject.${key}`)}</option>`).join('')}</select>
                        </label>
                        <label class="is-wide">${t('contact.message')} <textarea name="message" required maxlength="5000" placeholder="${esc(t('contact.messagePlaceholder'))}"></textarea></label>
                        <div class="static-form-actions">
                            <button type="submit">${t('contact.send')}</button>
                            <small>${t('static.formNote')}</small>
                        </div>
                    </form>`}
                    <p class="static-desc">${t('contact.privacy')} <a href="${links.privacy}">${t('contact.privacyLink')}</a></p>
                </section>
            </div>
        </div>
    </main>
    <footer class="static-taskbar">
        <span class="static-start">${LOGO} Start</span>
        <span class="static-task">Portfolio.exe</span>
        <span class="static-tray">${t('static.mode')}<span class="static-copyright"> · © ${year} ${esc(Profile.name)}</span></span>
    </footer>
</div>`;
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
    <link rel="stylesheet" href="${css}?v=16">
</head>
<body>
${body}
</body>
</html>
`;
}

// ---------- Landing page (index.html / pl.html) ----------

// GitHub's language colours, for the dot next to each project
const LANG_COLORS = { javascript: '#f1e05a', typescript: '#3178c6', python: '#3572a5', 'c++': '#f34b7d', c: '#555555', 'c#': '#178600', java: '#b07219', html: '#e34c26', css: '#663399', shell: '#89e051', lua: '#000080' };

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

// Lowercase words a project is tagged with, for the skill filter: "Node.js" stays
// one word and has to match a whole word, so "C" never matches "CSS".
function projectWords(project) {
    const text = [project.language, project.tech, loc(project.description, 'en')].filter(Boolean).join(' ').toLowerCase();
    const words = text.split(/[\s,;:()/]+/).map(word => word.replace(/^["']+|[.!?"']+$/g, '')).filter(Boolean);
    return [...new Set(words)];
}

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
    const words = projects.map(projectWords);
    const chips = Profile.skills
        .map(skill => loc(skill, 'en'))
        .map(skill => [skill, words.filter(list => list.includes(skill.toLowerCase())).length])
        .filter(([, count]) => count > 0);

    const liveUrl = project => project.demo
        || (project.name.toLowerCase() === 'portfolioos' ? boot : Profile.links?.[project.name.toLowerCase()]);

    const items = projects.map((project, i) => {
        const live = liveUrl(project);
        const repo = esc(project.url || githubUrl());
        const language = project.language || '';
        const color = LANG_COLORS[language.toLowerCase()] ?? '#808080';
        const meta = [
            language && `<span class="lang"><i style="background:${color}"></i>${esc(language)}</span>`,
            project.tech && project.tech !== language && `<span>${esc(project.tech)}</span>`,
            project.updated && `<span>${esc(project.updated)}</span>`
        ].filter(Boolean).join('');
        return `
                    <article class="item${project.featured ? ' is-featured' : ''}" data-text="${esc(words[i].join(' '))}">
                        <div class="item-icon">${icon('projects')}${project.featured ? `<span class="badge" title="${t('landing.featured')}">&#9733;</span>` : ''}</div>
                        <div class="item-body">
                            <h3><a href="${repo}" target="_blank" rel="noopener">${esc(project.name)}</a></h3>
                            <p>${L(project.description)}</p>
                            ${meta ? `<div class="item-meta">${meta}</div>` : ''}
                            <div class="item-actions">${live ? `<a class="btn small" href="${esc(live)}"${live === boot ? '' : ' target="_blank" rel="noopener"'}>${t('landing.live')} &#9656;</a>` : ''}<a class="btn small" href="${repo}" target="_blank" rel="noopener">${icon('socialGithub')}${t('landing.repo')}</a></div>
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
                            <a class="btn default" href="${boot}">${LOGO}${t('landing.boot')} &#9656;</a>
                        </div>
                    </div>
                    <aside class="props" aria-labelledby="props-title">
                        <h3 id="props-title">${t('landing.spec')}</h3>
                        <dl>
                            <dt>${t('landing.role')}:</dt><dd>${L(Profile.title)}</dd>
                            <dt>${t('landing.based')}:</dt><dd>${L(Profile.location)}</dd>
                            <dt>${t('landing.stack')}:</dt><dd>${Profile.skills.slice(0, 5).map(L).join(', ')}&hellip;</dd>
                            <dt>${t('landing.langs')}:</dt><dd>${t('landing.langsValue')}</dd>${Profile.openToWork === false ? '' : `
                            <dt>${t('landing.status')}:</dt><dd><span class="status"><i></i>${t('landing.open')}</span></dd>`}
                        </dl>
                    </aside>
                </div>
            </section>

            <section id="works" class="group" aria-labelledby="works-title">
                <h2 class="legend" id="works-title">${icon('projects')}${t('landing.works')}</h2>
                <div class="explorer">
                    ${chips.length ? `<div class="toolbar filter" role="group" aria-label="${t('landing.filter')}" hidden>
                        <button class="chip" type="button" data-skill="" aria-pressed="true">${t('landing.all')}</button>${chips.map(([skill]) => `<button class="chip" type="button" data-skill="${esc(skill.toLowerCase())}" aria-pressed="false">${esc(skill)}</button>`).join('')}
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
                    <a class="mini-desktop" href="${boot}" aria-label="${t('landing.boot')}">${OS_APPS.map(([name, label]) => `<span class="desk-icon">${icon(name)}<span>${L(label)}</span></span>`).join('')}</a>
                    <div class="boot-text">
                        <h3>${t('landing.bootHead')}</h3>
                        <p>${t('landing.bootText')}</p>
                        <a class="btn default" href="${boot}">${LOGO}${t('landing.boot')} &#9656;</a>
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
    <link rel="stylesheet" href="css/home.css?v=16">
    <script type="module" src="js/home.js?v=16"></script>
</head>
<body>
    ${sprite(icons)}
    <a class="skip" href="#main">${t('landing.skip')}</a>

    <div class="win" id="top">
        <header class="titlebar">
            ${LOGO}
            <span class="titlebar-text">${esc(title)} - ${esc(Profile.name)}</span>
            <span class="controls" aria-hidden="true"><span>_</span><span>&#9633;</span><span>&times;</span></span>
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
        <a class="start" href="${boot}" title="${t('landing.boot')}">${LOGO}<b>Start</b></a>
        <a class="task" href="#top">${LOGO}<span>${esc(title)}</span></a>
        <span class="tray">
            <button class="tray-btn" type="button" data-theme-toggle aria-pressed="true" title="${t('landing.dark')}" aria-label="${t('landing.dark')}" hidden>${THEME_ICONS}</button>
            <time data-clock>${year}</time>
        </span>
    </nav>
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
        ['email', esc(Profile.contact.email), `mailto:${Profile.contact.email}`],
        ['linkedin', linkedin ? esc(bareUrl(linkedin)) : '', linkedin],
        ['github', `github.com/${esc(Profile.contact.github)}`, githubUrl()],
        ['web', esc(site), siteUrl]
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
${featured().map(project => ({ ...project, ...cv.projects?.[project.name] })).map(project => `                        <div>
                            <a class="cv-project-name" href="${esc(project.url)}">${esc(project.name)}</a>
                            <span class="cv-project-tech">${esc(project.tech || project.language || '')}</span>
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
        ['/os.html', '0.5', ''],
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
    // desktop (os.html?lang=pl starts it in Polish). The static portfolio inside its
    // <noscript> is what no-JS visitors of the desktop see.
    outputs['index.html'] = renderHome('en');
    outputs['pl.html'] = renderHome('pl');
    let os = await readFile(path.join(ROOT, 'os.html'), 'utf8');
    os = replaceBetween(os, 'meta', metaTags('en', `${siteUrl}/os.html`, { title: `PortfolioOS | ${Profile.name}`, alternates: false }));
    os = replaceBetween(os, 'lang', '');
    outputs['os.html'] = replaceBetween(os, 'static', renderStaticPage('en', { cv: 'cv.html', otherLanguage: 'pl.html', privacy: legalFile('privacy', 'en') }));
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
