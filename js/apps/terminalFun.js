/**
 * Terminal commands that take their time: ping, tracert, hack, matrix, sl, telnet...
 * Each one gets a job (see TerminalApp.startJob): job.print() writes a line as it goes,
 * job.sleep() waits and throws CANCEL when Ctrl+C stops the command, job.read() asks
 * for a line of input and job.overlay() covers the terminal for full-screen animations.
 * Plus the instant ones that belong with them: ipconfig, tasklist, taskkill.
 */

import { WindowManager } from '../managers/WindowManager.js?v=20';
import { SoundManager } from '../managers/SoundManager.js?v=20';
import { VFS } from '../vfs.js?v=20';
import { NotepadApp } from './NotepadApp.js?v=20';
import { Profile } from '../config.js?v=20';

export const CANCEL = Symbol('cancel');

const random = max => Math.floor(Math.random() * max);
const pick = list => list[random(list.length)];
const shuffle = list => list.map(item => [Math.random(), item]).sort(([a], [b]) => a - b).map(([, item]) => item);
const hash = text => [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const stopped = err => { if (err !== CANCEL) throw err; return true; };

// ---------- ping / tracert ----------

// Made-up addresses: the terminal never shows where anything really lives
const fakeIp = name => {
    const h = hash(name);
    const first = 23 + (h % 190);
    return `${first === 127 ? 128 : first}.${(h >>> 8) & 255}.${(h >>> 16) & 255}.${1 + ((h >>> 24) % 254)}`;
};

const siteHost = (() => { try { return new URL(Profile.siteUrl).hostname.replace(/^www\./, ''); } catch { return ''; } })();
const OWN_HOSTS = siteHost ? [siteHost, `www.${siteHost}`] : [];

/** "example.com", "8.8.8.8", "localhost" -> what ping and tracert need, or null for a bad name. */
const lookup = host => {
    const name = host.toLowerCase();
    const ipv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(name);
    if (ipv4 && name.split('.').some(octet => Number(octet) > 255)) return null;
    if (!ipv4 && !/^(localhost|[a-z0-9-]+(\.[a-z0-9-]+)+)$/.test(name)) return null;
    const local = name === 'localhost' || name.startsWith('127.');
    const own = !local && (OWN_HOSTS.includes(name) || name === location.hostname);
    return {
        name, ipv4, local, own,
        ip: local ? (ipv4 ? name : '127.0.0.1') : ipv4 ? name : fakeIp(name),
        ttl: local ? 128 : own ? 56 : 44 + (hash(name) % 12),
        base: 9 + (hash(name) % 70)
    };
};

const notFound = host => `Ping request could not find host ${host}. Please check the name and try again.`;

/** Round trip in ms, null when it timed out. Our own server is measured for real. */
async function probe(target, job) {
    if (target.local) {
        await job.sleep(1);
        return 0;
    }
    if (target.own) {
        const start = performance.now();
        try {
            await fetch(`${new URL('os.html', location.href)}?ping=${Date.now()}`, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(4000) });
        } catch {
            job.check();
            return null;
        }
        job.check();
        return Math.max(1, Math.round(performance.now() - start));
    }
    if (Math.random() < 0.04) {
        await job.sleep(1500);
        return null;
    }
    const time = Math.max(1, Math.round(target.base * (0.8 + Math.random() * 0.5)));
    await job.sleep(time);
    return time;
}

const ms = time => (time < 1 ? '<1ms' : `=${time}ms`);

