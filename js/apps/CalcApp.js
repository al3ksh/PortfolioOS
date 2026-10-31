/**
 * Calculator App - Win 3.1 style calculator with memory, a tape line,
 * a scientific panel and a hidden surprise (type IDDQD).
 */

import { Icons } from '../icons.js?v=16';
import { SoundManager } from '../managers/SoundManager.js?v=16';

const MAX_DIGITS = 12;
const MAX_LENGTH = 14;
const SCI_WIDTH = 600;
const NORMAL_WIDTH = 300;
const CODE = 'iddqd';

const SYMBOLS = { add: '+', subtract: '−', multiply: '×', divide: '÷', pow: '^', mod: 'mod' };
const KEY_OPS = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide', '^': 'pow' };
const UNARY_LABELS = {
    sq: 'sqr', sqrt: '√', inv: '1/', sin: 'sin', cos: 'cos', tan: 'tan', ln: 'ln', log: 'log',
    exp: 'exp', tenx: '10^', cbrt: '∛', cube: 'cube', abs: 'abs', fact: 'fact', percent: '%'
};

const BINARY = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => (b === 0 ? NaN : a / b),
    pow: (a, b) => Math.pow(a, b),
    mod: (a, b) => (b === 0 ? NaN : a % b)
};

function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) return NaN;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

/** Number -> display string (max 14 chars), or null when it cannot be shown. */
function fmt(n) {
    if (!Number.isFinite(n)) return null;
    if (n === 0) return '0';
    for (let p = 12; p >= 1; p--) {
        const s = String(parseFloat(n.toPrecision(p)));
        if (!s.includes('e') && s.length <= MAX_LENGTH) return s;
        if (Math.abs(n) >= 1e14 || Math.abs(n) < 1e-6) break;
    }
    return n.toExponential(6).replace(/\.?0+e/, 'e');
}

const state = {};
let els = {};
let win = null;
let keyHandler = null;

function reset(keepMemory = true) {
    const memory = keepMemory ? state.memory : null;
    Object.assign(state, {
        acc: null, op: null, entry: '0', fresh: true, awaiting: false, evaluated: false,
        lastOp: null, lastOperand: 0, memory, angle: 'deg', error: false, tape: '', sci: false,
        keys: ''
    });
}

const value = () => parseFloat(state.entry) || 0;

function paint() {
    if (!els.screen) return;
    els.screen.value = state.error ? 'Error' : state.entry;
    els.tape.textContent = state.tape || ' ';
    els.mem.hidden = state.memory === null;
    els.angle.textContent = state.angle === 'deg' ? 'Deg' : 'Rad';
    els.sciBtn.setAttribute('aria-pressed', String(state.sci));
}

function fail() {
    state.error = true;
    state.entry = '0';
    state.acc = null;
    state.op = null;
    state.fresh = true;
    state.awaiting = false;
    state.evaluated = false;
    state.tape = '';
    SoundManager.play('error');
}

function show(n) {
    const s = fmt(n);
    if (s === null) { fail(); return false; }
    state.entry = s;
    state.fresh = true;
    state.awaiting = false;
    return true;
}

function digit(d) {
    if (state.error) { reset(); }
    if (state.evaluated) {
        state.acc = null; state.op = null; state.evaluated = false; state.tape = '';
        state.entry = '0'; state.fresh = true;
    }
    if (state.fresh || state.awaiting) {
        state.entry = d;
        state.fresh = false;
        state.awaiting = false;
        return;
    }
    const sign = state.entry.startsWith('-') ? '-' : '';
    const body = state.entry.replace('-', '');
    if (body === '0') { state.entry = sign + d; return; }
    if (body.replace('.', '').length >= MAX_DIGITS) return;
    state.entry += d;
}

function decimal() {
    if (state.error) reset();
    if (state.evaluated) { digit('0'); }
    else if (state.fresh || state.awaiting) { state.entry = '0'; state.fresh = false; state.awaiting = false; }
    if (!state.entry.includes('.')) state.entry += '.';
}

function negate() {
    if (state.error) return;
    if (state.awaiting) { state.entry = '-0'; state.awaiting = false; state.fresh = false; return; }
    state.entry = state.entry.startsWith('-') ? state.entry.slice(1) : `-${state.entry}`;
}

