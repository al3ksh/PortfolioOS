/**
 * Code.exe - a tiny code editor with a run button, Turbo-IDE style.
 *
 * Edits .js, .html and .css files on the shared disk (js/vfs.js), with syntax
 * colours, line numbers and auto-indent. Run executes the file safely:
 *   .js         in a Web Worker (no access to the page or to PortfolioOS data),
 *               stopped after 3 s if it never finishes; console output below
 *   .html/.css  in a sandboxed iframe without same-origin access; its console
 *               is relayed to the same panel
 * No dependencies: the editor is a transparent textarea over a coloured <pre>.
 */

import { Icons } from '../icons.js?v=20';
import { t } from '../i18n.js?v=20';
import { SoundManager } from '../managers/SoundManager.js?v=20';
import { DialogManager } from '../managers/DialogManager.js?v=20';
import { WindowManager } from '../managers/WindowManager.js?v=20';
import { VFS } from '../vfs.js?v=20';

const BS = String.fromCharCode(92);
const PATH_KEY = 'code-path';
const CONTENT_KEY = 'code-content';
const TIMEOUT_MS = 3000;
const MAX_LINES = 400;
const INDENT = '  ';
const SAMPLE = ['D:', 'Projects', 'playground', 'hello.js'];
export const CODE_EXT = ['js', 'html', 'htm', 'css'];

const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const extOf = name => (name && name.includes('.') ? name.split('.').pop().toLowerCase() : '');
const langOf = name => ({ js: 'js', html: 'html', htm: 'html', css: 'css' })[extOf(name)] || 'js';

// ---------- Syntax colours ----------

const JS_WORDS = new Set('await break case catch class const continue default delete do else export extends finally for from function if import in instanceof let new of return static super switch this throw try typeof var void while with yield async'.split(' '));
const JS_VALUES = new Set('true false null undefined NaN Infinity'.split(' '));

