/**
 * Portfolio App - Main Bento Grid portfolio
 */

import { Icons } from '../icons.js?v=15';
import { WindowManager } from '../managers/WindowManager.js?v=15';
import { Profile, githubUrl, featuredProjects } from '../config.js?v=15';

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
                            <p class="profile-title">${Profile.title}</p>
                            <div class="bio-text">
                                ${Profile.bio.map(line => `<p>&gt; ${line}</p>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- About Card -->
                <div class="bento-card" data-span="2x1">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secUser}</div>
                        <span class="card-title">About Me</span>
                    </div>
                    <div class="card-content">
                        <p class="about-text">${Profile.about}</p>
                    </div>
                </div>

                <!-- Experience Card -->
                <div class="bento-card" data-span="2x1">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secBriefcase}</div>
                        <span class="card-title">Experience</span>
                    </div>
                    <div class="card-content experience-content">
                        ${Profile.experience.map(job => `
                            <div class="exp-item">
                                <div class="exp-header">
                                    <strong>${job.role}</strong>
                                    <span class="exp-date">${job.date}</span>
                                </div>
                                <span class="exp-company">${job.company}</span>
                                <p class="exp-desc">${job.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Skills Card -->
                <div class="bento-card">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secLightbulb}</div>
                        <span class="card-title">Skills</span>
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
                        <button class="card-title project-launch" type="button" aria-label="Open Projects application">Projects</button>
                    </div>
                    <div class="card-content projects-content">
                        ${featuredProjects().map(project => `
                            <div class="project-item">
                                <strong><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.name}</a></strong>
                                <span class="project-tech">${project.language}</span>
                                <p>${project.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Education Card -->
                <div class="bento-card">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secGraduation}</div>
                        <span class="card-title">Education</span>
                    </div>
                    <div class="card-content">
                        ${Profile.education.map(edu => `
                            <div class="edu-item">
                                <strong>${edu.degree}</strong>
                                <span class="edu-date">${edu.date}</span>
                                <p>${edu.school}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Contact Card -->
                <div class="bento-card">
                    <div class="card-header">
                        <div class="card-icon">${Icons.secMail}</div>
                        <span class="card-title">Contact</span>
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
                            ${Icons.actDownload} Download CV
                        </button>
                        <button class="win-btn primary" id="sendMessageBtn">
                            ${Icons.actSend} Send Message
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

    downloadCV() {
        const cvHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${Profile.name} - CV</title>
    <style>
        @page {
            size: A4;
            margin: 10mm 12mm;
        }
        @media print {
            html, body { 
                width: 210mm;
                height: 297mm;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
            }
            .no-print { display: none !important; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            line-height: 1.35;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px 25px;
            background: #fff;
        }
        header {
            text-align: center;
            margin-bottom: 12px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2563eb;
        }
        h1 { font-size: 22px; color: #1e40af; margin-bottom: 2px; }
        .subtitle { font-size: 13px; color: #64748b; margin-bottom: 6px; }
        .contact-row {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
            font-size: 10px;
        }
        .contact-row a { color: #2563eb; text-decoration: none; }
        .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        section { margin-bottom: 10px; }
        h2 {
            font-size: 11px;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 8px;
        }
        .about-text { font-size: 10px; color: #475569; }
        .exp-item, .edu-item { margin-bottom: 8px; }
        .exp-header, .edu-header { display: flex; justify-content: space-between; align-items: baseline; }
        .exp-title, .edu-title { font-weight: 600; font-size: 11px; color: #1e293b; }
        .exp-date, .edu-date { font-size: 10px; color: #64748b; }
        .exp-company { font-size: 10px; color: #2563eb; }
        .exp-desc { font-size: 10px; color: #475569; margin-top: 2px; }
        .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .skill-tag {
            background: #e0e7ff;
            color: #3730a3;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 10px;
        }
        .project-item { margin-bottom: 6px; }
        .project-item strong { font-size: 10px; }
        .project-tech { font-size: 9px; color: #64748b; margin-left: 6px; }
        .project-desc { font-size: 10px; color: #475569; }
        .print-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .print-btn:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <header>
        <h1>${Profile.name}</h1>
        <p class="subtitle">${Profile.title}</p>
        <div class="contact-row">
            <span>${Profile.location}</span>
            <a href="mailto:${Profile.contact.email}">${Profile.contact.email}</a>
            <a href="${githubUrl()}">github.com/${Profile.contact.github}</a>
            <span>Discord: ${Profile.contact.discord}</span>
        </div>
    </header>

    <section>
        <h2>About</h2>
        <p class="about-text">${Profile.about}</p>
    </section>

    <div class="two-columns">
        <div>
            <section>
                <h2>Experience</h2>
                ${Profile.experience.map(job => `
                <div class="exp-item">
                    <div class="exp-header">
                        <span class="exp-title">${job.role}</span>
                        <span class="exp-date">${job.date}</span>
                    </div>
                    <div class="exp-company">${job.company}</div>
                    <p class="exp-desc">${job.description}</p>
                </div>`).join('')}
            </section>

            <section>
                <h2>Education</h2>
                ${Profile.education.map(edu => `
                <div class="edu-item">
                    <div class="edu-header">
                        <span class="edu-title">${edu.degree}</span>
                        <span class="edu-date">${edu.date}</span>
                    </div>
                    <p class="exp-desc">${edu.school}</p>
                </div>`).join('')}
            </section>
        </div>

        <div>
            <section>
                <h2>Skills</h2>
                <div class="skills-grid">
                    ${Profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </section>

            <section>
                <h2>Projects</h2>
                ${featuredProjects().map(project => `
                <div class="project-item">
                    <strong><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.name}</a></strong><span class="project-tech">${project.tech || project.language}</span>
                    <p class="project-desc">${project.description}</p>
                </div>`).join('')}
            </section>
        </div>
    </div>

    <button class="print-btn no-print" onclick="window.print()">Save as PDF</button>
</body>
</html>`;

        // Open CV in new window
        const cvWindow = window.open('', '_blank');
        cvWindow.document.write(cvHTML);
        cvWindow.document.close();
    }
};

export default PortfolioApp;
