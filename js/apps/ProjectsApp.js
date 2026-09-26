/**
 * Projects App - Curated repository browser based on the public GitHub profile.
 */

import { Icons } from '../icons.js?v=15';
import { Profile, githubUrl } from '../config.js?v=15';

const repositories = Profile.projects;

const languageColors = {
    JavaScript: '#f1e05a',
    'C++': '#f34b7d',
    Assembly: '#6e4c13',
    EJS: '#a91e50',
    Python: '#3572a5',
    TypeScript: '#3178c6'
};

const languages = [...new Set(repositories.map(repository => repository.language))];
const repositoriesUrl = () => githubUrl('?tab=repositories');

function renderRepository(repository) {
    const starText = repository.stars ? `★ ${repository.stars}` : '-';
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
                        <p>Public repositories by ${Profile.name} · ${repositories.length} repositories</p>
                    </div>
                    <a class="win-btn projects-github-link" href="${repositoriesUrl()}" target="_blank" rel="noopener noreferrer">Open GitHub</a>
                </header>
                <div class="projects-toolbar" role="search">
                    <label for="projectsSearch">Find a project</label>
                    <input id="projectsSearch" class="win-input" type="search" placeholder="Name or description…" autocomplete="off">
                    <label for="projectsLanguage" class="visually-hidden">Filter by language</label>
                    <select id="projectsLanguage" class="win-select">
                        <option value="all">All languages</option>
                        ${languages.map(language => `<option>${language}</option>`).join('')}
                    </select>
                    <span id="projectsResultStatus" class="projects-result-status" role="status" aria-live="polite">${repositories.length} projects shown</span>
                </div>
                <div id="projectsList" class="projects-list" role="list">
                    ${repositories.map(renderRepository).join('')}
                </div>
                <p class="projects-source">Snapshot based on <a href="${repositoriesUrl()}" target="_blank" rel="noopener noreferrer">github.com/${Profile.contact.github}</a>. Repository names, descriptions and metadata are linked to their public source.</p>
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
        if (action === 'github') window.open(repositoriesUrl(), '_blank', 'noopener,noreferrer');
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
