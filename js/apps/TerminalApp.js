/**
 * Terminal App - Fake DOS prompt with commands
 */

import { Icons } from '../icons.js?v=15';
import { WindowManager } from '../managers/WindowManager.js?v=15';
import { SoundManager } from '../managers/SoundManager.js?v=15';
import { Profile, githubUrl } from '../config.js?v=15';

const SEP = '\\';
const ROOT = `C:${SEP}`;
const FILE_DATE = '01-31-26  12:00a';

const dosName = name => name.toUpperCase().replace(/[^A-Z0-9._-]+/g, '_');
const file = (size, content, extra = {}) => ({ type: 'file', size, content, ...extra });
const folder = children => ({ type: 'dir', children });

/** Small virtual disk built from the profile, so cd/dir/type/tree agree with each other. */
function buildDisk() {
    const projects = {};
    Profile.projects.forEach(project => {
        const text = [project.description, project.tech || project.language, project.url].filter(Boolean).join('\n');
        projects[`${dosName(project.name)}.URL`] = file(text.length, text, { url: project.url });
    });
    const skills = {};
    Profile.skills.forEach(skill => {
        skills[`${dosName(skill)}.SKL`] = file(64, `Skill: ${skill}`);
    });
    return folder({
        PORTFOLIO: folder({
            PROJECTS: folder(projects),
            SKILLS: folder(skills),
            'README.TXT': file(1337, `${Profile.name}\nPortfolio built as a desktop. Projects are in the PROJECTS folder,\ntype HELP to see what this terminal can do.`),
            'RESUME.PDF': file(42069, 'Binary file. Use Download CV in Portfolio.exe to get it.'),
            'SECRET.DAT': file(0, 'Nothing in here. The Konami code might do something though.', { hidden: true })
        }),
        WINDOWS: folder({ 'WIN.INI': file(512, '[windows]\nload=\nrun=') }),
        'AUTOEXEC.BAT': file(128, '@ECHO OFF\nPROMPT $p$g\nPATH C:\\PORTFOLIO'),
        'CONFIG.SYS': file(96, 'DEVICE=C:\\WINDOWS\\HIMEM.SYS\nFILES=40')
    });
}

const ALIASES = { ls: 'dir', cat: 'type', pwd: 'cd', man: 'help', '?': 'help' };

const splitPath = text => text.replace(/[/]/g, SEP).split(SEP).filter(Boolean);
const matchChild = (node, name) => Object.keys(node.children).find(key => key.toUpperCase() === name.toUpperCase());

/** Resolve a DOS-style path against the current directory. Returns { node, parts } or null. */
function resolvePath(disk, cwd, input) {
    const raw = (input || '').trim().replace(/[/]/g, SEP);
    const absolute = /^([a-z]:)?[\\]/i.test(raw) || /^[a-z]:$/i.test(raw);
    const parts = absolute ? [] : splitPath(cwd.slice(ROOT.length));
    for (const segment of splitPath(raw.replace(/^[a-z]:/i, ''))) {
        if (segment === '.') continue;
        if (segment === '..') parts.pop();
        else parts.push(segment);
    }
    let node = disk;
    const real = [];
    for (const segment of parts) {
        if (node.type !== 'dir') return null;
        const key = matchChild(node, segment);
        if (!key) return null;
        node = node.children[key];
        real.push(key);
    }
    return { node, parts: real };
}

