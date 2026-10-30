/**
 * File Explorer App - Virtual file browser
 */

import { Icons } from '../icons.js?v=15';
import { Profile, githubUrl } from '../config.js?v=15';
import { loc } from '../i18n.js?v=15';
import { SoundManager } from '../managers/SoundManager.js?v=15';
import { WindowManager } from '../managers/WindowManager.js?v=15';

const BS = String.fromCharCode(92);
// Deleting anything under these paths takes the whole system down
const SYSTEM_PATHS = ['c:' + BS + 'windows', 'c:' + BS + 'program files' + BS + 'portfolio os' + BS + 'portfolio.exe'];
const cloneTree = (tree) => {
    const copy = {};
    Object.entries(tree).forEach(([name, item]) => {
        copy[name] = { ...item };
        if (item.children) copy[name].children = cloneTree(item.children);
    });
    return copy;
};

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
            { label: 'Delete', action: 'delete', shortcut: 'Del' },
            { divider: true },
            { label: 'Select All', action: 'selectAll', shortcut: 'Ctrl+A' },
            { label: 'Invert Selection', action: 'invertSelection' }
        ],
        'View': [
            { label: 'Large Icons', action: 'viewLarge', checked: false, checkGroup: 'viewMode' },
            { label: 'Small Icons', action: 'viewSmall', checked: false, checkGroup: 'viewMode' },
            { label: 'List', action: 'viewList', checked: false, checkGroup: 'viewMode' },
            { label: 'Details', action: 'viewDetails', checked: true, checkGroup: 'viewMode' },
            { divider: true },
            { label: 'Refresh', action: 'refresh', shortcut: 'F5' },
            { divider: true },
            { label: 'Show Hidden Files', action: 'showHidden', checked: false }
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
            case 'delete':
                FileExplorerApp.deleteSelected(window);
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
        const { DialogManager } = await import('../managers/DialogManager.js?v=15');
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
        const { DialogManager } = await import('../managers/DialogManager.js?v=15');
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
                                'config.sys': { type: 'file', size: '512 B', icon: Icons.fileConfig, content: 'config.sys' },
                                'autoexec.bat': { type: 'file', size: '256 B', icon: Icons.fileText, content: 'autoexec.bat' },
                                'win.ini': { type: 'file', size: '1 KB', icon: Icons.fileConfig, content: 'win.ini' },
                                'secrets.dll': { type: 'file', size: '???', icon: Icons.fileLock, hidden: true }
                            }
                        },
                        'Fonts': {
                            type: 'folder',
                            children: {
                                'Arial.ttf': { type: 'file', size: '150 KB', icon: Icons.fileFont },
                                'Times.ttf': { type: 'file', size: '180 KB', icon: Icons.fileFont },
                                'MSSerif.ttf': { type: 'file', size: '120 KB', icon: Icons.fileFont }
                            }
                        },
                        'Media': {
                            type: 'folder',
                            children: {
                                'startup.wav': { type: 'file', size: '420 KB', icon: Icons.fileAudio },
                                'chord.wav': { type: 'file', size: '24 KB', icon: Icons.fileAudio },
                                'ding.wav': { type: 'file', size: '12 KB', icon: Icons.fileAudio }
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
                                'portfolio.exe': { type: 'file', size: '2.1 MB', icon: Icons.fileExe, action: 'portfolio' },
                                'readme.txt': { type: 'file', size: '4 KB', icon: Icons.fileText, action: 'readme' },
                                'contact.exe': { type: 'file', size: '512 KB', icon: Icons.fileExe, action: 'contact' },
                                'simple.exe': { type: 'file', size: '128 KB', icon: Icons.smSimple, action: 'simplemode' }
                            }
                        },
                        'Accessories': {
                            type: 'folder',
                            children: {
                                'notepad.exe': { type: 'file', size: '64 KB', icon: Icons.smNotepad, action: 'notepad' },
                                'calc.exe': { type: 'file', size: '48 KB', icon: Icons.smCalc, action: 'calc' },
                                'paint.exe': { type: 'file', size: '256 KB', icon: Icons.smPaint, action: 'paint' },
                                'terminal.exe': { type: 'file', size: '96 KB', icon: Icons.smTerminal, action: 'terminal' }
                            }
                        },
                        'Internet': {
                            type: 'folder',
                            children: {
                                'internet.exe': { type: 'file', size: '1.2 MB', icon: Icons.smBrowser, action: 'browser' }
                            }
                        },
                        'Games': {
                            type: 'folder',
                            children: {
                                'mines.exe': { type: 'file', size: '180 KB', icon: Icons.smMines, action: 'mines' },
                                'snake.exe': { type: 'file', size: '96 KB', icon: Icons.fileExe, action: 'snake' }
                            }
                        }
                    }
                },
                'Users': {
                    type: 'folder',
                    children: {
                        [Profile.firstName]: {
                            type: 'folder',
                            children: {
                                'Desktop': {
                                    type: 'folder',
                                    children: {
                                        'Portfolio.lnk': { type: 'file', size: '1 KB', icon: Icons.fileLink, action: 'portfolio' },
                                        'README.txt': { type: 'file', size: '2 KB', icon: Icons.fileText, action: 'readme' }
                                    }
                                },
                                'Documents': {
                                    type: 'folder',
                                    children: {
                                         'cv.txt': { type: 'file', size: '8 KB', icon: Icons.fileText, content: 'cv' },
                                         'projects.txt': { type: 'file', size: '4 KB', icon: Icons.fileText, content: 'projects' },
                                         'notes.txt': { type: 'file', size: '1 KB', icon: Icons.fileText, content: 'notes' }
                                    }
                                },
                                'Pictures': {
                                    type: 'folder',
                                    children: {
                                         'avatar.png': { type: 'file', size: '128 KB', icon: Icons.fileImage },
                                         'screenshot.png': { type: 'file', size: '512 KB', icon: Icons.fileImage }
                                    }
                                },
                                '.secret': {
                                    type: 'folder',
                                    hidden: true,
                                    children: {
                                         'easter_egg.txt': { type: 'file', size: '???', icon: Icons.fileText, content: 'easter_egg' }
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
                                'index.html': { type: 'file', size: '12 KB', icon: Icons.smBrowser },
                                'style.css': { type: 'file', size: '24 KB', icon: Icons.fileText },
                                'main.js': { type: 'file', size: '48 KB', icon: Icons.fileText },
                                'README.md': { type: 'file', size: '3 KB', icon: Icons.fileText, content: 'project_readme' }
                            }
                        }
                    }
                },
                'Backup': {
                    type: 'folder',
                    children: {
                        'important.zip': { type: 'file', size: '15 MB', icon: Icons.fileZip },
                        'memories.zip': { type: 'file', size: '2.3 GB', icon: Icons.fileZip }
                    }
                }
            }
        }
    },

    // File contents for special files
    fileContents: {
        'config.sys': `DEVICE=C:${BS}WINDOWS${BS}HIMEM.SYS
DEVICE=C:${BS}WINDOWS${BS}EMM386.EXE NOEMS
DOS=HIGH,UMB
FILES=40
BUFFERS=20
STACKS=9,256`,

        'autoexec.bat': `@ECHO OFF
PROMPT $P$G
SET PATH=C:${BS}WINDOWS;C:${BS}WINDOWS${BS}SYSTEM32
SET TEMP=C:${BS}WINDOWS${BS}TEMP
LH C:${BS}WINDOWS${BS}MOUSE.COM`,

        'win.ini': `[windows]
load=
run=
NullPort=None

[Desktop]
Wallpaper=(None)
TileWallpaper=0

[fonts]
MS Sans Serif=SSERIFE.FON
Courier=COURE.FON
Symbol=SYMBOLE.FON

[mci extensions]
wav=waveaudio
mid=sequencer
avi=AVIVideo`,

        get cv() {
            return `${Profile.name}
${loc(Profile.title)}

Email:    ${Profile.contact.email}
GitHub:   github.com/${Profile.contact.github}
Discord:  ${Profile.contact.discord}
Location: ${loc(Profile.location)}

EDUCATION
${Profile.education.map(edu => `${loc(edu.date)}  ${loc(edu.school)}\n          ${loc(edu.degree)}`).join('\n')}

EXPERIENCE
${Profile.experience.map(job => `${loc(job.date)}  ${loc(job.role)}, ${loc(job.company)}`).join('\n')}

SKILLS
${Profile.skills.join(', ')}`;
        },

        get projects() {
            return `PROJECTS

${Profile.projects.map(project => `${project.name}${project.tech ? ` (${project.tech})` : ''}\n${project.description}\n${project.url}`).join('\n\n')}`;
        },

        'notes': `TODO

- update the CV
- add screenshots to the project READMEs
- back up the server
- reply to recruiters`,

        'easter_egg': `Hidden file, nothing sensitive in here.

If you like poking around, try the Konami code
and the Terminal.

${Profile.initials}`,

        get project_readme() {
            return `PortfolioOS

A portfolio built as a Windows 3.1 / 95 style desktop.
Vanilla JavaScript, no frameworks.

github.com/${Profile.contact.github}/PortfolioOS`;
        }
    },

    /** Children of a folder in the virtual disk (the current folder by default). */
    getItems(path = FileExplorerApp.currentPath) {
        let node = { children: FileExplorerApp.fileSystem };
        for (const segment of path) {
            node = node.children?.[segment];
            if (!node) return null;
        }
        return node.children || null;
    },

    /** Name of the system file that makes deleting `name` fatal, or null for harmless items. */
    systemCulprit(name) {
        const target = [...FileExplorerApp.currentPath, name].join(BS).toLowerCase();
        for (const system of SYSTEM_PATHS) {
            if (target === system || target.startsWith(system + BS)) return name;
            if (system.startsWith(target + BS)) return system.split(BS).pop();
        }
        return null;
    },

    collectFiles(name, item, out = []) {
        if (item.type === 'file') {
            out.push(name);
        } else {
            Object.entries(item.children || {}).forEach(([childName, child]) => FileExplorerApp.collectFiles(childName, child, out));
        }
        return out;
    },

    async deleteSelected(container) {
        const names = [...container.querySelectorAll('.explorer-item.selected')].map(el => el.dataset.name);
        const items = FileExplorerApp.getItems();
        if (!names.length || !items) return;

        const { DialogManager } = await import('../managers/DialogManager.js?v=15');
        const first = items[names[0]];
        let message;
        let title;
        if (names.length > 1) {
            message = `Are you sure you want to delete these ${names.length} items?`;
            title = 'Confirm Multiple File Delete';
        } else if (first?.type === 'file') {
            message = `Are you sure you want to delete "${names[0]}"?`;
            title = 'Confirm File Delete';
        } else {
            message = `Are you sure you want to delete the folder "${names[0]}" and all its contents?`;
            title = 'Confirm Folder Delete';
        }
        if (!await DialogManager.confirm(message, title)) return;

        const doomed = names.filter(name => items[name]);
        const culprit = doomed.map(name => FileExplorerApp.systemCulprit(name)).find(Boolean);

        if (culprit) {
            const files = doomed.flatMap(name => FileExplorerApp.collectFiles(name, items[name]));
            await FileExplorerApp.playDeleteProgress(files);
            FileExplorerApp.showBlueScreen(culprit);
            return;
        }

        doomed.forEach(name => delete items[name]);
        FileExplorerApp.renderTree(container);
        FileExplorerApp.navigateTo(container, FileExplorerApp.currentPath);
        SoundManager.play('close');
    },

    /** "Deleting..." dialog that gets as far as the first few system files, then gives up. */
    playDeleteProgress(files) {
        return new Promise(async resolve => {
            const { DialogManager } = await import('../managers/DialogManager.js?v=15');
            const dialog = DialogManager.createDialog({
                title: 'Deleting',
                content: `
                    <div class="delete-progress">
                        <div class="delete-file"></div>
                        <div class="delete-bar"><div class="delete-fill"></div></div>
                        <div class="delete-from"></div>
                    </div>`,
                buttons: []
            });
            dialog.querySelector('.dialog-close-btn')?.remove();
            DialogManager.show(dialog);

            const fileEl = dialog.querySelector('.delete-file');
            const fillEl = dialog.querySelector('.delete-fill');
            dialog.querySelector('.delete-from').textContent = `from ${FileExplorerApp.currentPath.join(BS)}${BS}`;

            const steps = 20;
            const failAt = 12;
            let step = 0;
            const timer = setInterval(() => {
                fileEl.textContent = files[step % files.length] || '';
                fillEl.style.width = `${Math.round((step / steps) * 100)}%`;
                if (step++ >= failAt) {
                    clearInterval(timer);
                    if (dialog.isConnected) DialogManager.close(dialog);
                    resolve();
                }
            }, 110);
        });
    },

    showBlueScreen(culprit) {
        const bsod = document.getElementById('bsodScreen');
        if (!bsod) return;
        const message = bsod.querySelector('.bsod-message');
        const original = message?.textContent;
        if (message) {
            message.textContent = `FATAL_ERROR: Deleted_${culprit.replace(/[^A-Za-z0-9.]+/g, '_')}`;
        }
        bsod.classList.remove('hidden');
        SoundManager.play('error');

        const dismiss = () => {
            bsod.classList.add('hidden');
            if (message) message.textContent = original;
            document.removeEventListener('keydown', dismiss);
            document.removeEventListener('click', dismiss);
            FileExplorerApp.restoreDisk();
        };
        // Short grace period so the click that started the delete does not close it at once
        setTimeout(() => {
            document.addEventListener('keydown', dismiss, { once: true });
            document.addEventListener('click', dismiss, { once: true });
        }, 500);
    },

    /** After a crash the disk comes back as it was ("restored from backup"). */
    restoreDisk() {
        FileExplorerApp.fileSystem = cloneTree(FileExplorerApp.pristine);
        FileExplorerApp.currentPath = ['C:'];
        FileExplorerApp.selectedItem = null;
        const container = document.querySelector('#window-explorer');
        if (container) {
            FileExplorerApp.renderTree(container);
            FileExplorerApp.navigateTo(container, ['C:']);
        }
    },

    closeContextMenu() {},

    showContextMenu(x, y, entries) {
        FileExplorerApp.closeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'icon-context-menu';
        menu.setAttribute('role', 'menu');
        menu.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; padding: 2px; z-index: 10000;`;

        const close = () => {
            menu.remove();
            document.removeEventListener('mousedown', onOutside, true);
            FileExplorerApp.closeContextMenu = () => {};
        };
        const onOutside = (event) => {
            if (!menu.contains(event.target)) close();
        };

        entries.forEach(entry => {
            if (entry.divider) {
                const divider = document.createElement('div');
                divider.className = 'menu-divider';
                divider.setAttribute('role', 'separator');
                menu.appendChild(divider);
                return;
            }
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'menu-item';
            button.setAttribute('role', 'menuitem');
            button.innerHTML = `<span class="context-menu-icon" aria-hidden="true">${entry.icon || ''}</span><span>${entry.label}</span>`;
            button.addEventListener('click', () => {
                close();
                entry.action();
            });
            menu.appendChild(button);
        });

        menu.addEventListener('keydown', (event) => {
            const buttons = [...menu.querySelectorAll('.menu-item')];
            const index = buttons.indexOf(document.activeElement);
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
            } else if (['ArrowDown', 'ArrowUp', 'Tab'].includes(event.key)) {
                event.preventDefault();
                const step = event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey) ? -1 : 1;
                buttons[(index + step + buttons.length) % buttons.length]?.focus({ preventScroll: true });
            }
        });

        document.body.appendChild(menu);
        const rect = menu.getBoundingClientRect();
        menu.style.left = `${Math.max(0, Math.min(x, window.innerWidth - rect.width - 2))}px`;
        menu.style.top = `${Math.max(0, Math.min(y, window.innerHeight - rect.height - 2))}px`;
        menu.querySelector('.menu-item')?.focus({ preventScroll: true });

        document.addEventListener('mousedown', onOutside, true);
        FileExplorerApp.closeContextMenu = close;
    },

    currentPath: ['C:'],
    selectedItem: null,
    showHiddenFiles: false,

    render() {
        return `
            <div class="explorer-container">
                <div class="explorer-toolbar">
                    <button class="explorer-btn" id="btnBack" title="Back">${Icons.navBack}</button>
                    <button class="explorer-btn" id="btnUp" title="Up">${Icons.navUp}</button>
                    <button class="explorer-btn" id="btnRefresh" title="Refresh">${Icons.ctxRefresh}</button>
                    <div class="explorer-address">
                        <span class="address-icon">${Icons.smFolder}</span>
                        <input type="text" id="addressBar" class="win-input" value="C:\\" readonly>
                    </div>
                </div>
                
                <div class="explorer-main">
                    <div class="explorer-sidebar">
                        <div class="sidebar-section">
                            <div class="sidebar-header">${Icons.explorer} This PC</div>
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

        // Right-click menu
        container.querySelector('#fileContent')?.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            FileExplorerApp.openContextMenu(container, event);
        });

        // Del key deletes the selection while this window is the active one
        FileExplorerApp.keyHandler = (event) => {
            if (event.key !== 'Delete' || !container.isConnected || !container.classList.contains('active')) return;
            if (document.querySelector('.dialog-overlay') || event.target.closest?.('input, textarea')) return;
            FileExplorerApp.deleteSelected(container);
        };
        document.addEventListener('keydown', FileExplorerApp.keyHandler);

        // Render initial view
        FileExplorerApp.renderTree(container);
        FileExplorerApp.navigateTo(container, ['C:']);
    },

    onClose() {
        document.removeEventListener('keydown', FileExplorerApp.keyHandler);
        FileExplorerApp.closeContextMenu();
    },

    openContextMenu(container, event) {
        const itemEl = event.target.closest('.explorer-item');
        if (itemEl) {
            if (!itemEl.classList.contains('selected')) itemEl.click();
            FileExplorerApp.showContextMenu(event.clientX, event.clientY, [
                { label: 'Open', icon: Icons.ctxOpen, action: () => itemEl.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })) },
                { divider: true },
                { label: 'Delete', icon: Icons.actTrash, action: () => FileExplorerApp.deleteSelected(container) },
                { divider: true },
                { label: 'Properties', icon: Icons.ctxProps, action: () => FileExplorerApp.showProperties(container) }
            ]);
        } else {
            container.querySelectorAll('.explorer-item.selected').forEach(el => el.classList.remove('selected'));
            FileExplorerApp.selectedItem = null;
            FileExplorerApp.showContextMenu(event.clientX, event.clientY, [
                { label: 'Refresh', icon: Icons.ctxRefresh, action: () => FileExplorerApp.navigateTo(container, FileExplorerApp.currentPath) },
                { label: 'New Folder', icon: Icons.smFolder, action: () => FileExplorerApp.createNewFolder(container) },
                { divider: true },
                { label: 'Properties', icon: Icons.ctxProps, action: () => FileExplorerApp.showProperties(container) }
            ]);
        }
    },

    renderTree(container) {
        const tree = container.querySelector('#folderTree');
        if (!tree) return;

        tree.innerHTML = '';
        
        Object.keys(FileExplorerApp.fileSystem).forEach(drive => {
            const driveEl = document.createElement('div');
            driveEl.className = 'tree-item drive';
            driveEl.innerHTML = `<span class="tree-icon">${Icons.fileDrive}</span><span>${drive}</span>`;
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
                        folderEl.innerHTML = `<span class="tree-icon">${Icons.smFolder}</span><span>${folder}</span>`;
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

                let icon = Icons.fileText;
                if (item.type === 'drive') icon = Icons.fileDrive;
                else if (item.type === 'folder') icon = Icons.smFolder;
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
            import('../managers/DialogManager.js?v=15').then(({ DialogManager }) => {
                DialogManager.alert('♪ Playing sound... ♪\n(Not really, but imagine it!)', 'Media Player');
            });
        } else if (ext === 'zip') {
            SoundManager.play('error');
            import('../managers/DialogManager.js?v=15').then(({ DialogManager }) => {
                DialogManager.alert('Cannot extract archive.\nWinZIP not installed.', 'Error');
            });
        } else if (ext === 'dll') {
            SoundManager.play('error');
            import('../managers/DialogManager.js?v=15').then(({ DialogManager }) => {
                DialogManager.alert('This is a system file.\nIt cannot be opened directly.', 'Error');
            });
        } else {
            SoundManager.play('error');
            import('../managers/DialogManager.js?v=15').then(({ DialogManager }) => {
                DialogManager.alert(
                    `Cannot open "${name}"\n\nNo application associated with this file type.`,
                    'Error'
                );
            });
        }
    },

    async showFileContent(filename, content) {
        const { DialogManager } = await import('../managers/DialogManager.js?v=15');
        
        // Create a custom modal for file content
        const modal = document.createElement('div');
        modal.className = 'file-viewer-modal';
        modal.innerHTML = `
            <div class="file-viewer-window">
                <div class="file-viewer-titlebar">
                    <span>${Icons.fileText} ${filename}</span>
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

FileExplorerApp.pristine = cloneTree(FileExplorerApp.fileSystem);

export default FileExplorerApp;