async function ping(app, args, job) {
    let forever = false, count = 4, host = '';
    for (let i = 0; i < args.length; i++) {
        const arg = args[i].toLowerCase();
        if (arg === '-t' || arg === '/t') forever = true;
        else if (arg === '-n' || arg === '/n') count = Math.max(1, Math.min(100, parseInt(args[++i], 10) || 4));
        else host = args[i];
    }
    if (!host) return 'Usage: ping [-t] [-n count] target_name\n\n  -t        Ping the target until stopped with Ctrl+C.\n  -n count  Number of echo requests to send.';
    if (host.toLowerCase() === 'girlfriend') {
        job.print('Pinging girlfriend with 32 bytes of data:');
        await job.sleep(1200);
        return 'Request timed out. She is probably busy being awesome.';
    }
    const target = lookup(host);
    if (!target) return notFound(host);

    job.print(`\nPinging ${target.ipv4 ? target.ip : `${target.name} [${target.ip}]`} with 32 bytes of data:`);
    const times = [];
    let sent = 0, cancelled = false;
    try {
        while (forever || sent < count) {
            const started = performance.now();
            const time = await probe(target, job);
            sent++;
            if (time === null) {
                job.print('Request timed out.');
            } else {
                times.push(time);
                job.print(`Reply from ${target.ip}: bytes=32 time${ms(time)} TTL=${target.ttl}`);
            }
            if (forever || sent < count) await job.sleep(Math.max(0, 1000 - (performance.now() - started)));
        }
    } catch (err) {
        cancelled = stopped(err);
    }

    const lost = sent - times.length;
    const lines = ['', `Ping statistics for ${target.ip}:`,
        `    Packets: Sent = ${sent}, Received = ${times.length}, Lost = ${lost} (${sent ? Math.round(lost / sent * 100) : 0}% loss),`];
    if (times.length) {
        const average = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
        lines.push('Approximate round trip times in milli-seconds:',
            `    Minimum = ${Math.min(...times)}ms, Maximum = ${Math.max(...times)}ms, Average = ${average}ms`);
    }
    if (cancelled) lines.push('Control-C', '^C');
    return lines.join('\n');
}

const OWN_ROUTE = [
    'router-w-piwnicy.lan [192.168.1.1]',
    null,
    'kabel-pod-dywanem.isp.pl',
    'centrala.chmura.pl',
    'gdzies-nad-baltykiem.backbone.eu',
    'golab-pocztowy.relay',
    'tunel-przez-chmurke.cdn',
    'raspberry-pi.pod-biurkiem'
];

const DETOURS = [
    'chomik-w-kolowrotku.dc', 'serwerownia-u-babci.pl', 'switch-pod-zlewem.lan',
    'satelita-z-tektury.space', 'kabel-od-zelazka.net', 'rekin-gryzie-kabel.atlantic',
    'dial-up-56k.retro', 'stary-modem-piszczy.isp'
];

async function tracert(app, args, job) {
    const host = args.find(arg => !/^[-/]/.test(arg));
    if (!host) return 'Usage: tracert target_name';
    const target = lookup(host);
    if (!target) return `Unable to resolve target system name ${host}.`;

    const destination = target.ipv4 ? target.ip : `${target.name} [${target.ip}]`;
    job.print(`\nTracing route to ${destination}`);
    job.print('over a maximum of 30 hops:\n');
    const route = target.local ? []
        : target.own ? OWN_ROUTE
        : [OWN_ROUTE[0], null, OWN_ROUTE[2], ...shuffle(DETOURS).slice(0, 2 + random(3))];
    const hops = [...route, destination];

    try {
        for (const [index, hop] of hops.entries()) {
            const line = job.print(`${String(index + 1).padStart(3)}`);
            for (let i = 0; i < 3; i++) {
                if (hop === null) {
                    await job.sleep(700);
                    line.textContent += '     *   ';
                } else {
                    const time = target.local ? 0 : Math.max(1, Math.round((index + 1) * target.base / hops.length * (0.8 + Math.random() * 0.5)));
                    await job.sleep(120 + time);
                    line.textContent += `${(time < 1 ? '<1' : String(time)).padStart(6)} ms`;
                }
            }
            line.textContent += hop === null ? '  Request timed out.' : `  ${hop}`;
        }
    } catch (err) {
        stopped(err);
        return '^C';
    }
    return '\nTrace complete.';
}

