/**
 * DOOM intro - a joke easter egg for the Calculator (type IDDQD).
 * DOS start-up, a fire title screen and the main menu; picking NEW GAME ends in an
 * out-of-memory error, because we are not going to write the whole game.
 * Everything is drawn from scratch on a 320x200 canvas, there are no original assets.
 */

import { SoundManager } from './managers/SoundManager.js?v=16';

const W = 320;
const H = 200;
const FIRE_H = 64;
const FRAME_MS = 1000 / 30;
const MONO = "'Lucida Console', 'Courier New', monospace";
const LOGO_FONT = "Impact, 'Arial Black', 'Haettenschweiler', sans-serif";

const MAIN_ITEMS = ['NEW GAME', 'OPTIONS', 'LOAD GAME', 'SAVE GAME', 'READ THIS!', 'QUIT GAME'];
const EPISODES = [
    ['KNEE-DEEP IN THE DEAD', 'E1M1'],
    ['THE SHORES OF HELL', 'E2M1'],
    ['INFERNO', 'E3M1']
];
const SKILLS = ["I'M TOO YOUNG TO DIE.", 'HEY, NOT TOO ROUGH.', 'HURT ME PLENTY.', 'ULTRA-VIOLENCE.', 'NIGHTMARE!'];
const MESSAGES = {
    1: ['NOT ENOUGH MEMORY', 'FOR THE OPTIONS MENU.'],
    2: ["YOU CAN'T LOAD A GAME", 'THERE ARE NO SAVED GAMES.'],
    3: ["YOU CAN'T SAVE IF YOU", "AREN'T PLAYING!"],
    4: ['THIS IS A CALCULATOR.', 'PRESS = TO GET RESULTS.']
};
const QUIT_TEXT = ['ARE YOU SURE YOU WANT TO', 'QUIT THIS GREAT GAME?'];

const DOS_BOOT = [
    'C:\\CALC>DOOM',
    '',
    'DOS/4GW Protected Mode Run-time  Version 1.97',
    'Copyright (c) Rational Systems, Inc. 1990-1994',
    '',
    'Z_Init: Init zone memory allocation daemon.',
    'V_Init: allocate screens.',
    'M_LoadDefaults: Load system defaults.',
    'W_Init: Init WADfiles.',
    'I_Init: Setting up machine state.'
];
const DOS_CRASH = [
    'R_Init: Init DOOM refresh daemon - [..............]',
    'P_Init: Init Playloop state.',
    'S_Init: Setting up sound.',
    'P_SetupLevel: loading',
    'Z_Malloc: failed on allocation of 4194304 bytes',
    '',
    '** OUT OF MEMORY **',
    '',
    'CALC.EXE has 12 digits of RAM. DOOM needs a bit more.',
    '',
    'Press any key to return to the Calculator.'
];

// 11x10 pixel skull for the menu cursor: # bone, e eye
const SKULL = [
    '...#####...',
    '..#######..',
    '.#########.',
    '.#ee###ee#.',
    '.#ee###ee#.',
    '.#########.',
    '..###.###..',
    '...#####...',
    '...#.#.#...',
    '...#####...'
];

const FIRE_PALETTE = Array.from({ length: 37 }, (_, i) => {
    const t = i / 36;
    return [
        Math.min(255, t * 2.3 * 255),
        Math.max(0, Math.min(255, (t - 0.35) * 2.3 * 255)),
        Math.max(0, Math.min(255, (t - 0.8) * 5 * 255))
    ];
});

let active = false;
const sprites = new Map();