const pathOf = parts => ROOT + parts.join(SEP);
const pad = (text, width) => String(text).padEnd(width, ' ');

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
    currentDir: 'C:\\PORTFOLIO',

    commands: {
        help: () => `Available commands:
  help      - Show this help
  neofetch  - Display PortfolioOS system summary
  dir       - List directory contents
  cls       - Clear screen
  clear     - Clear screen
  history   - Show command history
  echo      - Print text
  open      - Open a project or application
  github    - Open the GitHub profile
  whoami    - Display current user
  date      - Show current date
  time      - Show current time
  ver       - Show OS version
  cd        - Change directory
  type      - Display file contents
  tree      - Show the folder tree
  color     - Change text color
  matrix    - ???
  bios      - Reboot into BIOS setup
  sudo      - Request administrator powers
  format c: - Pretend to format the drive
  ping girlfriend - Test your luck
  sl        - Steam locomotive
  fortune   - Print a random fortune
  exit      - Close terminal

Tips: Tab completes, Up/Down browse history, Ctrl+L clears, Ctrl+C cancels.
Aliases: ls = dir, cat = type, pwd = cd, man = help`,

        dir: (app, args) => {
            const target = app.resolve(args.find(arg => !arg.startsWith('-')) || '');
            if (!target) return 'File Not Found';
            if (target.node.type === 'file') {
                const name = target.parts[target.parts.length - 1];
                return `\n Directory of ${pathOf(target.parts.slice(0, -1))}\n\n${pad(name, 18)}${target.node.size.toLocaleString('en-US').padStart(10)}    ${FILE_DATE}`;
            }
            const entries = Object.entries(target.node.children);
            const byName = ([a], [b]) => a.localeCompare(b);
            const dirs = entries.filter(([, node]) => node.type === 'dir').sort(byName);
            const files = entries.filter(([, node]) => node.type === 'file').sort(byName);
            const lines = ['', ' Volume in drive C is PORTFOLIO', ` Directory of ${pathOf(target.parts)}`, ''];
            if (target.parts.length) {
                lines.push(`${pad('.', 18)}<DIR>         ${FILE_DATE}`, `${pad('..', 18)}<DIR>         ${FILE_DATE}`);
            }
            dirs.forEach(([name]) => lines.push(`${pad(name, 18)}<DIR>         ${FILE_DATE}`));
            files.forEach(([name, node]) => {
                const size = node.hidden ? '???' : node.size.toLocaleString('en-US');
                lines.push(`${pad(name, 18)}${size.padStart(10)}    ${node.hidden ? '??-??-??  ??:??a' : FILE_DATE}`);
            });
            const total = files.reduce((sum, [, node]) => sum + node.size, 0);
            lines.push(`${String(files.length).padStart(9)} file(s) ${total.toLocaleString('en-US').padStart(14)} bytes`);
            lines.push(`${String(dirs.length).padStart(9)} dir(s)  ${'640,000'.padStart(14)} bytes free`);
            return lines.join('\n');
        },

        tree: (app, args) => {
            const target = app.resolve(args.find(arg => !arg.startsWith('-')) || '');
            if (!target || target.node.type !== 'dir') return 'Invalid path';
            const lines = [pathOf(target.parts)];
            const walk = (node, prefix) => {
                const kids = node.children;
                const names = Object.keys(kids).filter(name => !kids[name].hidden)
                    .sort((a, b) => (kids[b].type === 'dir') - (kids[a].type === 'dir') || a.localeCompare(b));
                names.forEach((name, index) => {
                    const last = index === names.length - 1;
                    lines.push(`${prefix}${last ? '\\---' : '+---'}${name}`);
                    if (kids[name].type === 'dir') walk(kids[name], `${prefix}${last ? '    ' : '|   '}`);
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
            if (!args.length) return app.currentDir;
            const target = app.resolve(args.join(' '));
            if (!target) return 'The system cannot find the path specified.';
            if (target.node.type !== 'dir') return 'The directory name is invalid.';
            app.currentDir = pathOf(target.parts);
            return '';
        },

        type: (app, args) => {
            if (!args.length) return 'The syntax of the command is incorrect.';
            const target = app.resolve(args.join(' '));
            if (!target) return `File not found - ${args.join(' ')}`;
            if (target.node.type === 'dir') return 'Access is denied.';
            return target.node.content;
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
                const { playDoomIntro } = await import('../doomIntro.js?v=15');
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
        konami: () => '↑↑↓↓←→←→BA - Try it on the desktop!',
        
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
                    <span class="terminal-prompt">${this.currentDir}&gt;</span>
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

    resolve(path) {
        return resolvePath(buildDisk(), TerminalApp.currentDir, path);
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
        if (base && base.node.type === 'dir' && ['cd', 'dir', 'ls', 'type', 'cat', 'tree', 'open'].includes(cmd)) {
            options = Object.entries(base.node.children)
                .filter(([name, node]) => !node.hidden && name.toUpperCase().startsWith(namePart.toUpperCase()) && (cmd !== 'cd' || node.type === 'dir'))
                .map(([name, node]) => name + (node.type === 'dir' ? SEP : ''));
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
        if (found?.node.type === 'file' && found.node.url) {
            window.open(found.node.url, '_blank', 'noopener,noreferrer');
            return `Opening ${found.node.url}...`;
        }
        if (links[normalized]) {
            window.open(links[normalized], '_blank', 'noopener,noreferrer');
            return `Opening ${links[normalized]}...`;
        }
        if (apps[normalized]) {
            WindowManager.createWindow(apps[normalized]);
            return `Opening ${normalized}...`;
        }
        return normalized ? `Cannot open '${target}'. Try: ${[...Object.keys(links), 'projects'].map(name => `open ${name}`).join(', ')}.` : 'Open what?';
    },

    executeCommand(cmdLine, output, input) {
        const parts = cmdLine.trim().replace(/^(cd)(?=[.\\/])/i, '$1 ').split(/\s+/);
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
            prompt.textContent = `${TerminalApp.currentDir}>`;
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