function backspace() {
    if (state.error || state.fresh) return;
    state.entry = state.entry.length > 1 ? state.entry.slice(0, -1) : '0';
    if (state.entry === '-' || state.entry === '-0') state.entry = '0';
}

function operator(op) {
    if (state.error) return;
    if (state.evaluated) state.evaluated = false;
    if (state.op && state.awaiting) {
        state.op = op;
    } else {
        const v = value();
        if (state.op) {
            const r = BINARY[state.op](state.acc, v);
            if (!Number.isFinite(r)) { fail(); return; }
            state.acc = r;
            if (!show(r)) return;
        } else {
            state.acc = v;
        }
        state.op = op;
    }
    state.awaiting = true;
    state.fresh = true;
    state.tape = `${fmt(state.acc)} ${SYMBOLS[op]}`;
}

function equals() {
    if (state.error) return;
    if (!state.op && !state.evaluated && state.entry === '1993' && !state.fresh) {
        launchDoom();
        return;
    }
    let a, b, op;
    if (state.op) {
        a = state.acc; b = value(); op = state.op;
    } else if (state.lastOp && state.evaluated) {
        a = value(); b = state.lastOperand; op = state.lastOp;
    } else {
        return;
    }
    const r = BINARY[op](a, b);
    state.tape = `${fmt(a)} ${SYMBOLS[op]} ${fmt(b)} =`;
    state.lastOp = op;
    state.lastOperand = b;
    state.op = null;
    state.acc = null;
    if (!Number.isFinite(r)) { const tape = state.tape; fail(); state.tape = tape; return; }
    show(r);
    state.evaluated = true;
}

const rad = x => (state.angle === 'deg' ? (x * Math.PI) / 180 : x);
const tidy = x => (Math.abs(x) < 1e-12 ? 0 : x);

const UNARY = {
    sq: x => x * x,
    cube: x => x * x * x,
    sqrt: x => (x < 0 ? NaN : Math.sqrt(x)),
    cbrt: x => Math.cbrt(x),
    inv: x => (x === 0 ? NaN : 1 / x),
    abs: x => Math.abs(x),
    ln: x => (x > 0 ? Math.log(x) : NaN),
    log: x => (x > 0 ? Math.log10(x) : NaN),
    exp: x => Math.exp(x),
    tenx: x => Math.pow(10, x),
    fact: x => factorial(x),
    sin: x => tidy(Math.sin(rad(x))),
    cos: x => tidy(Math.cos(rad(x))),
    tan: x => (state.angle === 'deg' && (x - 90) % 180 === 0 ? NaN : tidy(Math.tan(rad(x)))),
    percent: x => (state.op && state.acc !== null && (state.op === 'add' || state.op === 'subtract') ? (state.acc * x) / 100 : x / 100)
};

function unary(name) {
    if (state.error) return;
    const before = value();
    const r = UNARY[name](before);
    const prefix = state.op ? `${fmt(state.acc)} ${SYMBOLS[state.op]} ` : '';
    const tape = `${prefix}${UNARY_LABELS[name]}(${fmt(before)})`;
    if (!Number.isFinite(r)) { fail(); state.tape = tape; return; }
    show(r);
    state.tape = tape;
}

function constant(n) {
    if (state.error) reset();
    if (state.evaluated) { state.evaluated = false; state.acc = null; state.op = null; state.tape = ''; }
    show(n);
}

function memory(kind) {
    if (state.error) return;
    if (kind === 'mc') state.memory = null;
    else if (kind === 'mr') { if (state.memory !== null) show(state.memory); }
    else if (kind === 'mp') { state.memory = (state.memory || 0) + value(); state.fresh = true; }
    else if (kind === 'mm') { state.memory = (state.memory || 0) - value(); state.fresh = true; }
}

function setSci(on) {
    state.sci = on;
    els.container.classList.toggle('sci', on);
    if (!win || win.classList.contains('maximized') || window.innerWidth <= 768) return;
    const width = on ? SCI_WIDTH : NORMAL_WIDTH;
    win.style.width = `${Math.min(width, window.innerWidth)}px`;
    const left = parseFloat(win.style.left) || 0;
    if (left + width > window.innerWidth) win.style.left = `${Math.max(0, window.innerWidth - width)}px`;
}