// Text rendered once to an offscreen canvas and thresholded, so it stays crisp when scaled up
function sprite(text, size, fill, { family = MONO, weight = 'bold', spacing = 0, key = typeof fill === 'string' ? fill : 'grad' } = {}) {
    const id = `${text}|${size}|${key}|${family}|${spacing}`;
    if (sprites.has(id)) return sprites.get(id);
    const font = `${weight} ${size}px ${family}`;
    const canvas = document.createElement('canvas');
    let g = canvas.getContext('2d', { willReadFrequently: true });
    g.font = font;
    if ('letterSpacing' in g) g.letterSpacing = `${spacing}px`;
    canvas.width = Math.ceil(g.measureText(text).width) + 3;
    canvas.height = Math.ceil(size * 1.3) + 2;
    g = canvas.getContext('2d', { willReadFrequently: true });
    g.font = font;
    if ('letterSpacing' in g) g.letterSpacing = `${spacing}px`;
    g.textBaseline = 'top';
    g.fillStyle = typeof fill === 'function' ? fill(g, canvas.height) : fill;
    g.fillText(text, 1, 1);
    const data = g.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.data.length; i += 4) data.data[i] = data.data[i] > 110 ? 255 : 0;
    g.putImageData(data, 0, 0);
    sprites.set(id, canvas);
    return canvas;
}

const logoGradient = (g, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ff7a1c');
    grad.addColorStop(0.5, '#d41212');
    grad.addColorStop(1, '#6c0000');
    return grad;
};

