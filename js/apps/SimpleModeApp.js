/**
 * Simple Mode App - Plain HTML view of Portfolio
 */

import { Icons } from '../icons.js?v=15';
import { PortfolioApp } from './PortfolioApp.js?v=15';
import { Profile, githubUrl, featuredProjects } from '../config.js?v=15';

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
                    <span>${Icons.fileText} Plain HTML Portfolio View</span>
                    <button class="win-btn win-btn-sm" id="simplePrintBtn">${Icons.actPrint} Print</button>
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
                    <p class="simple-subtitle">${Profile.title}</p>
                    <p class="simple-location">${Icons.secLocation} ${Profile.location}</p>
                </header>

                <section class="simple-section">
                    <h2>${Icons.secUser} About Me</h2>
                    <p>${Profile.about}</p>
                </section>

                <section class="simple-section">
                    <h2>${Icons.secBriefcase} Experience</h2>
                    ${Profile.experience.map(job => `
                        <div class="simple-item">
                            <strong>${job.role}</strong> @ ${job.company}
                            <span class="simple-date">${job.date}</span>
                            <p>${job.description}</p>
                        </div>
                    `).join('')}
                </section>

                <section class="simple-section">
                    <h2>${Icons.secLightbulb} Skills</h2>
                    <div class="simple-skills">
                        ${Profile.skills.map(skill => `<span class="simple-skill">${skill}</span>`).join('')}
                    </div>
                </section>

                <section class="simple-section">
                    <h2>${Icons.smFolder} Projects</h2>
                    ${featuredProjects().map(project => `
                        <div class="simple-item">
                            <strong><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.name}</a></strong>
                            <p>${project.description}</p>
                            <small>${project.tech || project.language}</small>
                        </div>
                    `).join('')}
                </section>

                <section class="simple-section">
                    <h2>${Icons.secGraduation} Education</h2>
                    ${Profile.education.map(edu => `
                        <div class="simple-item">
                            <strong>${edu.degree}</strong>
                            <span class="simple-date">${edu.date}</span>
                            <p>${edu.school}</p>
                        </div>
                    `).join('')}
                </section>

                <section class="simple-section">
                    <h2>${Icons.secMail} Contact</h2>
                    <ul class="simple-contact">
                        <li>${Icons.secMail} Email: <a href="mailto:${Profile.contact.email}">${Profile.contact.email}</a></li>
                        <li>${Icons.socialGithub} GitHub: <a href="${githubUrl()}" target="_blank" rel="noopener noreferrer">@${Profile.contact.github}</a></li>
                        <li>${Icons.socialDiscord} Discord: ${Profile.contact.discord}</li>
                    </ul>
                </section>

                <footer class="simple-footer">
                    <p>© ${new Date().getFullYear()} ${Profile.name}. Generated with Portfolio OS.</p>
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
