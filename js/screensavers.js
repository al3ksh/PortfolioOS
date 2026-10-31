/**
 * Screen savers drawn on a full-screen canvas.
 * Each saver has init(ctx, width, height) and draw(ctx, width, height).
 */

import { Profile } from './config.js?v=16';

const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const random = (min, max) => min + Math.random() * (max - min);

function clear(ctx, width, height) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
}

const matrix = {
    label: 'Matrix',
    fontSize: 16,
    init(ctx, width, height) {
        clear(ctx, width, height);
        this.columns = Array.from({ length: Math.floor(width / this.fontSize) }, () => ({
            y: random(-100, 0),
            speed: random(0.5, 1)
        }));
    },
    draw(ctx, width, height) {
        const size = this.fontSize;
        const pick = () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = `${size}px monospace`;
        this.columns.forEach((column, index) => {
            const x = index * size;
            const y = column.y * size;
            ctx.fillStyle = '#FFF';
            ctx.fillText(pick(), x, y);
            for (let j = 1; j < 20; j++) {
                const trailY = y - j * size;
                if (trailY > 0) {
                    ctx.fillStyle = `rgba(0, 255, 70, ${1 - j / 20})`;
                    ctx.fillText(pick(), x, trailY);
                }
            }
            column.y += column.speed;
            if (y > height + 200) {
                column.y = random(-20, 0);
                column.speed = random(0.5, 1);
            }
        });
    }
};

const starfield = {
    label: 'Starfield',
    init(ctx, width, height) {
        clear(ctx, width, height);
        this.stars = Array.from({ length: 450 }, () => this.spawn(true));
    },
    spawn(anywhere = false) {
        return { x: random(-1, 1), y: random(-1, 1), z: anywhere ? random(0.05, 1) : 1, pz: null };
    },
    draw(ctx, width, height) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.max(width, height) * 0.5;
        ctx.lineCap = 'round';
        this.stars.forEach((star, index) => {
            star.pz = star.z;
            star.z -= 0.006;
            if (star.z <= 0.02) {
                this.stars[index] = this.spawn();
                return;
            }
            const x = cx + (star.x / star.z) * scale;
            const y = cy + (star.y / star.z) * scale;
            const px = cx + (star.x / star.pz) * scale;
            const py = cy + (star.y / star.pz) * scale;
            if (x < 0 || x > width || y < 0 || y > height) {
                this.stars[index] = this.spawn();
                return;
            }
            const brightness = Math.round(255 * (1 - star.z));
            ctx.strokeStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
            ctx.lineWidth = Math.max(0.6, 2.6 * (1 - star.z));
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(x, y);
            ctx.stroke();
        });
    }
};

// The PortfolioOS logo (mini desktop), as 16x16 pixel rectangles.
const LOGO_RECTS = [
    [1, 1, 14, 14, '#000'], [2, 2, 12, 10, '#008080'], [2, 12, 12, 2, '#C0C0C0'], [2, 12, 3, 2, '#808080'],
    [3, 3, 3, 2, '#FFFF80'], [3, 7, 2, 3, '#FFF'], [8, 4, 5, 5, '#C0C0C0'], [8, 4, 5, 1, '#000080']
];

function logoSprite(size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const unit = size / 16;
    LOGO_RECTS.forEach(([x, y, w, h, color]) => {
        ctx.fillStyle = color;
        ctx.fillRect(x * unit, y * unit, w * unit, h * unit);
    });
    return canvas;
}

