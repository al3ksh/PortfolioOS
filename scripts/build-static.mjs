#!/usr/bin/env node
/**
 * Generates the no-JavaScript pages from js/config.js:
 *   index.html          meta tags + static portfolio inside <noscript>
 *   pl.html             Polish static portfolio
 *   cv.html, cv.pl.html printable CV
 *   contact-sent(.pl).html, contact-error(.pl).html  replies for the no-JS contact form
 *
 * Usage: node scripts/build-static.mjs [--config js/config.js] [--out .]
 * No dependencies; runs on Node 18+.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function metaTags(lang, pageUrl) {
    const title = `${Profile.name} | ${loc(Profile.title, lang)}`;
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
    <meta name="twitter:image" content="${esc(siteUrl)}/og-image.png">
    <link rel="alternate" hreflang="en" href="${esc(siteUrl)}/">
    <link rel="alternate" hreflang="pl" href="${esc(siteUrl)}/pl.html">
    <link rel="alternate" hreflang="x-default" href="${esc(siteUrl)}/">
    <title>${esc(Profile.name)} | PortfolioOS</title>`;
}

function replaceBetween(source, name, content) {
    const start = `<!-- ${name}:start -->`;
    const end = `<!-- ${name}:end -->`;
    const from = source.indexOf(start);
    const to = source.indexOf(end);
    if (from < 0 || to < from) throw new Error(`index.html is missing the ${name} markers`);
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
    <link rel="stylesheet" href="${css}?v=15">
</head>
<body>
${body}
</body>
</html>
`;
}

// ---------- CV ----------

const CV_ICONS = {
    location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.5 5.3A16.6 16.6 0 0 0 15.4 4l-.5 1a15.3 15.3 0 0 0-5.8 0l-.5-1a16.6 16.6 0 0 0-4.1 1.3C1.9 9.2 1.2 13 1.6 16.7a16.7 16.7 0 0 0 5 2.5l1.1-1.7a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 11.2 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.7a16.6 16.6 0 0 0 5-2.5c.5-4.3-.8-8.1-2.9-11.4zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/></svg>'
};

function renderCv(lang) {
    const t = key => tr(lang, key);
    const L = value => esc(loc(value, lang));
    const other = lang === 'pl' ? 'cv.html' : 'cv.pl.html';
    const back = lang === 'pl' ? 'pl.html' : './';
    const site = siteUrl.replace(/^https?:\/\//, '');
    const interests = Profile.interests || [];
    const consent = t('cv.consent');

    const contact = [
        ['location', L(Profile.location), null],
        ['email', esc(Profile.contact.email), `mailto:${Profile.contact.email}`],
        ['web', esc(site), siteUrl],
        ['github', `github.com/${esc(Profile.contact.github)}`, githubUrl()],
        ['discord', esc(Profile.contact.discord), null]
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
            <p class="cv-title">${L(Profile.title)}</p>
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
                    <ul class="cv-skills">
                        ${Profile.skills.map(skill => `<li>${L(skill)}</li>`).join('')}
                    </ul>
                </section>
${interests.length ? `
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
                    <p class="cv-profile">${L(Profile.about)}</p>
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
${featured().map(project => `                        <div>
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
        ['/cv.html', '0.7', ''],
        ['/cv.pl.html', '0.6', '']
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

    // index.html (English) and pl.html (Polish) are the same desktop; the static
    // portfolio inside is what search engines and no-JS visitors see.
    const template = await readFile(path.join(ROOT, 'index.html'), 'utf8');
    const page = (lang, file, links) => {
        let html = template.replace(/<html lang="[a-z]+">/, `<html lang="${lang}">`);
        html = replaceBetween(html, 'meta', metaTags(lang, `${siteUrl}/${file}`));
        html = replaceBetween(html, 'lang', lang === 'pl'
            // Start the desktop in Polish unless the visitor picked a language before.
            ? "<script>if (!/[?&]lang=/.test(location.search) && !sessionStorage.getItem('lang') && !localStorage.getItem('lang')) sessionStorage.setItem('lang', 'pl');</script>"
            : '');
        return replaceBetween(html, 'static', renderStaticPage(lang, links));
    };
    outputs['index.html'] = page('en', '', { cv: 'cv.html', otherLanguage: 'pl.html' });
    outputs['pl.html'] = page('pl', 'pl.html', { cv: 'cv.pl.html', otherLanguage: './' });
    outputs['404.html'] = renderNotFound();
    outputs['robots.txt'] = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
    outputs['sitemap.xml'] = renderSitemap();

    outputs['cv.html'] = renderCv('en');
    outputs['cv.pl.html'] = renderCv('pl');
    outputs['contact-sent.html'] = renderReply('en', 'sent');
    outputs['contact-sent.pl.html'] = renderReply('pl', 'sent');
    outputs['contact-error.html'] = renderReply('en', 'error');
    outputs['contact-error.pl.html'] = renderReply('pl', 'error');

    for (const [name, content] of Object.entries(outputs)) {
        await writeFile(path.join(OUT_DIR, name), content, 'utf8');
    }
    console.log(`Static pages for ${Profile.name} written to ${OUT_DIR}: ${Object.keys(outputs).join(', ')}`);
}

await main();