export function playDoomIntro(onExit) {
    if (active) return;
    active = true;

    const root = document.createElement('div');
    root.className = 'doom-screen dos';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'DOOM intro (easter egg)');
    root.innerHTML = `
        <canvas class="doom-canvas" width="${W}" height="${H}"></canvas>
        <pre class="doom-dos"></pre>
        <button type="button" class="doom-close" aria-label="Close">✕</button>`;
    document.body.appendChild(root);

    const canvas = root.querySelector('canvas');
    const dos = root.querySelector('.doom-dos');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Fire effect on its own canvas so black cells stay transparent
    const fireCanvas = document.createElement('canvas');
    fireCanvas.width = W;
    fireCanvas.height = FIRE_H;
    const fireCtx = fireCanvas.getContext('2d');
    const fireImage = fireCtx.createImageData(W, FIRE_H);
    const fire = new Uint8Array(W * FIRE_H);
    fire.fill(0, 0, W * (FIRE_H - 1));
    fire.fill(36, W * (FIRE_H - 1));

    let scene = 'dos';          // dos | title | menu | confirm | message | loading | crash
    let menu = 'main';          // main | episode | skill
    let sel = 0;
    let episode = 0;
    let message = null;
    let loadStart = 0;
    let crashReady = false;
    let skipDos = false;
    let closed = false;
    let raf = 0;
    let lastFrame = 0;
    let dosText = '';

    const play = name => SoundManager.play(name);
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    const showDos = on => root.classList.toggle('dos', on);
    const writeDos = text => {
        dosText = text;
        dos.innerHTML = `${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}<span class="doom-cursor">_</span>`;
    };

    async function typeLines(lines, delay) {
        for (const line of lines) {
            if (closed) return;
            writeDos(`${dosText}${line}\n`);
            if (!skipDos) await wait(line ? delay : delay / 2);
        }
    }

    function exit() {
        if (closed) return;
        closed = true;
        active = false;
        cancelAnimationFrame(raf);
        document.removeEventListener('keydown', onKey, true);
        root.remove();
        onExit?.();
    }

    /* ---------- Scenes ---------- */

    async function boot() {
        writeDos('');
        await typeLines(DOS_BOOT, 170);
        if (closed) return;
        if (!skipDos) await wait(450);
        if (closed) return;
        showDos(false);
        scene = 'title';
        play('chord');
    }

    async function crash() {
        scene = 'crash';
        crashReady = false;
        skipDos = false;
        writeDos('');
        showDos(true);
        play('error');
        await typeLines(DOS_CRASH, 220);
        if (closed) return;
        crashReady = true;
        play('error');
    }

    function startLoading(skill) {
        scene = 'loading';
        loadStart = performance.now();
        play('open');
    }

    function items() {
        return menu === 'main' ? MAIN_ITEMS : menu === 'episode' ? EPISODES.map(e => e[0]) : SKILLS;
    }

    function choose(i) {
        sel = i;
        play('open');
        if (menu === 'main') {
            if (i === 0) { menu = 'episode'; sel = 0; }
            else if (i === 5) scene = 'confirm';
            else { message = MESSAGES[i]; scene = 'message'; }
        } else if (menu === 'episode') {
            episode = i;
            menu = 'skill';
            sel = 2;
        } else {
            startLoading(i);
        }
    }

    function back() {
        play('click');
        if (scene === 'confirm' || scene === 'message') { scene = 'menu'; return; }
        if (menu === 'skill') { menu = 'episode'; sel = episode; }
        else if (menu === 'episode') { menu = 'main'; sel = 0; }
        else scene = 'confirm';
    }

    /* ---------- Input ---------- */

    function onKey(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.repeat && scene !== 'menu') return;
        const key = e.key;

        if (scene === 'dos') {
            if (key === 'Escape') exit(); else skipDos = true;
        } else if (scene === 'title') {
            if (key === 'Escape') { exit(); return; }
            scene = 'menu';
            menu = 'main';
            sel = 0;
            play('open');
        } else if (scene === 'menu') {
            const list = items();
            if (key === 'ArrowDown' || key === 's' || key === 'S') { sel = (sel + 1) % list.length; play('click'); }
            else if (key === 'ArrowUp' || key === 'w' || key === 'W') { sel = (sel + list.length - 1) % list.length; play('click'); }
            else if (key === 'Enter' || key === ' ') choose(sel);
            else if (key === 'Escape' || key === 'Backspace') back();
        } else if (scene === 'confirm') {
            if (key === 'y' || key === 'Y' || key === 'Enter') exit();
            else back();
        } else if (scene === 'message') {
            back();
        } else if (scene === 'crash') {
            if (crashReady) exit(); else skipDos = true;
        } else if (key === 'Escape') {
            exit();
        }
    }

    function logicalPoint(e) {
        const rect = canvas.getBoundingClientRect();
        return [(e.clientX - rect.left) / rect.width * W, (e.clientY - rect.top) / rect.height * H];
    }

    function hitItem(y) {
        const list = items();
        const index = Math.floor((y - menuTop(list) + 2) / menuStep());
        return index >= 0 && index < list.length ? index : -1;
    }

    const menuStep = () => (menu === 'main' ? 14 : 16);
    const menuTop = list => (menu === 'main' ? 78 : 100 - (list.length * menuStep()) / 2 + 12);

    canvas.addEventListener('mousemove', (e) => {
        if (scene !== 'menu') return;
        const index = hitItem(logicalPoint(e)[1]);
        if (index >= 0 && index !== sel) { sel = index; play('click'); }
    });

    canvas.addEventListener('click', (e) => {
        const [x, y] = logicalPoint(e);
        if (scene === 'title') { scene = 'menu'; menu = 'main'; sel = 0; play('open'); }
        else if (scene === 'menu') {
            const index = hitItem(y);
            if (index >= 0) choose(index);
        } else if (scene === 'confirm') {
            if (y > 110) { if (x < W / 2) exit(); else back(); }
        } else if (scene === 'message') back();
    });

    root.addEventListener('click', (e) => {
        if (e.target.closest('.doom-close')) exit();
        else if (scene === 'dos') skipDos = true;
        else if (scene === 'crash') { if (crashReady) exit(); else skipDos = true; }
    });

    document.addEventListener('keydown', onKey, true);

    /* ---------- Drawing ---------- */

    const text = (str, x, y, size, color, options) => {
        const s = sprite(str, size, color, options);
        ctx.drawImage(s, Math.round(x - s.width / 2), Math.round(y));
    };

    function stepFire() {
        for (let x = 0; x < W; x++) {
            for (let y = 1; y < FIRE_H; y++) {
                const from = y * W + x;
                const heat = fire[from];
                if (heat === 0) { fire[from - W] = 0; continue; }
                const r = (Math.random() * 3) | 0;
                const to = from - W - r + 1;
                fire[to >= 0 ? to : from - W] = Math.max(0, heat - r);
            }
        }
        const px = fireImage.data;
        for (let i = 0; i < fire.length; i++) {
            const v = fire[i];
            const c = FIRE_PALETTE[v];
            const o = i * 4;
            px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2];
            px[o + 3] = v ? 255 : 0;
        }
        fireCtx.putImageData(fireImage, 0, 0);
    }

    // Already burning when the title appears instead of creeping up from the bottom
    for (let i = 0; i < FIRE_H * 2; i++) stepFire();

    function backdrop(dim) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#2a0000');
        g.addColorStop(0.6, '#0c0000');
        g.addColorStop(1, '#000');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        if (dim) ctx.drawImage(fireCanvas, 0, H - FIRE_H);
    }

    function logo(y, size) {
        const options = { family: LOGO_FONT, weight: '400', spacing: size / 12 };
        const front = sprite('DOOM', size, logoGradient, { ...options, key: 'logo' });
        const back = sprite('DOOM', size, '#3a0000', options);
        const x = Math.round((W - front.width) / 2);
        for (let i = Math.max(2, Math.round(size / 12)); i >= 1; i--) ctx.drawImage(back, x + i, y + i);
        ctx.drawImage(front, x, y);
    }

    function skull(x, y, blink) {
        SKULL.forEach((row, ry) => {
            for (let rx = 0; rx < row.length; rx++) {
                const c = row[rx];
                if (c === '.') continue;
                ctx.fillStyle = c === 'e' ? (blink ? '#ff2a00' : '#200000') : '#e8dfc4';
                ctx.fillRect(x + rx, y + ry, 1, 1);
            }
        });
    }

    function drawMenu(now) {
        const list = items();
        const top = menuTop(list);
        const step = menuStep();
        if (menu !== 'main') {
            text(menu === 'episode' ? 'WHICH EPISODE?' : 'CHOOSE SKILL LEVEL:', W / 2, top - 22, 12, '#e6a800');
        }
        list.forEach((label, i) => {
            text(label, W / 2 + 8, top + i * step, menu === 'main' ? 13 : 11, i === sel ? '#ffb000' : '#c8281e');
        });
        const widest = Math.max(...list.map(label => sprite(label, menu === 'main' ? 13 : 11, '#fff').width));
        skull(Math.round(W / 2 + 8 - widest / 2 - 18), top + sel * step + 1, Math.floor(now / 260) % 2 === 0);
    }

    function draw(now) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        if (scene === 'title') {
            backdrop(1);
            logo(22, 72);
            text('CALC.EXE EDITION', W / 2, 106, 12, '#b89060', { spacing: 1 });
            if (Math.floor(now / 520) % 2 === 0) text('PRESS ANY KEY', W / 2, 140, 12, '#ffe08a');
        } else if (scene === 'menu' || scene === 'confirm' || scene === 'message') {
            backdrop(0);
            if (menu === 'main') logo(10, 40);
            if (scene === 'menu') {
                drawMenu(now);
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0.78)';
                ctx.fillRect(0, 0, W, H);
                const lines = scene === 'confirm' ? QUIT_TEXT : message;
                lines.forEach((line, i) => text(line, W / 2, 62 + i * 16, 12, '#e6a800'));
                if (scene === 'confirm') {
                    text('YES', W / 2 - 40, 118, 13, '#ffb000');
                    text('NO', W / 2 + 40, 118, 13, '#c8281e');
                    text('PRESS Y OR N', W / 2, 150, 9, '#8a6a40');
                } else {
                    text('PRESS ANY KEY', W / 2, 130, 9, '#8a6a40');
                }
            }
        } else if (scene === 'loading') {
            const elapsed = now - loadStart;
            const progress = Math.floor(Math.min(0.93, elapsed / 3200) * 28) / 28;
            text(`ENTERING ${EPISODES[episode][1]}`, W / 2, 80, 12, '#e6a800');
            ctx.strokeStyle = '#7a1008';
            ctx.strokeRect(60.5, 104.5, 200, 10);
            ctx.fillStyle = '#c8281e';
            ctx.fillRect(62, 106, Math.round(196 * progress), 7);
            if (elapsed > 3700) crash();
        }
    }

    function frame(now) {
        if (closed) return;
        raf = requestAnimationFrame(frame);
        if (now - lastFrame < FRAME_MS) return;
        lastFrame = now;
        if (scene === 'title') stepFire();
        if (scene !== 'dos' && scene !== 'crash') draw(now);
    }

    raf = requestAnimationFrame(frame);
    root.querySelector('.doom-close').focus({ preventScroll: true });
    boot();
}
