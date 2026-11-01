/**
 * Virtual disk shared by Explorer, Terminal, Notepad and the Printer.
 *
 * The tree is rebuilt from the profile on every load. What the visitor changes
 * (saved files, new folders, deletions) is kept as a short log in localStorage
 * and replayed on top, so a file saved in Notepad shows up in Explorer and in
 * `dir`, and is still there after a reload. A crash (BSOD) wipes the log.
 *
 * The Recycle Bin lives here too: 'trash' moves a file or folder into VFS.bin,
 * 'restore' puts it back, 'purge' deletes it for good. Desktop icons are the
 * shortcuts in Users\<name>\Desktop, so an icon thrown away goes the same way.
 */

import { Icons } from './icons.js?v=21';
import { Profile } from './config.js?v=21';
import { loc } from './i18n.js?v=21';
import { cvText, skillLines } from './cvText.js?v=21';
import { DESKTOP_APPS } from './desktopApps.js?v=21';

const BS = String.fromCharCode(92);
const STORE = 'vfs-changes';
const TEXT_EXT = ['txt', 'md', 'ini', 'bat', 'sys', 'url', 'log', 'cfg', 'csv', 'json', 'js', 'css', 'html', 'htm'];
// Deleting anything under these paths takes the whole system down
const SYSTEM_PATHS = ['c:' + BS + 'windows', 'c:' + BS + 'program files' + BS + 'portfolio os' + BS + 'portfolio.exe'];

