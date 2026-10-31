/**
 * Taskbar Preview - hovering a taskbar button shows the window's title and a small snapshot.
 * Desktop only; the snapshot is a static clone taken when the preview opens.
 */

import { WindowManager } from '../managers/WindowManager.js?v=16';

const SHOW_DELAY = 450;
const HIDE_DELAY = 120;
const MAX_W = 220;
const MAX_H = 140;

const canHover = () => matchMedia('(hover: hover) and (pointer: fine)').matches && innerWidth > 768;

export const TaskbarPreview = {
    el: null,
    showTimer: null,
    hideTimer: null,
    windowId: null,

    /** Wires a taskbar button; call for every button the taskbar renders. */
    attach(btn, windowId) {
        btn.addEventListener('mouseenter', () => {
            if (!canHover()) return;
            clearTimeout(TaskbarPreview.hideTimer);
            clearTimeout(TaskbarPreview.showTimer);
            // Moving between buttons while a preview is open swaps it right away
            const delay = TaskbarPreview.el ? 0 : SHOW_DELAY;
            TaskbarPreview.showTimer = setTimeout(() => TaskbarPreview.show(btn, windowId), delay);
        });
        btn.addEventListener('mouseleave', () => {
            clearTimeout(TaskbarPreview.showTimer);
            TaskbarPreview.hideTimer = setTimeout(() => TaskbarPreview.hide(), HIDE_DELAY);
        });
        btn.addEventListener('pointerdown', () => TaskbarPreview.hide());
    },

    show(btn, windowId) {
        const win = WindowManager.getWindowInstance(windowId);
        if (!win || !btn.isConnected) return;
        TaskbarPreview.hide();

        const el = document.createElement('div');
        el.className = 'taskbar-preview';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = `
            <div class="taskbar-preview-title">
                <span class="taskbar-preview-icon">${win.icon || ''}</span>
                <span class="taskbar-preview-text"></span>
            </div>
            <div class="taskbar-preview-thumb"></div>
        `;
        el.querySelector('.taskbar-preview-text').textContent = win.title;
        el.querySelector('.taskbar-preview-thumb').appendChild(TaskbarPreview.snapshot(win));
        document.body.appendChild(el);

        // Above the button, kept inside the screen
        const b = btn.getBoundingClientRect();
        const taskbarTop = document.querySelector('.taskbar')?.getBoundingClientRect().top ?? b.top;
        const left = Math.max(4, Math.min(b.left, innerWidth - el.offsetWidth - 4));
        el.style.left = `${left}px`;
        el.style.bottom = `${innerHeight - taskbarTop + 4}px`;

        TaskbarPreview.el = el;
        TaskbarPreview.windowId = windowId;
    },

    hide() {
        clearTimeout(TaskbarPreview.showTimer);
        TaskbarPreview.el?.remove();
        TaskbarPreview.el = null;
        TaskbarPreview.windowId = null;
    },

    /** A scaled-down copy of the window; frames become placeholders so nothing loads twice. */
    snapshot(win) {
        const source = win.element;
        const box = source.getBoundingClientRect();
        const width = box.width || (win.isMaximized ? innerWidth : win.width);
        const height = box.height || (win.isMaximized ? innerHeight : win.height);
        const scale = Math.min(MAX_W / width, MAX_H / height, 1);

        const clone = source.cloneNode(true);
        clone.classList.remove('minimized', 'opening', 'restoring', 'dragging');
        clone.removeAttribute('id');
        clone.removeAttribute('role');
        clone.removeAttribute('aria-labelledby');
        clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        clone.querySelectorAll('iframe, video, audio, object, embed').forEach(node => {
            const stub = document.createElement('div');
            stub.className = 'taskbar-preview-stub';
            stub.style.width = node.style.width || '100%';
            stub.style.height = node.style.height || '100%';
            node.replaceWith(stub);
        });

        // cloneNode copies canvases blank, so paint the current frame in
        const sourceCanvases = source.querySelectorAll('canvas');
        clone.querySelectorAll('canvas').forEach((canvas, i) => {
            const from = sourceCanvases[i];
            if (!from?.width || !from?.height) return;
            try {
                canvas.getContext('2d')?.drawImage(from, 0, 0);
            } catch {
                // A tainted or WebGL canvas just stays blank
            }
        });

        clone.style.cssText += `
            position: absolute; left: 0; top: 0; margin: 0;
            width: ${width}px; height: ${height}px;
            transform: scale(${scale}); transform-origin: 0 0;
            animation: none; transition: none; pointer-events: none;
        `;

        const frame = document.createElement('div');
        frame.className = 'taskbar-preview-frame';
        frame.style.width = `${Math.round(width * scale)}px`;
        frame.style.height = `${Math.round(height * scale)}px`;
        frame.inert = true;
        frame.appendChild(clone);
        return frame;
    }
};

export default TaskbarPreview;