const ipconfig = (app, args) => {
    const all = args.some(arg => arg.toLowerCase() === '/all');
    const lines = ['', 'PortfolioOS IP Configuration', ''];
    if (all) lines.push(
        '   Host Name . . . . . . . . . . . . : PORTFOLIO',
        '   Primary Dns Suffix  . . . . . . . : pod-biurkiem',
        '   Node Type . . . . . . . . . . . . : Hybrid',
        '   IP Routing Enabled. . . . . . . . : No',
        '   WINS Proxy Enabled. . . . . . . . : No', '');
    lines.push('Ethernet adapter Dial-Up Modem 56k:', '');
    if (all) lines.push(
        '   Description . . . . . . . . . . . : PortfolioOS Screaming Modem 56k',
        '   Physical Address. . . . . . . . . : DE-AD-BE-EF-CA-FE',
        '   DHCP Enabled. . . . . . . . . . . : Yes');
    lines.push(
        '   Connection-specific DNS Suffix  . : pod-biurkiem',
        '   IP Address. . . . . . . . . . . . : 192.168.1.42',
        '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
        '   Default Gateway . . . . . . . . . : 192.168.1.1');
    if (all) lines.push(
        '   DNS Servers . . . . . . . . . . . : 192.168.1.1',
        `   Lease Obtained. . . . . . . . . . : ${new Date().toLocaleDateString('en-US')} 12:00 AM`,
        '   Lease Expires . . . . . . . . . . : when the coffee runs out');
    lines.push('', 'Ethernet adapter Bluetooth:', '', '   Media State . . . . . . . . . . . : Media disconnected (it never worked anyway)');
    return lines.join('\n');
};

// ---------- tasklist / taskkill ----------

const SYSTEM_TASKS = [
    { image: 'System Idle Process', pid: 0, memory: 16, reason: 'It is busy doing nothing.' },
    { image: 'System', pid: 4, memory: 212, reason: 'Access is denied.' },
    { image: 'csrss.exe', pid: 420, memory: 2048, reason: 'This is a critical system process.' },
    { image: 'winlogon.exe', pid: 512, memory: 1024, reason: 'This is a critical system process.' },
    { image: 'explorer.exe', pid: 1337, memory: 16384, reason: 'Without explorer.exe there would be no desktop to come back to.' },
    { image: 'svchost.exe', pid: 666, memory: 4096, reason: 'Access is denied.' }
];

/** Every open PortfolioOS window as a process: notepad-1712345 -> notepad.exe. */
const windowTasks = () => [...WindowManager.windows.keys()].map(id => ({
    id, image: `${id.replace(/-\d+$/, '')}.exe`, pid: 2000 + (hash(id) % 7000), memory: 1024 + (hash(`${id}mem`) % 30000)
}));

const tasklist = () => {
    const kb = memory => `${memory.toLocaleString('en-US')} K`;
    return ['', `${'Image Name'.padEnd(25)} ${'PID'.padStart(8)} ${'Mem Usage'.padStart(12)}`,
        `${'='.repeat(25)} ${'='.repeat(8)} ${'='.repeat(12)}`,
        ...[...SYSTEM_TASKS, ...windowTasks()].map(task => `${task.image.padEnd(25)} ${String(task.pid).padStart(8)} ${kb(task.memory).padStart(12)}`)
    ].join('\n');
};

const taskkill = (app, args) => {
    let image = '', pid = null, force = false;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i].toLowerCase();
        if (arg === '/f' || arg === '-f') force = true;
        else if (arg === '/im' || arg === '-im') image = (args[++i] || '').toLowerCase();
        else if (arg === '/pid' || arg === '-pid') pid = Number(args[++i]);
    }
    if (!image && pid === null) return 'ERROR: Invalid syntax. Neither /PID nor /IM were specified.\nUsage: taskkill /im notepad.exe   or   taskkill /pid 1234   (/f forces)';
    if (image && !image.includes('.') && !image.includes('*')) image += '.exe';
    const matches = image ? (task => wildcardMatch(image, task.image.toLowerCase())) : (task => task.pid === pid);
    const label = image || String(pid);

    const system = SYSTEM_TASKS.filter(matches);
    const windows = windowTasks().filter(matches);
    if (!system.length && !windows.length) return `ERROR: The process "${label}" not found.`;

    const lines = system.map(task => `ERROR: The process "${task.image}" with PID ${task.pid} could not be terminated.\nReason: ${task.reason}`);
    windows.forEach(task => {
        lines.push(force
            ? `SUCCESS: The process "${task.image}" with PID ${task.pid} has been terminated.`
            : `SUCCESS: Sent termination signal to the process "${task.image}" with PID ${task.pid}.`);
        // The terminal closing itself waits until its own answer is on screen
        setTimeout(() => WindowManager.closeWindow(task.id), task.id === 'terminal' ? 400 : 0);
    });
    return lines.join('\n');
};

