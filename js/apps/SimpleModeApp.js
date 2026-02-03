/**
 * Simple Mode App - Plain HTML view of Portfolio
 */

import { Icons } from '../icons.js';
import { PortfolioApp } from './PortfolioApp.js';

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
                    <span>📄 Plain HTML Portfolio View</span>
                    <button class="win-btn win-btn-sm" id="simplePrintBtn">🖨️ Print</button>
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
                    <h1>Aleks Szotek</h1>
                    <p class="simple-subtitle">Full-Stack Developer</p>
                    <p class="simple-location">📍 Silesia, Poland</p>
                </header>

                <section class="simple-section">
                    <h2>👤 About Me</h2>
                    <p>Computer Science student at Silesian University of Technology. 
                    Certified in INF.03 (Web Dev & Databases) and INF.04 (App Development).
                    Backend & Web Developer — building efficient web applications with focus on
                    clean code and backend architecture.</p>
                </section>

                <section class="simple-section">
                    <h2>💼 Experience</h2>
                    <div class="simple-item">
                        <strong>Full-Stack Developer (Contract)</strong> @ RecodeIT · D9 Space
                        <span class="simple-date">2024</span>
                        <p>Built reservation system for d9space.com. Implemented multi-step booking flow 
                        with PHP/WordPress, backend logic for availability and admin interface.</p>
                    </div>
                    <div class="simple-item">
                        <strong>Full-Stack Intern</strong> @ RecodeIT
                        <span class="simple-date">2024</span>
                        <p>Built full-stack features using T3 Stack (Next.js, TypeScript, Tailwind, PostgreSQL, Drizzle ORM).
                        Extended employee management panel with leave/holiday management system.</p>
                    </div>
                    <div class="simple-item">
                        <strong>Intern</strong> @ RecodeIT
                        <span class="simple-date">2023</span>
                        <p>First professional experience in software development environment.</p>
                    </div>
                </section>

                <section class="simple-section">
                    <h2>🛠️ Skills</h2>
                    <div class="simple-skills">
                        <span class="simple-skill">JavaScript</span>
                        <span class="simple-skill">TypeScript</span>
                        <span class="simple-skill">Python</span>
                        <span class="simple-skill">C++</span>
                        <span class="simple-skill">C#</span>
                        <span class="simple-skill">Node.js</span>
                        <span class="simple-skill">Express</span>
                        <span class="simple-skill">Next.js</span>
                        <span class="simple-skill">MongoDB</span>
                        <span class="simple-skill">MySQL</span>
                        <span class="simple-skill">PostgreSQL</span>
                        <span class="simple-skill">PHP</span>
                        <span class="simple-skill">WordPress</span>
                        <span class="simple-skill">Tailwind</span>
                        <span class="simple-skill">Git</span>
                        <span class="simple-skill">LLMs</span>
                    </div>
                </section>

                <section class="simple-section">
                    <h2>📁 Projects</h2>
                    <div class="simple-item">
                        <strong>Czytaj24</strong>
                        <p>E-commerce bookstore with full shopping cart, user accounts and order management.</p>
                        <small>Node.js, Express, MongoDB, EJS</small>
                    </div>
                    <div class="simple-item">
                        <strong>BreadMusic</strong>
                        <p>Discord music bot with queue management, created with AI assistance.</p>
                        <small>JavaScript, Discord.js</small>
                    </div>
                    <div class="simple-item">
                        <strong>Shapey Tower</strong>
                        <p>Vertical arcade platformer game with procedural generation.</p>
                        <small>C++</small>
                    </div>
                    <div class="simple-item">
                        <strong>Portfolio OS</strong>
                        <p>Interactive Windows 3.1 style portfolio with working apps and games.</p>
                        <small>JavaScript, CSS, HTML</small>
                    </div>
                </section>

                <section class="simple-section">
                    <h2>🎓 Education</h2>
                    <div class="simple-item">
                        <strong>Computer Science</strong>
                        <span class="simple-date">present</span>
                        <p>Silesian University of Technology</p>
                    </div>
                    <div class="simple-item">
                        <strong>Technical School - Computer Programming</strong>
                        <span class="simple-date">2025</span>
                        <p>Certified in INF.03 (Web Dev & Databases) and INF.04 (App Development)</p>
                    </div>
                </section>

                <section class="simple-section">
                    <h2>📫 Contact</h2>
                    <ul class="simple-contact">
                        <li>📧 Email: <a href="mailto:alex.szotek@gmail.com">alex.szotek@gmail.com</a></li>
                        <li>🐙 GitHub: <a href="https://github.com/al3ksh" target="_blank">@al3ksh</a></li>
                        <li>💬 Discord: aleksh8</li>
                    </ul>
                </section>

                <footer class="simple-footer">
                    <p>© 2026 Aleks Szotek. Generated with Portfolio OS.</p>
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
