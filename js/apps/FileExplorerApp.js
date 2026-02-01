/**
 * File Explorer App - Virtual file browser
 */

import { Icons } from '../icons.js';
import { SoundManager } from '../managers/SoundManager.js';
import { WindowManager } from '../managers/WindowManager.js';

export const FileExplorerApp = {
    id: 'explorer',
    title: 'File Explorer',
    icon: Icons.explorer,
    width: 650,
    height: 450,
    hasMenu: true,
    menuItems: ['File', 'Edit', 'View', 'Help'],
    resizable: true,
    minWidth: 550,
    minHeight: 350,

    menuConfig: {
        'File': [
            { label: 'New Folder', action: 'newFolder', shortcut: 'Ctrl+Shift+N' },
            { divider: true },
            { label: 'Open', action: 'openSelected', shortcut: 'Enter' },
            { label: 'Copy Path', action: 'copyPath' },
            { label: 'Properties', action: 'properties' },
            { divider: true },
            { label: 'Exit', action: 'close', shortcut: 'Alt+F4' }
        ],
        'Edit': [
            { label: 'Cut', action: 'cut', shortcut: 'Ctrl+X', disabled: true },
            { label: 'Copy', action: 'copy', shortcut: 'Ctrl+C', disabled: true },
            { label: 'Paste', action: 'paste', shortcut: 'Ctrl+V', disabled: true },
            { divider: true },
            { label: 'Select All', action: 'selectAll', shortcut: 'Ctrl+A' },
            { label: 'Invert Selection', action: 'invertSelection' }
        ],
        'View': [
            { label: 'Large Icons', action: 'viewLarge' },
            { label: 'Small Icons', action: 'viewSmall' },
            { label: 'List', action: 'viewList' },
            { label: 'Details', action: 'viewDetails', checked: true },
            { divider: true },
            { label: 'Refresh', action: 'refresh', shortcut: 'F5' },
            { divider: true },
            { label: 'Show Hidden Files', action: 'showHidden' }
        ],
        'Help': [
            { label: 'Help Topics', action: 'helpTopics', shortcut: 'F1' },
            { divider: true },
            { label: 'About Explorer', action: 'about' }
        ]
    },

    onMenuAction(action) {
        const window = document.querySelector('#window-explorer');
        if (!window) return;

        switch(action) {
            case 'openSelected':
                const selected = window.querySelector('.explorer-item.selected');
                selected?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                break;
            case 'selectAll':
                window.querySelectorAll('.explorer-item').forEach(item => item.classList.add('selected'));
                break;
            case 'invertSelection':
                window.querySelectorAll('.explorer-item').forEach(item => item.classList.toggle('selected'));
                break;
            case 'refresh':
                FileExplorerApp.navigateTo(window, FileExplorerApp.currentPath);
                SoundManager.play('click');
                break;
            case 'copyPath':
                const path = FileExplorerApp.currentPath.join('\\') + '\\';
                navigator.clipboard.writeText(path).then(() => {
                    SoundManager.play('chord');
                });
                break;
            case 'newFolder':
                FileExplorerApp.createNewFolder(window);
                break;
            case 'properties':
                FileExplorerApp.showProperties(window);
                break;
            case 'viewLarge':
            case 'viewSmall':
            case 'viewList':
            case 'viewDetails':
                FileExplorerApp.changeView(window, action);
                break;
            case 'showHidden':
                FileExplorerApp.toggleHiddenFiles(window);
                break;
        }
    },

    toggleHiddenFiles(container) {
        FileExplorerApp.showHiddenFiles = !FileExplorerApp.showHiddenFiles;
        
        // Update menu checkbox using WindowManager
        const windowInstance = WindowManager.getWindowInstance('explorer');
        if (windowInstance) {
            windowInstance.toggleMenuChecked('View', 'showHidden');
        }
        
        // Refresh current view
        FileExplorerApp.navigateTo(container, FileExplorerApp.currentPath);
        SoundManager.play('click');
    },

    async createNewFolder(container) {
        const { DialogManager } = await import('../managers/DialogManager.js');
        const name = await DialogManager.prompt('Enter folder name:', '', 'New Folder');
        if (!name) return;
        
        // Get current folder
        let current = FileExplorerApp.fileSystem;
        for (const segment of FileExplorerApp.currentPath) {
            if (current[segment]) {
                current = current[segment].children || current[segment];
            } else if (current.children && current.children[segment]) {
                current = current.children[segment].children || {};
            }
        }
        
        // Add new folder (in memory only)
        if (current.children) {
            current.children[name] = { type: 'folder', children: {} };
        } else {
            current[name] = { type: 'folder', children: {} };
        }
        
        FileExplorerApp.navigateTo(container, FileExplorerApp.currentPath);
        SoundManager.play('chord');
    },

    async showProperties(container) {
        const { DialogManager } = await import('../managers/DialogManager.js');
        const selected = FileExplorerApp.selectedItem;
        
        if (!selected) {
            // Show folder properties
            const path = FileExplorerApp.currentPath.join('\\');
            await DialogManager.info({
                'Location': path,
                'Type': 'Folder',
                'Items': container.querySelectorAll('.explorer-item').length
            }, 'Folder Properties');
        } else {
            // Show file properties
            let current = FileExplorerApp.fileSystem;
            for (const segment of FileExplorerApp.currentPath) {
                if (current[segment]) {
                    current = current[segment].children || current[segment];
                } else if (current.children && current.children[segment]) {
                    current = current.children[segment].children || {};
                }
            }
            const items = current.children || current;
            const item = items[selected];
            
            if (item) {
                await DialogManager.info({
                    'Name': selected,
                    'Type': item.type.charAt(0).toUpperCase() + item.type.slice(1),
                    'Size': item.size || 'Unknown',
                    'Location': FileExplorerApp.currentPath.join('\\')
                }, 'File Properties');
            }
        }
    },

    changeView(container, viewType) {
        const content = container.querySelector('#fileContent');
        if (!content) return;
        
        // Remove existing view classes
        content.classList.remove('view-large', 'view-small', 'view-list', 'view-details');
        
        // Add new view class
        const viewClass = viewType.replace('view', 'view-').toLowerCase();
        content.classList.add(viewClass);
        
        // Update menu checkmarks
        const windowInstance = WindowManager.getWindowInstance('explorer');
        if (windowInstance) {
            windowInstance.updateMenuChecked('View', viewType);
        }
        
        SoundManager.play('click');
    },

    // Virtual file system
    fileSystem: {
        'C:': {
            type: 'drive',
            children: {
                'Windows': {
                    type: 'folder',
                    children: {
                        'System32': {
                            type: 'folder',
                            children: {
                                'config.sys': { type: 'file', size: '512 B', icon: '⚙️', content: 'config.sys' },
                                'autoexec.bat': { type: 'file', size: '256 B', icon: '📄', content: 'autoexec.bat' },
                                'win.ini': { type: 'file', size: '1 KB', icon: '⚙️', content: 'win.ini' },
                                'secrets.dll': { type: 'file', size: '???', icon: '🔒', hidden: true }
                            }
                        },
                        'Fonts': {
                            type: 'folder',
                            children: {
                                'Arial.ttf': { type: 'file', size: '150 KB', icon: '🔤' },
                                'Times.ttf': { type: 'file', size: '180 KB', icon: '🔤' },
                                'MSSerif.ttf': { type: 'file', size: '120 KB', icon: '🔤' }
                            }
                        },
                        'Media': {
                            type: 'folder',
                            children: {
                                'startup.wav': { type: 'file', size: '420 KB', icon: '🔊' },
                                'chord.wav': { type: 'file', size: '24 KB', icon: '🔊' },
                                'ding.wav': { type: 'file', size: '12 KB', icon: '🔊' }
                            }
                        }
                    }
                },
                'Program Files': {
                    type: 'folder',
                    children: {
                        'Portfolio OS': {
                            type: 'folder',
                            children: {
                                'portfolio.exe': { type: 'file', size: '2.1 MB', icon: '💼', action: 'portfolio' },
                                'readme.txt': { type: 'file', size: '4 KB', icon: '📝', action: 'readme' },
                                'contact.exe': { type: 'file', size: '512 KB', icon: '📧', action: 'contact' },
                                'simple.exe': { type: 'file', size: '128 KB', icon: '📄', action: 'simplemode' }
                            }
                        },
                        'Accessories': {
                            type: 'folder',
                            children: {
                                'notepad.exe': { type: 'file', size: '64 KB', icon: '📝', action: 'notepad' },
                                'calc.exe': { type: 'file', size: '48 KB', icon: '🔢', action: 'calc' },
                                'paint.exe': { type: 'file', size: '256 KB', icon: '🎨', action: 'paint' },
                                'terminal.exe': { type: 'file', size: '96 KB', icon: '⬛', action: 'terminal' }
                            }
                        },
                        'Internet': {
                            type: 'folder',
                            children: {
                                'iexplore.exe': { type: 'file', size: '1.2 MB', icon: '🌐', action: 'browser' }
                            }
                        },
                        'Games': {
                            type: 'folder',
                            children: {
                                'minesweeper.exe': { type: 'file', size: '180 KB', icon: '💣', action: 'minesweeper' },
                                'snake.exe': { type: 'file', size: '96 KB', icon: '🐍', action: 'snake' }
                            }
                        }
                    }
                },
                'Users': {
                    type: 'folder',
                    children: {
                        'Aleks': {
                            type: 'folder',
                            children: {
                                'Desktop': {
                                    type: 'folder',
                                    children: {
                                        'Portfolio.lnk': { type: 'file', size: '1 KB', icon: '🔗', action: 'portfolio' },
                                        'README.txt': { type: 'file', size: '2 KB', icon: '📝', action: 'readme' }
                                    }
                                },
                                'Documents': {
                                    type: 'folder',
                                    children: {
                                        'cv.txt': { type: 'file', size: '8 KB', icon: '📄', content: 'cv' },
                                        'projects.txt': { type: 'file', size: '4 KB', icon: '📄', content: 'projects' },
                                        'notes.txt': { type: 'file', size: '1 KB', icon: '📝', content: 'notes' }
                                    }
                                },
                                'Pictures': {
                                    type: 'folder',
                                    children: {
                                        'avatar.png': { type: 'file', size: '128 KB', icon: '🖼️' },
                                        'screenshot.png': { type: 'file', size: '512 KB', icon: '🖼️' }
                                    }
                                },
                                '.secret': {
                                    type: 'folder',
                                    hidden: true,
                                    children: {
                                        'easter_egg.txt': { type: 'file', size: '???', icon: '🥚', content: 'easter_egg' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        'D:': {
            type: 'drive',
            children: {
                'Projects': {
                    type: 'folder',
                    children: {
                        'portfolio-os': {
                            type: 'folder',
                            children: {
                                'index.html': { type: 'file', size: '12 KB', icon: '🌐' },
                                'style.css': { type: 'file', size: '24 KB', icon: '🎨' },
                                'main.js': { type: 'file', size: '48 KB', icon: '📜' },
                                'README.md': { type: 'file', size: '3 KB', icon: '📝', content: 'project_readme' }
                            }
                        }
                    }
                },
                'Backup': {
                    type: 'folder',
                    children: {
                        'important.zip': { type: 'file', size: '15 MB', icon: '📦' },
                        'memories.zip': { type: 'file', size: '2.3 GB', icon: '📦' }
                    }
                }
            }
        }
    },

    // File contents for special files
    fileContents: {
        'config.sys': `; Portfolio OS Configuration File
; Last modified: 2026-02-01

DEVICE=HIMEM.SYS
DEVICE=EMM386.EXE NOEMS
DOS=HIGH,UMB
FILES=40
BUFFERS=20
STACKS=9,256

[SYSTEM]
VERSION=1.0.2026
AUTHOR=Aleks Szotek
MODE=PRODUCTION

; Hint: Konami code works here`,

        'autoexec.bat': `@ECHO OFF
REM Portfolio OS Startup Script

ECHO Initializing Portfolio OS...
ECHO.

SET PATH=C:\\WINDOWS;C:\\WINDOWS\\SYSTEM32
SET PROMPT=$P$G
SET DEVELOPER=Aleks Szotek

ECHO System ready.
ECHO.
ECHO Type 'help' in terminal for available commands.`,

        'win.ini': `; Portfolio OS Configuration
[windows]
load=portfolio.exe
run=
NullPort=None

[Desktop]
Wallpaper=(None)
TileWallpaper=0
WallpaperStyle=0
Pattern=(None)

[fonts]
MS Sans Serif=SSERIFE.FON
Courier=COURE.FON
Symbol=SYMBOLE.FON

[mci extensions]
wav=waveaudio
mid=sequencer
avi=AVIVideo

[Portfolio]
Developer=Aleks Szotek
Theme=teal
Sound=ON`,

        'cv': `CURRICULUM VITAE
================

Aleks Szotek
Full-Stack Developer

CONTACT:
- Email: alex.szotek@gmail.com
- GitHub: github.com/al3ksh
- Discord: aleksh8
- Location: Silesia, Poland

EDUCATION:
- Silesian University of Technology (2025-present)
  Computer Science
- Technical School (2025)
  INF.03 & INF.04 Certifications

EXPERIENCE:
- RecodeIT (2024) - Junior Developer
  Full-time contract position
- RecodeIT (2024) - Intern
  Backend development
- RecodeIT (2023) - Intern
  First industry experience

SKILLS:
JavaScript, TypeScript, Python, C++
React, Node.js, Express, SQL
Git, Docker, Linux

[Use File > Print Portfolio in Portfolio.exe for full CV]`,

        'projects': `MY PROJECTS
===========

1. Portfolio OS (This!)
   A Windows 3.1 styled portfolio website
   Tech: HTML, CSS, JavaScript
   Features: Working apps, games, easter eggs

2. Web Applications
   Various full-stack projects
   Tech: React, Node.js, PostgreSQL

3. Backend Systems
   APIs and server applications
   Tech: Python, Express, Docker

4. Open Source Contributions
   GitHub: github.com/al3ksh

Check out Portfolio.exe for more details!`,

        'notes': `Notes
=====

TODO:
[x] Finish Portfolio OS
[x] Add hidden features
[ ] Deploy

IDEAS:
- Music player
- Video player
- More themes

Keyboard shortcuts:
- Konami code
- Terminal commands`,

        'easter_egg': `You found a hidden file.

There are a few secrets scattered
around this portfolio. This is one
of them.

Try the Konami code or explore
the terminal for more.

- A.S.`,

        'project_readme': `Portfolio OS
============

Windows 3.1 inspired portfolio website.

Features:
- Retro UI
- Working applications
- Games
- Multiple themes

Built with HTML, CSS, JavaScript.
No frameworks.

by Aleks Szotek
v1.0.2026`
    },

    currentPath: ['C:'],
    selectedItem: null,
    showHiddenFiles: false,

    render() {
        return `
            <div class="explorer-container">
                <div class="explorer-toolbar">
                    <button class="explorer-btn" id="btnBack" title="Back">◀</button>
                    <button class="explorer-btn" id="btnUp" title="Up">⬆</button>
                    <button class="explorer-btn" id="btnRefresh" title="Refresh">🔄</button>
                    <div class="explorer-address">
                        <span class="address-icon">📁</span>
                        <input type="text" id="addressBar" class="win-input" value="C:\\" readonly>
                    </div>
                </div>
                
                <div class="explorer-main">
                    <div class="explorer-sidebar">
                        <div class="sidebar-section">
                            <div class="sidebar-header">💻 This PC</div>
                            <div class="sidebar-tree" id="folderTree"></div>
                        </div>
                    </div>
                    
                    <div class="explorer-content" id="fileContent">
                        <!-- Files will be rendered here -->
                    </div>
                </div>
                
                <div class="explorer-statusbar">
                    <span id="itemCount">0 items</span>
                    <span id="selectedInfo"></span>
                </div>
            </div>
        `;
    },

    onInit() {
        const container = document.querySelector('#window-explorer');
        if (!container) return;

        // Navigation buttons
        container.querySelector('#btnBack')?.addEventListener('click', () => {
            if (FileExplorerApp.currentPath.length > 1) {
                FileExplorerApp.currentPath.pop();
                FileExplorerApp.navigateTo(container, FileExplorerApp.currentPath);
            }
        });

        container.querySelector('#btnUp')?.addEventListener('click', () => {
            if (FileExplorerApp.currentPath.length > 1) {
                FileExplorerApp.currentPath.pop();
                FileExplorerApp.navigateTo(container, FileExplorerApp.currentPath);
            }
        });

        container.querySelector('#btnRefresh')?.addEventListener('click', () => {
            FileExplorerApp.navigateTo(container, FileExplorerApp.currentPath);
            SoundManager.play('click');
        });

        // Render initial view
        FileExplorerApp.renderTree(container);
        FileExplorerApp.navigateTo(container, ['C:']);
    },

    renderTree(container) {
        const tree = container.querySelector('#folderTree');
        if (!tree) return;

        tree.innerHTML = '';
        
        Object.keys(FileExplorerApp.fileSystem).forEach(drive => {
            const driveEl = document.createElement('div');
            driveEl.className = 'tree-item drive';
            driveEl.innerHTML = `<span class="tree-icon">💾</span><span>${drive}</span>`;
            driveEl.addEventListener('click', () => {
                FileExplorerApp.navigateTo(container, [drive]);
                SoundManager.play('click');
            });
            tree.appendChild(driveEl);

            // Add first level folders
            const driveData = FileExplorerApp.fileSystem[drive];
            if (driveData.children) {
                Object.keys(driveData.children).forEach(folder => {
                    const item = driveData.children[folder];
                    if (item.type === 'folder') {
                        const folderEl = document.createElement('div');
                        folderEl.className = 'tree-item folder';
                        folderEl.innerHTML = `<span class="tree-icon">📁</span><span>${folder}</span>`;
                        folderEl.addEventListener('click', () => {
                            FileExplorerApp.navigateTo(container, [drive, folder]);
                            SoundManager.play('click');
                        });
                        tree.appendChild(folderEl);
                    }
                });
            }
        });
    },

    navigateTo(container, path) {
        FileExplorerApp.currentPath = [...path];
        FileExplorerApp.selectedItem = null;

        // Update address bar
        const addressBar = container.querySelector('#addressBar');
        if (addressBar) {
            addressBar.value = path.join('\\') + '\\';
        }

        // Get current folder content
        let current = FileExplorerApp.fileSystem;
        for (const segment of path) {
            if (current[segment]) {
                current = current[segment].children || current[segment];
            } else if (current.children && current.children[segment]) {
                current = current.children[segment].children || {};
            }
        }

        // Render content
        const content = container.querySelector('#fileContent');
        if (!content) return;

        content.innerHTML = '';
        let itemCount = 0;

        if (typeof current === 'object') {
            const items = current.children || current;
            
            Object.keys(items).forEach(name => {
                const item = items[name];
                if (!item) return;
                
                // Skip hidden files unless showHiddenFiles is enabled
                if (item.hidden && !FileExplorerApp.showHiddenFiles) return;
                
                itemCount++;
                const el = document.createElement('div');
                el.className = 'explorer-item';
                if (item.hidden) el.classList.add('hidden-file');
                el.dataset.name = name;
                el.dataset.type = item.type;

                let icon = '📄';
                if (item.type === 'drive') icon = '💾';
                else if (item.type === 'folder') icon = '📁';
                else if (item.icon) icon = item.icon;

                el.innerHTML = `
                    <div class="item-icon">${icon}</div>
                    <div class="item-name">${name}</div>
                    ${item.size ? `<div class="item-size">${item.size}</div>` : ''}
                `;

                el.addEventListener('click', () => {
                    content.querySelectorAll('.explorer-item').forEach(i => i.classList.remove('selected'));
                    el.classList.add('selected');
                    FileExplorerApp.selectedItem = name;
                    
                    const info = container.querySelector('#selectedInfo');
                    if (info) {
                        info.textContent = item.size ? `${name} - ${item.size}` : name;
                    }
                    SoundManager.play('click');
                });

                el.addEventListener('dblclick', () => {
                    if (item.type === 'folder' || item.type === 'drive') {
                        FileExplorerApp.navigateTo(container, [...FileExplorerApp.currentPath, name]);
                        SoundManager.play('open');
                    } else {
                        // Try to open file
                        FileExplorerApp.openFile(name, item);
                    }
                });

                content.appendChild(el);
            });
        }

        // Update status bar
        const itemCountEl = container.querySelector('#itemCount');
        if (itemCountEl) {
            itemCountEl.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
        }

        const selectedInfo = container.querySelector('#selectedInfo');
        if (selectedInfo) {
            selectedInfo.textContent = '';
        }
    },

    openFile(name, item) {
        // If file has an action, open the corresponding app
        if (item.action) {
            WindowManager.createWindow(item.action);
            SoundManager.play('open');
            return;
        }

        // If file has content, show it in a dialog or notepad
        if (item.content && FileExplorerApp.fileContents[item.content]) {
            const content = FileExplorerApp.fileContents[item.content];
            FileExplorerApp.showFileContent(name, content);
            return;
        }

        // Map file extensions to apps
        const ext = name.split('.').pop().toLowerCase();
        
        const appMap = {
            'txt': 'notepad',
            'md': 'notepad',
            'ini': 'notepad',
            'bat': 'notepad',
            'sys': 'notepad',
            'exe': null, // Show error
            'pdf': null,
            'png': null,
            'jpg': null,
            'wav': null,
            'zip': null,
            'dll': null,
            'ttf': null
        };

        if (appMap[ext] === 'notepad') {
            WindowManager.createWindow('notepad');
            SoundManager.play('open');
        } else if (ext === 'wav') {
            SoundManager.play('chord');
            import('../managers/DialogManager.js').then(({ DialogManager }) => {
                DialogManager.alert('♪ Playing sound... ♪\n(Not really, but imagine it!)', 'Media Player');
            });
        } else if (ext === 'zip') {
            SoundManager.play('error');
            import('../managers/DialogManager.js').then(({ DialogManager }) => {
                DialogManager.alert('Cannot extract archive.\nWinZIP not installed.', 'Error');
            });
        } else if (ext === 'dll') {
            SoundManager.play('error');
            import('../managers/DialogManager.js').then(({ DialogManager }) => {
                DialogManager.alert('This is a system file.\nIt cannot be opened directly.', 'Error');
            });
        } else {
            SoundManager.play('error');
            import('../managers/DialogManager.js').then(({ DialogManager }) => {
                DialogManager.alert(
                    `Cannot open "${name}"\n\nNo application associated with this file type.`,
                    'Error'
                );
            });
        }
    },

    async showFileContent(filename, content) {
        const { DialogManager } = await import('../managers/DialogManager.js');
        
        // Create a custom modal for file content
        const modal = document.createElement('div');
        modal.className = 'file-viewer-modal';
        modal.innerHTML = `
            <div class="file-viewer-window">
                <div class="file-viewer-titlebar">
                    <span>📄 ${filename}</span>
                    <button class="file-viewer-close">×</button>
                </div>
                <div class="file-viewer-content">
                    <pre>${content}</pre>
                </div>
                <div class="file-viewer-statusbar">
                    <span>Read-only</span>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex;
            align-items: center; justify-content: center; z-index: 99999;
        `;
        
        const win = modal.querySelector('.file-viewer-window');
        win.style.cssText = `
            background: var(--win-gray); width: 500px; max-width: 90%;
            border: var(--border-raised); box-shadow: 4px 4px 0 rgba(0,0,0,0.3);
        `;
        
        const titlebar = modal.querySelector('.file-viewer-titlebar');
        titlebar.style.cssText = `
            background: var(--win-blue); color: white; padding: 4px 8px;
            display: flex; justify-content: space-between; align-items: center;
            font-weight: bold;
        `;
        
        const closeBtn = modal.querySelector('.file-viewer-close');
        closeBtn.style.cssText = `
            background: var(--win-gray); border: var(--border-raised);
            width: 20px; height: 20px; cursor: pointer; font-weight: bold;
        `;
        
        const contentDiv = modal.querySelector('.file-viewer-content');
        contentDiv.style.cssText = `
            background: white; margin: 8px; padding: 12px; height: 350px;
            overflow: auto; font-family: 'Courier New', monospace; font-size: 12px;
            border: 2px inset #808080; white-space: pre-wrap; word-wrap: break-word;
        `;
        
        const statusbar = modal.querySelector('.file-viewer-statusbar');
        statusbar.style.cssText = `
            background: var(--win-gray); padding: 4px 8px; font-size: 11px;
            border-top: 1px solid var(--win-dark-gray);
        `;
        
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.body.appendChild(modal);
        SoundManager.play('open');
    }
};

export default FileExplorerApp;
