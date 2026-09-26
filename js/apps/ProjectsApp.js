/**
 * Projects App - Repository browser for the public GitHub profile.
 *
 * The list is loaded live from the GitHub API when the window opens
 * (disable with Profile.githubSync = false). Profile.projects is the
 * offline fallback and decides which repositories are featured.
 */

import { Icons } from '../icons.js?v=15';
import { Profile, githubUrl } from '../config.js?v=15';

let repositories = Profile.projects;
let liveRequest = null;
let sourceState = 'snapshot';

const languageColors = {
    JavaScript: '#f1e05a',
    'C++': '#f34b7d',
    Assembly: '#6e4c13',
    EJS: '#a91e50',
    Python: '#3572a5',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#663399',
    'C#': '#178600',
    C: '#555555',
    Java: '#b07219',
    PHP: '#4f5d95',
    Shell: '#89e051',
    Go: '#00add8',
    Rust: '#dea584'
};

const repositoriesUrl = () => githubUrl('?tab=repositories');
const languagesOf = list => [...new Set(list.map(repository => repository.language))];

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const formatDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

async function fetchGithubRepositories() {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(Profile.contact.github)}/repos?per_page=100&sort=pushed`, {
        headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error(`GitHub API responded with ${response.status}`);

    const publicRepositories = (await response.json()).filter(repo => !repo.fork);
    if (!publicRepositories.length) throw new Error('no public repositories found');

    const configured = new Map(Profile.projects.map(project => [project.name.toLowerCase(), project]));
    return publicRepositories
        .map((repo) => {
            const local = configured.get(repo.name.toLowerCase()) || {};
            const license = repo.license?.spdx_id;
            return {
                ...local,
                name: repo.name,
                language: repo.language || local.language || 'Other',
                description: repo.description || local.description || 'No description provided.',
                stars: repo.stargazers_count,
                license: license && license !== 'NOASSERTION' ? license : local.license,
                updated: formatDate(repo.pushed_at),
                url: repo.html_url
            };
        });
}

// One request per page load; "Refresh list" forces a new one.
function loadRepositories(force = false) {
    if (Profile.githubSync === false) return Promise.resolve(repositories);
    if (!liveRequest || force) {
        liveRequest = fetchGithubRepositories()
            .then((live) => {
                repositories = live;
                sourceState = 'live';
                return live;
            })
            .catch((error) => {
                console.warn('Projects: using the configured snapshot -', error.message);
                liveRequest = null;
                sourceState = 'offline';
                return repositories;
            });
    }
    return liveRequest;
}

function sourceText() {
    const profileLink = `<a href="${repositoriesUrl()}" target="_blank" rel="noopener noreferrer">github.com/${escapeHtml(Profile.contact.github)}</a>`;
    if (sourceState === 'live') return `Live data from ${profileLink}.`;
    if (sourceState === 'offline') return `Could not load live data from GitHub - showing a saved snapshot of ${profileLink}.`;
    return `Snapshot based on ${profileLink}.`;
}

function renderRepository(repository) {
    const starText = repository.stars ? `★ ${repository.stars}` : '-';
    const licenseText = escapeHtml(repository.license || 'No license listed');
    const languageColor = languageColors[repository.language] || '#808080';

    return `
        <article class="project-repository${repository.featured ? ' is-featured' : ''}" data-name="${escapeHtml(repository.name.toLowerCase())}" data-language="${escapeHtml(repository.language)}">
            <div class="project-repository-main">
                <div class="project-repository-heading">
                    <span class="project-folder-icon" aria-hidden="true">${Icons.projects}</span>
                    <h3><a href="${escapeHtml(repository.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repository.name)}</a></h3>
                    ${repository.featured ? '<span class="project-featured">Featured</span>' : ''}
                </div>
                <p>${escapeHtml(repository.description)}</p>
            </div>
            <div class="project-repository-meta">
                <span><i class="language-dot" style="background:${languageColor}" aria-hidden="true"></i>${escapeHtml(repository.language)}</span>
                <span>${starText}</span>
                <span>${licenseText}</span>
                ${repository.updated ? `<time>Updated ${escapeHtml(repository.updated)}</time>` : ''}
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
                        <p>Public repositories by ${Profile.name} · <span id="projectsCount">${repositories.length}</span> repositories</p>
                    </div>
                    <a class="win-btn projects-github-link" href="${repositoriesUrl()}" target="_blank" rel="noopener noreferrer">Open GitHub</a>
                </header>
                <div class="projects-toolbar" role="search">
                    <label for="projectsSearch">Find a project</label>
                    <input id="projectsSearch" class="win-input" type="search" placeholder="Name or description…" autocomplete="off">
                    <label for="projectsLanguage" class="visually-hidden">Filter by language</label>
                    <select id="projectsLanguage" class="win-select">
                        <option value="all">All languages</option>
                        ${languagesOf(repositories).map(language => `<option>${escapeHtml(language)}</option>`).join('')}
                    </select>
                    <span id="projectsResultStatus" class="projects-result-status" role="status" aria-live="polite">${repositories.length} projects shown</span>
                </div>
                <div id="projectsList" class="projects-list" role="list">
                    ${repositories.map(renderRepository).join('')}
                </div>
                <p class="projects-source" id="projectsSource">${sourceText()}</p>
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

        // Every value from GitHub goes through escapeHtml() in renderRepository/sourceText.
        const renderList = () => {
            if (!windowEl.isConnected) return;
            list?.replaceChildren();
            list?.insertAdjacentHTML('beforeend', repositories.map(renderRepository).join(''));
            if (language) {
                const selected = language.value;
                const available = languagesOf(repositories);
                language.replaceChildren(new Option('All languages', 'all'), ...available.map(name => new Option(name, name)));
                language.value = available.includes(selected) ? selected : 'all';
            }
            const count = windowEl.querySelector('#projectsCount');
            if (count) count.textContent = repositories.length;
            const source = windowEl.querySelector('#projectsSource');
            source?.replaceChildren();
            source?.insertAdjacentHTML('beforeend', sourceText());
            applyFilter();
        };
        windowEl._projectsReload = (force) => loadRepositories(force).then(renderList);
        windowEl._projectsReload(false);
    },

    onMenuAction(action) {
        if (action === 'github') window.open(repositoriesUrl(), '_blank', 'noopener,noreferrer');
        if (action === 'refresh') {
            document.querySelector('#window-projects')?._projectsReload?.(true);
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