const wildcardMatch = (pattern, text) => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`).test(text);

// ---------- hack ----------

const hexByte = () => random(256).toString(16).toUpperCase().padStart(2, '0');

async function progress(job, label, cls = 'ok') {
    const line = job.print('');
    for (let step = 0; step <= 20; step++) {
        line.textContent = `${label.padEnd(24)}[${'#'.repeat(step)}${'.'.repeat(20 - step)}] ${String(step * 5).padStart(3)}%`;
        await job.sleep(25 + random(70));
    }
    line.textContent += '  OK';
    line.classList.add(`t-${cls}`);
}

async function hackMovie(job, target) {
    job.print(`Initializing h4x0r toolkit v0.1 against ${target}...`, 'dim');
    await job.sleep(400);
    for (let i = 0; i < 14; i++) {
        const bytes = Array.from({ length: 8 }, hexByte);
        const text = bytes.map(byte => {
            const code = parseInt(byte, 16);
            return code > 32 && code < 127 ? String.fromCharCode(code) : '.';
        }).join('');
        job.print(`0x${(0x3F00 + i * 8).toString(16).toUpperCase()}  ${bytes.join(' ')}  |${text}|`, 'dim');
        await job.sleep(35);
    }
    await progress(job, 'Bypassing firewall');
    await progress(job, 'Downloading more RAM');
    await progress(job, 'Injecting coffee.dll');

    const line = job.print('');
    const secret = 'hunter2';
    for (let i = 0; i <= secret.length * 3; i++) {
        const known = Math.floor(i / 3);
        line.textContent = `Cracking admin password: ${secret.slice(0, known)}${Array.from({ length: secret.length - known }, () => String.fromCharCode(33 + random(90))).join('')}`;
        await job.sleep(60);
    }
    job.print('(it is always hunter2)', 'dim');
    await job.sleep(500);

    SoundManager.play('chord');
    ['', '  ╔════════════════════════╗', '  ║    ACCESS  GRANTED     ║', '  ╚════════════════════════╝', '']
        .forEach(text => job.print(text, 'ok'));
    await job.sleep(900);
    WindowManager.createWindow('portfolio');
    return 'Opening classified dossier: Portfolio.exe\nToo easy? Try: hack mainframe';
}

const HACK_WORDS = ['PIXEL', 'LOGIN', 'DEBUG', 'ARRAY', 'CACHE', 'MOUSE', 'CLICK', 'SHELL', 'PATCH', 'QUERY',
    'STACK', 'TOKEN', 'LINUX', 'MACRO', 'BYTES', 'CODER', 'FRAME', 'GHOST', 'FLASH', 'PROXY', 'ROUTE',
    'SCOPE', 'ASYNC', 'MODEM', 'DRIVE', 'CLASS', 'MERGE', 'BLOCK', 'PARSE', 'FETCH'];
const JUNK = '!@#$%^&*()-_=+[]{}<>,.;:\'"/\\|?~`';

const SECRET = `TOP SECRET - PORTFOLIO INDUSTRIES
=================================
You hacked the mainframe. Everything we tried to hide:

 * doom             - yes, that one
 * bios             - reboot into the setup screen
 * matrix, sl       - press any key to get out
 * telnet towel.blinkenlights.nl
 * konami           - try the code on the desktop
 * xyzzy            - say it three times
 * party, cowsay, fortune, rickroll, ping girlfriend
 * Close Portfolio.exe three times in a row. Go on.
 * The Recycle Bin is hungry.

Achievement unlocked: L33T H4X0R
`;

