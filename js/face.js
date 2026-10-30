/**
 * Face - the ASCII face in Portfolio.exe. Its mood follows the visitor's local
 * time (asleep at night, gaming in the evening, glasses during work hours, ...),
 * it blinks, falls asleep when nobody touches the page and reacts to being
 * poked. Rendering is plain text in a <pre>, so it keeps the retro look.
 */

import { t } from './i18n.js?v=15';

const WIDTH = 14;
const EYES_OPEN = '  ◉    ◉  ';
const NOSE = '    ▼     ';
const SMILE = '  ╰────╯  ';
const SMALL_SMILE = '   ╰──╯   ';
const CLOSED_EYES = '  ─    ─  ';

// A frame is { eyes, nose, mouth, row, headset, ms }. `row` is the free line above
// the head (z's, score, music) and may be a function; `ms` is how long it stays.
const frame = (eyes, mouth, extra = {}) => ({ eyes, nose: NOSE, mouth, ms: 1000, ...extra });

let score = 0;

const MOODS = {
    idle: { blink: true, frames: [frame(EYES_OPEN, SMILE)] },
    coding: {
        blink: true,
        frames: ['> compiling.', '> compiling..', '> compiling...', '> build: OK'].map(row =>
            frame(' [◉]──[◉] ', '   ────   ', { row, ms: 600 }))
    },
    lunch: {
        blink: true,
        frames: [
            frame(EYES_OPEN, SMILE, { row: '   ~ nom ~', ms: 350 }),
            frame(EYES_OPEN, SMALL_SMILE, { row: '   ~ NOM ~', ms: 350 })
        ]
    },
    morning: {
        blink: true,
        frames: [
            frame(EYES_OPEN, SMILE, { row: '   c[_]) ~', ms: 3200 }),
            frame('  >    <  ', '    ◯     ', { row: '   c[_]) ~', ms: 1500 })
        ]
    },
    gaming: {
        blink: true,
        frames: ['  ◈    ◈  ', '   ◈    ◈ ', '  ◈    ◈  ', ' ◈    ◈   '].map((eyes, i) =>
            frame(eyes, i % 2 ? SMILE : SMALL_SMILE, {
                headset: true,
                ms: 420,
                row: () => `SCORE:${String(score = (score + 10 + Math.floor(Math.random() * 80)) % 100000).padStart(5, '0')}`
            }))
    },
    evening: {
        blink: true,
        frames: [
            frame(EYES_OPEN, SMILE, { row: '  ♪  ♫  ♪  ♫', ms: 700 }),
            frame(EYES_OPEN, SMILE, { row: '  ♫  ♪  ♫  ♪', ms: 700 })
        ]
    },
    sleepy: {
        frames: [
            frame(CLOSED_EYES, SMALL_SMILE, { row: '      ...', ms: 1700 }),
            frame(EYES_OPEN, SMALL_SMILE, { row: '      ...', ms: 700 }),
            frame(CLOSED_EYES, SMALL_SMILE, { row: '      ...', ms: 1700 }),
            frame('  ─    ─  ', '    ◯     ', { row: '      ...', ms: 1300 })
        ]
    },
    sleep: {
        frames: [
            frame(CLOSED_EYES, SMALL_SMILE, { row: '          z', ms: 1000 }),
            frame(CLOSED_EYES, '    ╰╯    ', { row: '         zZ', ms: 1000 }),
            frame(CLOSED_EYES, SMALL_SMILE, { row: '       z zZ', ms: 1000 }),
            frame(CLOSED_EYES, '    ╰╯    ', { row: '     Z z zZ', ms: 1000 })
        ]
    },

    // Short reactions, played on top of the current mood
    wink: { reaction: true, frames: [frame('  ◉    ─  ', SMILE, { row: '    ♪', ms: 1300 })] },
    love: { reaction: true, frames: [frame('  ♥    ♥  ', SMILE, { row: '    ♥  ♥', ms: 700 }), frame('  ♥    ♥  ', SMILE, { row: '   ♥  ♥  ♥', ms: 700 })] },
    surprised: { reaction: true, frames: [frame('  ◎    ◎  ', '    ○     ', { row: '     !!', ms: 1300 })] },
    dizzy: { reaction: true, frames: [frame('  @    @  ', '   ≈≈≈≈   ', { row: '   * ~ * ~', ms: 450 }), frame('  @    @  ', '   ≈≈≈≈   ', { row: '   ~ * ~ *', ms: 450 }), frame('  @    @  ', '   ≈≈≈≈   ', { row: '   * ~ * ~', ms: 450 })] },
    angry: { reaction: true, frames: [frame(' \\◉    ◉/ ', '   ╭──╮   ', { row: '    #@!%', ms: 1500 })] }
};

// Which mood fits this moment. Weekends start late and the gaming goes on all day.
function moodForTime(date = new Date()) {
    const hour = date.getHours();
    const weekend = [0, 6].includes(date.getDay());
    if (hour < (weekend ? 8 : 6)) return 'sleep';
    if (hour >= 23) return 'sleepy';
    if (hour < (weekend ? 10 : 9)) return 'morning';
    if (hour === 12) return 'lunch';
    if (weekend) return hour >= 22 ? 'evening' : 'gaming';
    if (hour < 18) return 'coding';
    if (hour < 19) return 'evening';
    return 'gaming';
}

