/**
 * System Information App - Detailed "system" info with charts
 */

import { Icons } from '../icons.js?v=15';
import { WindowManager } from '../managers/WindowManager.js?v=15';
import { SoundManager } from '../managers/SoundManager.js?v=15';

export const SysInfoApp = {
    id: 'sysinfo',
    title: 'System Information',
    icon: Icons.sysinfo,
    width: 550,
    height: 450,
    hasMenu: false,
    resizable: true,
    minWidth: 500,
    minHeight: 400,

    render() {
        const startTime = sessionStorage.getItem('bootTime') || new Date().toISOString();
        const uptime = SysInfoApp.calculateUptime(startTime);
        const info = SysInfoApp.getRuntimeInfo();
        const esc = (value) => SysInfoApp.escapeHtml(value);
        
        return `
            <div class="sysinfo-container">
                <div class="sysinfo-tabs">
                    <button class="sysinfo-tab active" data-tab="general">General</button>
                    <button class="sysinfo-tab" data-tab="hardware">Hardware</button>
                    <button class="sysinfo-tab" data-tab="performance">Performance</button>
                    <button class="sysinfo-tab" data-tab="network">Network</button>
                </div>

                <div class="sysinfo-content">
                    <!-- General Tab -->
                    <div class="sysinfo-panel" id="sysinfo-general">
                        <div class="sysinfo-section">
                            <h3>${Icons.sysOs} Operating System</h3>
                            <table class="sysinfo-table">
                                <tr><td>OS Name:</td><td>PortfolioOS 98 SE</td></tr>
                                <tr><td>Version:</td><td>1.0.2026 (Build 31337)</td></tr>
                                <tr><td>Architecture:</td><td>Retro 32-bit</td></tr>
                                <tr><td>System Type:</td><td>Web-based Workstation</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>${Icons.secUser} User Information</h3>
                            <table class="sysinfo-table">
                                <tr><td>User Name:</td><td>PORTFOLIO\\Visitor</td></tr>
                                <tr><td>Registered To:</td><td>Aleks Szotek</td></tr>
                                <tr><td>Organization:</td><td>Portfolio Industries</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>${Icons.sysUptime} System Uptime</h3>
                            <div class="uptime-display" id="uptimeDisplay">${uptime}</div>
                        </div>
                    </div>

                    <!-- Hardware Tab -->
                    <div class="sysinfo-panel hidden" id="sysinfo-hardware">
                        <div class="sysinfo-section">
                            <h3>${Icons.sysProcessor} Processor</h3>
                            <table class="sysinfo-table">
                                <tr><td>CPU:</td><td>Human Brain @ variable MHz</td></tr>
                                <tr><td>Cores:</td><td>${esc(info.cores)}</td></tr>
                                <tr><td>Cache:</td><td>Creative cache (browser-managed)</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>${Icons.sysMemory} Memory</h3>
                            <table class="sysinfo-table">
                                <tr><td>Total RAM:</td><td>probably enough</td></tr>
                                <tr><td>Browser hint:</td><td>${esc(info.deviceMemory)}</td></tr>
                                <tr><td>Available:</td><td>Browser does not expose this</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>${Icons.sysDisplay} Display</h3>
                            <table class="sysinfo-table">
                                <tr><td>Resolution:</td><td id="sysinfoResolution">${esc(info.resolution)}</td></tr>
                                <tr><td>Viewport:</td><td id="sysinfoViewport">${esc(info.viewport)}</td></tr>
                                <tr><td>Color Depth:</td><td>${esc(info.colorDepth)}</td></tr>
                                <tr><td>Pixel Ratio:</td><td>${esc(info.pixelRatio)}</td></tr>
                            </table>
                        </div>
                    </div>

                    <!-- Performance Tab -->
                    <div class="sysinfo-panel hidden" id="sysinfo-performance">
                        <div class="sysinfo-section">
                            <h3>${Icons.sysPerformance} Resource Usage</h3>
                            <div class="perf-meters">
                                <div class="perf-meter">
                                    <label>CPU Usage</label>
                                    <div class="meter-bar">
                                        <div class="meter-fill cpu-fill" id="cpuMeter" style="width: 15%"></div>
                                    </div>
                                    <span class="meter-value" id="cpuValue">15%</span>
                                </div>
                                <div class="perf-meter">
                                    <label>Memory Usage</label>
                                    <div class="meter-bar">
                                        <div class="meter-fill mem-fill" id="memMeter" style="width: 42%"></div>
                                    </div>
                                    <span class="meter-value" id="memValue">42%</span>
                                </div>
                                <div class="perf-meter">
                                    <label>Disk Activity</label>
                                    <div class="meter-bar">
                                        <div class="meter-fill disk-fill" id="diskMeter" style="width: 5%"></div>
                                    </div>
                                    <span class="meter-value" id="diskValue">5%</span>
                                </div>
                            </div>
                        </div>
                        <div class="sysinfo-section">
                            <h3>${Icons.sysProcesses} Process Statistics</h3>
                            <table class="sysinfo-table">
                                <tr><td>Open Windows:</td><td id="openWindows">${WindowManager.windows.size}</td></tr>
                                <tr><td>DOM Elements:</td><td id="domElements">${document.getElementsByTagName('*').length}</td></tr>
                                <tr><td>Event Listeners:</td><td>Many</td></tr>
                            </table>
                        </div>
                    </div>

                    <!-- Network Tab -->
                    <div class="sysinfo-panel hidden" id="sysinfo-network">
                        <div class="sysinfo-section">
                            <h3>${Icons.sysNetwork} Connection</h3>
                            <table class="sysinfo-table">
                                <tr><td>Status:</td><td class="sysinfo-status" id="sysinfoOnline">${info.online ? `${Icons.statusSuccess} Online` : `${Icons.statusError} Offline`}</td></tr>
                                <tr><td>Type:</td><td>${esc(info.connectionType)}</td></tr>
                                <tr><td>Downlink:</td><td>${esc(info.downlink)}</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>${Icons.sysBrowser} Browser Info</h3>
                            <table class="sysinfo-table">
                                <tr><td>User Agent:</td><td class="ua-cell">${esc(info.userAgent)}</td></tr>
                                <tr><td>Language:</td><td>${esc(info.language)}</td></tr>
                                <tr><td>Languages:</td><td>${esc(info.languages)}</td></tr>
                                <tr><td>Platform:</td><td>${esc(info.platform)}</td></tr>
                                <tr><td>Color scheme:</td><td id="sysinfoColorScheme">${esc(info.colorScheme)}</td></tr>
                                <tr><td>Local time:</td><td id="sysinfoLocalTime">${esc(info.localTime)}</td></tr>
                                <tr><td>Cookies:</td><td>${navigator.cookieEnabled ? 'Enabled' : 'Disabled'}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="sysinfo-footer">
                    <button class="win-btn" id="refreshSysInfo">${Icons.ctxRefresh} Refresh</button>
                    <button class="win-btn" id="exportSysInfo">${Icons.actCopy} Copy to Clipboard</button>
                </div>
            </div>
        `;
    },

    onInit() {
        const container = document.querySelector('#window-sysinfo');
        if (!container) return;

        // Tab switching
        container.querySelectorAll('.sysinfo-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.sysinfo-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.sysinfo-panel').forEach(p => p.classList.add('hidden'));
                
                tab.classList.add('active');
                const panelId = `sysinfo-${tab.dataset.tab}`;
                container.querySelector(`#${panelId}`)?.classList.remove('hidden');
                
                SoundManager.play('click');
            });
        });

        // Refresh button
        container.querySelector('#refreshSysInfo')?.addEventListener('click', () => {
            SysInfoApp.updateStats(container);
            SoundManager.play('click');
        });

        // Export button
        container.querySelector('#exportSysInfo')?.addEventListener('click', () => {
            SysInfoApp.exportInfo();
        });

        SysInfoApp.runtimeHandler = () => SysInfoApp.updateRuntimeValues(container);
        window.addEventListener('online', SysInfoApp.runtimeHandler);
        window.addEventListener('offline', SysInfoApp.runtimeHandler);

        // Update stats periodically
        SysInfoApp.updateInterval = setInterval(() => {
            if (document.querySelector('#window-sysinfo')) {
                SysInfoApp.updateStats(container);
            } else {
                clearInterval(SysInfoApp.updateInterval);
            }
        }, 1000);
    },

    onClose() {
        if (SysInfoApp.updateInterval) {
            clearInterval(SysInfoApp.updateInterval);
        }
        if (SysInfoApp.runtimeHandler) {
            window.removeEventListener('online', SysInfoApp.runtimeHandler);
            window.removeEventListener('offline', SysInfoApp.runtimeHandler);
            SysInfoApp.runtimeHandler = null;
        }
    },

    calculateUptime(startTime) {
        const start = new Date(startTime);
        const now = new Date();
        const diff = now - start;
        
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = String(value ?? '');
        return div.innerHTML;
    },

    getRuntimeInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
        const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)')?.matches;
        const colorScheme = prefersDark ? 'Dark' : prefersLight ? 'Light' : 'No preference reported';
        const cores = Number.isFinite(navigator.hardwareConcurrency)
            ? `${navigator.hardwareConcurrency} logical processor${navigator.hardwareConcurrency === 1 ? '' : 's'}`
            : 'Not reported by browser';
        let localTime;
        try {
            localTime = new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'medium'
            }).format(new Date());
        } catch {
            localTime = new Date().toLocaleString();
        }

        return {
            resolution: `${window.screen.width} × ${window.screen.height}`,
            viewport: `${window.innerWidth} × ${window.innerHeight}`,
            colorDepth: `${window.screen.colorDepth || 'Unknown'}-bit`,
            pixelRatio: `${window.devicePixelRatio || 1}x`,
            language: navigator.language || 'Not reported',
            languages: navigator.languages?.join(', ') || navigator.language || 'Not reported',
            platform: navigator.userAgentData?.platform || navigator.platform || 'Not reported',
            cores,
            deviceMemory: navigator.deviceMemory ? `Approx. ${navigator.deviceMemory} GB (coarse browser hint)` : 'Not reported by browser',
            colorScheme,
            localTime,
            online: navigator.onLine,
            connectionType: connection?.effectiveType || 'Not reported',
            downlink: Number.isFinite(connection?.downlink) ? `${connection.downlink} Mbps` : 'Not reported',
            userAgent: navigator.userAgent || 'Not reported'
        };
    },

    updateRuntimeValues(container) {
        const info = SysInfoApp.getRuntimeInfo();
        const resolution = container.querySelector('#sysinfoResolution');
        const viewport = container.querySelector('#sysinfoViewport');
        const localTime = container.querySelector('#sysinfoLocalTime');
        const colorScheme = container.querySelector('#sysinfoColorScheme');
        const online = container.querySelector('#sysinfoOnline');

        if (resolution) resolution.textContent = info.resolution;
        if (viewport) viewport.textContent = info.viewport;
        if (localTime) localTime.textContent = info.localTime;
        if (colorScheme) colorScheme.textContent = info.colorScheme;
        if (online) {
            online.innerHTML = info.online ? `${Icons.statusSuccess} Online` : `${Icons.statusError} Offline`;
        }
    },

    updateStats(container) {
        // Update uptime
        const startTime = sessionStorage.getItem('bootTime');
        const uptimeEl = container.querySelector('#uptimeDisplay');
        if (uptimeEl && startTime) {
            uptimeEl.textContent = SysInfoApp.calculateUptime(startTime);
        }

        // Update performance meters with random-ish values
        const cpu = 10 + Math.floor(Math.random() * 20);
        const mem = 35 + Math.floor(Math.random() * 20);
        const disk = Math.floor(Math.random() * 15);

        const cpuMeter = container.querySelector('#cpuMeter');
        const memMeter = container.querySelector('#memMeter');
        const diskMeter = container.querySelector('#diskMeter');
        
        if (cpuMeter) cpuMeter.style.width = cpu + '%';
        if (memMeter) memMeter.style.width = mem + '%';
        if (diskMeter) diskMeter.style.width = disk + '%';

        const cpuValue = container.querySelector('#cpuValue');
        const memValue = container.querySelector('#memValue');
        const diskValue = container.querySelector('#diskValue');
        
        if (cpuValue) cpuValue.textContent = cpu + '%';
        if (memValue) memValue.textContent = mem + '%';
        if (diskValue) diskValue.textContent = disk + '%';

        // Update window count
        const openWindows = container.querySelector('#openWindows');
        if (openWindows) openWindows.textContent = WindowManager.windows.size;

        // Update DOM count
        const domElements = container.querySelector('#domElements');
        if (domElements) domElements.textContent = document.getElementsByTagName('*').length;

        SysInfoApp.updateRuntimeValues(container);
    },

    exportInfo() {
        const info = SysInfoApp.getRuntimeInfo();
        const report = `
Portfolio OS System Information
================================
Generated: ${new Date().toLocaleString()}

OS: PortfolioOS 98 SE v1.0.2026
Architecture: Retro 32-bit
User: PORTFOLIO\\Visitor

CPU: Human Brain @ variable MHz
Cores: ${info.cores}
RAM: probably enough

Display: ${info.resolution}
Viewport: ${info.viewport}
Color Depth: ${info.colorDepth}
Language: ${info.language}
Platform: ${info.platform}
Color scheme: ${info.colorScheme}
Local time: ${info.localTime}

Browser: ${navigator.userAgent}
Online: ${info.online ? 'Yes' : 'No'}
        `.trim();

        navigator.clipboard.writeText(report).then(() => {
            SoundManager.play('chord');
            import('../managers/DialogManager.js?v=15').then(({ DialogManager }) => {
                DialogManager.alert('System information copied to clipboard!', 'Copy Successful');
            });
        });
    }
};

export default SysInfoApp;
