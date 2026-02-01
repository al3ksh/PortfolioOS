/**
 * System Information App - Detailed "system" info with charts
 */

import { Icons } from '../icons.js';
import { WindowManager } from '../managers/WindowManager.js';
import { SoundManager } from '../managers/SoundManager.js';

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
                            <h3>🖥️ Operating System</h3>
                            <table class="sysinfo-table">
                                <tr><td>OS Name:</td><td>Portfolio OS Professional</td></tr>
                                <tr><td>Version:</td><td>1.0.2026 (Build 31337)</td></tr>
                                <tr><td>Architecture:</td><td>Retro 32-bit</td></tr>
                                <tr><td>System Type:</td><td>Web-based Workstation</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>👤 User Information</h3>
                            <table class="sysinfo-table">
                                <tr><td>User Name:</td><td>PORTFOLIO\\Visitor</td></tr>
                                <tr><td>Registered To:</td><td>Aleks Szotek</td></tr>
                                <tr><td>Organization:</td><td>Portfolio Industries</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>⏱️ System Uptime</h3>
                            <div class="uptime-display" id="uptimeDisplay">${uptime}</div>
                        </div>
                    </div>

                    <!-- Hardware Tab -->
                    <div class="sysinfo-panel hidden" id="sysinfo-hardware">
                        <div class="sysinfo-section">
                            <h3>🔧 Processor</h3>
                            <table class="sysinfo-table">
                                <tr><td>CPU:</td><td>JavaScript V8 Engine @ ∞ GHz</td></tr>
                                <tr><td>Cores:</td><td>${navigator.hardwareConcurrency || 4} Logical Processors</td></tr>
                                <tr><td>Cache:</td><td>640 KB (Should be enough)</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>💾 Memory</h3>
                            <table class="sysinfo-table">
                                <tr><td>Total RAM:</td><td>${navigator.deviceMemory || 8} GB</td></tr>
                                <tr><td>Available:</td><td>Plenty</td></tr>
                                <tr><td>Virtual Memory:</td><td>Unlimited (It's the web!)</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>🖼️ Display</h3>
                            <table class="sysinfo-table">
                                <tr><td>Resolution:</td><td>${window.screen.width} x ${window.screen.height}</td></tr>
                                <tr><td>Color Depth:</td><td>${window.screen.colorDepth}-bit</td></tr>
                                <tr><td>Pixel Ratio:</td><td>${window.devicePixelRatio}x</td></tr>
                            </table>
                        </div>
                    </div>

                    <!-- Performance Tab -->
                    <div class="sysinfo-panel hidden" id="sysinfo-performance">
                        <div class="sysinfo-section">
                            <h3>📊 Resource Usage</h3>
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
                            <h3>📈 Process Statistics</h3>
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
                            <h3>🌐 Connection</h3>
                            <table class="sysinfo-table">
                                <tr><td>Status:</td><td>${navigator.onLine ? '🟢 Online' : '🔴 Offline'}</td></tr>
                                <tr><td>Type:</td><td>${navigator.connection?.effectiveType || 'Unknown'}</td></tr>
                                <tr><td>Downlink:</td><td>${navigator.connection?.downlink || '?'} Mbps</td></tr>
                            </table>
                        </div>
                        <div class="sysinfo-section">
                            <h3>🔗 Browser Info</h3>
                            <table class="sysinfo-table">
                                <tr><td>User Agent:</td><td class="ua-cell">${navigator.userAgent.substring(0, 60)}...</td></tr>
                                <tr><td>Language:</td><td>${navigator.language}</td></tr>
                                <tr><td>Cookies:</td><td>${navigator.cookieEnabled ? 'Enabled' : 'Disabled'}</td></tr>
                                <tr><td>Platform:</td><td>${navigator.platform}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="sysinfo-footer">
                    <button class="win-btn" id="refreshSysInfo">🔄 Refresh</button>
                    <button class="win-btn" id="exportSysInfo">📋 Copy to Clipboard</button>
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
    },

    exportInfo() {
        const info = `
Portfolio OS System Information
================================
Generated: ${new Date().toLocaleString()}

OS: Portfolio OS Professional v1.0.2026
Architecture: Retro 32-bit
User: PORTFOLIO\\Visitor

CPU: JavaScript V8 Engine
Cores: ${navigator.hardwareConcurrency || 4}
RAM: ${navigator.deviceMemory || 8} GB

Display: ${window.screen.width} x ${window.screen.height}
Color Depth: ${window.screen.colorDepth}-bit

Browser: ${navigator.userAgent}
Language: ${navigator.language}
Online: ${navigator.onLine ? 'Yes' : 'No'}
        `.trim();

        navigator.clipboard.writeText(info).then(() => {
            SoundManager.play('chord');
            import('../managers/DialogManager.js').then(({ DialogManager }) => {
                DialogManager.alert('System information copied to clipboard!', 'Copy Successful');
            });
        });
    }
};

export default SysInfoApp;