// One regex per language; each alternative is a capture group that maps to a class
const RULES = {
    js: [
        [/\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/, 'com'],
        [/`(?:\\[\s\S]|[^`\\])*`?|'(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?/, 'str'],
        [/\b(?:0x[\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/i, 'num'],
        [/[A-Za-z_$][\w$]*(?=\s*\()/, 'fn'],
        [/[A-Za-z_$][\w$]*/, 'word']
    ],
    css: [
        [/\/\*[\s\S]*?(?:\*\/|$)/, 'com'],
        [/'(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?/, 'str'],
        [/@[\w-]+/, 'kw'],
        [/#[\da-f]{3,8}\b|-?\d*\.?\d+(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?\b/i, 'num'],
        [/[\w-]+(?=\s*:(?![^{]*\{))/, 'prop'],
        [/[.#]?[\w-]+(?=[^;{}]*\{)/, 'sel']
    ]
};

function tokenize(code, rules) {
    const pattern = new RegExp(rules.map(([re]) => `(${re.source})`).join('|'), 'gi');
    let html = '';
    let last = 0;
    for (const match of code.matchAll(pattern)) {
        html += esc(code.slice(last, match.index));
        const index = match.slice(1).findIndex(group => group !== undefined);
        let kind = rules[index][1];
        if (kind === 'word') kind = JS_WORDS.has(match[0]) ? 'kw' : JS_VALUES.has(match[0]) ? 'num' : '';
        html += kind ? `<span class="tok-${kind}">${esc(match[0])}</span>` : esc(match[0]);
        last = match.index + match[0].length;
    }
    return html + esc(code.slice(last));
}

// HTML: tags, attributes, comments; <script> and <style> bodies get their own colours
function highlightHtml(code) {
    let html = '';
    let last = 0;
    const tagRe = /<!--[\s\S]*?(?:-->|$)|<\/?[a-zA-Z][^>]*>?/g;
    for (const match of code.matchAll(tagRe)) {
        html += esc(code.slice(last, match.index));
        const tag = match[0];
        if (tag.startsWith('<!--')) {
            html += `<span class="tok-com">${esc(tag)}</span>`;
        } else {
            html += tag.replace(/^(<\/?)([\w-]+)([\s\S]*?)(\/?>)?$/, (all, open, name, attrs, close = '') =>
                `<span class="tok-tag">${esc(open)}${esc(name)}</span>${attrs.replace(/([\w-:]+)(\s*=\s*)?("[^"]*"?|'[^']*'?|[^\s>]+)?/g, (part, attr, eq, value) =>
                    `<span class="tok-attr">${esc(attr)}</span>${eq ? esc(eq) : ''}${value ? `<span class="tok-str">${esc(value)}</span>` : ''}`)}<span class="tok-tag">${esc(close)}</span>`);
        }
        last = match.index + tag.length;
        const inner = /^<(script|style)\b/i.exec(tag);
        if (inner && !tag.endsWith('/>')) {
            const endTag = new RegExp(`</${inner[1]}\\s*>`, 'i');
            const rest = code.slice(last);
            const end = rest.search(endTag);
            const body = end < 0 ? rest : rest.slice(0, end);
            html += tokenize(body, inner[1].toLowerCase() === 'script' ? RULES.js : RULES.css);
            last += body.length;
            tagRe.lastIndex = last;
        }
    }
    return html + esc(code.slice(last));
}

export function highlight(code, lang) {
    return lang === 'html' ? highlightHtml(code) : tokenize(code, RULES[lang] || RULES.js);
}

// ---------- Running ----------

// Runs inside the worker: a console that posts back, then the user's code
const WORKER_SOURCE = `
const show = value => {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.name + ': ' + value.message;
    try { return JSON.stringify(value, (key, v) => typeof v === 'bigint' ? v + 'n' : typeof v === 'function' ? '[Function]' : v); } catch { return String(value); }
};
const post = (kind, args) => postMessage({ kind, text: args.map(show).join(' ') });
self.console = { log: (...a) => post('log', a), info: (...a) => post('log', a), debug: (...a) => post('log', a), warn: (...a) => post('warn', a), error: (...a) => post('error', a), table: (...a) => post('log', a), clear: () => postMessage({ kind: 'clear' }) };
self.addEventListener('unhandledrejection', event => post('error', ['Uncaught (in promise)', event.reason]));
self.onmessage = (event) => {
    try { (0, eval)(event.data); } catch (error) { post('error', [error]); }
    postMessage({ kind: 'done' });
};`;

// Injected first into the HTML preview so its console reaches the panel
const PREVIEW_CONSOLE = `<script>(function(){var s=function(v){if(typeof v==='string')return v;if(v instanceof Error)return v.name+': '+v.message;try{return JSON.stringify(v)}catch(e){return String(v)}};var p=function(k,a){parent.postMessage({codeApp:1,kind:k,text:[].map.call(a,s).join(' ')},'*')};['log','info','debug','table'].forEach(function(n){console[n]=function(){p('log',arguments)}});console.warn=function(){p('warn',arguments)};console.error=function(){p('error',arguments)};window.addEventListener('error',function(e){p('error',[e.message])});})();<\/script>`;

const CSS_DEMO = `<h1>Heading</h1><p>A paragraph with a <a href="#">link</a> and some <em>emphasis</em>.</p><button>Button</button><ul><li>One</li><li>Two</li><li>Three</li></ul><div class="box">.box</div>`;

function loadJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

export const CodeApp = {
    id: 'code',
    title: 'Code - hello.js',
    icon: Icons.code,
    width: 680,
    height: 500,
    minWidth: 360,
    minHeight: 300,
    hasMenu: true,
    menuItems: ['File', 'Run', 'Help'],
    resizable: true,
    path: null,
    pending: null,
    worker: null,
    timer: null,

    menuConfig: {
        'File': [
            { label: 'New', action: 'new' },
            { label: 'Open...', action: 'open', shortcut: 'Ctrl+O' },
            { label: 'Save', action: 'save', shortcut: 'Ctrl+S' },
            { label: 'Save As...', action: 'saveAs' },
            { divider: true },
            { label: 'Exit', action: 'close', shortcut: 'Alt+F4' }
        ],
        'Run': [
            { label: 'Run', action: 'run', shortcut: 'F5' },
            { label: 'Stop', action: 'stop' },
            { divider: true },
            { label: 'Clear Output', action: 'clear' }
        ],
        'Help': [
            { label: 'About Code', action: 'about' }
        ]
    },

    el: selector => document.querySelector(`#window-code ${selector}`),
    input: () => CodeApp.el('.code-input'),
    fileName: () => (CodeApp.path ? CodeApp.path[CodeApp.path.length - 1] : 'untitled.js'),
    lang: () => langOf(CodeApp.fileName()),

    isDirty() {
        const input = CodeApp.input();
        if (!input) return false;
        const saved = CodeApp.path ? VFS.read(CodeApp.path) ?? '' : '';
        return input.value !== saved;
    },

    updateTitle() {
        const title = `Code - ${CodeApp.fileName()}`;
        const instance = WindowManager.getWindowInstance('code');
        if (instance) instance.title = title;
        const bar = document.querySelector('#window-code .title-bar-text');
        if (bar) bar.textContent = title;
        const lang = CodeApp.el('.code-lang');
        if (lang) lang.textContent = { js: 'JavaScript', html: 'HTML', css: 'CSS' }[CodeApp.lang()];
        WindowManager.notifyChange();
    },

    remember() {
        try {
            localStorage.setItem(CONTENT_KEY, CodeApp.input()?.value ?? '');
            if (CodeApp.path) localStorage.setItem(PATH_KEY, JSON.stringify(CodeApp.path));
            else localStorage.removeItem(PATH_KEY);
        } catch { /* storage blocked or full */ }
    },

    // ---------- Editor ----------

    /** Redraw the colours and line numbers to match the textarea. */
    paint() {
        const input = CodeApp.input();
        if (!input) return;
        // A trailing newline needs a character after it, or the last empty line has no height
        CodeApp.el('.code-highlight').innerHTML = `${highlight(input.value, CodeApp.lang())}\n`;
        const lines = input.value.split('\n').length;
        const gutter = CodeApp.el('.code-gutter');
        if (gutter.dataset.lines !== String(lines)) {
            gutter.dataset.lines = lines;
            gutter.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
        }
        CodeApp.syncScroll();
        CodeApp.updateCaret();
    },

    syncScroll() {
        const input = CodeApp.input();
        const pre = CodeApp.el('.code-highlight');
        if (!input || !pre) return;
        pre.style.transform = `translate(${-input.scrollLeft}px, ${-input.scrollTop}px)`;
        CodeApp.el('.code-gutter').style.transform = `translateY(${-input.scrollTop}px)`;
    },

    updateCaret() {
        const input = CodeApp.input();
        const status = CodeApp.el('.code-pos');
        if (!input || !status) return;
        const before = input.value.slice(0, input.selectionStart).split('\n');
        status.textContent = t('code.position', { line: before.length, col: before[before.length - 1].length + 1 });
    },

    // execCommand keeps the browser's undo history; setRangeText is the fallback
    insert(text) {
        const input = CodeApp.input();
        if (!document.execCommand('insertText', false, text)) {
            input.setRangeText(text, input.selectionStart, input.selectionEnd, 'end');
            input.dispatchEvent(new Event('input'));
        }
    },

    onKey(event) {
        const input = event.target;
        if ((event.ctrlKey || event.metaKey) && !event.altKey) {
            const action = { s: 'save', o: 'open', enter: 'run' }[event.key.toLowerCase()];
            if (action) {
                event.preventDefault();
                CodeApp.onMenuAction(action);
            }
            return;
        }
        if (event.key === 'F5') {
            event.preventDefault();
            CodeApp.run();
            return;
        }
        // Esc lets the next Tab leave the editor instead of indenting
        if (event.key === 'Escape') {
            CodeApp.tabOut = true;
            return;
        }
        if (event.key === 'Tab' && !CodeApp.tabOut) {
            event.preventDefault();
            const { value, selectionStart: start } = input;
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            if (event.shiftKey) {
                const spaces = /^ {1,2}/.exec(value.slice(lineStart))?.[0].length || 0;
                if (!spaces) return;
                input.setSelectionRange(lineStart, lineStart + spaces);
                CodeApp.insert('');
                input.setSelectionRange(Math.max(lineStart, start - spaces), Math.max(lineStart, start - spaces));
            } else {
                CodeApp.insert(INDENT);
            }
            return;
        }
        CodeApp.tabOut = false;
        if (event.key === 'Enter') {
            event.preventDefault();
            const { value, selectionStart: start } = input;
            const line = value.slice(value.lastIndexOf('\n', start - 1) + 1, start);
            const indent = /^\s*/.exec(line)[0];
            const opens = /[{[(]\s*$/.test(line) || (CodeApp.lang() === 'html' && /<(?!\/)(?![^>]*\/>)[a-z][^>]*>\s*$/i.test(line) && !/<(br|img|input|meta|link|hr)\b/i.test(line));
            const closes = /^\s*[}\])]/.test(value.slice(start)) || (CodeApp.lang() === 'html' && /^\s*<\//.test(value.slice(start)));
            if (opens && closes) {
                // Between a pair: open an indented line and keep the closer under the opener
                CodeApp.insert(`\n${indent}${INDENT}\n${indent}`);
                const caret = start + 1 + indent.length + INDENT.length;
                input.setSelectionRange(caret, caret);
            } else {
                CodeApp.insert(`\n${indent}${opens ? INDENT : ''}`);
            }
        }
    },

    // ---------- Files ----------

    load(parts, text = parts ? VFS.read(parts) ?? '' : '') {
        CodeApp.path = parts;
        const input = CodeApp.input();
        if (input) {
            input.value = text;
            input.setSelectionRange(0, 0);
            input.scrollTop = 0;
            input.scrollLeft = 0;
        }
        CodeApp.stop(true);
        CodeApp.clearOutput();
        CodeApp.remember();
        CodeApp.updateTitle();
        CodeApp.paint();
    },

    /** Open a file from the shared disk (Explorer, Terminal, Open...). */
    async openPath(parts) {
        if (!CodeApp.input()) {
            CodeApp.pending = parts;
            WindowManager.createWindow('code');
            SoundManager.play('open');
            return;
        }
        WindowManager.createWindow('code');
        if (CodeApp.path && parts.join(BS) === CodeApp.path.join(BS)) return;
        if (CodeApp.isDirty() && !await DialogManager.confirm(t('notepad.discard', { name: CodeApp.fileName() }), 'Code')) return;
        CodeApp.load(parts);
        CodeApp.input()?.focus();
    },

    save() {
        if (!CodeApp.path) return CodeApp.saveAs();
        if (!VFS.write(CodeApp.path, CodeApp.input().value)) {
            DialogManager.alert(t('notepad.pathGone', { name: CodeApp.fileName() }), 'Code');
            return CodeApp.saveAs();
        }
        CodeApp.remember();
        SoundManager.play('click');
    },

    async saveAs() {
        const suggestion = CodeApp.path ? VFS.toString(CodeApp.path) : `Documents${BS}${CodeApp.fileName()}`;
        let name = (await DialogManager.prompt(t('notepad.fileName', { home: VFS.toString(VFS.home) }), suggestion, t('notepad.saveAs')))?.trim();
        if (!name) return;
        if (!/\.[a-z0-9]+$/i.test(name)) name += `.${CodeApp.lang()}`;
        const target = VFS.resolve(VFS.home, name, { parent: true });
        if (!target) return DialogManager.alert(t('notepad.notFound', { name }), t('notepad.saveAs'));
        if (target.node && !VFS.isText(target.node)) return DialogManager.alert(t('notepad.notText', { name: target.parts[target.parts.length - 1] }), t('notepad.saveAs'));
        const samePath = CodeApp.path && target.parts.join(BS) === CodeApp.path.join(BS);
        if (target.node && !samePath && !await DialogManager.confirm(t('notepad.replace', { path: VFS.toString(target.parts) }), t('notepad.saveAs'))) return;
        if (!VFS.write(target.parts, CodeApp.input()?.value ?? '')) return DialogManager.alert(t('notepad.cannotSave', { name }), t('notepad.saveAs'));
        CodeApp.path = target.parts;
        CodeApp.remember();
        CodeApp.updateTitle();
        CodeApp.paint();
        SoundManager.play('click');
    },

    showOpenDialog() {
        const files = VFS.textFiles().filter(parts => CODE_EXT.includes(extOf(parts[parts.length - 1])));
        const current = CodeApp.path?.join(BS);
        const dialog = DialogManager.createDialog({
            title: t('dlg.open'),
            content: `
                <div class="dialog-message">${esc(t('dlg.pickFile'))}</div>
                <select class="notepad-open-list win-input" size="10">${files.map((parts) => {
                    const value = parts.join(BS);
                    return `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(VFS.toString(parts))}</option>`;
                }).join('')}</select>`,
            buttons: [
                { label: t('dlg.open'), action: 'open', primary: true },
                { label: t('dlg.cancel'), action: 'cancel' }
            ],
            onClose: (action) => {
                if (action === 'open' && list.value) CodeApp.openPath(list.value.split(BS));
            }
        });
        const list = dialog.querySelector('select');
        if (!list.value && list.options.length) list.selectedIndex = 0;
        list.addEventListener('dblclick', () => dialog.querySelector('.win-btn.primary')?.click());
        DialogManager.show(dialog);
        setTimeout(() => list.focus(), 50);
    },

    async newFile() {
        if (CodeApp.isDirty() && !await DialogManager.confirm(t('notepad.discard', { name: CodeApp.fileName() }), t('notepad.newFile'))) return;
        CodeApp.load(null, '');
        CodeApp.input()?.focus();
    },

    // ---------- Output ----------

    clearOutput() {
        const out = CodeApp.el('.code-console');
        if (out) out.replaceChildren();
        CodeApp.el('.code-preview')?.remove();
        CodeApp.el('.code-output')?.classList.remove('has-preview');
    },

    print(kind, text) {
        const out = CodeApp.el('.code-console');
        if (!out) return;
        if (kind === 'clear') return out.replaceChildren();
        const line = document.createElement('div');
        line.className = `code-line is-${kind}`;
        line.textContent = text;
        out.append(line);
        while (out.childElementCount > MAX_LINES) out.firstElementChild.remove();
        out.scrollTop = out.scrollHeight;
    },

    setRunning(running) {
        CodeApp.el('.code-run')?.toggleAttribute('disabled', running);
        CodeApp.el('.code-stop')?.toggleAttribute('disabled', !running);
        const state = CodeApp.el('.code-state');
        if (state) state.textContent = running ? t('code.running') : '';
    },

    run() {
        const input = CodeApp.input();
        if (!input) return;
        CodeApp.stop(true);
        CodeApp.clearOutput();
        SoundManager.play('click');
        if (CodeApp.lang() === 'js') CodeApp.runScript(input.value);
        else CodeApp.runPreview(input.value);
    },

    runScript(code) {
        const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
        const worker = new Worker(url);
        URL.revokeObjectURL(url);
        CodeApp.worker = worker;
        CodeApp.setRunning(true);
        const started = performance.now();
        worker.onmessage = ({ data }) => {
            if (data.kind === 'done') {
                clearTimeout(CodeApp.timer);
                CodeApp.print('info', t('code.finished', { ms: Math.round(performance.now() - started) }));
                // Timers and promises may still print; Stop or the next Run ends them
                CodeApp.setRunning(false);
                CodeApp.el('.code-stop')?.removeAttribute('disabled');
                return;
            }
            CodeApp.print(data.kind, data.text);
        };
        worker.onerror = (event) => {
            event.preventDefault();
            CodeApp.print('error', event.message || t('code.crashed'));
        };
        // An endless loop never says "done": the worker is killed, the page never freezes
        CodeApp.timer = setTimeout(() => {
            if (CodeApp.worker !== worker) return;
            CodeApp.print('error', t('code.timeout', { s: TIMEOUT_MS / 1000 }));
            CodeApp.stop(true);
        }, TIMEOUT_MS);
        worker.postMessage(code);
    },

    runPreview(code) {
        const body = CodeApp.lang() === 'css'
            ? `<!doctype html><html><head><style>${code.replace(/<\/style/gi, '<\\/style')}</style></head><body>${CSS_DEMO}</body></html>`
            : code;
        // The console bridge goes first, so it is in place before the page's own scripts
        const doc = /<head[^>]*>/i.test(body)
            ? body.replace(/<head[^>]*>/i, match => match + PREVIEW_CONSOLE)
            : PREVIEW_CONSOLE + body;
        const frame = document.createElement('iframe');
        frame.className = 'code-preview';
        frame.title = t('code.preview');
        // Scripts may run, but with an opaque origin: no cookies, storage or access to PortfolioOS
        frame.setAttribute('sandbox', 'allow-scripts allow-modals');
        frame.srcdoc = doc;
        CodeApp.el('.code-output').classList.add('has-preview');
        CodeApp.el('.code-output').prepend(frame);
    },

    stop(quiet = false) {
        clearTimeout(CodeApp.timer);
        if (CodeApp.worker) {
            CodeApp.worker.terminate();
            CodeApp.worker = null;
            if (!quiet) CodeApp.print('warn', t('code.stopped'));
        }
        if (!quiet && CodeApp.el('.code-preview')) {
            CodeApp.el('.code-preview').remove();
            CodeApp.el('.code-output')?.classList.remove('has-preview');
            CodeApp.print('warn', t('code.stopped'));
        }
        CodeApp.setRunning(false);
    },

    onPreviewMessage(event) {
        const frame = CodeApp.el('.code-preview');
        if (!frame || event.source !== frame.contentWindow || !event.data?.codeApp) return;
        CodeApp.print(event.data.kind, String(event.data.text).slice(0, 2000));
    },

    onMenuAction(action) {
        switch (action) {
            case 'new': CodeApp.newFile(); break;
            case 'open': CodeApp.showOpenDialog(); break;
            case 'save': CodeApp.save(); break;
            case 'saveAs': CodeApp.saveAs(); break;
            case 'run': CodeApp.run(); break;
            case 'stop': CodeApp.stop(); break;
            case 'clear': CodeApp.clearOutput(); break;
        }
    },

    render() {
        return `
            <div class="code-app">
                <div class="code-toolbar">
                    <button class="win-btn code-run" type="button" title="F5 / Ctrl+Enter">${Icons.actRun}<span>${t('code.run')}</span></button>
                    <button class="win-btn code-stop" type="button" disabled>${Icons.actStop}<span>${t('code.stop')}</span></button>
                    <span class="code-state" role="status"></span>
                    <span class="code-lang"></span>
                </div>
                <div class="code-editor">
                    <div class="code-gutter" aria-hidden="true">1</div>
                    <div class="code-area">
                        <pre class="code-highlight" aria-hidden="true"></pre>
                        <textarea class="code-input" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="${esc(t('code.editor'))}"></textarea>
                    </div>
                </div>
                <div class="code-output">
                    <div class="code-console" role="log" aria-label="${esc(t('code.console'))}"></div>
                </div>
                <div class="code-status"><span class="code-pos"></span><span>${t('code.hint')}</span></div>
            </div>`;
    },

    onInit() {
        const input = CodeApp.input();
        if (!input) return;

        if (CodeApp.pending) {
            const parts = CodeApp.pending;
            CodeApp.pending = null;
            CodeApp.load(parts);
        } else {
            // Back to the last file (unsaved text included), or the sample on first use
            const path = loadJson(PATH_KEY);
            const saved = (() => { try { return localStorage.getItem(CONTENT_KEY); } catch { return null; } })();
            if (Array.isArray(path) && VFS.get(path)) CodeApp.load(path, saved ?? VFS.read(path) ?? '');
            else if (saved) CodeApp.load(null, saved);
            else CodeApp.load(VFS.get(SAMPLE) ? SAMPLE : null);
        }

        input.addEventListener('input', () => {
            CodeApp.paint();
            CodeApp.remember();
        });
        input.addEventListener('scroll', () => CodeApp.syncScroll());
        input.addEventListener('keydown', event => CodeApp.onKey(event));
        ['click', 'keyup', 'select'].forEach(type => input.addEventListener(type, () => CodeApp.updateCaret()));
        CodeApp.el('.code-run').addEventListener('click', () => CodeApp.run());
        CodeApp.el('.code-stop').addEventListener('click', () => CodeApp.stop());

        CodeApp.messageHandler = event => CodeApp.onPreviewMessage(event);
        window.addEventListener('message', CodeApp.messageHandler);
    },

    onClose() {
        CodeApp.stop(true);
        window.removeEventListener('message', CodeApp.messageHandler);
    }
};

export default CodeApp;
