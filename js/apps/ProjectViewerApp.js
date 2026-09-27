/**
 * Project Viewer App - Shows a repository's details and README from GitHub.
 * Opened from Projects.exe via ProjectViewerApp.open(repository).
 */

import { Icons } from '../icons.js?v=15';
import { WindowManager } from '../managers/WindowManager.js?v=15';
import { renderMarkdown } from '../markdown.js?v=15';
import { t, loc } from '../i18n.js?v=15';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const readmeCache = new Map();

function parseRepository(url) {
    const match = String(url || '').match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i);
    return match ? { owner: match[1], repo: match[2] } : null;
}

function decodeBase64(content) {
    const bytes = Uint8Array.from(atob(content.replace(/\s/g, '')), char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

async function fetchReadme(repository) {
    const parsed = parseRepository(repository.url);
    if (!parsed) throw new Error('not a GitHub repository');
    const key = `${parsed.owner}/${parsed.repo}`;
    if (readmeCache.has(key)) return readmeCache.get(key);

    const response = await fetch(`https://api.github.com/repos/${key}/readme`, {
        headers: { Accept: 'application/vnd.github+json' }
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub API responded with ${response.status}`);

    const data = await response.json();
    const rawBase = data.download_url.replace(/[^/]*$/, '');
    const branch = rawBase.split('/')[5] || 'HEAD';
    // renderMarkdown escapes all README text and only emits a fixed set of tags.
    const readme = renderMarkdown(decodeBase64(data.content), {
        rawBase,
        linkBase: `https://github.com/${key}/blob/${branch}/`
    });
    readmeCache.set(key, readme);
    return readme;
}

function setHtml(element, html) {
    element.replaceChildren();
    element.insertAdjacentHTML('beforeend', html);
}

function statusHtml(key) {
    return `<p class="viewer-status">${escapeHtml(t(key))}</p>`;
}

function renderHeader(repository) {
    const meta = [
        repository.language,
        repository.stars ? `★ ${repository.stars} ${t('viewer.stars')}` : '',
        repository.license || '',
        repository.updated ? `${t('projects.updated')} ${repository.updated}` : ''
    ].filter(Boolean);

    return `
        <header class="viewer-header">
            <div class="viewer-header-icon" aria-hidden="true">${Icons.projects}</div>
            <div class="viewer-header-text">
                <h2>${escapeHtml(repository.name)}</h2>
                <p>${escapeHtml(loc(repository.description))}</p>
                <div class="viewer-meta">${meta.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>
            </div>
            <div class="viewer-actions">
                <button class="win-btn win-btn-sm" type="button" data-viewer-action="back">${t('viewer.back')}</button>
                <a class="win-btn win-btn-sm" href="${escapeHtml(repository.url)}" target="_blank" rel="noopener noreferrer">${t('viewer.openRepo')}</a>
            </div>
        </header>
    `;
}

const windowTitle = repository => `${escapeHtml(repository.name)} - Project Viewer`;

export const ProjectViewerApp = {
    id: 'projectviewer',
    title: 'Project Viewer',
    icon: Icons.projects,
    width: 760,
    height: 600,
    minWidth: 360,
    minHeight: 320,
    hasMenu: false,
    current: null,

    open(repository) {
        ProjectViewerApp.current = repository;
        const existing = WindowManager.windows.get('projectviewer');
        if (!existing) {
            WindowManager.createWindow('projectviewer', { title: windowTitle(repository) });
            return;
        }
        setHtml(existing.element.querySelector('.window-content-inner'), ProjectViewerApp.render());
        const title = existing.element.querySelector('#window-title-projectviewer');
        if (title) title.textContent = `${repository.name} - Project Viewer`;
        existing.title = windowTitle(repository);
        WindowManager.createWindow('projectviewer');
        ProjectViewerApp.onInit();
        WindowManager.notifyChange();
    },

    render() {
        const repository = ProjectViewerApp.current;
        if (!repository) return `<div class="project-viewer"><div class="viewer-readme">${statusHtml('viewer.noReadme')}</div></div>`;
        return `
            <div class="project-viewer">
                ${renderHeader(repository)}
                <article class="viewer-readme markdown-body" aria-live="polite">
                    ${statusHtml('viewer.loading')}
                </article>
            </div>
        `;
    },

    onInit() {
        const windowEl = document.querySelector('#window-projectviewer');
        const repository = ProjectViewerApp.current;
        if (!windowEl) return;

        windowEl.querySelector('[data-viewer-action="back"]')?.addEventListener('click', () => {
            WindowManager.createWindow('projects');
        });
        if (!repository) return;

        const target = windowEl.querySelector('.viewer-readme');
        fetchReadme(repository)
            .then((readme) => {
                if (ProjectViewerApp.current !== repository || !target.isConnected) return;
                setHtml(target, readme ?? statusHtml('viewer.noReadme'));
            })
            .catch((error) => {
                console.warn('Project Viewer:', error.message);
                if (ProjectViewerApp.current !== repository || !target.isConnected) return;
                setHtml(target, statusHtml('viewer.error'));
            });
    },

    onClose() {
        ProjectViewerApp.current = null;
    }
};

export default ProjectViewerApp;
