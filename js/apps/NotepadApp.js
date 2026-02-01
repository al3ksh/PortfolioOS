/**
 * Notepad App - Simple text editor
 */

import { Icons } from '../icons.js';
import { SoundManager } from '../managers/SoundManager.js';

export const NotepadApp = {
    id: 'notepad',
    title: 'Notepad - Untitled',
    icon: Icons.notepad,
    width: 500,
    height: 400,
    hasMenu: true,
    menuItems: ['File', 'Edit', 'Help'],
    resizable: true,

    menuConfig: {
        'File': [
            { label: 'New', action: 'new', shortcut: 'Ctrl+N' },
            { label: 'Open...', action: 'open', shortcut: 'Ctrl+O' },
            { label: 'Save', action: 'save', shortcut: 'Ctrl+S' },
            { label: 'Save As...', action: 'saveAs' },
            { divider: true },
            { label: 'Page Setup...', action: 'pageSetup', disabled: true },
            { label: 'Print...', action: 'print', shortcut: 'Ctrl+P', disabled: true },
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

    onMenuAction(action) {
        const window = document.querySelector('#window-notepad');
        const textarea = window?.querySelector('.notepad-textarea');
        if (!textarea) return;

        switch(action) {
            case 'new':
                if (textarea.value) {
                    import('../managers/DialogManager.js').then(async ({ DialogManager }) => {
                        const confirmed = await DialogManager.confirm('Current content will be lost. Continue?', 'New File');
                        if (confirmed) {
                            textarea.value = '';
                            localStorage.removeItem('notepad-content');
                        }
                    });
                    return;
                }
                textarea.value = '';
                localStorage.removeItem('notepad-content');
                break;
            case 'save':
            case 'saveAs':
                NotepadApp.downloadFile(textarea.value);
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
                });
                break;
            case 'delete':
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                if (start !== end) {
                    textarea.value = textarea.value.substring(0, start) + textarea.value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start;
                }
                break;
            case 'selectAll':
                textarea.select();
                break;
            case 'insertDate':
                const date = new Date().toLocaleString();
                const pos = textarea.selectionStart;
                textarea.value = textarea.value.substring(0, pos) + date + textarea.value.substring(pos);
                textarea.selectionStart = textarea.selectionEnd = pos + date.length;
                localStorage.setItem('notepad-content', textarea.value);
                break;
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
        const window = document.querySelector('#window-notepad');
        if (!window) return;

        // Load saved content if exists
        const saved = localStorage.getItem('notepad-content');
        if (saved) {
            const textarea = window.querySelector('.notepad-textarea');
            if (textarea) textarea.value = saved;
        }

        // Auto-save on change
        const textarea = window.querySelector('.notepad-textarea');
        textarea?.addEventListener('input', () => {
            localStorage.setItem('notepad-content', textarea.value);
        });
    },

    downloadFile(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notepad.txt';
        a.click();
        URL.revokeObjectURL(url);
        SoundManager.play('chord');
    }
};

export default NotepadApp;