function draw(f, blink) {
    const eyes = blink ? f.eyes.replace(/[◉◈◎]/g, '─') : f.eyes;
    const row = (typeof f.row === 'function' ? f.row() : f.row || '').padEnd(WIDTH);
    const head = f.headset ? ['╭╔══════════╗╮', '(║', '║)'] : [' ╔══════════╗ ', ' ║', '║ '];
    return [
        row,
        head[0],
        `${head[1]}${eyes}${head[2]}`,
        ` ║${f.nose}║ `,
        ` ║${f.mouth}║ `,
        ' ╚══════════╝ '
    ].join('\n');
}

const IDLE_SLEEPY_MS = 120000;
const IDLE_SLEEP_MS = 240000;

export function mountFace(element) {
    const timers = new Set();
    const state = { mood: null, base: null, reaction: null, blinking: false, idleStage: 0, pokes: [] };
    let frameTimer = null;
    let index = 0;

    const later = (fn, ms) => {
        const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
        timers.add(id);
        return id;
    };

    function paint() {
        const mood = MOODS[state.reaction || state.mood];
        const current = mood.frames[index % mood.frames.length];
        element.textContent = draw(current, state.blinking && mood.blink);
    }

    function tick() {
        const mood = MOODS[state.reaction || state.mood];
        paint();
        const ms = mood.frames[index % mood.frames.length].ms;
        index += 1;
        frameTimer = later(tick, ms);
    }

    function restart() {
        clearTimeout(frameTimer);
        timers.delete(frameTimer);
        index = 0;
        const key = state.reaction || state.mood;
        element.title = t(`face.${key}`);
        element.setAttribute('aria-label', element.title);
        tick();
    }

    function setMood(key) {
        if (!MOODS[key] || MOODS[key].reaction || state.mood === key) return;
        state.mood = key;
        if (!state.reaction) restart();
    }

    function react(key, ms) {
        if (!MOODS[key]) return;
        clearTimeout(state.reactionTimer);
        state.reaction = key;
        restart();
        state.reactionTimer = later(() => {
            state.reaction = null;
            restart();
        }, ms ?? MOODS[key].frames.reduce((sum, f) => sum + f.ms, 0));
    }

    function applyBase() {
        const stage = ['', 'sleepy', 'sleep'][state.idleStage];
        const natural = moodForTime();
        // Falling asleep from idling only ever moves the face "down", never wakes it
        const order = ['gaming', 'evening', 'coding', 'lunch', 'morning', 'idle', 'sleepy', 'sleep'];
        const wanted = stage && order.indexOf(stage) > order.indexOf(natural) ? stage : natural;
        state.base = natural;
        setMood(wanted);
    }

    function blinkLoop() {
        later(() => {
            if (MOODS[state.reaction || state.mood].blink) {
                state.blinking = true;
                paint();
                later(() => { state.blinking = false; paint(); }, 140);
            }
            blinkLoop();
        }, 2500 + Math.random() * 3500);
    }

    // Idle: nobody touched the page for a while, so the face dozes off
    let idleTimer = null;
    function armIdle() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            state.idleStage = Math.min(2, state.idleStage + 1);
            applyBase();
            if (state.idleStage < 2) armIdle();
        }, state.idleStage === 0 ? IDLE_SLEEPY_MS : IDLE_SLEEP_MS - IDLE_SLEEPY_MS);
    }
    function activity() {
        if (state.idleStage > 0) {
            const wasAsleep = state.idleStage === 2;
            state.idleStage = 0;
            applyBase();
            if (wasAsleep) react('surprised', 1200);
        }
        armIdle();
    }
    const activityEvents = ['pointerdown', 'keydown', 'mousemove', 'touchstart'];
    activityEvents.forEach(name => document.addEventListener(name, activity, { passive: true }));

    function poke() {
        const now = Date.now();
        state.pokes = state.pokes.filter(time => now - time < 4000).concat(now);
        if (state.pokes.length >= 10) { state.pokes = []; react('angry'); }
        else if (state.pokes.length >= 5) react('dizzy');
        else if (state.mood === 'sleep') react('surprised', 1400);
        else react(['wink', 'love', 'surprised'][Math.floor(Math.random() * 3)]);
    }
    element.addEventListener('click', poke);

    // Re-check the clock, so the face changes when the hour does
    const clock = setInterval(applyBase, 60000);

    element.setAttribute('role', 'img');
    applyBase();
    blinkLoop();
    armIdle();

    return {
        set: setMood,
        react,
        moods: Object.keys(MOODS),
        destroy() {
            timers.forEach(clearTimeout);
            timers.clear();
            clearTimeout(idleTimer);
            clearTimeout(state.reactionTimer);
            clearInterval(clock);
            activityEvents.forEach(name => document.removeEventListener(name, activity));
            element.removeEventListener('click', poke);
        }
    };
}
