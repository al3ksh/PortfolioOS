/**
 * Recycle Bin - always empty, because nothing on this desktop can be deleted.
 * Dragging an icon onto it is refused in DesktopIcon.refuseRecycle().
 */

import { Icons } from '../icons.js?v=16';
import { t } from '../i18n.js?v=16';

export const RecycleApp = {
    id: 'recycle',
    title: 'Recycle Bin',
    icon: Icons.recycle,
    width: 360,
    height: 240,
    minWidth: 280,
    minHeight: 200,
    hasMenu: false,
    resizable: true,

    render() {
        const rescued = Number(sessionStorage.getItem('recycleRefused') || 0);
        return `
            <div class="recycle-container">
                <div class="recycle-empty">
                    <div class="recycle-empty-icon" aria-hidden="true">${Icons.recycle}</div>
                    <p class="recycle-empty-title">${t('recycle.empty')}</p>
                    <p class="recycle-empty-hint">${t('recycle.hint')}</p>
                </div>
                <div class="recycle-status">
                    <span>0 object(s)</span>
                    <span>${rescued ? t('recycle.saved', { count: rescued }) : '0 bytes'}</span>
                </div>
            </div>
        `;
    }
};

export default RecycleApp;