const ext = name => (name.includes('.') ? name.split('.').pop().toLowerCase() : '');
const iconFor = name => ({ ini: Icons.fileConfig, sys: Icons.fileConfig, url: Icons.fileLink, js: Icons.code, html: Icons.code, htm: Icons.code, css: Icons.code })[ext(name)] || Icons.fileText;
const text = (content, extra = {}) => ({ type: 'file', text: content, ...extra });
const blob = (size, icon, extra = {}) => ({ type: 'file', size, icon, ...extra });
const folder = (children, extra = {}) => ({ type: 'folder', children, ...extra });
const fileName = name => name.replace(/[\\/:*?"<>|]+/g, '_').trim();

const CONTENTS = {
    'config.sys': `DEVICE=C:${BS}WINDOWS${BS}HIMEM.SYS
DEVICE=C:${BS}WINDOWS${BS}EMM386.EXE NOEMS
DOS=HIGH,UMB
FILES=40
BUFFERS=20
STACKS=9,256`,

    'autoexec.bat': `@ECHO OFF
PROMPT $P$G
SET PATH=C:${BS}WINDOWS;C:${BS}WINDOWS${BS}SYSTEM32
SET TEMP=C:${BS}WINDOWS${BS}TEMP
LH C:${BS}WINDOWS${BS}MOUSE.COM`,

    'win.ini': `[windows]
load=
run=
NullPort=None

[Desktop]
Wallpaper=(None)
TileWallpaper=0

[fonts]
MS Sans Serif=SSERIFE.FON
Courier=COURE.FON
Symbol=SYMBOLE.FON

[mci extensions]
wav=waveaudio
mid=sequencer
avi=AVIVideo`,

    notes: () => loc({
        en: `TODO

- update the CV
- add screenshots to the project READMEs
- back up the server
- reply to recruiters`,
        pl: `DO ZROBIENIA

- zaktualizować CV
- dodać zrzuty ekranu do README projektów
- zrobić kopię zapasową serwera
- odpisać rekruterom`
    }),

    // The same text the printer prints, built from the same data as cv.html
    cv: () => cvText(),

    skills: () => skillLines().join('\n'),

    projects: () => `PROJECTS

${Profile.projects.map(project => `${project.name}${project.tech ? ` (${project.tech})` : ''}\n${loc(project.description)}\n${project.url}`).join('\n\n')}`,

    easter_egg: () => loc({
        en: `Hidden file, nothing sensitive in here.

If you like poking around, try the Konami code
and the Terminal.

${Profile.initials}`,
        pl: `Ukryty plik, nie ma tu nic poufnego.

Jeśli lubisz grzebać, spróbuj kodu Konami
i Terminala.

${Profile.initials}`
    }),

    // Code.exe samples (D:\Projects\playground)
    sample_js: () => loc({
        en: `// Press Run (F5) to try it. Edit anything and run again.

function fizzBuzz(n) {
  if (n % 15 === 0) return 'FizzBuzz';
  if (n % 3 === 0) return 'Fizz';
  if (n % 5 === 0) return 'Buzz';
  return n;
}

for (let i = 1; i <= 15; i++) {
  console.log(fizzBuzz(i));
}

const skills = ['JavaScript', 'HTML', 'CSS'];
console.log('Hello from PortfolioOS!', { skills });`,
        pl: `// Wciśnij Uruchom (F5). Zmień cokolwiek i uruchom jeszcze raz.

function fizzBuzz(n) {
  if (n % 15 === 0) return 'FizzBuzz';
  if (n % 3 === 0) return 'Fizz';
  if (n % 5 === 0) return 'Buzz';
  return n;
}

for (let i = 1; i <= 15; i++) {
  console.log(fizzBuzz(i));
}

const umiejetnosci = ['JavaScript', 'HTML', 'CSS'];
console.log('Pozdrowienia z PortfolioOS!', { umiejetnosci });`
    }),

    sample_html: () => `<!doctype html>
<html>
<head>
  <style>
    body { margin: 0; background: #008080; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    let x = 40, y = 40, dx = 3, dy = 2;

    function frame() {
      ctx.fillStyle = 'rgba(0, 128, 128, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFF55';
      ctx.fillRect(x, y, 16, 16);
      if (x + dx < 0 || x + dx > canvas.width - 16) dx = -dx;
      if (y + dy < 0 || y + dy > canvas.height - 16) dy = -dy;
      x += dx;
      y += dy;
      requestAnimationFrame(frame);
    }
    frame();
    console.log('Bouncing!');
  </script>
</body>
</html>`,

    sample_css: () => `/* Run shows these styles on a small demo page */
body {
  font-family: sans-serif;
  background: #C0C0C0;
  padding: 16px;
}

h1 {
  color: #000080;
}

button {
  padding: 4px 16px;
  border: 2px outset #FFFFFF;
}

.box {
  width: 120px;
  padding: 12px;
  background: #FFFF55;
  transform: rotate(-3deg);
}`,

    project_readme: () => loc({
        en: `PortfolioOS

A portfolio built as a Windows 3.1 / 95 style desktop.
Vanilla JavaScript, no frameworks.

github.com/${Profile.contact.github}/PortfolioOS`,
        pl: `PortfolioOS

Portfolio zbudowane jako pulpit w stylu Windows 3.1 / 95.
Czysty JavaScript, bez frameworków.

github.com/${Profile.contact.github}/PortfolioOS`
    })
};

const content = key => (typeof CONTENTS[key] === 'function' ? CONTENTS[key]() : CONTENTS[key]);

function projectFiles() {
    const files = {};
    Profile.projects.forEach(project => {
        const body = [project.name, loc(project.description), project.tech || project.language, project.url].filter(Boolean).join('\n');
        files[`${fileName(project.name)}.url`] = text(body, { url: project.url });
    });
    return files;
}

// C:\Program Files, one folder per group in DESKTOP_APPS
function programFiles() {
    const folders = {};
    DESKTOP_APPS.filter(app => app.folder).forEach((app) => {
        folders[app.folder] ??= {};
        folders[app.folder][app.file] = blob(app.size, app.icon, { action: app.appId });
    });
    return Object.fromEntries(Object.entries(folders).map(([name, files]) => [name, folder(files)]));
}

// A shortcut for every desktop icon ("Portfolio.exe" -> "Portfolio.lnk")
function desktopShortcuts() {
    return Object.fromEntries(DESKTOP_APPS.filter(app => app.folder).map(app => [
        shortcutName(app),
        blob('1 KB', app.icon, { action: app.appId })
    ]));
}

const shortcutName = app => `${fileName(app.title.replace(/\.(exe|cpl|txt)$/i, ''))}.lnk`;

function buildTree() {
    return {
        'C:': {
            type: 'drive',
            children: {
                'Windows': folder({
                    'System32': folder({
                        'config.sys': text(content('config.sys')),
                        'autoexec.bat': text(content('autoexec.bat')),
                        'win.ini': text(content('win.ini')),
                        'secrets.dll': blob('???', Icons.fileLock, { hidden: true })
                    }),
                    'Fonts': folder({
                        'Arial.ttf': blob('150 KB', Icons.fileFont),
                        'Times.ttf': blob('180 KB', Icons.fileFont),
                        'MSSerif.ttf': blob('120 KB', Icons.fileFont)
                    }),
                    'Media': folder({
                        'startup.wav': blob('420 KB', Icons.fileAudio),
                        'chord.wav': blob('24 KB', Icons.fileAudio),
                        'ding.wav': blob('12 KB', Icons.fileAudio)
                    })
                }),
                'Program Files': folder(programFiles()),
                'Users': folder({
                    [Profile.firstName]: folder({
                        'Desktop': folder(desktopShortcuts()),
                        'Documents': folder({
                            'Projects': folder(projectFiles()),
                            'cv.txt': text(content('cv')),
                            'projects.txt': text(content('projects')),
                            'skills.txt': text(content('skills')),
                            'notes.txt': text(content('notes'))
                        }),
                        'Pictures': folder({
                            'avatar.png': blob('128 KB', Icons.fileImage),
                            'screenshot.png': blob('512 KB', Icons.fileImage)
                        }),
                        '.secret': folder({
                            'easter_egg.txt': text(content('easter_egg'), { size: '???' })
                        }, { hidden: true })
                    })
                })
            }
        },
        'D:': {
            type: 'drive',
            children: {
                'Projects': folder({
                    'playground': folder({
                        'hello.js': text(content('sample_js')),
                        'bounce.html': text(content('sample_html')),
                        'style.css': text(content('sample_css'))
                    }),
                    'portfolio-os': folder({
                        'index.html': blob('12 KB', Icons.smBrowser),
                        'style.css': blob('24 KB', Icons.fileText),
                        'main.js': blob('48 KB', Icons.fileText),
                        'README.md': text(content('project_readme'))
                    })
                }),
                'Backup': folder({
                    'important.zip': blob('15 MB', Icons.fileZip),
                    'memories.zip': blob('2.3 GB', Icons.fileZip)
                })
            }
        }
    };
}

const UNITS = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };

function loadLog() {
    try {
        const log = JSON.parse(localStorage.getItem(STORE) || '[]');
        return Array.isArray(log) ? log : [];
    } catch {
        return [];
    }
}

export const VFS = {
    root: { type: 'folder', children: {} },
    log: [],
    bin: [],
    home: ['C:', 'Users', Profile.firstName],
    documents: ['C:', 'Users', Profile.firstName, 'Documents'],

    init() {
        VFS.root = { type: 'folder', children: buildTree() };
        VFS.bin = [];
        VFS.log = loadLog();
        VFS.log.forEach(entry => VFS.apply(entry));
    },

    /** Node at an exact path (array of names), or null. */
    get(parts) {
        let node = VFS.root;
        for (const name of parts) {
            node = node?.children?.[name];
            if (!node) return null;
        }
        return node;
    },

    /** Children of a folder or drive, or null. */
    list(parts) {
        return VFS.get(parts)?.children || null;
    },

    isDir: node => node?.type === 'folder' || node?.type === 'drive',
    isText: node => node?.type === 'file' && typeof node.text === 'string',
    canHoldText: name => TEXT_EXT.includes(ext(name)),
    iconOf: (name, node) => (VFS.isDir(node) ? (node.type === 'drive' ? Icons.fileDrive : Icons.smFolder) : node.icon || iconFor(name)),

    read(parts) {
        const node = VFS.get(parts);
        return VFS.isText(node) ? node.text : null;
    },

    bytes(node) {
        if (!node || VFS.isDir(node)) return 0;
        if (VFS.isText(node) && !node.size) return new Blob([node.text]).size;
        const match = /^([\d.]+)\s*(B|KB|MB|GB)$/i.exec(node.size || '');
        return match ? Math.round(parseFloat(match[1]) * UNITS[match[2].toUpperCase()]) : 0;
    },

    sizeLabel(node) {
        if (!node || VFS.isDir(node)) return '';
        if (node.size) return node.size;
        const bytes = VFS.bytes(node);
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
        return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    },

    toString(parts) {
        return parts.length <= 1 ? `${parts[0] || 'C:'}${BS}` : parts.join(BS);
    },

    /**
     * Resolve a DOS-style path ("..\\notes.txt", "C:\\Users", "docs/cv.txt") against cwd.
     * Case-insensitive. Returns { node, parts } with the real names, or null.
     * With { parent: true } the last segment may be missing: returns { node: null, parts }.
     */
    resolve(cwd, input, { parent = false } = {}) {
        const raw = String(input || '').trim().replace(/^"|"$/g, '').replace(/\//g, BS);
        const drive = /^([a-z]:)/i.exec(raw)?.[1]?.toUpperCase();
        const rest = drive ? raw.slice(2) : raw;
        const wanted = drive ? [drive] : rest.startsWith(BS) ? [cwd[0]] : [...cwd];
        rest.split(BS).filter(Boolean).forEach(segment => {
            if (segment === '.') return;
            if (segment === '..') {
                if (wanted.length > 1) wanted.pop();
            } else {
                wanted.push(segment);
            }
        });
        let node = VFS.root;
        const real = [];
        for (let i = 0; i < wanted.length; i++) {
            const key = Object.keys(node.children || {}).find(name => name.toUpperCase() === wanted[i].toUpperCase());
            if (!key) {
                if (parent && i === wanted.length - 1 && VFS.isDir(node)) return { node: null, parts: [...real, fileName(wanted[i])] };
                return null;
            }
            node = node.children[key];
            real.push(key);
            if (i < wanted.length - 1 && !VFS.isDir(node)) return null;
        }
        return { node, parts: real };
    },

    /** True when deleting this path should crash the system. */
    isSystem(parts) {
        const target = parts.join(BS).toLowerCase();
        return SYSTEM_PATHS.some(system => target === system || target.startsWith(system + BS) || system.startsWith(target + BS));
    },

    /** Name of the system file that makes deleting `parts` fatal, or null. */
    systemCulprit(parts) {
        const target = parts.join(BS).toLowerCase();
        for (const system of SYSTEM_PATHS) {
            if (target === system || target.startsWith(system + BS)) return parts[parts.length - 1];
            if (system.startsWith(target + BS)) return system.split(BS).pop();
        }
        return null;
    },

    /** Every text file under a folder, as paths. */
    textFiles(parts = [], { hidden = false } = {}) {
        const out = [];
        const walk = (node, path) => Object.entries(node.children || {}).forEach(([name, child]) => {
            if (child.hidden && !hidden) return;
            if (VFS.isDir(child)) walk(child, [...path, name]);
            else if (VFS.isText(child)) out.push([...path, name]);
        });
        walk(VFS.get(parts) || VFS.root, parts);
        return out;
    },

    write(parts, body) {
        return VFS.commit({ op: 'write', path: parts, text: String(body) });
    },

    mkdir(parts) {
        return VFS.commit({ op: 'mkdir', path: parts });
    },

    /** Delete for good (the Terminal's DEL). */
    remove(parts) {
        const removed = VFS.commit({ op: 'rm', path: parts });
        if (removed) countDeleted();
        return removed;
    },

    /** Move a file or folder to the Recycle Bin (Explorer, desktop icons). */
    trash(parts) {
        const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        const moved = VFS.commit({ op: 'trash', path: parts, id, at: Date.now() });
        if (moved) countDeleted();
        return moved;
    },

    /** Put Recycle Bin items back where they came from. */
    restore(ids) {
        return [].concat(ids).filter(id => VFS.commit({ op: 'restore', id })).length;
    },

    /** Delete Recycle Bin items for good. */
    purge(ids) {
        return VFS.commit({ op: 'purge', ids: [].concat(ids) });
    },

    binBytes() {
        const size = node => (VFS.isDir(node) ? Object.values(node.children || {}).reduce((sum, child) => sum + size(child), 0) : VFS.bytes(node));
        return VFS.bin.reduce((sum, item) => sum + size(item.node), 0);
    },

    // ---------- Desktop shortcuts ----------

    desktop: ['C:', 'Users', Profile.firstName, 'Desktop'],

    /** Path of the desktop shortcut that opens appId, or null when it is gone. */
    shortcutOf(appId) {
        const name = Object.entries(VFS.list(VFS.desktop) || {}).find(([, node]) => node.action === appId)?.[0];
        return name ? [...VFS.desktop, name] : null;
    },

    commit(entry) {
        if (!VFS.apply(entry)) return false;
        const same = other => other.path && entry.path && other.path.join(BS) === entry.path.join(BS);
        // Older writes to the same file are dead weight (but a trashed file still needs them to come back)
        if (entry.op === 'write' || entry.op === 'rm') VFS.log = VFS.log.filter(other => !(other.op === 'write' && same(other)));
        VFS.log.push(entry);
        VFS.save();
        window.dispatchEvent(new CustomEvent('vfs-change', { detail: entry }));
        return true;
    },

    apply({ op, path, text: body, id, ids, at }) {
        if (op === 'restore') return restoreFromBin(id);
        if (op === 'purge') {
            const before = VFS.bin.length;
            VFS.bin = VFS.bin.filter(item => !ids?.includes(item.id));
            return VFS.bin.length < before;
        }
        if (!Array.isArray(path) || path.length < 2) return false;
        const parent = VFS.get(path.slice(0, -1));
        const name = path[path.length - 1];
        if (!VFS.isDir(parent)) return false;
        const existing = parent.children[name];
        if (op === 'write') {
            if (VFS.isDir(existing) || (existing && !VFS.isText(existing))) return false;
            parent.children[name] = existing ? { ...existing, text: body, size: undefined } : { type: 'file', text: body };
        } else if (op === 'mkdir') {
            if (existing) return false;
            parent.children[name] = folder({});
        } else if (op === 'rm') {
            if (!existing) return false;
            delete parent.children[name];
        } else if (op === 'trash') {
            if (!existing) return false;
            delete parent.children[name];
            VFS.bin.push({ id, name, path, node: existing, at });
        } else {
            return false;
        }
        return true;
    },

    save() {
        try {
            localStorage.setItem(STORE, JSON.stringify(VFS.log));
        } catch {
            // Storage full or blocked: changes stay for this session only
        }
    },

    /** Back to the disk as shipped ("restored from backup" after a crash). */
    reset() {
        localStorage.removeItem(STORE);
        VFS.init();
        window.dispatchEvent(new CustomEvent('vfs-change', { detail: { op: 'reset' } }));
    }
};

// Counted for this visit only; the shutdown screen has a line for it
function countDeleted() {
    try { sessionStorage.setItem('filesDeleted', String(Number(sessionStorage.getItem('filesDeleted') || 0) + 1)); } catch { /* storage blocked */ }
}

// Back to its folder (recreated if it was deleted meanwhile); a name already taken gets " (2)"
function restoreFromBin(id) {
    const index = VFS.bin.findIndex(item => item.id === id);
    if (index < 0) return false;
    const { path, node } = VFS.bin[index];
    let parent = VFS.root;
    for (const part of path.slice(0, -1)) {
        if (!VFS.isDir(parent.children[part])) parent.children[part] = folder({});
        parent = parent.children[part];
    }
    let name = path[path.length - 1];
    const dot = name.lastIndexOf('.');
    const [stem, extension] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ''];
    for (let n = 2; parent.children[name]; n++) name = `${stem} (${n})${extension}`;
    parent.children[name] = node;
    VFS.bin.splice(index, 1);
    return true;
}

VFS.init();

export default VFS;
