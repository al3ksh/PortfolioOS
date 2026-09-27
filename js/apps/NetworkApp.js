/**
 * Network App - "Network Neighborhood" with live status of self-hosted services.
 * Data comes from the backend /api/status endpoint (see STATUS_SERVICES).
 */

import { Icons } from '../icons.js?v=15';
import { t, lang } from '../i18n.js?v=15';

const REFRESH_INTERVAL = 60 * 1000;

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days) return `${days}${t('network.days')} ${hours}${t('network.hours')}`;
    if (hours) return `${hours}${t('network.hours')} ${minutes}${t('network.minutes')}`;
    return `${minutes}${t('network.minutes')}`;
}

function formatGigabytes(bytes) {
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function renderHost(host) {
    const used = host.memory.total - host.memory.free;
    const percent = Math.round((used / host.memory.total) * 100);
    return `
        <section class="network-host">
            <div class="network-host-icon" aria-hidden="true">${Icons.network}</div>
            <dl class="network-host-stats">
                <div><dt>${t('network.host')}</dt><dd>${escapeHtml(host.label)} <small>${escapeHtml(host.platform)}</small></dd></div>
                <div><dt>${t('network.uptime')}</dt><dd>${formatUptime(host.uptime)}</dd></div>
                <div><dt>${t('network.load')}</dt><dd>${host.load.map(value => value.toFixed(2)).join(' · ')} <small>(${host.cpus} CPU)</small></dd></div>
                <div><dt>${t('network.memory')}</dt><dd>
                    <span class="network-meter" role="meter" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><i style="width:${percent}%"></i></span>
                    ${formatGigabytes(used)} / ${formatGigabytes(host.memory.total)}
                </dd></div>
            </dl>
        </section>
    `;
}

function renderService(service) {
    const state = service.up ? 'online' : 'offline';
    let hostname = service.url;
    try { hostname = new URL(service.url).hostname; } catch { /* keep raw url */ }
    return `
        <li class="network-service is-${state}">
            <span class="network-led" aria-hidden="true"></span>
            <span class="network-service-name">${escapeHtml(service.name)}<small>${escapeHtml(hostname)}</small></span>
            <span class="network-service-state">${t(`network.${state}`)}${service.ms != null ? ` · ${service.ms} ms` : ''}</span>
            <a class="win-btn win-btn-sm" href="${escapeHtml(service.url)}" target="_blank" rel="noopener noreferrer">${t('network.open')}</a>
        </li>
    `;
}

function renderStatus(data) {
    const checked = new Date(data.checkedAt).toLocaleTimeString(lang === 'pl' ? 'pl-PL' : 'en-US');
    const online = data.services.filter(service => service.up).length;
    return `
        ${renderHost(data.host)}
        <ul class="network-services">${data.services.map(renderService).join('')}</ul>
        <footer class="network-footer">
            <span>${online}/${data.services.length} ${t('network.online').toLowerCase()} · ${t('network.checked')}: ${checked}</span>
        </footer>
    `;
}

export const NetworkApp = {
    id: 'network',
    title: 'Network.exe',
    icon: Icons.network,
    width: 560,
    height: 520,
    minWidth: 340,
    minHeight: 320,
    hasMenu: false,
    timer: null,

    render() {
        return `
            <div class="network-app">
                <header class="network-header">
                    <div>
                        <h2>${t('network.title')}</h2>
                        <p>${t('network.subtitle')}</p>
                    </div>
                    <button class="win-btn win-btn-sm" type="button" data-network-action="refresh">${Icons.ctxRefresh} ${t('network.refresh')}</button>
                </header>
                <div class="network-body" aria-live="polite">
                    <p class="network-status">${t('network.checking')}</p>
                </div>
            </div>
        `;
    },

    async load() {
        const body = document.querySelector('#window-network .network-body');
        if (!body) return;
        let html;
        try {
            const response = await fetch('/api/status', { headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error(`status ${response.status}`);
            html = renderStatus(await response.json());
        } catch (error) {
            html = `<p class="network-status">${t('network.unavailable')}</p>`;
        }
        if (!body.isConnected) return;
        // renderStatus escapes every value coming from the API.
        body.replaceChildren();
        body.insertAdjacentHTML('beforeend', html);
    },

    onInit() {
        const windowEl = document.querySelector('#window-network');
        windowEl?.querySelector('[data-network-action="refresh"]')?.addEventListener('click', () => NetworkApp.load());
        NetworkApp.load();
        clearInterval(NetworkApp.timer);
        NetworkApp.timer = setInterval(() => NetworkApp.load(), REFRESH_INTERVAL);
    },

    onClose() {
        clearInterval(NetworkApp.timer);
        NetworkApp.timer = null;
    }
};

export default NetworkApp;
