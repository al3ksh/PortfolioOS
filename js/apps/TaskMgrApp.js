/**
 * Task Manager App - Shows running processes
 */

import { Icons } from '../icons.js';
import { WindowManager } from '../managers/WindowManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export const TaskMgrApp = {
    id: 'taskmgr',
    title: 'Task Manager',
    icon: Icons.taskmgr,
    width: 400,
    height: 350,
    hasMenu: false,
    resizable: true,

    // System processes (killing these = BSOD)
    systemProcesses: [
        { name: 'System', pid: 4, memory: '128 KB', cpu: '0%', critical: true },
        { name: 'csrss.exe', pid: 420, memory: '2,048 KB', cpu: '0%', critical: true },
        { name: 'winlogon.exe', pid: 512, memory: '1,024 KB', cpu: '0%', critical: true },
        { name: 'explorer.exe', pid: 1337, memory: '16,384 KB', cpu: '1%', critical: true },
        { name: 'dwm.exe', pid: 888, memory: '32,768 KB', cpu: '2%', critical: false },
        { name: 'svchost.exe', pid: 666, memory: '4,096 KB', cpu: '0%', critical: false },
    ],

    render() {
        return `
            <div class="taskmgr-container">
                <div class="taskmgr-tabs">
                    <button class="taskmgr-tab active" data-tab="apps">Applications</button>
                    <button class="taskmgr-tab" data-tab="processes">Processes</button>
                </div>
                
                <div class="taskmgr-content">
                    <div class="taskmgr-panel" id="taskmgr-apps">
                        <div class="taskmgr-list" id="taskAppsList">
                            <!-- Apps will be listed here -->
                        </div>
                    </div>
                    
                    <div class="taskmgr-panel hidden" id="taskmgr-processes">
                        <div class="taskmgr-header-row">
                            <span class="col-name">Image Name</span>
                            <span class="col-pid">PID</span>
                            <span class="col-mem">Mem Usage</span>
                            <span class="col-cpu">CPU</span>
                        </div>
                        <div class="taskmgr-list" id="taskProcessesList">
                            <!-- Processes will be listed here -->
                        </div>
                    </div>
                </div>
                
                <div class="taskmgr-footer">
                    <div class="taskmgr-stats">
                        <span>Processes: <strong id="processCount">0</strong></span>
                        <span>CPU Usage: <strong id="cpuUsage">3%</strong></span>
                        <span>Memory: <strong id="memUsage">64 MB / 640 KB</strong></span>
                    </div>
                    <button class="win-btn" id="endTaskBtn">End Task</button>
                </div>
            </div>
        `;
    },

    onInit() {
        const container = document.querySelector('#window-taskmgr');
        if (!container) return;

        // Store selected item
        TaskMgrApp.selectedId = null;
        TaskMgrApp.selectedType = null;

        // Tab switching
        container.querySelectorAll('.taskmgr-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.taskmgr-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.taskmgr-panel').forEach(p => p.classList.add('hidden'));
                
                tab.classList.add('active');
                const panelId = `taskmgr-${tab.dataset.tab}`;
                container.querySelector(`#${panelId}`)?.classList.remove('hidden');
                
                SoundManager.play('click');
            });
        });

        // End Task button
        container.querySelector('#endTaskBtn')?.addEventListener('click', () => {
            TaskMgrApp.endSelectedTask(container);
        });

        // Initial render
        TaskMgrApp.lastWindowCount = -1;
        TaskMgrApp.updateLists(container);

        // Update every 2 seconds (slower to prevent selection issues)
        TaskMgrApp.updateInterval = setInterval(() => {
            if (document.querySelector('#window-taskmgr')) {
                // Only update if window count changed
                if (TaskMgrApp.lastWindowCount !== WindowManager.windows.size) {
                    TaskMgrApp.updateLists(container);
                    TaskMgrApp.lastWindowCount = WindowManager.windows.size;
                } else {
                    // Just update stats without rebuilding lists
                    TaskMgrApp.updateStatsOnly(container);
                }
            } else {
                clearInterval(TaskMgrApp.updateInterval);
            }
        }, 2000);
    },

    onClose() {
        if (TaskMgrApp.updateInterval) {
            clearInterval(TaskMgrApp.updateInterval);
        }
    },

    updateLists(container) {
        // Update Applications list
        const appsList = container.querySelector('#taskAppsList');
        if (appsList) {
            appsList.innerHTML = '';
            WindowManager.windows.forEach((win, id) => {
                const item = document.createElement('div');
                item.className = 'taskmgr-item';
                // Restore selection
                if (TaskMgrApp.selectedType === 'app' && TaskMgrApp.selectedId === id) {
                    item.classList.add('selected');
                }
                item.dataset.type = 'app';
                item.dataset.id = id;
                item.innerHTML = `
                    <span class="item-icon">${win.icon || '📄'}</span>
                    <span class="item-name">${win.title}</span>
                    <span class="item-status">${win.isMinimized ? 'Not Responding' : 'Running'}</span>
                `;
                item.addEventListener('click', () => {
                    appsList.querySelectorAll('.taskmgr-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    TaskMgrApp.selectedType = 'app';
                    TaskMgrApp.selectedId = id;
                });
                appsList.appendChild(item);
            });
            
            if (WindowManager.windows.size === 0) {
                appsList.innerHTML = '<div class="taskmgr-empty">No applications running</div>';
            }
        }

        // Update Processes list
        const processList = container.querySelector('#taskProcessesList');
        if (processList) {
            processList.innerHTML = '';
            
            // Add system processes
            TaskMgrApp.systemProcesses.forEach(proc => {
                const item = document.createElement('div');
                item.className = 'taskmgr-item process-item';
                // Restore selection
                if (TaskMgrApp.selectedType === 'process' && TaskMgrApp.selectedId === proc.name) {
                    item.classList.add('selected');
                }
                item.dataset.type = 'process';
                item.dataset.name = proc.name;
                item.dataset.critical = proc.critical;
                item.innerHTML = `
                    <span class="col-name">${proc.name}</span>
                    <span class="col-pid">${proc.pid}</span>
                    <span class="col-mem">${proc.memory}</span>
                    <span class="col-cpu">${proc.cpu}</span>
                `;
                item.addEventListener('click', () => {
                    processList.querySelectorAll('.taskmgr-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    TaskMgrApp.selectedType = 'process';
                    TaskMgrApp.selectedId = proc.name;
                });
                processList.appendChild(item);
            });

            // Add running apps as processes
            WindowManager.windows.forEach((win, id) => {
                const item = document.createElement('div');
                item.className = 'taskmgr-item process-item';
                // Restore selection
                if (TaskMgrApp.selectedType === 'app-process' && TaskMgrApp.selectedId === id) {
                    item.classList.add('selected');
                }
                item.dataset.type = 'app-process';
                item.dataset.id = id;
                // Use consistent PID based on id hash
                const pid = TaskMgrApp.getPidForApp(id);
                const mem = TaskMgrApp.getMemForApp(id);
                item.innerHTML = `
                    <span class="col-name">${id}.exe</span>
                    <span class="col-pid">${pid}</span>
                    <span class="col-mem">${mem.toLocaleString()} KB</span>
                    <span class="col-cpu">${Math.floor(Math.random() * 5)}%</span>
                `;
                item.addEventListener('click', () => {
                    processList.querySelectorAll('.taskmgr-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    TaskMgrApp.selectedType = 'app-process';
                    TaskMgrApp.selectedId = id;
                });
                processList.appendChild(item);
            });
        }

        // Update stats
        TaskMgrApp.updateStatsOnly(container);
    },

    updateStatsOnly(container) {
        const totalProcesses = TaskMgrApp.systemProcesses.length + WindowManager.windows.size;
        const processCount = container.querySelector('#processCount');
        const cpuUsage = container.querySelector('#cpuUsage');
        if (processCount) processCount.textContent = totalProcesses;
        if (cpuUsage) cpuUsage.textContent = `${Math.floor(Math.random() * 10) + 1}%`;
    },

    // Generate consistent PID for app
    getPidForApp(id) {
        if (!TaskMgrApp.appPids) TaskMgrApp.appPids = {};
        if (!TaskMgrApp.appPids[id]) {
            TaskMgrApp.appPids[id] = Math.floor(Math.random() * 9000) + 1000;
        }
        return TaskMgrApp.appPids[id];
    },

    // Generate consistent memory for app
    getMemForApp(id) {
        if (!TaskMgrApp.appMem) TaskMgrApp.appMem = {};
        if (!TaskMgrApp.appMem[id]) {
            TaskMgrApp.appMem[id] = Math.floor(Math.random() * 50000) + 5000;
        }
        return TaskMgrApp.appMem[id];
    },

    async endSelectedTask(container) {
        const selected = container.querySelector('.taskmgr-item.selected');
        if (!selected) {
            SoundManager.play('error');
            return;
        }

        const type = selected.dataset.type;
        
        if (type === 'app' || type === 'app-process') {
            // Close the window
            const id = selected.dataset.id;
            WindowManager.closeWindow(id);
            SoundManager.play('close');
            TaskMgrApp.updateLists(container);
        } else if (type === 'process') {
            // System process
            const isCritical = selected.dataset.critical === 'true';
            const name = selected.dataset.name;
            
            if (isCritical) {
                // Show warning first
                SoundManager.play('error');
                const { DialogManager } = await import('../managers/DialogManager.js');
                const confirmed = await DialogManager.confirm(
                    `WARNING: Terminating "${name}" may cause system instability.\n\nAre you sure you want to end this process?`,
                    '⚠️ End Process'
                );
                
                if (confirmed) {
                    // BSOD!
                    TaskMgrApp.triggerBSOD(name);
                }
            } else {
                // Non-critical, just remove from list
                const idx = TaskMgrApp.systemProcesses.findIndex(p => p.name === name);
                if (idx > -1) {
                    TaskMgrApp.systemProcesses.splice(idx, 1);
                    SoundManager.play('close');
                    TaskMgrApp.updateLists(container);
                }
            }
        }
    },

    triggerBSOD(processName) {
        const bsod = document.getElementById('bsodScreen');
        const errorMsg = bsod.querySelector('.bsod-message');
        if (errorMsg) {
            errorMsg.textContent = `FATAL_ERROR: Terminated_${processName.replace('.exe', '')}`;
        }
        bsod.classList.remove('hidden');

        // Reset after click/key
        const handler = () => {
            bsod.classList.add('hidden');
            // Restore system processes
            TaskMgrApp.systemProcesses = [
                { name: 'System', pid: 4, memory: '128 KB', cpu: '0%', critical: true },
                { name: 'csrss.exe', pid: 420, memory: '2,048 KB', cpu: '0%', critical: true },
                { name: 'winlogon.exe', pid: 512, memory: '1,024 KB', cpu: '0%', critical: true },
                { name: 'explorer.exe', pid: 1337, memory: '16,384 KB', cpu: '1%', critical: true },
                { name: 'dwm.exe', pid: 888, memory: '32,768 KB', cpu: '2%', critical: false },
                { name: 'svchost.exe', pid: 666, memory: '4,096 KB', cpu: '0%', critical: false },
            ];
            document.removeEventListener('keydown', handler);
            document.removeEventListener('click', handler);
        };

        setTimeout(() => {
            document.addEventListener('keydown', handler, { once: true });
            document.addEventListener('click', handler, { once: true });
        }, 500);
    }
};

export default TaskMgrApp;