async function launchDoom() {
    if (document.querySelector('.doom-screen')) return;
    try {
        const { playDoomIntro } = await import('../doomIntro.js?v=16');
        playDoomIntro(() => { reset(); paint(); });
    } catch (err) {
        console.error('DOOM failed to load:', err);
    }
}

function copyDisplay() {
    const text = state.error ? '' : state.entry;
    navigator.clipboard?.writeText(text).catch(() => {});
}

function pasteNumber(text) {
    const n = parseFloat(String(text).trim().replace(',', '.'));
    if (!Number.isFinite(n)) return;
    if (state.error) reset();
    if (state.evaluated) { state.evaluated = false; state.acc = null; state.op = null; state.tape = ''; }
    if (show(n)) { state.fresh = false; state.awaiting = false; }
    paint();
}

function dispatch(action) {
    switch (action) {
        case 'clear': { const m = state.memory; const sci = state.sci; reset(); state.memory = m; state.sci = sci; break; }
        case 'ce':
            if (state.evaluated || state.error) { const m = state.memory; const sci = state.sci; reset(); state.memory = m; state.sci = sci; }
            else { state.entry = '0'; state.fresh = false; state.awaiting = false; }
            break;
        case 'backspace': backspace(); break;
        case 'decimal': decimal(); break;
        case 'negate': negate(); break;
        case 'equals': equals(); break;
        case 'pi': constant(Math.PI); break;
        case 'e': constant(Math.E); break;
        case 'angle': state.angle = state.angle === 'deg' ? 'rad' : 'deg'; break;
        case 'sci': setSci(!state.sci); break;
        case 'mc': case 'mr': case 'mp': case 'mm': memory(action); break;
        default:
            if (BINARY[action]) operator(action);
            else if (UNARY[action]) unary(action);
    }
    paint();
}

function isActive() {
    return !!win && document.body.contains(win) && win.classList.contains('active') && !win.classList.contains('minimized');
}

function handleKey(e) {
    if (!isActive() || document.querySelector('.doom-screen')) return;
    const key = e.key;

    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const k = key.toLowerCase();
        if (k === 'c') { copyDisplay(); e.preventDefault(); }
        else if (k === 'v') {
            e.preventDefault();
            navigator.clipboard?.readText().then(pasteNumber).catch(() => {});
        }
        return;
    }
    if (e.altKey) return;

    // Hidden code: type it while the calculator is focused
    if (key.length === 1) {
        state.keys = (state.keys + key.toLowerCase()).slice(-CODE.length);
        if (state.keys === CODE) { state.keys = ''; e.preventDefault(); launchDoom(); return; }
    }

    let action = null;
    if (/^[0-9]$/.test(key)) { digit(key); }
    else if (key === '.' || key === ',') action = 'decimal';
    else if (KEY_OPS[key]) action = KEY_OPS[key];
    else if (key === 'Enter' || key === '=') action = 'equals';
    else if (key === 'Escape') action = 'clear';
    else if (key === 'Delete') action = 'ce';
    else if (key === 'Backspace') action = 'backspace';
    else if (key === '%') action = 'percent';
    else if (key === '@') action = 'sqrt';
    else if (key === '!') action = 'fact';
    else if (key === 'p' || key === 'P') action = 'pi';
    else if (key === 'n' || key === 'N') action = 'negate';
    else return;

    e.preventDefault();
    SoundManager.play('click');
    if (action) dispatch(action); else paint();
}

const btn = (cls, label, attrs, title = '') =>
    `<button type="button" class="calc-btn ${cls}" ${attrs}${title ? ` title="${title}" aria-label="${title}"` : ''}>${label}</button>`;

