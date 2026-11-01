/**
 * Recycle Bin - files deleted in Explorer and icons dragged off the desktop
 * (their shortcuts in Users\<name>\Desktop) wait here until they are restored
 * or the bin is emptied. The bin itself is VFS.bin (js/vfs.js), saved with the
 * rest of the virtual disk.
 *
 * Emptying shows the classic progress dialog: the bar never moves, the time
 * estimate makes no sense and only Cancel ends it, so nothing is ever deleted
 * for good from here (DEL in the Terminal and a blue screen still are).
 */

import { Icons } from '../icons.js?v=19';
import { t, lang } from '../i18n.js?v=19';
import { VFS } from '../vfs.js?v=19';
import { SoundManager } from '../managers/SoundManager.js?v=19';

const BS = String.fromCharCode(92);
const ETA_MS = 1400;

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const bytesOf = node => (VFS.isDir(node) ? Object.values(node.children || {}).reduce((sum, child) => sum + bytesOf(child), 0) : VFS.bytes(node));
const sizeText = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};
const windowEl = () => document.querySelector('#window-recycle');

export const RecycleApp = {
    id: 'recycle',
    title: 'Recycle Bin',
    icon: Icons.recycle,
    width: 560,
    height: 340,
    minWidth: 340,
    minHeight: 220,
    hasMenu: false,
    resizable: true,
    selected: new Set(),

    render() {
        return `<div class="recycle-container">${RecycleApp.body()}</div>`;
    },

    body() {
        const items = [...VFS.bin].reverse();
        RecycleApp.selected = new Set([...RecycleApp.selected].filter(id => items.some(item => item.id === id)));
        const toolbar = `
            <div class="recycle-toolbar">
                <button class="win-btn win-btn-sm" type="button" data-recycle="restore"${RecycleApp.selected.size ? '' : ' disabled'}>${Icons.statusRestart} ${t('recycle.restore')}</button>
                <button class="win-btn win-btn-sm" type="button" data-recycle="empty"${items.length ? '' : ' disabled'}>${Icons.actTrash} ${t('recycle.emptyBin')}</button>
            </div>`;
        const list = items.length ? `
            <div class="recycle-list" role="listbox" aria-multiselectable="true" aria-label="${esc(t('recycle.title'))}">
                <div class="recycle-row recycle-head" aria-hidden="true">
                    <span>${t('recycle.colName')}</span><span>${t('recycle.colFrom')}</span><span>${t('recycle.colDate')}</span><span>${t('recycle.colSize')}</span>
                </div>
                ${items.map(item => `
                    <div class="recycle-row${RecycleApp.selected.has(item.id) ? ' selected' : ''}" role="option" tabindex="0" data-id="${esc(item.id)}" aria-selected="${RecycleApp.selected.has(item.id)}">
                        <span class="recycle-name"><span class="recycle-icon" aria-hidden="true">${VFS.iconOf(item.name, item.node)}</span>${esc(item.name)}</span>
                        <span>${esc(item.path.slice(0, -1).join(BS))}</span>
                        <span>${esc(new Date(item.at || Date.now()).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }))}</span>
                        <span>${VFS.isDir(item.node) ? '' : sizeText(bytesOf(item.node))}</span>
                    </div>`).join('')}
            </div>` : `
            <div class="recycle-empty">
                <div class="recycle-empty-icon" aria-hidden="true">${Icons.recycleEmpty}</div>
                <p class="recycle-empty-title">${t('recycle.empty')}</p>
                <p class="recycle-empty-hint">${t('recycle.hint')}</p>
            </div>`;
        return `${toolbar}${list}
            <div class="recycle-status">
                <span>${t('recycle.objects', { count: items.length })}</span>
                <span>${sizeText(VFS.binBytes())}</span>
            </div>`;
    },

    refresh() {
        const container = windowEl()?.querySelector('.recycle-container');
        if (!container) return;
        const focusedId = document.activeElement?.closest?.('.recycle-row')?.dataset.id;
        container.innerHTML = RecycleApp.body();
        if (focusedId) container.querySelector(`.recycle-row[data-id="${CSS.escape(focusedId)}"]`)?.focus();
    },

    // Selection changes only touch classes, so a double-click still lands on the same row
    showSelection() {
        const win = windowEl();
        if (!win) return;
        win.querySelectorAll('.recycle-row[data-id]').forEach((row) => {
            const on = RecycleApp.selected.has(row.dataset.id);
            row.classList.toggle('selected', on);
            row.setAttribute('aria-selected', String(on));
        });
        const restore = win.querySelector('[data-recycle="restore"]');
        if (restore) restore.disabled = !RecycleApp.selected.size;
    },

    restore(ids) {
        if (!ids.length) return;
        VFS.restore(ids);
        ids.forEach(id => RecycleApp.selected.delete(id));
        SoundManager.play('restore');
    },

    onInit() {
        const win = windowEl();
        if (!win) return;
        RecycleApp.selected = new Set();

        win.addEventListener('click', (event) => {
            const action = event.target.closest('[data-recycle]')?.dataset.recycle;
            if (action === 'restore') RecycleApp.restore([...RecycleApp.selected]);
            if (action === 'empty') RecycleApp.emptyBin();
            const row = event.target.closest('.recycle-row[data-id]');
            if (!row) return;
            const id = row.dataset.id;
            if (event.ctrlKey || event.metaKey) {
                if (RecycleApp.selected.has(id)) RecycleApp.selected.delete(id);
                else RecycleApp.selected.add(id);
            } else {
                RecycleApp.selected = new Set([id]);
            }
            RecycleApp.showSelection();
        });
        win.addEventListener('dblclick', (event) => {
            const row = event.target.closest('.recycle-row[data-id]');
            if (row) RecycleApp.restore([row.dataset.id]);
        });
        win.addEventListener('keydown', (event) => {
            const row = event.target.closest('.recycle-row[data-id]');
            if (!row) return;
            const rows = [...win.querySelectorAll('.recycle-row[data-id]')];
            const index = rows.indexOf(row);
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const next = rows[index + (event.key === 'ArrowDown' ? 1 : -1)];
                if (next) {
                    RecycleApp.selected = new Set([next.dataset.id]);
                    RecycleApp.showSelection();
                    next.focus();
                }
            } else if (event.key === ' ') {
                event.preventDefault();
                RecycleApp.selected = new Set([row.dataset.id]);
                RecycleApp.showSelection();
            } else if (event.key === 'Enter') {
                event.preventDefault();
                RecycleApp.restore(RecycleApp.selected.size ? [...RecycleApp.selected] : [row.dataset.id]);
            } else if (event.key === 'Delete') {
                event.preventDefault();
                RecycleApp.emptyBin(RecycleApp.selected.size ? [...RecycleApp.selected] : [row.dataset.id]);
            }
        });

        RecycleApp.diskHandler = () => RecycleApp.refresh();
        window.addEventListener('vfs-change', RecycleApp.diskHandler);
    },

    onClose() {
        window.removeEventListener('vfs-change', RecycleApp.diskHandler);
    },

    /** "Delete for good" (everything, or the given items): the legendary progress dialog that never ends. */
    async emptyBin(ids = VFS.bin.map(item => item.id)) {
        const items = VFS.bin.filter(item => ids.includes(item.id));
        if (!items.length) return;
        const { DialogManager } = await import('../managers/DialogManager.js?v=19');
        const question = items.length === 1
            ? t('recycle.confirmOne', { name: items[0].name })
            : t('recycle.confirmMany', { count: items.length });
        if (!await DialogManager.confirm(question, t('recycle.confirmTitle'))) return;

        let timer = null;
        const stop = () => { clearInterval(timer); timer = null; };
        const dialog = DialogManager.createDialog({
            title: t('recycle.deleting'),
            content: `
                <div class="delete-progress bin-progress">
                    <div class="bin-anim" aria-hidden="true">
                        <span class="bin-anim-bin">${Icons.recycle}</span>
                        <span class="bin-anim-paper">${Icons.fileText}</span>
                    </div>
                    <div class="delete-file">${esc(items[0].name)}</div>
                    <div class="delete-from">${t('recycle.from')}</div>
                    <div class="delete-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="1"><div class="delete-fill"></div></div>
                    <div class="bin-eta"></div>
                </div>`,
            buttons: [{ label: t('recycle.cancel'), action: 'cancel' }],
            // Cancel, the close button, Esc: nothing is deleted
            onClose: stop
        });
        DialogManager.show(dialog);

        // The bar sits on its first block forever while the estimate goes round and round.
        // Only Cancel ends it: nothing on this desktop is ever really deleted.
        const eta = dialog.querySelector('.bin-eta');
        const estimates = t('recycle.eta');
        let step = 0;
        eta.textContent = estimates[0];
        timer = setInterval(() => {
            if (!dialog.isConnected) return stop();
            step = step + 1 < estimates.length ? step + 1 : 1; // "Calculating..." only once
            eta.textContent = estimates[step];
        }, ETA_MS);
    }
};

export default RecycleApp;
