/**
 * Projects App - Curated repository browser based on the public GitHub profile.
 */

import { Icons } from '../icons.js?v=15';

const repositories = [
    { name: 'BreadMusic', language: 'JavaScript', description: 'Music bot packed with features.', stars: 3, license: 'AGPL-3.0', updated: 'Jun 18, 2026', url: 'https://github.com/al3ksh/BreadMusic', featured: true },
    { name: 'atmsimulator', language: 'C++', description: 'Objectively written C++ money printer.', updated: 'May 20, 2026', url: 'https://github.com/al3ksh/atmsimulator' },
    { name: 'Shapey-Tower', language: 'C++', description: 'A tiny vertical arcade platformer.', stars: 1, license: 'MIT', updated: 'May 14, 2026', url: 'https://github.com/al3ksh/Shapey-Tower', featured: true },
    { name: 'Medium', language: 'JavaScript', description: 'A self-hosted, single-server chat platform with text and voice channels, file sharing and more.', stars: 1, license: 'MIT', updated: 'May 12, 2026', url: 'https://github.com/al3ksh/Medium', featured: true },
    { name: 'PortfolioOS', language: 'JavaScript', description: 'An interactive Windows 3.1-style portfolio operating system.', stars: 1, updated: 'Apr 24, 2026', url: 'https://github.com/al3ksh/PortfolioOS', featured: true },
    { name: 'Tools', language: 'JavaScript', description: 'A collection of utility scripts and tools.', stars: 1, updated: 'Apr 15, 2026', url: 'https://github.com/al3ksh/Tools' },
    { name: 'asmpong', language: 'Assembly', description: 'Classic Pong with a terminal UI and sound, written in x86_64 Assembly (NASM) for Windows.', updated: 'Mar 25, 2026', url: 'https://github.com/al3ksh/asmpong' },
    { name: 'al3ksh', language: 'JavaScript', description: 'The public profile repository for aleksh.xyz.', updated: 'Mar 18, 2026', url: 'https://github.com/al3ksh/al3ksh' },
    { name: 'Czytaj24', language: 'EJS', description: 'E-commerce bookstore built with Node.js, Express and MongoDB.', license: 'MIT', updated: 'Jan 21, 2026', url: 'https://github.com/al3ksh/Czytaj24' },
    { name: 'Spinning-Donut', language: 'C++', description: 'A colorful spinning donut.', license: 'MIT', updated: 'Nov 21, 2025', url: 'https://github.com/al3ksh/Spinning-Donut' },
    { name: 'LightsOut', language: 'JavaScript', description: 'A web version of the classic Lights Out puzzle.', url: 'https://github.com/al3ksh/LightsOut' },
];

const languageColors = {
    JavaScript: '#f1e05a',
    'C++': '#f34b7d',
    Assembly: '#6e4c13',
    EJS: '#a91e50'
};

function renderRepository(repository) {
    const starText = repository.stars ? `★ ${repository.stars}` : '—';
    const licenseText = repository.license || 'No license listed';
    const languageColor = languageColors[repository.language] || '#808080';

    return `
        <article class="project-repository${repository.featured ? ' is-featured' : ''}" data-name="${repository.name.toLowerCase()}" data-language="${repository.language}">
            <div class="project-repository-main">
                <div class="project-repository-heading">
                    <span class="project-folder-icon" aria-hidden="true">${Icons.projects}</span>
                    <h3><a href="${repository.url}" target="_blank" rel="noopener noreferrer">${repository.name}</a></h3>
                    ${repository.featured ? '<span class="project-featured">Featured</span>' : ''}
                </div>
                <p>${repository.description}</p>
            </div>
            <div class="project-repository-meta">
                <span><i class="language-dot" style="background:${languageColor}" aria-hidden="true"></i>${repository.language}</span>
                <span>${starText}</span>
                <span>${licenseText}</span>
                ${repository.updated ? `<time datetime="${repository.updated}">Updated ${repository.updated}</time>` : ''}
            </div>
        </article>
    `;
}