export const CalcApp = {
    id: 'calc',
    title: 'Calculator',
    icon: Icons.calc,
    width: NORMAL_WIDTH,
    height: 470,
    minWidth: NORMAL_WIDTH,
    minHeight: 470,
    hasMenu: false,
    resizable: false,

    render() {
        const act = a => `data-action="${a}"`;
        const num = d => btn('num', d, `data-value="${d}"`);
        return `
            <div class="calc-container">
                <div class="calc-display">
                    <div class="calc-tape" id="calcTape" aria-live="off">&nbsp;</div>
                    <div class="calc-screen-wrap">
                        <span class="calc-mem" id="calcMem" hidden>M</span>
                        <input type="text" class="calc-screen" id="calcScreen" value="0" readonly aria-label="Calculator display">
                    </div>
                </div>
                <div class="calc-memrow">
                    ${btn('mem', 'MC', act('mc'), 'Memory clear')}
                    ${btn('mem', 'MR', act('mr'), 'Memory recall')}
                    ${btn('mem', 'M+', act('mp'), 'Memory add')}
                    ${btn('mem', 'M−', act('mm'), 'Memory subtract')}
                    <button type="button" class="calc-btn mem sci-toggle" ${act('sci')} id="calcSciBtn" aria-pressed="false" title="Scientific mode">Sci</button>
                </div>
                <div class="calc-body">
                    <div class="calc-sci">
                        ${btn('sci', 'Deg', act('angle'), 'Degrees / radians').replace('class="calc-btn sci"', 'class="calc-btn sci" id="calcAngle"')}
                        ${btn('sci', 'π', act('pi'), 'Pi')}
                        ${btn('sci', 'e', act('e'), 'Euler number')}
                        ${btn('sci', 'n!', act('fact'), 'Factorial')}
                        ${btn('sci', 'sin', act('sin'))}
                        ${btn('sci', 'cos', act('cos'))}
                        ${btn('sci', 'tan', act('tan'))}
                        ${btn('sci', 'x<sup>y</sup>', act('pow'), 'Power')}
                        ${btn('sci', 'ln', act('ln'), 'Natural logarithm')}
                        ${btn('sci', 'log', act('log'), 'Logarithm base 10')}
                        ${btn('sci', 'e<sup>x</sup>', act('exp'), 'e to the power x')}
                        ${btn('sci', '10<sup>x</sup>', act('tenx'), '10 to the power x')}
                        ${btn('sci', '|x|', act('abs'), 'Absolute value')}
                        ${btn('sci', '∛', act('cbrt'), 'Cube root')}
                        ${btn('sci', 'x³', act('cube'), 'Cube')}
                        ${btn('sci', 'mod', act('mod'), 'Modulo')}
                    </div>
                    <div class="calc-buttons">
                        ${btn('func', '%', act('percent'), 'Percent')}
                        ${btn('func', '√', act('sqrt'), 'Square root')}
                        ${btn('func', 'x²', act('sq'), 'Square')}
                        ${btn('func', '1/x', act('inv'), 'Reciprocal')}

                        ${btn('func', 'C', act('clear'), 'Clear')}
                        ${btn('func', 'CE', act('ce'), 'Clear entry')}
                        ${btn('func', '←', act('backspace'), 'Backspace')}
                        ${btn('op', '÷', act('divide'), 'Divide')}

                        ${num('7')}${num('8')}${num('9')}${btn('op', '×', act('multiply'), 'Multiply')}
                        ${num('4')}${num('5')}${num('6')}${btn('op', '−', act('subtract'), 'Subtract')}
                        ${num('1')}${num('2')}${num('3')}${btn('op', '+', act('add'), 'Add')}

                        ${btn('num', '±', act('negate'), 'Change sign')}
                        ${num('0')}
                        ${btn('num', '.', act('decimal'), 'Decimal point')}
                        ${btn('op equals', '=', act('equals'), 'Equals')}
                    </div>
                </div>
            </div>
        `;
    },

    onInit() {
        win = document.querySelector('#window-calc');
        if (!win) return;

        reset(false);
        els = {
            container: win.querySelector('.calc-container'),
            screen: win.querySelector('#calcScreen'),
            tape: win.querySelector('#calcTape'),
            mem: win.querySelector('#calcMem'),
            angle: win.querySelector('#calcAngle'),
            sciBtn: win.querySelector('#calcSciBtn')
        };

        win.querySelectorAll('.calc-btn').forEach(button => {
            button.addEventListener('click', () => {
                SoundManager.play('click');
                const d = button.dataset.value;
                if (d !== undefined) {
                    digit(d);
                    paint();
                } else if (button.dataset.action) {
                    dispatch(button.dataset.action);
                }
            });
        });

        if (keyHandler) document.removeEventListener('keydown', keyHandler);
        keyHandler = handleKey;
        document.addEventListener('keydown', keyHandler);
        paint();
    },

    onClose() {
        if (keyHandler) document.removeEventListener('keydown', keyHandler);
        keyHandler = null;
        win = null;
        els = {};
    }
};

export default CalcApp;
