// Leaderboards for the games: a small JSON file, no database.
// Only a nickname, a score and a date are stored; the visitor's address is used
// in memory for rate limiting and never written down.
const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const SCORES_FILE = process.env.SCORES_FILE || path.join(__dirname, 'data', 'scores.json');
const TOP = 10;

// One board per game mode. The browser runs the games, so the limits only
// reject impossible values; they cannot prove that a result was played fairly.
const BOARDS = {
    'snake-solid': { order: 'desc', min: 10, max: 8000 },
    'snake-wrap': { order: 'desc', min: 10, max: 8000 },
    'mines-beginner': { order: 'asc', min: 1, max: 999 },
    'mines-intermediate': { order: 'asc', min: 3, max: 999 },
    'mines-expert': { order: 'asc', min: 10, max: 999 },
    'tetris': { order: 'desc', min: 100, max: 2000000 }
};

const NAME_MIN = 2;
const NAME_MAX = 12;
const NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} _.\-]*$/u;

// Obvious profanity only (English and Polish). Names are normalised first, so
// "F.u_c-k", "fuuuck" and "f4ck" are caught as well.
const BLOCKED = [
    'fuck', 'fuk', 'shit', 'bitch', 'cunt', 'pussy', 'whore', 'slut', 'nigg', 'fagg',
    'nazi', 'hitler', 'kurw', 'jeb', 'pierdol', 'chuj', 'huj', 'pizd', 'spierdal', 'skurwy', 'cwel', 'dziwk',
    'szmat', 'pedal', 'ruchan', 'zjeb', 'kutas'
];

function normalizeName(name) {
    return name
        .toLowerCase()
        .normalize('NFD').replace(/\p{M}/gu, '')
        .replace(/ł/g, 'l')
        .replace(/[@4]/g, 'a').replace(/[3]/g, 'e').replace(/[1!|]/g, 'i').replace(/[0]/g, 'o').replace(/[$5]/g, 's')
        .replace(/[^a-z]/g, '')
        .replace(/(.)\1+/g, '$1');
}

const isBlocked = (name) => {
    const plain = normalizeName(name);
    return BLOCKED.some(word => plain.includes(word.replace(/(.)\1+/g, '$1')));
};

// --- Storage: kept in memory, written atomically after every change ---

let data = {};
try {
    data = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
} catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read the scores file, starting empty:', error.message);
}

let writing = Promise.resolve();
function save() {
    const snapshot = JSON.stringify(data);
    writing = writing.then(async () => {
        const temp = `${SCORES_FILE}.tmp`;
        await fs.promises.mkdir(path.dirname(SCORES_FILE), { recursive: true });
        await fs.promises.writeFile(temp, snapshot);
        await fs.promises.rename(temp, SCORES_FILE);
    }).catch(error => console.error('Could not save scores:', error.message));
    return writing;
}

const board = (game) => data[game] || (data[game] = []);
const better = (game, a, b) => BOARDS[game].order === 'asc' ? a < b : a > b;
const publicBoard = (game) => ({ game, order: BOARDS[game].order, scores: board(game) });

function createScoresRouter({ clientIp, verifyTurnstile, turnstileEnabled }) {
    const router = express.Router();

    const readLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, keyGenerator: clientIp });
    const writeLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        keyGenerator: clientIp,
        handler: (req, res) => res.status(429).json({ error: 'Too many scores sent, please try again later.' })
    });

    router.get('/:game', readLimiter, (req, res) => {
        if (!Object.hasOwn(BOARDS, req.params.game)) return res.status(404).json({ error: 'Unknown game.' });
        res.set('Cache-Control', 'public, max-age=10');
        res.json(publicBoard(req.params.game));
    });

    router.post('/', writeLimiter, async (req, res) => {
        const input = req.body || {};
        const game = input.game;
        if (typeof game !== 'string' || !Object.hasOwn(BOARDS, game)) {
            return res.status(400).json({ error: 'Unknown game.' });
        }

        const limits = BOARDS[game];
        const score = input.score;
        if (!Number.isInteger(score) || score < limits.min || score > limits.max) {
            return res.status(400).json({ error: 'That score is not valid.' });
        }

        const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
        if (name.length < NAME_MIN || name.length > NAME_MAX || !NAME_PATTERN.test(name)) {
            return res.status(400).json({ error: `Nickname must be ${NAME_MIN}-${NAME_MAX} letters, digits, spaces, dots, dashes or underscores.` });
        }
        if (isBlocked(name)) {
            return res.status(400).json({ error: 'Please choose a different nickname.' });
        }

        if (turnstileEnabled && !(await verifyTurnstile(input.turnstileToken, clientIp(req)))) {
            return res.status(400).json({ error: 'Verification failed. Please try again.' });
        }

        // One line per nickname: a new result only replaces the old one if it is better.
        const list = board(game);
        const existing = list.findIndex(entry => entry.name.toLowerCase() === name.toLowerCase());
        if (existing !== -1) {
            if (!better(game, score, list[existing].score)) {
                return res.json({ ok: true, rank: null, ...publicBoard(game) });
            }
            list.splice(existing, 1);
        }

        const entry = { name, score, date: new Date().toISOString().slice(0, 10) };
        // Equal results keep the earlier entry on top.
        let rank = list.findIndex(other => better(game, score, other.score));
        if (rank === -1) rank = list.length;
        if (rank >= TOP) return res.json({ ok: true, rank: null, ...publicBoard(game) });

        list.splice(rank, 0, entry);
        list.length = Math.min(list.length, TOP);
        await save();
        res.json({ ok: true, rank: rank + 1, ...publicBoard(game) });
    });

    return router;
}

module.exports = { createScoresRouter };