const logos = {
    label: 'Flying logos',
    init(ctx, width, height) {
        clear(ctx, width, height);
        this.sprite = logoSprite(128);
        this.items = Array.from({ length: 36 }, () => this.spawn(true));
    },
    spawn(anywhere = false) {
        return { x: random(-1.2, 1.2), y: random(-1.2, 1.2), z: anywhere ? random(0.1, 1.5) : 1.5 };
    },
    draw(ctx, width, height) {
        clear(ctx, width, height);
        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height) * 0.45;
        ctx.imageSmoothingEnabled = false;
        this.items.sort((a, b) => b.z - a.z).forEach((item, index) => {
            item.z -= 0.004;
            if (item.z <= 0.06) {
                this.items[index] = this.spawn();
                return;
            }
            const size = 34 / item.z;
            const x = cx + (item.x / item.z) * scale - size / 2;
            const y = cy + (item.y / item.z) * scale - size / 2;
            ctx.globalAlpha = Math.min(1, (1.5 - item.z) * 1.4);
            ctx.drawImage(this.sprite, x, y, size, size);
        });
        ctx.globalAlpha = 1;
    }
};

const PIPE_COLORS = [[220, 40, 40], [40, 170, 60], [40, 90, 220], [230, 190, 30], [170, 60, 200], [30, 190, 200], [200, 200, 200]];
const DIRECTIONS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

const pipes = {
    label: '3D Pipes',
    size: [14, 10, 10],
    init(ctx, width, height) {
        clear(ctx, width, height);
        this.occupied = new Set();
        this.pipes = [];
        this.segments = 0;
        this.tick = 0;
        for (let i = 0; i < 3; i++) this.addPipe();
    },
    key: point => point.join(','),
    free(point) {
        return point.every((value, axis) => value >= 0 && value < this.size[axis]) && !this.occupied.has(this.key(point));
    },
    addPipe() {
        for (let attempt = 0; attempt < 30; attempt++) {
            const start = this.size.map(max => Math.floor(Math.random() * max));
            if (!this.free(start)) continue;
            this.occupied.add(this.key(start));
            this.pipes.push({ point: start, direction: null, color: PIPE_COLORS[Math.floor(Math.random() * PIPE_COLORS.length)], alive: true, fresh: true });
            return;
        }
    },
    project(point, width, height) {
        const [x, y, z] = point;
        const [sx, sy, sz] = this.size;
        const depth = 1 + (z / sz) * 1.4;
        const cell = Math.min(width / (sx + 1), height / (sy + 1));
        return {
            x: width / 2 + ((x - sx / 2 + 0.5) * cell) / depth,
            y: height / 2 + ((y - sy / 2 + 0.5) * cell) / depth,
            radius: (cell * 0.18) / depth
        };
    },
    shade([r, g, b], factor) {
        return `rgb(${Math.min(255, Math.round(r * factor))}, ${Math.min(255, Math.round(g * factor))}, ${Math.min(255, Math.round(b * factor))})`;
    },
    joint(ctx, point, color, width, height) {
        const p = this.project(point, width, height);
        const gradient = ctx.createRadialGradient(p.x - p.radius * 0.4, p.y - p.radius * 0.4, p.radius * 0.1, p.x, p.y, p.radius * 1.3);
        gradient.addColorStop(0, this.shade(color, 1.6));
        gradient.addColorStop(1, this.shade(color, 0.45));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
    },
    segment(ctx, from, to, color, width, height) {
        const a = this.project(from, width, height);
        const b = this.project(to, width, height);
        const radius = (a.radius + b.radius) / 2;
        ctx.lineCap = 'round';
        [[2.2, 0.45], [1.6, 0.8], [0.9, 1.15], [0.35, 1.7]].forEach(([thickness, light]) => {
            ctx.strokeStyle = this.shade(color, light);
            ctx.lineWidth = radius * thickness;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        });
    },
    draw(ctx, width, height) {
        if (++this.tick % 4) return;
        if (this.segments > 320) {
            this.init(ctx, width, height);
            return;
        }
        this.pipes.filter(pipe => pipe.alive).forEach((pipe) => {
            if (pipe.fresh) {
                this.joint(ctx, pipe.point, pipe.color, width, height);
                pipe.fresh = false;
            }
            const keepGoing = pipe.direction && Math.random() < 0.7;
            const options = keepGoing ? [pipe.direction] : DIRECTIONS.slice().sort(() => Math.random() - 0.5);
            const direction = options.find(dir => this.free(pipe.point.map((value, axis) => value + dir[axis])))
                ?? DIRECTIONS.find(dir => this.free(pipe.point.map((value, axis) => value + dir[axis])));
            if (!direction) {
                pipe.alive = false;
                this.addPipe();
                return;
            }
            const next = pipe.point.map((value, axis) => value + direction[axis]);
            if (pipe.direction && direction !== pipe.direction) this.joint(ctx, pipe.point, pipe.color, width, height);
            this.segment(ctx, pipe.point, next, pipe.color, width, height);
            this.occupied.add(this.key(next));
            pipe.point = next;
            pipe.direction = direction;
            this.segments++;
        });
        if (this.pipes.filter(pipe => pipe.alive).length < 3) this.addPipe();
    }
};

