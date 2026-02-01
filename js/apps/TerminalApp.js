/**
 * Terminal App - Fake DOS prompt with commands
 */

import { Icons } from '../icons.js';
import { WindowManager } from '../managers/WindowManager.js';
import { SoundManager } from '../managers/SoundManager.js';

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
  dir       - List directory contents
  cls       - Clear screen
  echo      - Print text
  whoami    - Display current user
  date      - Show current date
  time      - Show current time
  ver       - Show OS version
  cd        - Change directory
  type      - Display file contents
  color     - Change text color
  matrix    - ???
  exit      - Close terminal`,

        dir: (app) => `
 Volume in drive C is PORTFOLIO
 Directory of ${app.currentDir}

.              <DIR>         01-31-26  12:00a
..             <DIR>         01-31-26  12:00a
PROJECTS       <DIR>         01-31-26  12:00a
SKILLS         <DIR>         01-31-26  12:00a
README.TXT          1,337    01-31-26  12:00a
RESUME.PDF         42,069    01-31-26  12:00a
SECRET.DAT            ???    ??-??-??  ??:??a
        3 file(s)         43,406 bytes
        3 dir(s)     640,000 bytes free`,

        cls: () => '__CLEAR__',
        
        echo: (app, args) => args.join(' ') || '',
        
        whoami: () => 'PORTFOLIO\\Developer',
        
        date: () => `Current date is ${new Date().toLocaleDateString('pl-PL')}`,
        
        time: () => `Current time is ${new Date().toLocaleTimeString('pl-PL')}`,
        
        ver: () => `
Portfolio OS [Version 1.0.2026]
(c) 2026 Portfolio Corporation. All rights reserved.`,

        cd: (app, args) => {
            if (!args[0]) return app.currentDir;
            if (args[0] === '..') {
                app.currentDir = 'C:\\';
            } else if (args[0].toUpperCase() === 'PROJECTS') {
                app.currentDir = 'C:\\PORTFOLIO\\PROJECTS';
            } else if (args[0].toUpperCase() === 'SKILLS') {
                app.currentDir = 'C:\\PORTFOLIO\\SKILLS';
            } else {
                return `The system cannot find the path specified.`;
            }
            return '';
        },

        type: (app, args) => {
            const file = (args[0] || '').toUpperCase();
            if (file === 'README.TXT') {
                return `Welcome to my Portfolio OS!
I'm a Full-Stack Developer passionate about creating
amazing web experiences. Check out my projects!`;
            } else if (file === 'SECRET.DAT') {
                return `ACCESS DENIED - Try the Konami Code! ;)`;
            }
            return `File not found - ${args[0] || '(no file specified)'}`;
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

        // Easter eggs
        sudo: () => 'Nice try, but this is Windows! 😄',
        rm: () => 'This is not Linux! Use DEL instead... just kidding, don\'t delete anything!',
        hack: () => 'HACKING THE MAINFRAME... just kidding, that\'s not how it works! 😂',
        hello: () => 'Hello there! 👋',
        coffee: () => '☕ Brewing coffee... Error: Coffee machine not found!',
        konami: () => '↑↑↓↓←→←→BA - Try it on the desktop!',
        
        // More Easter eggs
        rickroll: () => {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
            return 'Never gonna give you up... 🎵';
        },
        
        answer: () => '42 - The answer to life, the universe, and everything.',
        
        ping: () => `Pinging localhost [127.0.0.1] with 32 bytes of data:
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128

Ping statistics for 127.0.0.1:
    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)`,
        
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

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                if (cmd) {
                    TerminalApp.history.push(cmd);
                    TerminalApp.historyIndex = TerminalApp.history.length;
                    TerminalApp.executeCommand(cmd, output, input);
                }
                input.value = '';
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

    executeCommand(cmdLine, output, input) {
        const parts = cmdLine.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Add command to output
        const prompt = document.querySelector('#window-terminal .terminal-prompt');
        TerminalApp.addLine(output, `${prompt?.textContent || 'C:\\>'} ${cmdLine}`);

        // Execute command
        const handler = TerminalApp.commands[cmd];
        let result;
        
        if (handler) {
            result = handler(TerminalApp, args);
        } else if (cmd) {
            result = `'${cmd}' is not recognized as an internal or external command.`;
        }

        // Handle result
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
