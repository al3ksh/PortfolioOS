/**
 * Simple Mode App - Plain HTML view of Portfolio
 */

import { Icons } from '../icons.js?v=15';
import { PortfolioApp } from './PortfolioApp.js?v=15';
import { Profile, githubUrl, featuredProjects } from '../config.js?v=15';
import { t, loc, lang } from '../i18n.js?v=15';

export const SimpleModeApp = {
    id: 'simplemode',
    title: 'Simple View',
    icon: Icons.simplemode,
    width: 700,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    hasMenu: true,
    menuItems: ['File', 'View', 'Help'],

    menuConfig: {
        'File': [
            { label: 'Print...', action: 'print' },
            { divider: true },
            { label: 'Close', action: 'close', shortcut: 'Alt+F4' }
        ],
        'View': [
            { label: 'Refresh', action: 'refresh', shortcut: 'F5' }
        ],
        'Help': [
            { label: 'About Simple View', action: 'about' }
        ]
    },

    onMenuAction(action) {
        switch(action) {
            case 'print':
                window.print();
                break;
            case 'refresh':
                const content = document.querySelector('#window-simplemode .simplemode-content');
                if (content) content.innerHTML = SimpleModeApp.getPortfolioContent();
                break;
        }
    },

    render() {
        return `
            <div class="simplemode-container">
                <div class="simplemode-toolbar">
                    <span>${Icons.fileText} ${t('simple.toolbar')}</span>
                    <button class="win-btn win-btn-sm" id="simplePrintBtn">${Icons.actPrint} ${t('simple.print')}</button>
                </div>
                <div class="simplemode-content">
                    ${SimpleModeApp.getPortfolioContent()}
                </div>
            </div>
        `;
    },

    getPortfolioContent() {
        const site = (Profile.siteUrl || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
        const contact = [
            [Icons.secLocation, loc(Profile.location), null],
            [Icons.secMail, Profile.contact.email, `mailto:${Profile.contact.email}`],
            [Icons.navGlobe, site, Profile.siteUrl],
            [Icons.socialGithub, `github.com/${Profile.contact.github}`, githubUrl()],
            [Icons.socialDiscord, Profile.contact.discord, null]
        ].filter(([, text]) => text);
        const entry = (title, date, sub, desc = '') => `
            <div class="sv-entry">
                <div class="sv-entry-head"><strong>${title}</strong><span class="sv-date">${date}</span></div>
                <div class="sv-sub">${sub}</div>
                ${desc ? `<p class="sv-desc">${desc}</p>` : ''}
            </div>`;

        return `
            <article class="sv-sheet">
                <header class="sv-header">
                    <h1>${Profile.name}</h1>
                    <p class="sv-title">${loc(Profile.title)}</p>
                </header>
                <div class="sv-columns">
                    <aside class="sv-sidebar">
                        <section>
                            <h2>${t('cv.contact')}</h2>
                            <ul class="sv-contact">
                                ${contact.map(([icon, text, href]) => `<li><span class="sv-icon">${icon}</span>${href ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>` : `<span>${text}</span>`}</li>`).join('')}
                            </ul>
                        </section>
                        <section>
                            <h2>${t('section.skills')}</h2>
                            <ul class="sv-skills">${Profile.skills.map(skill => `<li>${loc(skill)}</li>`).join('')}</ul>
                        </section>
                        ${Profile.interests?.length ? `
                        <section>
                            <h2>${t('section.interests')}</h2>
                            <ul class="sv-interests">${Profile.interests.map(item => `<li>${loc(item)}</li>`).join('')}</ul>
                        </section>` : ''}
                    </aside>
                    <div class="sv-main">
                        <section>
                            <h2>${t('cv.profile')}</h2>
                            <p class="sv-desc">${loc(Profile.about)}</p>
                        </section>
                        <section>
                            <h2>${t('section.experience')}</h2>
                            <div class="sv-timeline">${Profile.experience.map(job => entry(loc(job.role), loc(job.date), loc(job.company), loc(job.description))).join('')}</div>
                        </section>
                        <section>
                            <h2>${t('section.projects')}</h2>
                            <div class="sv-projects">
                                ${featuredProjects().map(project => `
                                    <div>
                                        <a class="sv-project-name" href="${project.url}" target="_blank" rel="noopener noreferrer">${project.name}</a>
                                        <span class="sv-project-tech">${project.tech || project.language}</span>
                                        <p class="sv-desc">${loc(project.description)}</p>
                                    </div>`).join('')}
                            </div>
                        </section>
                        <section>
                            <h2>${t('section.education')}</h2>
                            <div class="sv-timeline">${Profile.education.map(edu => entry(loc(edu.degree), loc(edu.date), loc(edu.school))).join('')}</div>
                        </section>
                    </div>
                </div>
                <footer class="sv-footer">© ${new Date().getFullYear()} ${Profile.name} · ${t('simple.footer')}</footer>
            </article>
        `;
    },

    onInit() {
        const printBtn = document.querySelector('#simplePrintBtn');
        printBtn?.addEventListener('click', () => {
            PortfolioApp.downloadCV();
        });
    }
};

export default SimpleModeApp;
