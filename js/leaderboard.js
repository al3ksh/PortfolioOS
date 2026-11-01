/**
 * Leaderboards for the games. Results live on the server (a small JSON file);
 * personal bests stay in each game's own localStorage.
 */

import { Profile } from './config.js?v=19';
import { DialogManager } from './managers/DialogManager.js?v=19';
import { SoundManager } from './managers/SoundManager.js?v=19';
import { t } from './i18n.js?v=19';

const BOARDS = {
    'snake-solid': { title: 'Snake - Solid walls', unit: '' },
    'snake-wrap': { title: 'Snake - Wrap-around', unit: '' },
    'mines-beginner': { title: 'Mines - Beginner', unit: 's' },
    'mines-intermediate': { title: 'Mines - Intermediate', unit: 's' },
    'mines-expert': { title: 'Mines - Expert', unit: 's' },
    'tetris': { title: 'Blocks', unit: '' }
};

const NAME_KEY = 'leaderboardName';
const TOP = 10;

const escapeHtml = (value) => {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
};

const format = (game, score) => `${Number(score).toLocaleString('en-US')}${BOARDS[game].unit}`;

async function load(game) {
    try {
        const response = await fetch(`/api/scores/${encodeURIComponent(game)}`, { signal: AbortSignal.timeout(6000) });
        if (!response.ok) return null;
        const board = await response.json();
        return Array.isArray(board.scores) ? board : null;
    } catch (error) {
        return null;
    }
}

// Board names follow the language; BOARDS[game].title stays as the English fallback
const boardTitle = game => (t(`lb.${game}`) !== `lb.${game}` ? t(`lb.${game}`) : BOARDS[game].title);

const beats = (order, a, b) => order === 'asc' ? a < b : a > b;

// Where a result would land (1-based), or 0 when it would not make the list.
function rankFor(board, score) {
    const rank = board.scores.findIndex(entry => beats(board.order, score, entry.score));
    if (rank !== -1) return rank + 1;
    return board.scores.length < TOP ? board.scores.length + 1 : 0;
}

function tableHtml(game, board, mark) {
    if (!board.scores.length) return `<p class="lb-empty">${escapeHtml(t('lb.empty'))}</p>`;
    const rows = board.scores.map((entry, index) => `
        <tr${mark === index + 1 ? ' class="lb-mine"' : ''}>
            <td class="lb-rank">${index + 1}.</td>
            <td class="lb-name">${escapeHtml(entry.name)}</td>
            <td class="lb-score">${escapeHtml(format(game, entry.score))}</td>
            <td class="lb-date">${escapeHtml(entry.date)}</td>
        </tr>`).join('');
    return `<table class="lb-table"><tbody>${rows}</tbody></table>`;
}

// Keys typed in a dialog must not reach the game behind it.
function isolateKeys(dialog) {
    ['keydown', 'keyup', 'keypress'].forEach(type => dialog.addEventListener(type, event => event.stopPropagation()));
}

function openDialog(options) {
    return new Promise((resolve) => {
        const dialog = DialogManager.createDialog({ ...options, onClose: action => resolve({ action, dialog }) });
        isolateKeys(dialog);
        DialogManager.show(dialog);
        options.onOpen?.(dialog);
    });
}

let turnstileScript = null;
function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    turnstileScript ||= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.addEventListener('load', () => resolve(window.turnstile));
        script.addEventListener('error', () => { turnstileScript = null; reject(new Error('Turnstile unavailable')); });
        document.head.append(script);
    });
    return turnstileScript;
}

async function show(game, mark = 0, known = null) {
    if (!BOARDS[game]) return;
    const board = known || await load(game);
    if (!board) {
        await DialogManager.alert(t('lb.unreachable'), boardTitle(game));
        return;
    }
    await openDialog({
        title: t('lb.title', { board: boardTitle(game) }),
        content: `<div class="lb-box">${tableHtml(game, board, mark)}</div>`,
        buttons: [{ label: t('dlg.ok'), action: 'ok', primary: true }]
    });
}

function readName() {
    try { return localStorage.getItem(NAME_KEY) || ''; } catch (error) { return ''; }
}

function rememberName(name) {
    try { localStorage.setItem(NAME_KEY, name); } catch (error) { /* storage declined */ }
}

async function submit(game, score, name, turnstileToken) {
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game, score, name, turnstileToken }),
            signal: AbortSignal.timeout(10000)
        });
        const body = await response.json().catch(() => ({}));
        return response.ok ? body : { error: body.error || t('lb.saveFailed') };
    } catch (error) {
        return { error: t('lb.offline') };
    }
}

// After a game: when the result makes the top 10, ask for a nickname and send it.
// `stillOver` lets a game cancel the prompt if the player already started a new round.
async function offer(game, score, stillOver = () => true) {
    if (!BOARDS[game] || !Number.isInteger(score) || score <= 0) return;
    const board = await load(game);
    if (!board) return;
    const rank = rankFor(board, score);
    if (!rank) return;

    // A short pause so keys still being hammered in the game don't land in the nickname box
    await new Promise(resolve => setTimeout(resolve, 700));
    if (!stillOver()) return;

    let error = '';
    let typed = readName();
    for (let attempt = 0; attempt < 3; attempt++) {
        let token = '';
        const { action, dialog } = await openDialog({
            title: t('lb.newHigh'),
            content: `
                <div class="lb-box">
                    <p>${escapeHtml(boardTitle(game))}: <b>${escapeHtml(format(game, score))}</b>, ${escapeHtml(t('lb.place', { rank }))}.</p>
                    <p>${escapeHtml(t('lb.enterNick'))}</p>
                    <input type="text" class="dialog-input win-input" maxlength="12" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(t('lb.nickname'))}" value="${escapeHtml(typed)}">
                    ${error ? `<p class="lb-error">${escapeHtml(error)}</p>` : ''}
                    ${Profile.turnstileSiteKey ? '<div class="lb-turnstile"></div>' : ''}
                </div>`,
            buttons: [
                { label: t('lb.submit'), action: 'submit', primary: true },
                { label: t('lb.skip'), action: 'skip' }
            ],
            onOpen(box) {
                const send = box.querySelector('[data-action="submit"]');
                const slot = box.querySelector('.lb-turnstile');
                if (!slot) return;
                send.disabled = true;
                loadTurnstile().then(turnstile => turnstile.render(slot, {
                    sitekey: Profile.turnstileSiteKey,
                    callback: (value) => { token = value; send.disabled = false; },
                    'expired-callback': () => { token = ''; send.disabled = true; },
                    'error-callback': () => { token = ''; send.disabled = true; }
                })).catch(() => { slot.textContent = t('lb.noVerify'); });
            }
        });

        if (action !== 'submit') return;
        const name = typed = dialog.querySelector('.dialog-input').value.trim();
        const result = await submit(game, score, name, token);
        if (!result.error) {
            rememberName(name);
            SoundManager.play('chord');
            await show(game, result.rank || 0, result);
            return;
        }
        error = result.error;
    }
}

export const Leaderboard = { show, offer };
export default Leaderboard;
