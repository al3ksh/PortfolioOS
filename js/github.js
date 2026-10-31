/**
 * GitHub data shared by the desktop (Projects.exe, Portfolio.exe) and the static
 * build (landing page, CV): public repositories from the REST API merged with
 * Profile.projects, with the repositories pinned on the profile as featured.
 * No imports, so scripts/build-static.mjs can load it in Node as well.
 */

const API = 'https://api.github.com';
const TIMEOUT = 8000;

/** Public, non-fork repositories, most recently pushed first. */
export async function fetchRepositories(user) {
    const response = await fetch(`${API}/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(TIMEOUT)
    });
    if (!response.ok) throw new Error(`GitHub API responded with ${response.status}`);
    const repositories = (await response.json()).filter(repo => !repo.fork);
    if (!repositories.length) throw new Error('no public repositories found');
    return repositories;
}

// Pins are only in the GraphQL API, which needs a token (read-only, public data is enough)
export async function fetchPinnedGraphQL(user, token) {
    const response = await fetch(`${API}/graphql`, {
        method: 'POST',
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'PortfolioOS' },
        body: JSON.stringify({
            query: 'query($login:String!){user(login:$login){pinnedItems(first:6,types:REPOSITORY){nodes{... on Repository{name}}}}}',
            variables: { login: user }
        })
    });
    if (!response.ok) throw new Error(`GitHub responded with ${response.status}`);
    const nodes = (await response.json())?.data?.user?.pinnedItems?.nodes;
    if (!Array.isArray(nodes)) throw new Error('unexpected GraphQL response');
    return nodes.map(node => node?.name).filter(name => typeof name === 'string');
}

/** Pinned names from the site's own backend (/api/pinned), or null when it has no token. */
export async function fetchPinnedFromSite(base = '') {
    try {
        const response = await fetch(`${base}/api/pinned`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(TIMEOUT) });
        if (!response.ok) return null;
        const { pinned } = await response.json();
        return Array.isArray(pinned) && pinned.length ? pinned : null;
    } catch {
        return null;
    }
}

const shortDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Live repositories in the shape of Profile.projects. The config still supplies
 * what GitHub does not know: translated descriptions, tech lists, demo links.
 * Featured follows the pins (in pin order) when they are known, otherwise the
 * config flags; featured come first, the rest stay most recently pushed first.
 */
export function mergeProjects(configured, repositories, pinned) {
    const local = new Map(configured.map(project => [project.name.toLowerCase(), project]));
    const configOrder = configured.filter(project => project.featured).map(project => project.name.toLowerCase());
    const order = (pinned || configOrder).map(name => name.toLowerCase());

    const projects = repositories.map((repo) => {
        const own = local.get(repo.name.toLowerCase()) || {};
        const license = repo.license?.spdx_id;
        return {
            ...own,
            name: repo.name,
            language: repo.language || own.language || 'Other',
            description: own.description || repo.description || 'No description provided.',
            stars: repo.stargazers_count,
            license: license && license !== 'NOASSERTION' ? license : own.license,
            pushed: repo.pushed_at,
            updated: shortDate(repo.pushed_at),
            featured: order.includes(repo.name.toLowerCase()),
            url: repo.html_url
        };
    });
    const rank = project => (project.featured ? order.indexOf(project.name.toLowerCase()) : order.length);
    return projects
        .map((project, index) => ({ project, index }))
        .sort((a, b) => rank(a.project) - rank(b.project) || a.index - b.index)
        .map(({ project }) => project);
}
