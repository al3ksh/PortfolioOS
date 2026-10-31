/**
 * File Explorer App - Virtual file browser
 */

import { Icons } from '../icons.js?v=16';
import { SoundManager } from '../managers/SoundManager.js?v=16';
import { WindowManager } from '../managers/WindowManager.js?v=16';
import { VFS } from '../vfs.js?v=16';
import { NotepadApp } from './NotepadApp.js?v=16';
import { printText } from './PrinterApp.js?v=16';

const BS = String.fromCharCode(92);
const escapeHtml = value => String(value).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

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
        const { DialogManager } = await import('../managers/DialogManager.js?v=16');
        const name = (await DialogManager.prompt('Enter folder name:', 'New Folder', 'New Folder'))?.replace(/[\\/:*?"<>|]+/g, '').trim();
        if (!name) return;

        if (!VFS.mkdir([...FileExplorerApp.currentPath, name])) {
            SoundManager.play('error');
            await DialogManager.alert(`Cannot create folder "${name}".\nA file or folder with that name already exists.`, 'Error');
            return;
        }
        SoundManager.play('chord');
    },

    async showProperties(container) {
        const { DialogManager } = await import('../managers/DialogManager.js?v=16');
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
            const item = FileExplorerApp.getItems()?.[selected];
            if (item) {
                await DialogManager.info({
                    'Name': selected,
                    'Type': item.type.charAt(0).toUpperCase() + item.type.slice(1),
                    'Size': VFS.sizeLabel(item) || 'Unknown',
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

    /** Children of a folder in the virtual disk (the current folder by default). */
    getItems(path = FileExplorerApp.currentPath) {
        return VFS.list(path);
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

        const { DialogManager } = await import('../managers/DialogManager.js?v=16');
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
        const culprit = doomed.map(name => VFS.systemCulprit([...FileExplorerApp.currentPath, name])).find(Boolean);

        if (culprit) {
            const files = doomed.flatMap(name => FileExplorerApp.collectFiles(name, items[name]));
            await FileExplorerApp.playDeleteProgress(files);
            FileExplorerApp.showBlueScreen(culprit);
            return;
        }

        doomed.forEach(name => VFS.remove([...FileExplorerApp.currentPath, name]));
        SoundManager.play('close');
    },

    /** "Deleting..." dialog that gets as far as the first few system files, then gives up. */
    playDeleteProgress(files) {
        return new Promise(async resolve => {
            const { DialogManager } = await import('../managers/DialogManager.js?v=16');
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
        FileExplorerApp.currentPath = ['C:'];
        VFS.reset();
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

        // Notepad, the Terminal or a delete changed the disk: redraw what is on screen
        FileExplorerApp.diskHandler = () => {
            FileExplorerApp.renderTree(container);
            FileExplorerApp.navigateTo(container, FileExplorerApp.currentPath, { keepSelection: true });
        };
        window.addEventListener('vfs-change', FileExplorerApp.diskHandler);

        // Render initial view
        FileExplorerApp.renderTree(container);
        FileExplorerApp.navigateTo(container, ['C:']);
    },

    onClose() {
        document.removeEventListener('keydown', FileExplorerApp.keyHandler);
        window.removeEventListener('vfs-change', FileExplorerApp.diskHandler);
        FileExplorerApp.closeContextMenu();
    },

    openContextMenu(container, event) {
        const itemEl = event.target.closest('.explorer-item');
        if (itemEl) {
            if (!itemEl.classList.contains('selected')) itemEl.click();
            const path = [...FileExplorerApp.currentPath, itemEl.dataset.name];
            const isText = VFS.isText(VFS.get(path));
            FileExplorerApp.showContextMenu(event.clientX, event.clientY, [
                { label: 'Open', icon: Icons.ctxOpen, action: () => itemEl.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })) },
                ...(isText ? [
                    { label: 'Edit', icon: Icons.notepad, action: () => NotepadApp.openPath(path) },
                    { label: 'Print', icon: Icons.actPrint, action: () => printText(itemEl.dataset.name, VFS.read(path)) }
                ] : []),
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
        
        Object.keys(VFS.root.children).forEach(drive => {
            const driveEl = document.createElement('div');
            driveEl.className = 'tree-item drive';
            driveEl.innerHTML = `<span class="tree-icon">${Icons.fileDrive}</span><span>${drive}</span>`;
            driveEl.addEventListener('click', () => {
                FileExplorerApp.navigateTo(container, [drive]);
                SoundManager.play('click');
            });
            tree.appendChild(driveEl);

            // Add first level folders
            const driveData = VFS.root.children[drive];
            if (driveData.children) {
                Object.keys(driveData.children).forEach(folder => {
                    const item = driveData.children[folder];
                    if (item.type === 'folder') {
                        const folderEl = document.createElement('div');
                        folderEl.className = 'tree-item folder';
                        folderEl.innerHTML = `<span class="tree-icon">${Icons.smFolder}</span><span>${escapeHtml(folder)}</span>`;
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

    navigateTo(container, path, { keepSelection = false } = {}) {
        // A folder deleted from elsewhere sends the view up to the nearest one that still exists
        const target = [...path];
        while (target.length > 1 && !VFS.isDir(VFS.get(target))) target.pop();
        const reselect = keepSelection && target.length === path.length
            ? [...container.querySelectorAll('.explorer-item.selected')].map(el => el.dataset.name)
            : [];
        path = target;
        FileExplorerApp.currentPath = [...path];
        FileExplorerApp.selectedItem = null;

        // Update address bar
        const addressBar = container.querySelector('#addressBar');
        if (addressBar) {
            addressBar.value = path.join('\\') + '\\';
        }

        const current = VFS.list(path);

        // Render content
        const content = container.querySelector('#fileContent');
        if (!content) return;

        content.innerHTML = '';
        let itemCount = 0;

        if (current) {
            const items = current;

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

                const size = VFS.sizeLabel(item);
                el.innerHTML = `
                    <div class="item-icon">${VFS.iconOf(name, item)}</div>
                    <div class="item-name">${escapeHtml(name)}</div>
                    ${size ? `<div class="item-size">${size}</div>` : ''}
                `;

                el.addEventListener('click', () => {
                    content.querySelectorAll('.explorer-item').forEach(i => i.classList.remove('selected'));
                    el.classList.add('selected');
                    FileExplorerApp.selectedItem = name;
                    
                    const info = container.querySelector('#selectedInfo');
                    if (info) {
                        info.textContent = size ? `${name} - ${size}` : name;
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
                if (reselect.includes(name)) {
                    el.classList.add('selected');
                    FileExplorerApp.selectedItem = name;
                }
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

        // Text files open in Notepad, straight from the shared disk
        if (VFS.isText(item)) {
            NotepadApp.openPath([...FileExplorerApp.currentPath, name]);
            return;
        }

        const ext = name.split('.').pop().toLowerCase();

        if (VFS.canHoldText(name)) {
            NotepadApp.openPath([...FileExplorerApp.currentPath, name]);
        } else if (ext === 'wav') {
            SoundManager.play('chord');
            import('../managers/DialogManager.js?v=16').then(({ DialogManager }) => {
                DialogManager.alert('♪ Playing sound... ♪\n(Not really, but imagine it!)', 'Media Player');
            });
        } else if (ext === 'zip') {
            SoundManager.play('error');
            import('../managers/DialogManager.js?v=16').then(({ DialogManager }) => {
                DialogManager.alert('Cannot extract archive.\nWinZIP not installed.', 'Error');
            });
        } else if (ext === 'dll') {
            SoundManager.play('error');
            import('../managers/DialogManager.js?v=16').then(({ DialogManager }) => {
                DialogManager.alert('This is a system file.\nIt cannot be opened directly.', 'Error');
            });
        } else {
            SoundManager.play('error');
            import('../managers/DialogManager.js?v=16').then(({ DialogManager }) => {
                DialogManager.alert(
                    `Cannot open "${name}"\n\nNo application associated with this file type.`,
                    'Error'
                );
            });
        }
    }
};

export default FileExplorerApp;
