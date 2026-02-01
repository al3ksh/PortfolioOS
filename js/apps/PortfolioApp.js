/**
 * Portfolio App - Main Bento Grid portfolio
 */

import { Icons } from '../icons.js';
import { WindowManager } from '../managers/WindowManager.js';

export const PortfolioApp = {
    id: 'portfolio',
    title: 'Portfolio.exe',
    icon: Icons.portfolio,
    width: 800,
    height: 600,
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
                                <span class="profile-date">00.00.00</span>
                            </div>
                            <h1 class="profile-name">Aleks Szotek</h1>
                            <p class="profile-title">Full-Stack Developer</p>
                            <div class="bio-text">
                                <p>&gt; CS Student @ Silesian Uni of Tech</p>
                                <p>&gt; Backend & Web Developer</p>
                                <p>&gt; Silesia, Poland</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- About Card -->
                <div class="bento-card" data-span="2x1">
                    <div class="card-header">
                        <div class="card-icon">👤</div>
                        <span class="card-title">About Me</span>
                    </div>
                    <div class="card-content">
                        <p class="about-text">Computer Science student at Silesian University of Technology. 
                        Certified in INF.03 (Web Dev & Databases) and INF.04 (App Development). 
                        Backend & Web Developer — building efficient web applications with focus on clean code and backend architecture.</p>
                    </div>
                </div>

                <!-- Experience Card -->
                <div class="bento-card" data-span="2x1">
                    <div class="card-header">
                        <div class="card-icon">💼</div>
                        <span class="card-title">Experience</span>
                    </div>
                    <div class="card-content experience-content">
                        <div class="exp-item">
                            <div class="exp-header">
                                <strong>Full-Stack Developer (Contract)</strong>
                                <span class="exp-date">2024</span>
                            </div>
                            <span class="exp-company">RecodeIT · D9 Space</span>
                            <p class="exp-desc">Built reservation system for d9space.com with multi-step booking flow, PHP/WordPress backend and admin interface.</p>
                        </div>
                        <div class="exp-item">
                            <div class="exp-header">
                                <strong>Full-Stack Intern</strong>
                                <span class="exp-date">2024</span>
                            </div>
                            <span class="exp-company">RecodeIT</span>
                            <p class="exp-desc">Built features using T3 Stack (Next.js, TypeScript, PostgreSQL, Drizzle ORM). Extended employee management panel.</p>
                        </div>
                        <div class="exp-item">
                            <div class="exp-header">
                                <strong>Intern</strong>
                                <span class="exp-date">2023</span>
                            </div>
                            <span class="exp-company">RecodeIT</span>
                            <p class="exp-desc">First professional experience in software development environment.</p>
                        </div>
                    </div>
                </div>

                <!-- Skills Card -->
                <div class="bento-card">
                    <div class="card-header">
                        <div class="card-icon">💡</div>
                        <span class="card-title">Skills</span>
                    </div>
                    <div class="card-content">
                        <div class="skills-grid">
                            <span class="skill-tag">JavaScript</span>
                            <span class="skill-tag">TypeScript</span>
                            <span class="skill-tag">Node.js</span>
                            <span class="skill-tag">Express</span>
                            <span class="skill-tag">Next.js</span>
                            <span class="skill-tag">MongoDB</span>
                            <span class="skill-tag">MySQL</span>
                            <span class="skill-tag">PostgreSQL</span>
                            <span class="skill-tag">PHP</span>
                            <span class="skill-tag">WordPress</span>
                            <span class="skill-tag">Tailwind</span>
                            <span class="skill-tag">Git</span>
                            <span class="skill-tag">C++</span>
                            <span class="skill-tag">C#</span>
                            <span class="skill-tag">LLMs</span>
                        </div>
                    </div>
                </div>

                <!-- Projects Card -->
                <div class="bento-card" data-span="2x1">
                    <div class="card-header">
                        <div class="card-icon">${Icons.portfolio}</div>
                        <span class="card-title">Projects</span>
                    </div>
                    <div class="card-content projects-content">
                        <div class="project-item">
                            <strong>Czytaj24</strong>
                            <span class="project-tech">Node.js, Express, MongoDB</span>
                            <p>E-commerce bookstore with shopping cart and order management.</p>
                        </div>
                        <div class="project-item">
                            <strong>BreadMusic</strong>
                            <span class="project-tech">JavaScript, Discord.js</span>
                            <p>Discord music bot with queue management.</p>
                        </div>
                        <div class="project-item">
                            <strong>Shapey Tower</strong>
                            <span class="project-tech">C++</span>
                            <p>Vertical arcade platformer with procedural generation.</p>
                        </div>
                        <div class="project-item">
                            <strong>Portfolio OS</strong>
                            <span class="project-tech">JavaScript, CSS, HTML</span>
                            <p>Interactive Windows 3.1 style portfolio.</p>
                        </div>
                    </div>
                </div>

                <!-- Education Card -->
                <div class="bento-card">
                    <div class="card-header">
                        <div class="card-icon">🎓</div>
                        <span class="card-title">Education</span>
                    </div>
                    <div class="card-content">
                        <div class="edu-item">
                            <strong>Computer Science</strong>
                            <span class="edu-date">present</span>
                            <p>Silesian University of Technology</p>
                        </div>
                        <div class="edu-item">
                            <strong>Technical School</strong>
                            <span class="edu-date">2025</span>
                            <p>INF.03 & INF.04 Certified</p>
                        </div>
                    </div>
                </div>

                <!-- Contact Card -->
                <div class="bento-card">
                    <div class="card-header">
                        <div class="card-icon">✉️</div>
                        <span class="card-title">Contact</span>
                    </div>
                    <div class="card-content">
                        <ul class="win-list contact-list">
                            <li><a href="mailto:alex.szotek@gmail.com">📧 alex.szotek@gmail.com</a></li>
                            <li><a href="https://github.com/al3ksh" target="_blank">🐙 github.com/al3ksh</a></li>
                            <li>💬 Discord: aleksh8</li>
                        </ul>
                    </div>
                </div>

                <!-- Action Card -->
                <div class="bento-card action-card" data-span="2x1">
                    <div class="action-buttons">
                        <button class="win-btn" id="downloadCvBtn">
                            📄 Download CV
                        </button>
                        <button class="win-btn primary" id="sendMessageBtn">
                            ✉️ Send Message
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

        // Start clock in portfolio
        this.clockInterval = setInterval(() => {
            const now = new Date();
            const timeEl = document.querySelector('.profile-time');
            const dateEl = document.querySelector('.profile-date');
            
            if (timeEl) {
                timeEl.textContent = now.toLocaleTimeString('en-US');
            }
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                }).replace(/\//g, '.');
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
    <title>Aleks Szotek - CV</title>
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
        <h1>Aleks Szotek</h1>
        <p class="subtitle">Full-Stack Developer</p>
        <div class="contact-row">
            <span>Silesia, Poland</span>
            <a href="mailto:alex.szotek@gmail.com">alex.szotek@gmail.com</a>
            <a href="https://github.com/al3ksh">github.com/al3ksh</a>
            <span>Discord: aleksh8</span>
        </div>
    </header>

    <section>
        <h2>About</h2>
        <p class="about-text">Computer Science student at Silesian University of Technology. Certified in INF.03 (Web Development & Databases) and INF.04 (Application Development). Backend & Web Developer focused on building efficient web applications with clean code and solid backend architecture.</p>
    </section>

    <div class="two-columns">
        <div>
            <section>
                <h2>Experience</h2>
                <div class="exp-item">
                    <div class="exp-header">
                        <span class="exp-title">Full-Stack Developer</span>
                        <span class="exp-date">2024</span>
                    </div>
                    <div class="exp-company">RecodeIT · D9 Space (Contract)</div>
                    <p class="exp-desc">Built reservation system for d9space.com. Multi-step booking flow with PHP/WordPress, availability logic and admin interface.</p>
                </div>
                <div class="exp-item">
                    <div class="exp-header">
                        <span class="exp-title">Full-Stack Intern</span>
                        <span class="exp-date">2024</span>
                    </div>
                    <div class="exp-company">RecodeIT</div>
                    <p class="exp-desc">T3 Stack development (Next.js, TypeScript, Tailwind, PostgreSQL, Drizzle ORM). Built leave/holiday management system for employee panel.</p>
                </div>
                <div class="exp-item">
                    <div class="exp-header">
                        <span class="exp-title">Intern</span>
                        <span class="exp-date">2023</span>
                    </div>
                    <div class="exp-company">RecodeIT</div>
                    <p class="exp-desc">First professional software development experience.</p>
                </div>
            </section>

            <section>
                <h2>Education</h2>
                <div class="edu-item">
                    <div class="edu-header">
                        <span class="edu-title">Computer Science</span>
                        <span class="edu-date">2025 - present</span>
                    </div>
                    <p class="exp-desc">Silesian University of Technology</p>
                </div>
                <div class="edu-item">
                    <div class="edu-header">
                        <span class="edu-title">IT Technician</span>
                        <span class="edu-date">2025</span>
                    </div>
                    <p class="exp-desc">Technical School · INF.03 & INF.04 Certifications</p>
                </div>
            </section>
        </div>

        <div>
            <section>
                <h2>Skills</h2>
                <div class="skills-grid">
                    <span class="skill-tag">JavaScript</span>
                    <span class="skill-tag">TypeScript</span>
                    <span class="skill-tag">Node.js</span>
                    <span class="skill-tag">Express</span>
                    <span class="skill-tag">Next.js</span>
                    <span class="skill-tag">React</span>
                    <span class="skill-tag">MongoDB</span>
                    <span class="skill-tag">PostgreSQL</span>
                    <span class="skill-tag">MySQL</span>
                    <span class="skill-tag">PHP</span>
                    <span class="skill-tag">WordPress</span>
                    <span class="skill-tag">Tailwind</span>
                    <span class="skill-tag">Git</span>
                    <span class="skill-tag">C++</span>
                    <span class="skill-tag">C#</span>
                    <span class="skill-tag">LLMs</span>
                </div>
            </section>

            <section>
                <h2>Projects</h2>
                <div class="project-item">
                    <strong>Czytaj24</strong><span class="project-tech">Node.js, Express, MongoDB</span>
                    <p class="project-desc">E-commerce bookstore with cart, user accounts, order management.</p>
                </div>
                <div class="project-item">
                    <strong>BreadMusic</strong><span class="project-tech">JavaScript, Discord.js</span>
                    <p class="project-desc">Discord music bot with queue management and playback controls.</p>
                </div>
                <div class="project-item">
                    <strong>Shapey Tower</strong><span class="project-tech">C++</span>
                    <p class="project-desc">Vertical arcade platformer with procedural level generation.</p>
                </div>
                <div class="project-item">
                    <strong>Portfolio OS</strong><span class="project-tech">JavaScript, CSS, HTML</span>
                    <p class="project-desc">Interactive Windows 3.1 style portfolio with apps and games.</p>
                </div>
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