const mystify = {
    label: 'Mystify',
    init(ctx, width, height) {
        clear(ctx, width, height);
        this.shapes = [0, 1].map(index => ({
            hue: index * 180,
            points: Array.from({ length: 4 }, () => ({ x: random(0, width), y: random(0, height), vx: random(-3, 3) || 2, vy: random(-3, 3) || 2 })),
            trail: []
        }));
    },
    draw(ctx, width, height) {
        clear(ctx, width, height);
        this.shapes.forEach((shape) => {
            shape.points.forEach((point) => {
                point.x += point.vx;
                point.y += point.vy;
                if (point.x < 0 || point.x > width) point.vx *= -1;
                if (point.y < 0 || point.y > height) point.vy *= -1;
            });
            shape.hue = (shape.hue + 0.3) % 360;
            shape.trail.unshift(shape.points.map(point => ({ x: point.x, y: point.y })));
            shape.trail.length = Math.min(shape.trail.length, 40);
            shape.trail.forEach((points, index) => {
                if (index % 5) return;
                ctx.strokeStyle = `hsla(${shape.hue}, 90%, 60%, ${1 - index / 40})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                points.forEach((point, i) => (i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
                ctx.closePath();
                ctx.stroke();
            });
        });
    }
};

// Disk Defragmenter: every public GitHub repository is a file whose clusters
// (by repo size) are scattered over the disk and moved into place, newest push first.
const DEFRAG_COLORS = ['#0000A8', '#A80000', '#00A800', '#A800A8', '#A85400', '#00A8A8', '#5454FC', '#FC5454', '#54A854', '#FC54FC', '#545454', '#A8A800'];
const DEFRAG_CACHE = 'defragRepos';
let defragFiles = null;
let defragRequest = null;

function defragFallback() {
    return Profile.projects.map((project, index) => ({ name: project.name, size: 400 + index * 300 }));
}

function loadDefragFiles() {
    if (defragFiles || defragRequest) return;
    try {
        const cached = JSON.parse(sessionStorage.getItem(DEFRAG_CACHE) || 'null');
        if (Array.isArray(cached) && cached.length) {
            defragFiles = cached;
            return;
        }
    } catch { /* ignore broken cache */ }
    if (!Profile.githubSync || !Profile.contact.github) return;
    defragRequest = fetch(`https://api.github.com/users/${encodeURIComponent(Profile.contact.github)}/repos?per_page=100&sort=pushed`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(8000)
    })
        .then(response => (response.ok ? response.json() : Promise.reject(new Error(response.status))))
        .then((repos) => {
            const files = repos.filter(repo => !repo.fork).slice(0, DEFRAG_COLORS.length)
                .map(repo => ({ name: repo.name, size: repo.size || 1 }));
            if (!files.length) return;
            defragFiles = files;
            sessionStorage.setItem(DEFRAG_CACHE, JSON.stringify(files));
        })
        .catch(() => {})
        .finally(() => { defragRequest = null; });
}

const defrag = {
    label: 'Disk Defragmenter',
    init(ctx, width, height) {
        loadDefragFiles();
        this.font = getComputedStyle(document.body).fontFamily || 'sans-serif';
        this.files = (defragFiles || defragFallback()).slice(0, DEFRAG_COLORS.length);
        this.layout(width, height);
        this.fragment();
        this.paintAll(ctx, width, height);
    },
    layout(width, height) {
        const cellW = 10;
        const cellH = 13;
        const winW = Math.min(width - 40, Math.max(320, Math.round(width * 0.7)));
        const winH = Math.min(height - 40, Math.max(260, Math.round(height * 0.7)));
        // Shift the window a little on every pass so nothing burns in
        const x = Math.round((width - winW) / 2 + random(-1, 1) * Math.min(60, (width - winW) / 2));
        const y = Math.round((height - winH) / 2 + random(-1, 1) * Math.min(40, (height - winH) / 2));
        const legendH = 26 + Math.ceil(this.files.length / 3) * 16;
        const grid = { x: x + 14, y: y + 34, w: winW - 28, h: winH - 34 - legendH - 50 };
        this.cols = Math.max(1, Math.floor(grid.w / cellW));
        this.rows = Math.max(1, Math.floor(grid.h / cellH));
        grid.w = this.cols * cellW;
        grid.h = this.rows * cellH;
        grid.x = x + Math.round((winW - grid.w) / 2);
        Object.assign(this, { cellW, cellH, win: { x, y, w: winW, h: winH }, grid });
    },
    // Clusters per file grow with the square root of the repo size, filling about 55% of the disk
    fragment() {
        const total = this.cols * this.rows;
        const used = Math.floor(total * 0.55);
        const weights = this.files.map(file => Math.sqrt(file.size + 1));
        const sum = weights.reduce((a, b) => a + b, 0);
        const counts = weights.map(weight => Math.max(2, Math.round((weight / sum) * used)));
        this.target = [];
        counts.forEach((count, index) => { for (let i = 0; i < count && this.target.length < total; i++) this.target.push(index); });
        this.dataCount = this.target.length;
        while (this.target.length < total) this.target.push(-1);
        this.cells = this.target.slice();
        for (let i = this.cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cells[i], this.cells[j]] = [this.cells[j], this.cells[i]];
        }
        this.cursor = 0;
        this.moves = 0;
        this.reading = -1;
        this.writing = -1;
        this.doneAt = 0;
        this.current = '';
    },
    paintCell(ctx, index, color) {
        const { x, y } = this.grid;
        const cx = x + (index % this.cols) * this.cellW;
        const cy = y + Math.floor(index / this.cols) * this.cellH;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(cx, cy, this.cellW, this.cellH);
        const value = this.cells[index];
        if (value === -1 && !color) return;
        ctx.fillStyle = color || DEFRAG_COLORS[value];
        ctx.fillRect(cx + 1, cy + 1, this.cellW - 2, this.cellH - 2);
        if (!color && index >= this.cursor) {
            // Not yet optimized: lighter top-left edge like the old fragmented look
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(cx + 1, cy + 1, this.cellW - 2, 2);
        }
    },
    bevel(ctx, x, y, w, h, raised = true) {
        ctx.fillStyle = raised ? '#FFF' : '#808080';
        ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y, 1, h);
        ctx.fillStyle = raised ? '#808080' : '#FFF';
        ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x + w - 1, y, 1, h);
    },
    paintAll(ctx, width, height) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        const { x, y, w, h } = this.win;
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x, y, w, h);
        this.bevel(ctx, x, y, w, h);
        ctx.fillStyle = '#000080';
        ctx.fillRect(x + 3, y + 3, w - 6, 20);
        ctx.fillStyle = '#FFF';
        ctx.font = `bold 12px ${this.font}`;
        ctx.textBaseline = 'middle';
        ctx.fillText('Defragmenting Drive C', x + 10, y + 13);
        const { grid } = this;
        this.bevel(ctx, grid.x - 2, grid.y - 2, grid.w + 4, grid.h + 4, false);
        for (let i = 0; i < this.cells.length; i++) this.paintCell(ctx, i);
        // Legend: one swatch per repository
        ctx.font = `11px ${this.font}`;
        const legendY = grid.y + grid.h + 58;
        const colW = Math.floor(grid.w / 3);
        this.files.forEach((file, index) => {
            const lx = grid.x + (index % 3) * colW;
            const ly = legendY + Math.floor(index / 3) * 16;
            ctx.fillStyle = DEFRAG_COLORS[index];
            ctx.fillRect(lx, ly - 5, 10, 10);
            ctx.fillStyle = '#000';
            ctx.fillText(this.fit(ctx, file.name, colW - 18), lx + 16, ly);
        });
        this.paintStatus(ctx);
    },
    fit(ctx, text, max) {
        if (ctx.measureText(text).width <= max) return text;
        let short = text;
        while (short.length > 1 && ctx.measureText(`${short}…`).width > max) short = short.slice(0, -1);
        return `${short}…`;
    },
    paintStatus(ctx) {
        const { grid } = this;
        const top = grid.y + grid.h + 8;
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(grid.x - 2, top, grid.w + 4, 40);
        const done = this.dataCount ? Math.min(1, this.cursor / this.dataCount) : 1;
        ctx.font = `11px ${this.font}`;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        const label = this.doneAt ? 'Defragmentation complete.' : `Moving ${this.current || '...'}`;
        ctx.fillText(this.fit(ctx, label, grid.w - 50), grid.x, top + 7);
        const percent = `${Math.floor(done * 100)}%`;
        ctx.fillText(percent, grid.x + grid.w - ctx.measureText(percent).width, top + 7);
        // Progress bar
        const barY = top + 18;
        this.bevel(ctx, grid.x - 2, barY, grid.w + 4, 18, false);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(grid.x - 1, barY + 1, grid.w + 2, 16);
        ctx.fillStyle = '#000080';
        const blocks = Math.floor((grid.w - 2) / 10);
        for (let i = 0; i < Math.floor(blocks * done); i++) ctx.fillRect(grid.x + 1 + i * 10, barY + 3, 8, 12);
    },
    step(ctx) {
        while (this.cursor < this.dataCount && this.cells[this.cursor] === this.target[this.cursor]) {
            this.paintCell(ctx, this.cursor);
            this.cursor++;
        }
        if (this.cursor >= this.dataCount) return false;
        const want = this.target[this.cursor];
        let source = this.cursor + 1;
        while (source < this.cells.length && this.cells[source] !== want) source++;
        [this.cells[this.cursor], this.cells[source]] = [this.cells[source], this.cells[this.cursor]];
        this.reading = source;
        this.writing = this.cursor;
        this.current = this.files[want]?.name || '';
        this.moves++;
        return true;
    },
    draw(ctx, width, height) {
        if (this.doneAt) {
            if (performance.now() - this.doneAt > 5000) this.init(ctx, width, height);
            return;
        }
        // Repaint last move's highlighted clusters in their real colours
        [this.reading, this.writing].forEach(index => index >= 0 && this.paintCell(ctx, index));
        const perFrame = Math.max(1, Math.ceil(this.dataCount / 1800));
        let moved = false;
        for (let i = 0; i < perFrame; i++) {
            if (!this.step(ctx)) break;
            moved = true;
            if (i < perFrame - 1) [this.reading, this.writing].forEach(index => this.paintCell(ctx, index));
        }
        if (moved) {
            this.paintCell(ctx, this.reading, '#00FF00');
            this.paintCell(ctx, this.writing, '#FF0000');
        } else {
            this.reading = this.writing = -1;
            this.cursor = this.dataCount;
            this.doneAt = performance.now();
        }
        this.paintStatus(ctx);
    }
};

export const SCREENSAVERS = { matrix, starfield, logos, pipes, mystify, defrag };

export default SCREENSAVERS;
