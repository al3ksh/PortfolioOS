/**
 * Terminal App - Fake DOS prompt with commands.
 * Works on the same disk as Explorer and Notepad (js/vfs.js).
 */

import { Icons } from '../icons.js?v=16';
import { WindowManager } from '../managers/WindowManager.js?v=16';
import { SoundManager } from '../managers/SoundManager.js?v=16';
import { Profile, githubUrl } from '../config.js?v=16';
import { VFS } from '../vfs.js?v=16';
import { NotepadApp } from './NotepadApp.js?v=16';
import { printText } from './PrinterApp.js?v=16';

const SEP = '\\';
const FILE_DATE = '01-31-26  12:00a';

const ALIASES = {
    ls: 'dir', cat: 'type', pwd: 'cd', man: 'help', '?': 'help',
    mkdir: 'md', rmdir: 'rd', erase: 'del', edit: 'notepad', chdir: 'cd'
};

// Commands whose last argument is a path, for Tab completion
const PATH_COMMANDS = ['cd', 'chdir', 'dir', 'ls', 'type', 'cat', 'tree', 'open', 'notepad', 'edit', 'print', 'del', 'erase', 'rd', 'rmdir', 'md', 'mkdir'];

const pathOf = parts => VFS.toString(parts);
const pad = (text, width) => String(text).padEnd(width, ' ');
const leaf = parts => parts[parts.length - 1];
const isWithin = (inner, outer) => outer.length <= inner.length && outer.every((name, i) => name === inner[i]);
const wildcard = pattern => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i');