/** A word-guessing lock in the spirit of old terminal hacking minigames. */
async function hackMainframe(job) {
    const words = shuffle(HACK_WORDS).slice(0, 10);
    const password = pick(words);
    const ROWS = 14, WIDTH = 12, total = 2 * ROWS * WIDTH;
    const wall = Array.from({ length: total }, () => pick(JUNK));
    const slot = Math.floor(total / words.length);
    words.forEach((word, index) => {
        // Each word stays on one row so it reads in one piece
        let at;
        do at = index * slot + random(slot - word.length);
        while (at % WIDTH + word.length > WIDTH);
        [...word].forEach((char, i) => { wall[at + i] = char; });
    });
    const start = 0xF000 + random(0x40) * 16;
    const address = offset => `0x${(start + offset).toString(16).toUpperCase()}`;

    job.print('PORTFOLIO INDUSTRIES (TM) TERMLINK PROTOCOL', 'ok');
    job.print('ENTER PASSWORD NOW', 'ok');
    job.print('');
    for (let row = 0; row < ROWS; row++) {
        const left = wall.slice(row * WIDTH, (row + 1) * WIDTH).join('');
        const right = wall.slice((ROWS + row) * WIDTH, (ROWS + row + 1) * WIDTH).join('');
        job.print(`${address(row * WIDTH)} ${left}   ${address((ROWS + row) * WIDTH)} ${right}`);
        await job.sleep(30);
    }

    let attempts = 4;
    const showAttempts = () => job.print(`\n${attempts} ATTEMPT(S) LEFT: ${'■ '.repeat(attempts)}`, attempts === 1 ? 'err' : 'ok');
    showAttempts();
    while (attempts > 0) {
        const guess = (await job.read('>')).trim().toUpperCase();
        if (!guess) continue;
        if (guess === 'EXIT' || guess === 'QUIT') return 'Connection terminated.';
        if (!words.includes(guess)) {
            job.print('>Entry not found. Pick a word from the dump.');
            continue;
        }
        if (guess === password) {
            job.print('>Exact match!', 'ok');
            job.print('>Please wait while system is accessed.', 'ok');
            await job.sleep(900);
            SoundManager.play('chord');
            const file = [...VFS.home, 'top_secret.txt'];
            if (VFS.write(file, SECRET)) {
                NotepadApp.openPath(file);
                return `ACCESS GRANTED. Decrypted ${VFS.toString(file)}`;
            }
            return `ACCESS GRANTED.\n\n${SECRET}`;
        }
        attempts--;
        const likeness = [...guess].filter((char, i) => char === password[i]).length;
        job.print('>Entry denied.');
        job.print(`>Likeness=${likeness}`);
        if (attempts) showAttempts();
        if (attempts === 1) job.print('!!! WARNING: LOCKOUT IMMINENT !!!', 'err');
    }
    job.print('');
    job.print('TERMINAL LOCKED', 'err');
    job.print('PLEASE CONTACT AN ADMINISTRATOR', 'err');
    return `(The password was ${password}.)`;
}

async function hack(app, args, job) {
    const target = args.join(' ').toLowerCase();
    if (target === 'nasa') return 'Connecting to NASA... ACCESS DENIED. Try building something first.';
    try {
        return target === 'mainframe' ? await hackMainframe(job) : await hackMovie(job, target || 'the mainframe');
    } catch (err) {
        stopped(err);
        return '^C\nHack aborted. The FBI van drives away.';
    }
}

// ---------- full-screen animations ----------

const RAIN = '0123456789ABCDEFXZ$+-*/=%#@:;|';

async function matrix(app, args, job) {
    const screen = job.overlay('matrix');
    const { cols, rows } = screen;
    const age = Array.from({ length: rows }, () => new Array(cols).fill(99));
    const glyph = Array.from({ length: rows }, () => Array.from({ length: cols }, () => pick(RAIN)));
    const drops = Array.from({ length: cols }, () => -random(rows * 2));
    const shade = value => (value === 0 ? 'h' : value < 4 ? 'b' : value < 11 ? 'g' : value < 17 ? 'd' : '');
    SoundManager.play('chord');
    try {
        for (;;) {
            age.forEach(row => row.forEach((value, x) => { row[x] = value + 1; }));
            drops.forEach((y, x) => {
                if (y >= 0 && y < rows) {
                    age[y][x] = 0;
                    glyph[y][x] = pick(RAIN);
                }
                drops[x] = y > rows + random(rows) ? -random(rows) : y + 1;
            });
            for (let n = 0; n < cols / 4; n++) glyph[random(rows)][random(cols)] = pick(RAIN);
            screen.el.innerHTML = age.map((row, y) => {
                let html = '', open = null;
                row.forEach((value, x) => {
                    const cls = shade(value);
                    if (cls !== open) {
                        if (open) html += '</span>';
                        if (cls) html += `<span class="m${cls}">`;
                        open = cls || null;
                    }
                    html += cls ? glyph[y][x] : ' ';
                });
                return open ? `${html}</span>` : html;
            }).join('\n');
            await job.sleep(60);
        }
    } catch (err) {
        stopped(err);
    } finally {
        screen.el.remove();
    }
    return 'Wake up, Neo...';
}

