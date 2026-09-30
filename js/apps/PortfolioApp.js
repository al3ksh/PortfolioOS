/**
 * Portfolio App - Main Bento Grid portfolio
 */

import { Icons } from '../icons.js?v=15';
import { WindowManager } from '../managers/WindowManager.js?v=15';
import { Profile, githubUrl, featuredProjects } from '../config.js?v=15';
import { t, loc, lang } from '../i18n.js?v=15';
import { openCv } from './PrinterApp.js?v=15';

export const PortfolioApp = {
    id: 'portfolio',
    title: 'Portfolio.exe',
    icon: Icons.portfolio,
    width: 1000,
    height: 650,
    minWidth: 650,
    minHeight: 450,
    hasMenu: true,
    menuItems: ['File', 'View', 'Help'],

    menuConfig: {
        'File': [
            { label: 'Open README', action: 'openReadme' },
            { label: 'Contact', action: 'openContact' },
            { divider: true },
            { label: 'Print Portfolio...', action: 'print' },
            { divider: true },
            { label: 'Exit', action: 'close', shortcut: 'Alt+F4' }
        ],
        'View': [
            { label: 'Refresh', action: 'refresh', shortcut: 'F5' },
            { divider: true },
            { label: 'View Source', action: 'viewSource', disabled: true }
        ],
        'Help': [
            { label: 'README', action: 'openReadme', shortcut: 'F1' },
            { divider: true },
            { label: 'About Portfolio', action: 'about' }
        ]
    },

    onMenuAction(action) {
        switch(action) {
            case 'openReadme':
                WindowManager.createWindow('readme');
                break;
            case 'openContact':
                WindowManager.createWindow('contact');
                break;
            case 'refresh':
                location.reload();
                break;
            case 'print':
                PortfolioApp.downloadCV();
                break;
        }
    },

    render() {
        return `
            <div class="bento-grid">
                <!-- Hero Card - Profile -->
                <div class="bento-card hero-card" data-span="2x2">
                    <div class="profile-section">
                        <div class="profile-image-frame">
                            <div class="profile-image">
                                <pre class="ascii-art">╔══════════╗
║  ◉    ◉  ║
║    ▼     ║
║  ╰────╯  ║
╚══════════╝</pre>
                            </div>
                        </div>
                        <div class="profile-info">
                            <div class="digital-display">
                                <span class="profile-time">00:00:00</span>
                            </div>
                            <h1 class="profile-name">${Profile.name}</h1>
                            <p class="profile-title">${loc(Profile.title)}</p>
                            <div class="bio-text">
                                ${Profile.bio.map(line => `<p>&gt; ${loc(line)}</p>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- About Card -->
                <div class="bento-card" data-span="2x1">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secUser}</div>
                        <span class="card-title">${t('section.about')}</span>
                    </div>
                    <div class="card-content">
                        <p class="about-text">${loc(Profile.about)}</p>
                    </div>
                </div>

                <!-- Experience Card -->
                <div class="bento-card" data-span="2x1">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secBriefcase}</div>
                        <span class="card-title">${t('section.experience')}</span>
                    </div>
                    <div class="card-content experience-content">
                        ${Profile.experience.map(job => `
                            <div class="exp-item">
                                <div class="exp-header">
                                    <strong>${loc(job.role)}</strong>
                                    <span class="exp-date">${loc(job.date)}</span>
                                </div>
                                <span class="exp-company">${loc(job.company)}</span>
                                <p class="exp-desc">${loc(job.description)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Skills Card -->
                <div class="bento-card">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secLightbulb}</div>
                        <span class="card-title">${t('section.skills')}</span>
                    </div>
                    <div class="card-content">
                        <div class="skills-grid">
                            ${Profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <!-- Projects Card -->
                <div class="bento-card projects-card" data-span="2x1">
                    <div class="card-header">
                        <div class="card-icon">${Icons.portfolio}</div>
                        <button class="card-title project-launch" type="button" aria-label="${t('portfolio.openProjects')}">${t('section.projects')}</button>
                    </div>
                    <div class="card-content projects-content">
                        ${featuredProjects().map(project => `
                            <div class="project-item">
                                <strong><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.name}</a></strong>
                                <span class="project-tech">${project.language}</span>
                                <p>${loc(project.description)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Education Card -->
                <div class="bento-card">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secGraduation}</div>
                        <span class="card-title">${t('section.education')}</span>
                    </div>
                    <div class="card-content">
                        ${Profile.education.map(edu => `
                            <div class="edu-item">
                                <strong>${loc(edu.degree)}</strong>
                                <span class="edu-date">${loc(edu.date)}</span>
                                <p>${loc(edu.school)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Contact Card -->
                <div class="bento-card">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secMail}</div>
                        <span class="card-title">${t('section.contact')}</span>
                    </div>
                    <div class="card-content">
                        <ul class="win-list contact-list">
                            <li><a href="mailto:${Profile.contact.email}">${Icons.secMail} ${Profile.contact.email}</a></li>
                            <li><a href="${githubUrl()}" target="_blank" rel="noopener noreferrer">${Icons.socialGithub} github.com/${Profile.contact.github}</a></li>
                            <li>${Icons.socialDiscord} Discord: ${Profile.contact.discord}</li>
                        </ul>
                    </div>
                </div>

                <!-- Action Card -->
                <div class="bento-card action-card" data-span="2x1">
                    <div class="action-buttons">
                        <button class="win-btn" id="downloadCvBtn">
                            ${Icons.actDownload} ${t('portfolio.downloadCv')}
                        </button>
                        <button class="win-btn primary" id="sendMessageBtn">
                            ${Icons.actSend} ${t('portfolio.sendMessage')}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    onInit() {
        // Download CV button
        const cvBtn = document.querySelector('#downloadCvBtn');
        if (cvBtn) {
            cvBtn.addEventListener('click', () => {
                PortfolioApp.downloadCV();
            });
        }

        // Send Message button opens Contact
        const sendBtn = document.querySelector('#sendMessageBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                WindowManager.createWindow('contact');
            });
        }

        const projectsBtn = document.querySelector('.project-launch');
        projectsBtn?.addEventListener('click', () => {
            WindowManager.createWindow('projects');
        });

        // Start clock in portfolio
        this.clockInterval = setInterval(() => {
            const now = new Date();
            const timeEl = document.querySelector('.profile-time');
            
            if (timeEl) {
                timeEl.textContent = now.toLocaleTimeString('en-US');
            }
        }, 1000);
    },

    onClose() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    },

    // Opens cv.html / cv.pl.html (generated from config.js by scripts/build-static.mjs)
    // right away, inside the click so it isn't blocked as a popup, and lets the
    // Printer app print it on the desktop meanwhile.
    downloadCV() {
        openCv();
        if (!WindowManager.windows.has('printer')) {
            WindowManager.createWindow('printer');
            return;
        }
        // Restart: wait for the old window's close animation to remove it first.
        WindowManager.closeWindow('printer');
        setTimeout(() => WindowManager.createWindow('printer'), 200);
    }
};

export default PortfolioApp;
