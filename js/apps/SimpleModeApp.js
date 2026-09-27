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
        return `
            <div class="simple-portfolio">
                <header class="simple-header">
                    <h1>${Profile.name}</h1>
                    <p class="simple-subtitle">${loc(Profile.title)}</p>
                    <p class="simple-location">${Icons.secLocation} ${loc(Profile.location)}</p>
                </header>

                <section class="simple-section">
                    <h2>${Icons.secUser} ${t('section.about')}</h2>
                    <p>${loc(Profile.about)}</p>
                </section>

                <section class="simple-section">
                    <h2>${Icons.secBriefcase} ${t('section.experience')}</h2>
                    ${Profile.experience.map(job => `
                        <div class="simple-item">
                            <strong>${loc(job.role)}</strong> @ ${loc(job.company)}
                            <span class="simple-date">${loc(job.date)}</span>
                            <p>${loc(job.description)}</p>
                        </div>
                    `).join('')}
                </section>

                <section class="simple-section">
                    <h2>${Icons.secLightbulb} ${t('section.skills')}</h2>
                    <div class="simple-skills">
                        ${Profile.skills.map(skill => `<span class="simple-skill">${skill}</span>`).join('')}
                    </div>
                </section>

                <section class="simple-section">
                    <h2>${Icons.smFolder} ${t('section.projects')}</h2>
                    ${featuredProjects().map(project => `
                        <div class="simple-item">
                            <strong><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.name}</a></strong>
                            <p>${loc(project.description)}</p>
                            <small>${project.tech || project.language}</small>
                        </div>
                    `).join('')}
                </section>

                <section class="simple-section">
                    <h2>${Icons.secGraduation} ${t('section.education')}</h2>
                    ${Profile.education.map(edu => `
                        <div class="simple-item">
                            <strong>${loc(edu.degree)}</strong>
                            <span class="simple-date">${loc(edu.date)}</span>
                            <p>${loc(edu.school)}</p>
                        </div>
                    `).join('')}
                </section>

                <section class="simple-section">
                    <h2>${Icons.secMail} ${t('section.contact')}</h2>
                    <ul class="simple-contact">
                        <li>${Icons.secMail} Email: <a href="mailto:${Profile.contact.email}">${Profile.contact.email}</a></li>
                        <li>${Icons.socialGithub} GitHub: <a href="${githubUrl()}" target="_blank" rel="noopener noreferrer">@${Profile.contact.github}</a></li>
                        <li>${Icons.socialDiscord} Discord: ${Profile.contact.discord}</li>
                    </ul>
                </section>

                <footer class="simple-footer">
                    <p>© ${new Date().getFullYear()} ${Profile.name}. ${t('simple.footer')}</p>
                </footer>
            </div>
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