const TRAIN = [
    ['        (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O',
     '      (@@@)  (  )  (@@)   ()   (@)    @     O    @     O      @'],
    ['     (@)',
     '    (  )'],
    ['    _||___________     _______________    _______________'],
    ['   |  ___   ____  |   | PORTFOLIO-OS  |  |   v1.3 ~ PL   |'],
    ['  _| |___| |    | |___|               |__|               |'],
    [' |___________________|=|_______________|==|_______________|'],
    ['   (O)(O)(O)  (O)(O)     (O)     (O)        (O)     (O)',
     '   (o)(o)(o)  (o)(o)     (o)     (o)        (o)     (o)']
];

async function sl(app, args, job) {
    const screen = job.overlay('sl');
    const width = Math.max(...TRAIN.flat().map(line => line.length));
    const top = Math.max(0, Math.floor((screen.rows - TRAIN.length) / 2));
    try {
        for (let x = screen.cols; x > -width; x--) {
            const frame = Math.floor(x / 2) & 1;
            const lines = TRAIN.map(frames => {
                const line = frames[frame % frames.length];
                return (x >= 0 ? ' '.repeat(x) + line : line.slice(-x)).slice(0, screen.cols);
            });
            screen.el.textContent = `${'\n'.repeat(top)}${lines.join('\n')}`;
            await job.sleep(35);
        }
    } catch (err) {
        stopped(err);
    } finally {
        screen.el.remove();
    }
    return '';
}

const CRAWL = `EPISODE IV
A NEW PORTFOLIO

Turmoil has engulfed the
job market. Armed with
vanilla JavaScript and a
Raspberry Pi hidden under
a desk, one lone developer
sets out to build an
operating system nobody
asked for....

Meanwhile, the sinister
Empire of Frameworks
prepares its ultimate
weapon: a 400 MB
node_modules folder,
powerful enough to slow
down an entire laptop....

Our hero has no build step,
no bundler and no fear.
Only a terminal, a fake
modem and an unhealthy
love for Windows 95....`.split('\n');

async function telnet(app, args, job) {
    const host = (args[0] || '').toLowerCase();
    if (!host) return 'Usage: telnet host [port]';
    if (host !== 'towel.blinkenlights.nl') {
        job.print(`Connecting To ${host}...`);
        await job.sleep(1500).catch(stopped);
        return `Could not open connection to the host, on port ${args[1] || 23}: Connect failed`;
    }
    job.print(`Connecting To ${host}...`);
    try {
        await job.sleep(900);
        const screen = job.overlay('crawl');
        const center = line => ' '.repeat(Math.max(0, Math.floor((screen.cols - line.length) / 2))) + line;
        // The text gets its own box so tilting it leaves the black backdrop in place
        const text = document.createElement('div');
        screen.el.append(text);
        try {
            screen.el.classList.add('intro');
            text.textContent = `${'\n'.repeat(Math.floor(screen.rows / 2) - 1)}${center('A long time ago, in a browser far,')}\n${center('far away....')}`;
            await job.sleep(3200);
            screen.el.classList.remove('intro');
            screen.el.classList.add('tilt');
            const padded = [...new Array(screen.rows).fill(''), ...CRAWL, ...new Array(screen.rows).fill('')];
            for (let offset = 0; offset <= padded.length - screen.rows; offset++) {
                text.textContent = padded.slice(offset, offset + screen.rows).map(center).join('\n');
                await job.sleep(380);
            }
        } finally {
            screen.el.remove();
        }
    } catch (err) {
        stopped(err);
        return '^C';
    }
    return '\nConnection to host lost.';
}

export const funCommands = { ping, tracert, ipconfig, tasklist, taskkill, hack, matrix, sl, telnet };
