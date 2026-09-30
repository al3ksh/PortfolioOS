/**
 * Screen Saver - starts the selected saver after a period of inactivity.
 * Type and delay come from settings (Control Panel or BIOS setup).
 */

import { SCREENSAVERS } from '../screensavers.js?v=15';
import { getSetting } from '../settings.js?v=15';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

export const ScreenSaver = {
    timer: null,
    active: false,
    canvas: null,
    ctx: null,
    animationId: null,
    saver: null,
    ignoreActivityUntil: 0,

    init() {
        ScreenSaver.canvas = document.getElementById('screenSaverCanvas');
        ScreenSaver.ctx = ScreenSaver.canvas?.getContext('2d') ?? null;
        ScreenSaver.resize();
        window.addEventListener('resize', ScreenSaver.resize);
        ACTIVITY_EVENTS.forEach(event => document.addEventListener(event, ScreenSaver.onActivity, { passive: true }));
        document.querySelector('.screen-saver')?.addEventListener('click', () => ScreenSaver.deactivate());
        ScreenSaver.resetTimer();
    },

    delayMs() {
        const minutes = Number(getSetting('screensaverDelay'));
        return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 * 1000 : null;
    },

    resize() {
        if (!ScreenSaver.canvas) return;
        ScreenSaver.canvas.width = window.innerWidth;
        ScreenSaver.canvas.height = window.innerHeight;
        if (ScreenSaver.active) ScreenSaver.saver?.init(ScreenSaver.ctx, ScreenSaver.canvas.width, ScreenSaver.canvas.height);
    },

    onActivity() {
        if (Date.now() < ScreenSaver.ignoreActivityUntil) return;
        ScreenSaver.resetTimer();
    },

    resetTimer() {
        if (ScreenSaver.active) ScreenSaver.deactivate();
        clearTimeout(ScreenSaver.timer);
        const delay = ScreenSaver.delayMs();
        const type = getSetting('screensaver');
        if (delay && type !== 'none') ScreenSaver.timer = setTimeout(() => ScreenSaver.activate(), delay);
    },

    // type: key of SCREENSAVERS; preview ignores the mouse movement of the click that started it.
    activate(type = getSetting('screensaver'), { preview = false } = {}) {
        const saver = SCREENSAVERS[type] ?? SCREENSAVERS.matrix;
        if (!ScreenSaver.ctx) return;
        cancelAnimationFrame(ScreenSaver.animationId);
        clearTimeout(ScreenSaver.timer);
        ScreenSaver.saver = saver;
        ScreenSaver.active = true;
        if (preview) ScreenSaver.ignoreActivityUntil = Date.now() + 800;
        document.querySelector('.screen-saver')?.classList.add('active');
        saver.init(ScreenSaver.ctx, ScreenSaver.canvas.width, ScreenSaver.canvas.height);
        const frame = () => {
            if (!ScreenSaver.active) return;
            saver.draw(ScreenSaver.ctx, ScreenSaver.canvas.width, ScreenSaver.canvas.height);
            ScreenSaver.animationId = requestAnimationFrame(frame);
        };
        frame();
    },

    deactivate() {
        if (!ScreenSaver.active) return;
        ScreenSaver.active = false;
        document.querySelector('.screen-saver')?.classList.remove('active');
        cancelAnimationFrame(ScreenSaver.animationId);
        ScreenSaver.resetTimer();
    }
};

export default ScreenSaver;
