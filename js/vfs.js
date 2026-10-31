/**
 * Virtual disk shared by Explorer, Terminal, Notepad and the Printer.
 *
 * The tree is rebuilt from the profile on every load. What the visitor changes
 * (saved files, new folders, deletions) is kept as a short log in localStorage
 * and replayed on top, so a file saved in Notepad shows up in Explorer and in
 * `dir`, and is still there after a reload. A crash (BSOD) wipes the log.
 */

import { Icons } from './icons.js?v=16';
import { Profile } from './config.js?v=16';
import { loc } from './i18n.js?v=16';

const BS = String.fromCharCode(92);
const STORE = 'vfs-changes';
const TEXT_EXT = ['txt', 'md', 'ini', 'bat', 'sys', 'url', 'log', 'cfg', 'csv', 'json', 'js', 'css', 'html'];
// Deleting anything under these paths takes the whole system down
const SYSTEM_PATHS = ['c:' + BS + 'windows', 'c:' + BS + 'program files' + BS + 'portfolio os' + BS + 'portfolio.exe'];

const ext = name => (name.includes('.') ? name.split('.').pop().toLowerCase() : '');
const iconFor = name => ({ ini: Icons.fileConfig, sys: Icons.fileConfig, url: Icons.fileLink })[ext(name)] || Icons.fileText;
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

    notes: `TODO

- update the CV
- add screenshots to the project READMEs
- back up the server
- reply to recruiters`,

    cv: () => `${Profile.name}
${loc(Profile.cv?.title || Profile.title)}

Email:    ${Profile.contact.email}
GitHub:   github.com/${Profile.contact.github}
Discord:  ${Profile.contact.discord}
Location: ${loc(Profile.location)}

EDUCATION
${Profile.education.map(edu => `${loc(edu.date)}  ${loc(edu.school)}\n          ${loc(edu.degree)}`).join('\n')}

EXPERIENCE
${Profile.experience.map(job => `${loc(job.date)}  ${loc(job.role)}, ${loc(job.company)}`).join('\n')}

SKILLS
${Profile.skills.map(loc).join(', ')}`,

    projects: () => `PROJECTS

${Profile.projects.map(project => `${project.name}${project.tech ? ` (${project.tech})` : ''}\n${loc(project.description)}\n${project.url}`).join('\n\n')}`,

    easter_egg: () => `Hidden file, nothing sensitive in here.

If you like poking around, try the Konami code
and the Terminal.

${Profile.initials}`,

    project_readme: () => `PortfolioOS

A portfolio built as a Windows 3.1 / 95 style desktop.
Vanilla JavaScript, no frameworks.

github.com/${Profile.contact.github}/PortfolioOS`
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
                'Program Files': folder({
                    'Portfolio OS': folder({
                        'portfolio.exe': blob('2.1 MB', Icons.portfolio, { action: 'portfolio' }),
                        'readme.txt': blob('4 KB', Icons.fileText, { action: 'readme' }),
                        'contact.exe': blob('512 KB', Icons.contact, { action: 'contact' }),
                        'simple.exe': blob('128 KB', Icons.simplemode, { action: 'simplemode' })
                    }),
                    'Accessories': folder({
                        'notepad.exe': blob('64 KB', Icons.notepad, { action: 'notepad' }),
                        'calc.exe': blob('48 KB', Icons.calc, { action: 'calc' }),
                        'paint.exe': blob('256 KB', Icons.paint, { action: 'paint' }),
                        'terminal.exe': blob('96 KB', Icons.terminal, { action: 'terminal' })
                    }),
                    'Internet': folder({
                        'internet.exe': blob('1.2 MB', Icons.browser, { action: 'browser' })
                    }),
                    'Games': folder({
                        'mines.exe': blob('180 KB', Icons.mines, { action: 'mines' }),
                        'snake.exe': blob('96 KB', Icons.snake, { action: 'snake' })
                    })
                }),
                'Users': folder({
                    [Profile.firstName]: folder({
                        'Desktop': folder({
                            'Portfolio.lnk': blob('1 KB', Icons.fileLink, { action: 'portfolio' }),
                            'README.txt': blob('2 KB', Icons.fileText, { action: 'readme' })
                        }),
                        'Documents': folder({
                            'Projects': folder(projectFiles()),
                            'cv.txt': text(content('cv')),
                            'projects.txt': text(content('projects')),
                            'skills.txt': text(Profile.skills.map(loc).join('\n')),
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
    home: ['C:', 'Users', Profile.firstName],
    documents: ['C:', 'Users', Profile.firstName, 'Documents'],

    init() {
        VFS.root = { type: 'folder', children: buildTree() };
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

    remove(parts) {
        return VFS.commit({ op: 'rm', path: parts });
    },

    commit(entry) {
        if (!VFS.apply(entry)) return false;
        const same = other => other.path.join(BS) === entry.path.join(BS);
        // Older writes to the same file are dead weight
        if (entry.op !== 'mkdir') VFS.log = VFS.log.filter(other => !(other.op === 'write' && same(other)));
        VFS.log.push(entry);
        VFS.save();
        window.dispatchEvent(new CustomEvent('vfs-change', { detail: entry }));
        return true;
    },

    apply({ op, path, text: body }) {
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

VFS.init();

export default VFS;
