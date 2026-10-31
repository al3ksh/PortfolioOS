/**
 * Notepad App - Simple text editor working on the shared disk (js/vfs.js).
 * Explorer and the Terminal open files here; Save writes back to the same disk.
 */

import { Icons } from '../icons.js?v=16';
import { SoundManager } from '../managers/SoundManager.js?v=16';
import { DialogManager } from '../managers/DialogManager.js?v=16';
import { WindowManager } from '../managers/WindowManager.js?v=16';
import { VFS } from '../vfs.js?v=16';
import { printText } from './PrinterApp.js?v=16';

const CONTENT_KEY = 'notepad-content';
const PATH_KEY = 'notepad-path';

function loadPath() {
    try {
        const parts = JSON.parse(localStorage.getItem(PATH_KEY) || 'null');
        return Array.isArray(parts) && parts.length > 1 ? parts : null;
    } catch {
        return null;
    }
}

export const NotepadApp = {
    id: 'notepad',
    title: 'Notepad - Untitled',
    icon: Icons.notepad,
    width: 500,
    height: 400,
    hasMenu: true,
    menuItems: ['File', 'Edit', 'Help'],
    resizable: true,
    path: null,
    pending: null,

    menuConfig: {
        'File': [
            { label: 'New', action: 'new', shortcut: 'Ctrl+N' },
            { label: 'Open...', action: 'open', shortcut: 'Ctrl+O' },
            { label: 'Save', action: 'save', shortcut: 'Ctrl+S' },
            { label: 'Save As...', action: 'saveAs' },
            { label: 'Download...', action: 'download' },
            { divider: true },
            { label: 'Page Setup...', action: 'pageSetup', disabled: true },
            { label: 'Print...', action: 'print', shortcut: 'Ctrl+P' },
            { divider: true },
            { label: 'Exit', action: 'close', shortcut: 'Alt+F4' }
        ],
        'Edit': [
            { label: 'Undo', action: 'undo', shortcut: 'Ctrl+Z' },
            { divider: true },
            { label: 'Cut', action: 'cut', shortcut: 'Ctrl+X' },
            { label: 'Copy', action: 'copy', shortcut: 'Ctrl+C' },
            { label: 'Paste', action: 'paste', shortcut: 'Ctrl+V' },
            { label: 'Delete', action: 'delete', shortcut: 'Del' },
            { divider: true },
            { label: 'Select All', action: 'selectAll', shortcut: 'Ctrl+A' },
            { label: 'Time/Date', action: 'insertDate', shortcut: 'F5' }
        ],
        'Help': [
            { label: 'Help Topics', action: 'helpTopics', shortcut: 'F1' },
            { divider: true },
            { label: 'About Notepad', action: 'about' }
        ]
    },

    textarea: () => document.querySelector('#window-notepad .notepad-textarea'),
    fileName: () => (NotepadApp.path ? NotepadApp.path[NotepadApp.path.length - 1] : 'Untitled'),

    /** Text differs from what is on disk (or an untitled page is not empty). */
    isDirty() {
        const textarea = NotepadApp.textarea();
        if (!textarea) return false;
        const saved = NotepadApp.path ? VFS.read(NotepadApp.path) ?? '' : '';
        return textarea.value !== saved;
    },

    updateTitle() {
        const title = `Notepad - ${NotepadApp.fileName()}`;
        const instance = WindowManager.getWindowInstance('notepad');
        if (instance) instance.title = title;
        const bar = document.querySelector('#window-notepad .title-bar-text');
        if (bar) bar.textContent = title;
        WindowManager.notifyChange();
    },

    remember() {
        const textarea = NotepadApp.textarea();
        if (textarea) localStorage.setItem(CONTENT_KEY, textarea.value);
        if (NotepadApp.path) localStorage.setItem(PATH_KEY, JSON.stringify(NotepadApp.path));
        else localStorage.removeItem(PATH_KEY);
    },

    load(parts, text = parts ? VFS.read(parts) ?? '' : '') {
        NotepadApp.path = parts;
        const textarea = NotepadApp.textarea();
        if (textarea) {
            textarea.value = text;
            textarea.selectionStart = textarea.selectionEnd = 0;
            textarea.scrollTop = 0;
        }
        NotepadApp.remember();
        NotepadApp.updateTitle();
    },

    /** Open a file from the shared disk (Explorer, Terminal, Open...). */
    async openPath(parts) {
        if (!NotepadApp.textarea()) {
            NotepadApp.pending = parts;
            WindowManager.createWindow('notepad');
            SoundManager.play('open');
            return;
        }
        WindowManager.createWindow('notepad');
        const same = NotepadApp.path && parts.join('\\') === NotepadApp.path.join('\\');
        if (same) return;
        if (NotepadApp.isDirty()) {
            const discard = await DialogManager.confirm(`The text in ${NotepadApp.fileName()} has changed.\n\nDiscard the changes?`, 'Notepad');
            if (!discard) return;
        }
        NotepadApp.load(parts);
        NotepadApp.textarea()?.focus();
    },

    save() {
        if (!NotepadApp.path) return NotepadApp.saveAs();
        if (!VFS.write(NotepadApp.path, NotepadApp.textarea().value)) {
            DialogManager.alert(`Cannot save ${NotepadApp.fileName()}.\n\nThe path no longer exists.`, 'Notepad');
            return NotepadApp.saveAs();
        }
        NotepadApp.remember();
        SoundManager.play('click');
    },

    async saveAs() {
        const suggestion = NotepadApp.path ? VFS.toString(NotepadApp.path) : 'Documents\\untitled.txt';
        let name = await DialogManager.prompt(`File name (relative to ${VFS.toString(VFS.home)}):`, suggestion, 'Save As');
        name = name?.trim();
        if (!name) return;
        if (!/\.[a-z0-9]+$/i.test(name)) name += '.txt';
        const target = VFS.resolve(VFS.home, name, { parent: true });
        if (!target) {
            DialogManager.alert(`${name}\n\nPath not found.`, 'Save As');
            return;
        }
        if (target.node && !VFS.isText(target.node)) {
            DialogManager.alert(`${target.parts[target.parts.length - 1]} is not a text file.`, 'Save As');
            return;
        }
        const samePath = NotepadApp.path && target.parts.join('\\') === NotepadApp.path.join('\\');
        if (target.node && !samePath) {
            const replace = await DialogManager.confirm(`${VFS.toString(target.parts)} already exists.\n\nDo you want to replace it?`, 'Save As');
            if (!replace) return;
        }
        if (!VFS.write(target.parts, NotepadApp.textarea()?.value ?? '')) {
            DialogManager.alert(`Cannot save ${name}.`, 'Save As');
            return;
        }
        NotepadApp.path = target.parts;
        NotepadApp.remember();
        NotepadApp.updateTitle();
        SoundManager.play('click');
    },

    /** Win95-style file list of every text file on the disk. */
    showOpenDialog() {
        const files = VFS.textFiles();
        const current = NotepadApp.path?.join('\\');
        const options = files.map(parts => {
            const value = parts.join('\\');
            return `<option value="${DialogManager.escapeHtml(value)}"${value === current ? ' selected' : ''}>${DialogManager.escapeHtml(VFS.toString(parts))}</option>`;
        }).join('');
        const dialog = DialogManager.createDialog({
            title: 'Open',
            content: `
                <div class="dialog-message">Select a file to open:</div>
                <select class="notepad-open-list win-input" size="10">${options}</select>
            `,
            buttons: [
                { label: 'Open', action: 'open', primary: true },
                { label: 'Cancel', action: 'cancel' }
            ],
            onClose: action => {
                const value = list.value;
                if (action === 'open' && value) NotepadApp.openPath(value.split('\\'));
            },
            onShow: () => {
                if (!list.value && list.options.length) list.selectedIndex = 0;
                list.focus();
            }
        });
        const list = dialog.querySelector('.notepad-open-list');
        list.addEventListener('dblclick', () => dialog.querySelector('.win-btn.primary')?.click());
        DialogManager.show(dialog);
    },

    onMenuAction(action) {
        const textarea = NotepadApp.textarea();
        if (!textarea) return;

        switch(action) {
            case 'new':
                if (NotepadApp.isDirty()) {
                    DialogManager.confirm(`The text in ${NotepadApp.fileName()} has changed.\n\nDiscard the changes?`, 'New File').then(confirmed => {
                        if (confirmed) NotepadApp.load(null, '');
                    });
                    return;
                }
                NotepadApp.load(null, '');
                break;
            case 'open':
                NotepadApp.showOpenDialog();
                break;
            case 'save':
                NotepadApp.save();
                break;
            case 'saveAs':
                NotepadApp.saveAs();
                break;
            case 'download':
                NotepadApp.downloadFile(textarea.value);
                break;
            case 'print':
                printText(NotepadApp.fileName(), textarea.value);
                break;
            case 'undo':
                document.execCommand('undo');
                break;
            case 'cut':
                document.execCommand('cut');
                break;
            case 'copy':
                document.execCommand('copy');
                break;
            case 'paste':
                navigator.clipboard.readText().then(text => {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + text.length;
                    NotepadApp.remember();
                });
                break;
            case 'delete': {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                if (start !== end) {
                    textarea.value = textarea.value.substring(0, start) + textarea.value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start;
                    NotepadApp.remember();
                }
                break;
            }
            case 'selectAll':
                textarea.select();
                break;
            case 'insertDate': {
                const date = new Date().toLocaleString();
                const pos = textarea.selectionStart;
                textarea.value = textarea.value.substring(0, pos) + date + textarea.value.substring(pos);
                textarea.selectionStart = textarea.selectionEnd = pos + date.length;
                NotepadApp.remember();
                break;
            }
        }
    },

    render() {
        return `
            <div class="notepad-content">
                <textarea class="notepad-textarea" placeholder="Type your notes here..."
                    spellcheck="false"
                ></textarea>
            </div>
        `;
    },

    onInit() {
        const textarea = NotepadApp.textarea();
        if (!textarea) return;

        if (NotepadApp.pending) {
            const parts = NotepadApp.pending;
            NotepadApp.pending = null;
            NotepadApp.load(parts);
        } else {
            // Pick up where the last session left off, unsaved text included
            const path = loadPath();
            const saved = localStorage.getItem(CONTENT_KEY);
            NotepadApp.load(path && VFS.get(path) ? path : null, saved ?? (path ? VFS.read(path) ?? '' : ''));
        }

        textarea.addEventListener('input', () => NotepadApp.remember());
        textarea.addEventListener('keydown', (event) => {
            if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
            const action = { s: 'save', o: 'open', p: 'print' }[event.key.toLowerCase()];
            if (!action) return;
            event.preventDefault();
            NotepadApp.onMenuAction(action);
        });
    },

    downloadFile(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = NotepadApp.path ? NotepadApp.fileName() : 'notepad.txt';
        a.click();
        URL.revokeObjectURL(url);
        SoundManager.play('chord');
    }
};

export default NotepadApp;
