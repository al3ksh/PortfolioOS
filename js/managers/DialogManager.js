/**
 * Dialog Manager - Custom modal dialogs instead of native JS alerts/confirms/prompts
 */

import { SoundManager } from './SoundManager.js';

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
                    <input type="text" id="${inputId}" class="dialog-input win-input" value="${defaultValue}">
                `,
                buttons: [
                    { label: 'OK', action: 'ok', primary: true },
                    { label: 'Cancel', action: 'cancel' }
                ],
                onClose: (action) => {
                    if (action === 'ok') {
                        const input = document.getElementById(inputId);
                        resolve(input?.value || '');
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
        return String(message).replace(/\n/g, '<br>');
    }

    /**
     * Create dialog element
     */
    createDialog(options) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        
        overlay.innerHTML = `
            <div class="dialog-box">
                <div class="dialog-title-bar">
                    <span class="dialog-title-text">${options.title || 'Dialog'}</span>
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
        if (this.activeDialog === dialog) {
            this.activeDialog = null;
        }
    }
}

export const DialogManager = new DialogManagerClass();
export default DialogManager;