export const TerminalApp = {
    id: 'terminal',
    title: 'Command Prompt',
    icon: Icons.terminal,
    width: 550,
    height: 350,
    hasMenu: false,
    resizable: true,

    history: [],
    historyIndex: -1,
    currentDir: [...VFS.home],

    commands: {
        help: () => `Available commands:
  help      - Show this help
  neofetch  - Display PortfolioOS system summary
  dir       - List directory contents
  cls       - Clear screen
  clear     - Clear screen
  history   - Show command history
  echo      - Print text
  open      - Open a file, project or application
  github    - Open the GitHub profile
  whoami    - Display current user
  date      - Show current date
  time      - Show current time
  ver       - Show OS version
  cd        - Change directory
  type      - Display file contents
  tree      - Show the folder tree
  notepad   - Edit a file in Notepad (creates it if needed)
  print     - Print a text file
  md        - Make a directory
  rd        - Remove a directory (/S with everything inside)
  del       - Delete files (wildcards work: del *.txt)
  color     - Change text color
  matrix    - ???
  bios      - Reboot into BIOS setup
  sudo      - Request administrator powers
  format c: - Pretend to format the drive
  ping girlfriend - Test your luck
  sl        - Steam locomotive
  fortune   - Print a random fortune
  exit      - Close terminal

Redirect output into a file: echo hi > note.txt, dir >> list.txt
Tips: Tab completes, Up/Down browse history, Ctrl+L clears, Ctrl+C cancels.
Aliases: ls = dir, cat = type, pwd = cd, man = help, mkdir = md, rmdir = rd,
         erase = del, edit = notepad`,

        dir: (app, args) => {
            const target = app.resolve(args.find(arg => !arg.startsWith('-') && !arg.startsWith('/')) || '');
            if (!target) return 'File Not Found';
            if (!VFS.isDir(target.node)) {
                return `\n Directory of ${pathOf(target.parts.slice(0, -1))}\n\n${pad(leaf(target.parts), 24)}${VFS.bytes(target.node).toLocaleString('en-US').padStart(12)}    ${FILE_DATE}`;
            }
            const entries = Object.entries(target.node.children);
            const byName = ([a], [b]) => a.localeCompare(b);
            const dirs = entries.filter(([, node]) => VFS.isDir(node)).sort(byName);
            const files = entries.filter(([, node]) => !VFS.isDir(node)).sort(byName);
            const lines = ['', ` Volume in drive ${target.parts[0][0]} is PORTFOLIO`, ` Directory of ${pathOf(target.parts)}`, ''];
            if (target.parts.length > 1) {
                lines.push(`${pad('.', 24)}<DIR>           ${FILE_DATE}`, `${pad('..', 24)}<DIR>           ${FILE_DATE}`);
            }
            dirs.forEach(([name]) => lines.push(`${pad(name, 24)}<DIR>           ${FILE_DATE}`));
            files.forEach(([name, node]) => {
                const size = node.hidden ? '???' : VFS.bytes(node).toLocaleString('en-US');
                lines.push(`${pad(name, 24)}${size.padStart(12)}    ${node.hidden ? '??-??-??  ??:??a' : FILE_DATE}`);
            });
            const total = files.reduce((sum, [, node]) => sum + VFS.bytes(node), 0);
            lines.push(`${String(files.length).padStart(9)} file(s) ${total.toLocaleString('en-US').padStart(14)} bytes`);
            lines.push(`${String(dirs.length).padStart(9)} dir(s)  ${'640,000'.padStart(14)} bytes free`);
            return lines.join('\n');
        },

        tree: (app, args) => {
            const target = app.resolve(args.find(arg => !arg.startsWith('-')) || '');
            if (!target || !VFS.isDir(target.node)) return 'Invalid path';
            const lines = [pathOf(target.parts)];
            const walk = (node, prefix) => {
                const kids = node.children;
                const names = Object.keys(kids).filter(name => !kids[name].hidden)
                    .sort((a, b) => VFS.isDir(kids[b]) - VFS.isDir(kids[a]) || a.localeCompare(b));
                names.forEach((name, index) => {
                    const last = index === names.length - 1;
                    lines.push(`${prefix}${last ? '\\---' : '+---'}${name}`);
                    if (VFS.isDir(kids[name])) walk(kids[name], `${prefix}${last ? '    ' : '|   '}`);
                });
            };
            walk(target.node, '');
            return lines.join('\n');
        },

        neofetch: () => {
            const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'cores not reported';
            const scheme = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
            return `
        .--.       PortfolioOS 98 SE
       |o_o |      -----------------
       |:_/ |      Host: ${location.hostname || 'localhost'}
      //   \\\\      Browser: ${navigator.appName || 'browser'}
     (|     | )    Platform: ${navigator.platform || 'unknown'}
     /'\\_   _/\\     Resolution: ${window.screen.width}x${window.screen.height}
     \\___)=(___/     Viewport: ${window.innerWidth}x${window.innerHeight}
                    CPU: Human Brain @ variable MHz
                    ${cores}
                    Theme: ${scheme}
                    Uptime: ${TerminalApp.getUptime()}`;
        },

        cls: () => '__CLEAR__',
        clear: () => '__CLEAR__',
        history: (app) => app.history.length
            ? app.history.map((command, index) => ` ${String(index + 1).padStart(2, ' ')}  ${command}`).join('\n')
            : 'No commands in history.',

        open: (app, args) => app.openTarget(args.join(' ')),
        github: () => {
            window.open(githubUrl(), '_blank', 'noopener,noreferrer');
            return `Opening github.com/${Profile.contact.github}...`;
        },
        
        echo: (app, args) => args.join(' ') || '',
        
        whoami: () => 'PORTFOLIO\\Developer',
        
        date: () => `Current date is ${new Date().toLocaleDateString('pl-PL')}`,
        
        time: () => `Current time is ${new Date().toLocaleTimeString('pl-PL')}`,
        
        ver: () => `
Portfolio OS [Version 1.0.2026]
(c) 2026 Portfolio Corporation. All rights reserved.`,

        cd: (app, args) => {
            if (!args.length) return pathOf(app.currentDir);
            const target = app.resolve(args.join(' '));
            if (!target) return 'The system cannot find the path specified.';
            if (!VFS.isDir(target.node)) return 'The directory name is invalid.';
            app.currentDir = target.parts;
            return '';
        },

        type: (app, args) => {
            if (!args.length) return 'The syntax of the command is incorrect.';
            const target = app.resolve(args.join(' '));
            if (!target) return `File not found - ${args.join(' ')}`;
            if (VFS.isDir(target.node)) return 'Access is denied.';
            if (!VFS.isText(target.node)) return `${leaf(target.parts)} is a binary file. Try: open ${leaf(target.parts)}`;
            return target.node.text;
        },

        notepad: (app, args) => {
            if (!args.length) {
                WindowManager.createWindow('notepad');
                return '';
            }
            const target = app.resolve(args.join(' '), { parent: true });
            if (!target) return 'The system cannot find the path specified.';
            if (VFS.isDir(target.node)) return 'Access is denied.';
            if (target.node && !VFS.isText(target.node)) return `Cannot edit ${leaf(target.parts)}: not a text file.`;
            if (!target.node && !VFS.write(target.parts, '')) return 'Cannot create the file.';
            NotepadApp.openPath(target.parts);
            return '';
        },

        print: (app, args) => {
            if (!args.length) return 'Name of list device [PRN]: no file given.';
            const target = app.resolve(args.join(' '));
            if (!target) return `File not found - ${args.join(' ')}`;
            if (!VFS.isText(target.node)) return `${leaf(target.parts)} cannot be printed.`;
            printText(leaf(target.parts), target.node.text);
            return `${pathOf(target.parts)} is currently being printed`;
        },

        md: (app, args) => {
            if (!args.length) return 'The syntax of the command is incorrect.';
            const target = app.resolve(args.join(' '), { parent: true });
            if (!target) return 'The system cannot find the path specified.';
            if (target.node) return `A subdirectory or file ${args.join(' ')} already exists.`;
            return VFS.mkdir(target.parts) ? '' : 'Unable to create directory.';
        },

        rd: (app, args) => {
            const recursive = args.some(arg => arg.toLowerCase() === '/s');
            const name = args.filter(arg => !arg.startsWith('/')).join(' ');
            if (!name) return 'The syntax of the command is incorrect.';
            const target = app.resolve(name);
            if (!target) return 'The system cannot find the file specified.';
            if (!VFS.isDir(target.node)) return 'The directory name is invalid.';
            if (target.parts.length < 2 || VFS.isSystem(target.parts)) return 'Access is denied.';
            if (isWithin(app.currentDir, target.parts)) return 'The process cannot access the file because it is being used by another process.';
            if (Object.keys(target.node.children).length && !recursive) return 'The directory is not empty.';
            return VFS.remove(target.parts) ? '' : 'Access is denied.';
        },

        del: (app, args) => {
            const name = args.filter(arg => !arg.startsWith('/')).join(' ');
            if (!name) return 'The syntax of the command is incorrect.';
            const cut = Math.max(name.lastIndexOf(SEP), name.lastIndexOf('/'));
            const pattern = name.slice(cut + 1);
            let doomed;
            if (/[*?]/.test(pattern)) {
                const dir = app.resolve(cut >= 0 ? name.slice(0, cut + 1) : '.');
                if (!dir || !VFS.isDir(dir.node)) return 'The system cannot find the path specified.';
                const match = wildcard(pattern === '*.*' ? '*' : pattern);
                doomed = Object.entries(dir.node.children)
                    .filter(([child, node]) => !VFS.isDir(node) && match.test(child))
                    .map(([child]) => [...dir.parts, child]);
            } else {
                const target = app.resolve(name);
                if (!target) return `Could Not Find ${pathOf(app.currentDir)}${app.currentDir.length > 1 ? SEP : ''}${name}`;
                if (VFS.isDir(target.node)) return `${pathOf(target.parts)}\\*, Are you sure? Use RD /S to remove a folder.`;
                doomed = [target.parts];
            }
            if (!doomed.length) return `Could Not Find ${name}`;
            const denied = doomed.filter(parts => VFS.isSystem(parts));
            doomed.filter(parts => !VFS.isSystem(parts)).forEach(parts => VFS.remove(parts));
            return denied.map(parts => `Access is denied - ${pathOf(parts)}`).join('\n');
        },

        color: (app, args) => {
            const colors = {
                '0': '#000', 'a': '#0f0', 'b': '#00f', 'c': '#f00',
                'd': '#f0f', 'e': '#ff0', 'f': '#fff'
            };
            const color = colors[args[0]?.toLowerCase()];
            if (color) {
                const output = document.querySelector('#window-terminal .terminal-output');
                if (output) output.style.color = color;
                return `Color changed.`;
            }
            return `Invalid color. Use: 0=black a=green b=blue c=red d=magenta e=yellow f=white`;
        },

        bios: () => {
            sessionStorage.setItem('enterBios', '1');
            sessionStorage.removeItem('hasBooted');
            document.documentElement.dataset.reloading = 'true';
            setTimeout(() => location.reload(), 600);
            return 'Rebooting... Press DEL to enter SETUP';
        },

        matrix: () => {
            SoundManager.play('chord');
            return `
 ██████╗  █████╗ ███████╗████████╗███████╗██████╗ 
 ██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝███████║███████╗   ██║   █████╗  ██████╔╝
 ██╔═══╝ ██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗
 ██║     ██║  ██║███████║   ██║   ███████╗██║  ██║
 ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
           Wake up, Neo...`;
        },

        exit: () => {
            setTimeout(() => WindowManager.closeWindow('terminal'), 100);
            return 'Goodbye!';
        },

        doom: async () => {
            try {
                const { playDoomIntro } = await import('../doomIntro.js?v=16');
                playDoomIntro(() => document.querySelector('#window-terminal #terminalInput')?.focus());
            } catch (err) {
                console.error('DOOM failed to load:', err);
                return 'Bad command or file name.';
            }
            return 'DOS/4GW Protected Mode Run-time  Version 1.97';
        },

        // Easter eggs
        sudo: (app, args) => args.join(' ').toLowerCase().includes('rm -rf')
            ? 'Permission denied: PortfolioOS protects the root directory.'
            : 'Nice try, but this is PortfolioOS!',
        rm: () => 'No rm here! Use DEL instead... just kidding, don\'t delete anything!',
        hack: (app, args) => args.join(' ').toLowerCase() === 'nasa'
            ? 'Connecting to NASA... ACCESS DENIED. Try building something first.'
            : 'HACKING THE MAINFRAME... just kidding, that\'s not how it works!',
        format: (app, args) => args.join(' ').toLowerCase() === 'c:'
            ? 'FORMAT C: aborted. PortfolioOS needs its files.'
            : 'Specify a drive, for example: format c:',
        hello: () => 'Hello there!',
        coffee: () => 'Brewing coffee... Error: Coffee machine not found!',
        konami: () => '↑↑↓↓←→←→BA - Try it on the desktop, with Portfolio.exe open.\nType it again to switch the wallpaper back.',
        xyzzy: () => {
            const count = Number(sessionStorage.getItem('xyzzy') || 0) + 1;
            sessionStorage.setItem('xyzzy', String(count));
            if (count === 1) return 'Nothing happens.';
            if (count === 2) return 'A hollow voice says "Fool."';
            return 'A hollow voice whispers: "Old cheats still work on the desktop. Up, up..."\nAlso: the Recycle Bin has never deleted anything. Try feeding it.';
        },
        plugh: () => 'A hollow voice says "Plugh." (Try xyzzy.)',

        // More Easter eggs
        rickroll: () => {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
            return 'Never gonna give you up... 🎵';
        },
        
        answer: () => '42 - The answer to life, the universe, and everything.',
        
        ping: (app, args) => {
            if (args.join(' ').toLowerCase() === 'girlfriend') {
                return 'Pinging girlfriend...\nRequest timed out. She is probably busy being awesome.';
            }
            return `Pinging localhost [127.0.0.1] with 32 bytes of data:
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128

 Ping statistics for 127.0.0.1:
    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)`;
        },

        sl: () => `      ====        ________
     _|  |__     /        \\
    /        \\___|  SL    |
   /  O  O          \\_____/
  /__________________________\\
      Choo choo!`,
        
        fortune: () => {
            const fortunes = [
                'A beautiful, smart, and loving person will be coming into your life.',
                'A dubious friend may be an enemy in camouflage.',
                'A faithful friend is a strong defense.',
                'You will be hungry again in one hour.',
                'Error 404: Fortune not found.',
                'Segmentation fault (core dumped)',
                'Have you tried turning it off and on again?',
                '01001000 01101001 (That\'s "Hi" in binary)',
                'The cake is a lie.',
                'All your base are belong to us.'
            ];
            return fortunes[Math.floor(Math.random() * fortunes.length)];
        },
        
        leet: (app, args) => {
            const text = args.join(' ') || 'hello world';
            const leetMap = { a:'4', e:'3', i:'1', o:'0', s:'5', t:'7', b:'8', g:'9' };
            return text.split('').map(c => leetMap[c.toLowerCase()] || c).join('');
        },
        
        cowsay: (app, args) => {
            const msg = args.join(' ') || 'Moo!';
            const line = '_'.repeat(msg.length + 2);
            return `
 ${line}
< ${msg} >
 ${'-'.repeat(msg.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
        },
        
        b64encode: (app, args) => {
            try {
                return btoa(args.join(' '));
            } catch {
                return 'Error encoding text';
            }
        },
        
        b64decode: (app, args) => {
            try {
                return atob(args.join(' '));
            } catch {
                return 'Error decoding - invalid base64';
            }
        },
        
        party: () => {
            SoundManager.play('chord');
            document.body.style.animation = 'rainbow 1s linear infinite';
            setTimeout(() => { document.body.style.animation = ''; }, 5000);
            return '🎉🎊🥳 PARTY MODE ACTIVATED! 🥳🎊🎉';
        },
    },

    render() {
        return `
            <div class="terminal-container">
                <div class="terminal-output" id="terminalOutput">
<span class="terminal-line">Portfolio OS [Version 1.0.2026]</span>
<span class="terminal-line">(c) 2026 Portfolio Corporation.</span>
<span class="terminal-line"></span>
                </div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt">${pathOf(TerminalApp.cwd())}&gt;</span>
                    <input type="text" class="terminal-input" id="terminalInput" autocomplete="off" spellcheck="false">
                </div>
            </div>
        `;
    },

    onInit() {
        const window = document.querySelector('#window-terminal');
        if (!window) return;

        const input = window.querySelector('#terminalInput');
        const output = window.querySelector('#terminalOutput');
        
        input?.focus();

        let lastTab = '';
        const scrollDown = () => { output.scrollTop = output.scrollHeight; };

        input?.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') lastTab = '';
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                if (cmd) {
                    TerminalApp.history.push(cmd);
                    TerminalApp.historyIndex = TerminalApp.history.length;
                    TerminalApp.executeCommand(cmd, output, input);
                }
                input.value = '';
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const { value, options } = TerminalApp.complete(input.value);
                input.value = value;
                if (options.length > 1) {
                    if (lastTab === value) {
                        TerminalApp.addLine(output, options.join('  '));
                        scrollDown();
                    }
                    lastTab = value;
                }
            } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                output.innerHTML = '';
            } else if (e.ctrlKey && e.key.toLowerCase() === 'c' && input.selectionStart === input.selectionEnd) {
                e.preventDefault();
                TerminalApp.addLine(output, `${window.querySelector('.terminal-prompt')?.textContent || ''} ${input.value}^C`);
                input.value = '';
                scrollDown();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (TerminalApp.historyIndex > 0) {
                    TerminalApp.historyIndex--;
                    input.value = TerminalApp.history[TerminalApp.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (TerminalApp.historyIndex < TerminalApp.history.length - 1) {
                    TerminalApp.historyIndex++;
                    input.value = TerminalApp.history[TerminalApp.historyIndex];
                } else {
                    TerminalApp.historyIndex = TerminalApp.history.length;
                    input.value = '';
                }
            }
        });

        // Click anywhere to focus input
        window.querySelector('.terminal-container')?.addEventListener('click', () => {
            input?.focus();
        });
    },

    /** Current directory; walks up if Explorer deleted it in the meantime. */
    cwd() {
        while (TerminalApp.currentDir.length > 1 && !VFS.isDir(VFS.get(TerminalApp.currentDir))) TerminalApp.currentDir.pop();
        if (!VFS.isDir(VFS.get(TerminalApp.currentDir))) TerminalApp.currentDir = ['C:'];
        return TerminalApp.currentDir;
    },

    resolve(path, options) {
        return VFS.resolve(TerminalApp.cwd(), path, options);
    },

    /** Tab completion: command names first, then paths (and open targets) for the last word. */
    complete(text) {
        const trailing = /\s$/.test(text);
        const words = text.split(/\s+/).filter(Boolean);
        if (words.length === 0 || (words.length === 1 && !trailing)) {
            const prefix = (words[0] || '').toLowerCase();
            const names = [...new Set([...Object.keys(TerminalApp.commands), ...Object.keys(ALIASES)])].sort();
            return TerminalApp.finish('', prefix, names.filter(name => name.startsWith(prefix)), '');
        }
        const cmd = words[0].toLowerCase();
        const last = trailing ? '' : words[words.length - 1];
        const head = text.slice(0, text.length - last.length);
        const cut = Math.max(last.lastIndexOf(SEP), last.lastIndexOf('/'));
        const dirPart = cut >= 0 ? last.slice(0, cut + 1) : '';
        const namePart = last.slice(cut + 1);
        const base = TerminalApp.resolve(dirPart || '.');
        let options = [];
        const dirsOnly = ['cd', 'chdir', 'rd', 'rmdir', 'md', 'mkdir', 'tree'].includes(cmd);
        if (base && VFS.isDir(base.node) && PATH_COMMANDS.includes(cmd)) {
            options = Object.entries(base.node.children)
                .filter(([name, node]) => !node.hidden && name.toUpperCase().startsWith(namePart.toUpperCase()) && (!dirsOnly || VFS.isDir(node)))
                .map(([name, node]) => name + (VFS.isDir(node) ? SEP : ''));
        }
        if (cmd === 'open' && !dirPart) {
            options.push(...TerminalApp.openNames().filter(name => name.startsWith(namePart.toLowerCase())));
        }
        return TerminalApp.finish(head, namePart, options, dirPart);
    },

    finish(head, typed, options, dirPart) {
        if (!options.length) return { value: head + dirPart + typed, options: [] };
        let common = options[0];
        options.forEach(option => {
            while (!option.toUpperCase().startsWith(common.toUpperCase())) common = common.slice(0, -1);
        });
        const filled = common.length >= typed.length ? common : typed;
        const single = options.length === 1 && !filled.endsWith(SEP);
        return { value: `${head}${dirPart}${filled}${single ? ' ' : ''}`, options };
    },

    openNames() {
        return [...new Set([
            'github', 'projects', 'paint', 'terminal', 'sysinfo', 'internet', 'browser',
            ...Profile.projects.map(project => project.name.toLowerCase()),
            ...Object.keys(Profile.links)
        ])];
    },

    getUptime() {
        const bootTime = sessionStorage.getItem('bootTime');
        if (!bootTime) return '00:00:00';

        const elapsed = Math.max(0, Date.now() - new Date(bootTime).getTime());
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return [hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':');
    },

    openTarget(target) {
        const normalized = target.trim().toLowerCase();
        const links = {
            github: githubUrl(),
            ...Object.fromEntries(Profile.projects.map(project => [project.name.toLowerCase(), project.url])),
            ...Profile.links
        };
        const apps = {
            projects: 'projects',
            paint: 'paint',
            terminal: 'terminal',
            sysinfo: 'sysinfo',
            'system info': 'sysinfo',
            internet: 'browser',
            browser: 'browser'
        };

        const found = normalized ? TerminalApp.resolve(target) : null;
        if (found && !VFS.isDir(found.node)) {
            if (found.node.url) {
                window.open(found.node.url, '_blank', 'noopener,noreferrer');
                return `Opening ${found.node.url}...`;
            }
            if (found.node.action) {
                WindowManager.createWindow(found.node.action);
                return `Opening ${leaf(found.parts)}...`;
            }
            if (VFS.isText(found.node)) {
                NotepadApp.openPath(found.parts);
                return `Opening ${leaf(found.parts)} in Notepad...`;
            }
            return `No application is associated with ${leaf(found.parts)}.`;
        }
        if (links[normalized]) {
            window.open(links[normalized], '_blank', 'noopener,noreferrer');
            return `Opening ${links[normalized]}...`;
        }
        if (apps[normalized]) {
            WindowManager.createWindow(apps[normalized]);
            return `Opening ${normalized}...`;
        }
        if (found) {
            WindowManager.createWindow('explorer');
            return 'Opening File Explorer...';
        }
        return normalized ? `Cannot open '${target}'. Try: ${[...Object.keys(links), 'projects'].map(name => `open ${name}`).join(', ')}.` : 'Open what?';
    },

    /** "command > file" / "command >> file": the output goes to the shared disk instead of the screen. */
    redirect(result, mode, name) {
        if (typeof result !== 'string' || result === '__CLEAR__') return result;
        const target = TerminalApp.resolve(name, { parent: true });
        if (!target) return 'The system cannot find the path specified.';
        if (VFS.isDir(target.node)) return 'Access is denied.';
        if (target.node && !VFS.isText(target.node)) return `Access is denied - ${leaf(target.parts)} is not a text file.`;
        const before = mode === '>>' ? target.node?.text ?? '' : '';
        const glue = before && !before.endsWith('\n') ? '\n' : '';
        return VFS.write(target.parts, `${before}${glue}${result}\n`) ? '' : 'Cannot write to the file.';
    },

    executeCommand(cmdLine, output, input) {
        const redirect = /\s*(>>?)\s*([^>]+?)\s*$/.exec(cmdLine);
        const commandText = redirect ? cmdLine.slice(0, redirect.index) : cmdLine;
        const parts = commandText.trim().replace(/^(cd)(?=[.\\/])/i, '$1 ').split(/\s+/);
        const cmd = ALIASES[parts[0].toLowerCase()] || parts[0].toLowerCase();
        const args = parts.slice(1);

        // Add command to output
        const prompt = document.querySelector('#window-terminal .terminal-prompt');
        TerminalApp.addLine(output, `${prompt?.textContent || 'C:\\>'} ${cmdLine}`);

        // Execute command
        const handler = TerminalApp.commands[cmd];
        let result;

        if (handler) {
            result = handler(TerminalApp, args);
            if (result instanceof Promise) {
                result.then(text => TerminalApp.showResult(output, text, prompt));
                return;
            }
            if (redirect) result = TerminalApp.redirect(result, redirect[1], redirect[2]);
        } else if (cmd) {
            result = `'${cmd}' is not recognized as an internal or external command.`;
        }

        TerminalApp.showResult(output, result, prompt);
    },

    showResult(output, result, prompt) {
        if (result === '__CLEAR__') {
            output.innerHTML = '';
        } else if (result) {
            result.split('\n').forEach(line => {
                TerminalApp.addLine(output, line);
            });
        }

        // Update prompt
        if (prompt) {
            prompt.textContent = `${pathOf(TerminalApp.cwd())}>`;
        }

        // Scroll to bottom
        output.scrollTop = output.scrollHeight;
    },

    addLine(output, text) {
        const line = document.createElement('span');
        line.className = 'terminal-line';
        line.textContent = text;
        output.appendChild(line);
    }
};

export default TerminalApp;