export const ProjectsApp = {
    id: 'projects',
    title: 'Projects.exe',
    icon: Icons.projects,
    width: 780,
    height: 590,
    minWidth: 340,
    minHeight: 360,
    hasMenu: true,
    menuItems: ['File', 'View', 'Help'],
    menuConfig: {
        File: [
            { label: 'Open GitHub Profile', action: 'github' },
            { divider: true },
            { label: 'Close', action: 'close', shortcut: 'Alt+F4' }
        ],
        View: [
            { label: 'Refresh list', action: 'refresh', shortcut: 'F5' },
            { label: 'Featured only', action: 'featured', checked: false }
        ],
        Help: [
            { label: 'About Projects', action: 'about' }
        ]
    },

    render() {
        return `
            <div class="projects-app">
                <header class="projects-header">
                    <div class="projects-header-icon" aria-hidden="true">${Icons.projects}</div>
                    <div>
                        <h2>Projects</h2>
                        <p>Public repositories by Aleks Szotek · 11 repositories</p>
                    </div>
                    <a class="win-btn projects-github-link" href="https://github.com/al3ksh?tab=repositories" target="_blank" rel="noopener noreferrer">Open GitHub</a>
                </header>
                <div class="projects-toolbar" role="search">
                    <label for="projectsSearch">Find a project</label>
                    <input id="projectsSearch" class="win-input" type="search" placeholder="Name or description…" autocomplete="off">
                    <label for="projectsLanguage" class="visually-hidden">Filter by language</label>
                    <select id="projectsLanguage" class="win-select">
                        <option value="all">All languages</option>
                        <option>JavaScript</option>
                        <option>C++</option>
                        <option>Assembly</option>
                        <option>EJS</option>
                    </select>
                    <span id="projectsResultStatus" class="projects-result-status" role="status" aria-live="polite">11 projects shown</span>
                </div>
                <div id="projectsList" class="projects-list" role="list">
                    ${repositories.map(renderRepository).join('')}
                </div>
                <p class="projects-source">Snapshot based on <a href="https://github.com/al3ksh?tab=repositories" target="_blank" rel="noopener noreferrer">github.com/al3ksh</a>. Repository names, descriptions and metadata are linked to their public source.</p>
            </div>
        `;
    },

    onInit() {
        const windowEl = document.querySelector('#window-projects');
        if (!windowEl) return;

        const search = windowEl.querySelector('#projectsSearch');
        const language = windowEl.querySelector('#projectsLanguage');
        const list = windowEl.querySelector('#projectsList');

        const applyFilter = () => {
            const query = (search?.value || '').trim().toLowerCase();
            const selectedLanguage = language?.value || 'all';
            const featuredOnly = Boolean(ProjectsApp.menuConfig.View.find(item => item.action === 'featured')?.checked);
            let visible = 0;

            windowEl.querySelectorAll('.project-repository').forEach((card) => {
                const matchesQuery = !query || card.dataset.name.includes(query) || card.textContent.toLowerCase().includes(query);
                const matchesLanguage = selectedLanguage === 'all' || card.dataset.language === selectedLanguage;
                const matchesFeatured = !featuredOnly || card.classList.contains('is-featured');
                const isVisible = matchesQuery && matchesLanguage && matchesFeatured;
                card.hidden = !isVisible;
                card.classList.toggle('is-filtered-out', !isVisible);
                if (isVisible) visible++;
            });

            const empty = list?.querySelector('.projects-empty');
            if (empty) empty.remove();
            if (!visible && list) {
                list.insertAdjacentHTML('beforeend', '<p class="projects-empty" role="status">No projects match this filter.</p>');
            }
            const resultStatus = windowEl.querySelector('#projectsResultStatus');
            if (resultStatus) resultStatus.textContent = `${visible} project${visible === 1 ? '' : 's'} shown`;
        };

        search?.addEventListener('input', () => applyFilter());
        search?.addEventListener('search', () => applyFilter());
        language?.addEventListener('change', () => applyFilter());
        windowEl.querySelector('.projects-github-link')?.addEventListener('click', () => windowEl.querySelector('.projects-github-link')?.blur());
        windowEl._projectsApplyFilter = applyFilter;
    },

    onMenuAction(action) {
        if (action === 'github') window.open('https://github.com/al3ksh?tab=repositories', '_blank', 'noopener,noreferrer');
        if (action === 'refresh') {
            const windowEl = document.querySelector('#window-projects');
            const list = windowEl?.querySelector('#projectsList');
            if (list) {
                list.innerHTML = repositories.map(renderRepository).join('');
                windowEl._projectsApplyFilter?.();
            }
        }
        if (action === 'featured') {
            this.toggleMenuChecked('View', 'featured');
            this.element._projectsApplyFilter?.();
        }
    },

    onClose() {
        const featuredItem = ProjectsApp.menuConfig.View.find(item => item.action === 'featured');
        if (featuredItem) featuredItem.checked = false;
    }
};

export default ProjectsApp;
