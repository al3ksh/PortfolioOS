/**
 * Dialog Manager - Custom modal dialogs instead of native JS alerts/confirms/prompts
 */

import { SoundManager } from './SoundManager.js?v=15';

class DialogManagerClass {
    constructor() {
        this.activeDialog = null;
    }

    /**
     * Show an alert dialog
     */
    alert(message, title = 'Message') {
        return new Promise((resolve) => {
            const dialog = this.createDialog({
                title,
                content: `<div class="dialog-message">${this.formatMessage(message)}</div>`,
                buttons: [
                    { label: 'OK', action: 'ok', primary: true }
                ],
                onClose: () => resolve()
            });
            this.show(dialog);
        });
    }

    /**
     * Show a confirm dialog
     */
    confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            const dialog = this.createDialog({
                title,
                content: `
                    <div class="dialog-icon-text">
                        <span class="dialog-question-icon">❓</span>
                        <div class="dialog-message">${this.formatMessage(message)}</div>
                    </div>
                `,
                buttons: [
                    { label: 'Yes', action: 'yes', primary: true },
                    { label: 'No', action: 'no' }
                ],
                onClose: (action) => resolve(action === 'yes')
            });
            this.show(dialog);
        });
    }

    /**
     * Show a prompt dialog
     */
    prompt(message, defaultValue = '', title = 'Input') {
        return new Promise((resolve) => {
            const inputId = 'dialog-input-' + Date.now();
            const dialog = this.createDialog({
                title,
                content: `
                    <div class="dialog-message">${this.formatMessage(message)}</div>
                    <input type="text" id="${inputId}" class="dialog-input win-input" value="${this.escapeHtml(defaultValue)}">
                `,
                buttons: [
                    { label: 'OK', action: 'ok', primary: true },
                    { label: 'Cancel', action: 'cancel' }
                ],
                onClose: (action) => {
                    if (action === 'ok') {
                        resolve(dialog._promptValue || '');
                    } else {
                        resolve(null);
                    }
                },
                onShow: () => {
                    const input = document.getElementById(inputId);
                    input?.focus();
                    input?.select();
                }
            });

            // Capture input value before dialog closes
            const overlay = dialog;
            overlay.querySelectorAll('[data-action]').forEach(btn => {
                const origHandler = btn.onclick;
                btn.addEventListener('click', () => {
                    const input = overlay.querySelector('.dialog-input');
                    dialog._promptValue = input ? input.value : '';
                }, true);
            });
            // Also capture on Enter key
            overlay.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const input = overlay.querySelector('.dialog-input');
                    dialog._promptValue = input ? input.value : '';
                }
            }, true);

            this.show(dialog);
        });
    }

    /**
     * Show info/properties dialog
     */
    info(properties, title = 'Properties') {
        return new Promise((resolve) => {
            let content = '<div class="dialog-properties">';
            for (const [key, value] of Object.entries(properties)) {
                content += `
                    <div class="property-row">
                        <span class="property-label">${key}:</span>
                        <span class="property-value">${value}</span>
                    </div>
                `;
            }
            content += '</div>';

            const dialog = this.createDialog({
                title,
                content,
                buttons: [
                    { label: 'OK', action: 'ok', primary: true }
                ],
                onClose: () => resolve()
            });
            this.show(dialog);
        });
    }

    /**
     * Show custom dialog
     */
    custom(options) {
        return new Promise((resolve) => {
            const dialog = this.createDialog({
                ...options,
                onClose: (action) => resolve(action)
            });
            this.show(dialog);
        });
    }

    /**
     * Format message - convert \n to <br>
     */
    formatMessage(message) {
        return this.escapeHtml(message).replace(/\n/g, '<br>');
    }

    escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = String(value ?? '');
        return div.innerHTML;
    }

    /**
     * Create dialog element
     */
    createDialog(options) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        const titleId = `dialog-title-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        overlay.setAttribute('aria-labelledby', titleId);
        
        overlay.innerHTML = `
            <div class="dialog-box">
                <div class="dialog-title-bar">
                    <span id="${titleId}" class="dialog-title-text">${this.escapeHtml(options.title || 'Dialog')}</span>
                    <button class="dialog-close-btn" data-action="close">×</button>
                </div>
                <div class="dialog-content">
                    ${options.content}
                </div>
                <div class="dialog-buttons">
                    ${options.buttons.map(btn => `
                        <button class="win-btn ${btn.primary ? 'primary' : ''}" data-action="${btn.action}">
                            ${btn.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Button handlers
        overlay.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                SoundManager.play('click');
                const action = btn.dataset.action;
                this.close(overlay);
                options.onClose?.(action);
            });
        });

        // Click outside to close (cancel)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                SoundManager.play('click');
                this.close(overlay);
                options.onClose?.('cancel');
            }
        });

        // Enter key to submit
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const primaryBtn = overlay.querySelector('.win-btn.primary');
                if (primaryBtn) {
                    e.preventDefault();
                    primaryBtn.click();
                }
            } else if (e.key === 'Escape') {
                SoundManager.play('click');
                this.close(overlay);
                options.onClose?.('cancel');
            } else if (e.key === 'Tab') {
                const focusable = [...overlay.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')];
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        overlay._onShow = options.onShow;
        return overlay;
    }

    /**
     * Show dialog
     */
    show(dialog) {
        this.activeDialog = dialog;
        dialog._previousActiveElement = document.activeElement;
        document.body.appendChild(dialog);
        SoundManager.play('chord');
        
        // Focus first input or primary button
        setTimeout(() => {
            if (dialog._onShow) {
                dialog._onShow();
            } else {
                const input = dialog.querySelector('.dialog-input');
                const primaryBtn = dialog.querySelector('.win-btn.primary');
                (input || primaryBtn)?.focus();
            }
        }, 50);
    }

    /**
     * Close dialog
     */
    close(dialog) {
        dialog?.remove();
        if (dialog?._previousActiveElement?.isConnected) {
            dialog._previousActiveElement.focus();
        }
        if (this.activeDialog === dialog) {
            this.activeDialog = null;
        }
    }
}

export const DialogManager = new DialogManagerClass();
export default DialogManager;
