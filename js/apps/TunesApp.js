/**
 * Tunes App - a Winamp-style player for three royalty-free tracks in audio/.
 * Plays through an <audio> element; the spectrum analyser reads it via Web Audio.
 * Keys like the real thing: Z prev, X play, C pause, V stop, B next.
 */

import { Icons } from '../icons.js?v=21';

const TRACKS = [
    { file: 'audio/sky-high.opus', artist: 'Elektronomia', title: 'Sky High', duration: 238, kbps: 132 },
    { file: 'audio/sneaky-snitch.opus', artist: 'Kevin MacLeod', title: 'Sneaky Snitch', duration: 136, kbps: 126 },
    { file: 'audio/unity.opus', artist: 'TheFatRat', title: 'Unity', duration: 249, kbps: 132 }
];

const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
const CREDITS = [
    `<b>Elektronomia - Sky High</b><br>${link('https://ncs.io/SkyHigh', 'NoCopyrightSounds')}`,
    `<b>Kevin MacLeod - Sneaky Snitch</b><br>${link('https://incompetech.com', 'incompetech.com')}, licensed under ${link('https://creativecommons.org/licenses/by/4.0/', 'CC BY 4.0')}`,
    `<b>TheFatRat - Unity</b><br>${link('https://www.youtube.com/@TheFatRat', 'youtube.com/@TheFatRat')}`
];

// 16px pixel glyphs; the transport row draws them at 1x like Winamp's tiny buttons
const glyph = rects => `<svg viewBox="0 0 16 16" class="pixel-icon" shape-rendering="crispEdges" aria-hidden="true">${rects.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}</svg>`;
const ICONS = {
    prev: glyph([[3, 4, 2, 8], [10, 4, 1, 8], [9, 5, 1, 6], [8, 6, 1, 4], [7, 7, 1, 2], [13, 4, 1, 8], [12, 5, 1, 6], [11, 6, 1, 4]]),
    play: glyph([[5, 3, 1, 10], [6, 4, 1, 8], [7, 5, 1, 6], [8, 6, 1, 4], [9, 7, 1, 2]]),
    pause: glyph([[4, 4, 3, 8], [9, 4, 3, 8]]),
    stop: glyph([[4, 4, 8, 8]]),
    next: glyph([[2, 4, 1, 8], [3, 5, 1, 6], [4, 6, 1, 4], [5, 7, 1, 2], [5, 4, 1, 8], [6, 5, 1, 6], [7, 6, 1, 4], [8, 7, 1, 2], [11, 4, 2, 8]])
};

// Starts quiet; the listener's own level is remembered between visits
const VOLUME_KEY = 'tunesVolume';
const DEFAULT_VOLUME = 20;
// The tracks are mastered loud, so 100% is half of full scale, and the
// slider is squared to follow how loudness is heard: 20% plays at 0.02.
const MAX_GAIN = 0.5;
const volumeGain = level => (level / 100) ** 2 * MAX_GAIN;

function savedVolume() {
    const value = Number(localStorage.getItem(VOLUME_KEY));
    return localStorage.getItem(VOLUME_KEY) !== null && value >= 0 && value <= 100 ? value : DEFAULT_VOLUME;
}

const BARS = 19;
const VIS_W = BARS * 4;
const VIS_H = 16;

function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const trackLabel = (track, index) => `${index + 1}. ${track.artist} - ${track.title}`;

export const TunesApp = {
    id: 'tunes',
    title: 'Tunes.exe - Music Player',
    icon: Icons.tunes,
    width: 520,
    height: 560,
    minWidth: 400,
    minHeight: 470,
    hasMenu: false,
    resizable: true,

    // Live state of the open window; reset in onClose
    audio: null,
    context: null,
    analyser: null,
    gain: null,
    level: DEFAULT_VOLUME,
    frame: 0,
    current: 0,
    shuffle: false,
    repeat: true,
    remaining: false,
    stopped: true,
    peaks: null,
    levels: null,

    render() {
        const total = TRACKS.reduce((sum, track) => sum + track.duration, 0);
        return `
            <div class="tunes-container" tabindex="-1">
                <section class="wa-main" aria-label="Player">
                    <div class="wa-strip" aria-hidden="true"><span>TUNES</span></div>
                    <div class="wa-top">
                        <div class="wa-lcd">
                            <span class="wa-state" data-state="stop" aria-hidden="true"></span>
                            <button class="wa-time" type="button" title="Elapsed / remaining">0:00</button>
                            <canvas class="wa-vis" width="${VIS_W}" height="${VIS_H}" aria-hidden="true"></canvas>
                        </div>
                        <div class="wa-info">
                            <div class="wa-marquee" aria-live="polite"><span class="wa-marquee-text"></span></div>
                            <div class="wa-meta">
                                <span><b class="wa-kbps">${TRACKS[0].kbps}</b> kbps</span>
                                <span><b>48</b> kHz</span>
                                <span class="wa-led">mono</span>
                                <span class="wa-led is-on">stereo</span>
                            </div>
                            <label class="wa-volume-row">
                                <span>VOL</span>
                                <input class="wa-volume" type="range" min="0" max="100" step="5" value="${savedVolume()}" aria-label="Volume" title="Volume (Up / Down)">
                                <output class="wa-volume-value">${savedVolume()}%</output>
                            </label>
                        </div>
                    </div>
                    <input class="wa-seek" type="range" min="0" max="${TRACKS[0].duration}" value="0" step="1" aria-label="Track position">
                    <div class="wa-transport">
                        <div class="wa-buttons" role="group" aria-label="Playback controls">
                            <button type="button" data-action="prev" title="Previous (Z)" aria-label="Previous track">${ICONS.prev}</button>
                            <button type="button" data-action="play" title="Play (X)" aria-label="Play">${ICONS.play}</button>
                            <button type="button" data-action="pause" title="Pause (C)" aria-label="Pause">${ICONS.pause}</button>
                            <button type="button" data-action="stop" title="Stop (V)" aria-label="Stop">${ICONS.stop}</button>
                            <button type="button" data-action="next" title="Next (B)" aria-label="Next track">${ICONS.next}</button>
                        </div>
                        <div class="wa-toggles">
                            <button type="button" class="wa-toggle" data-toggle="shuffle" aria-pressed="false">Shuffle</button>
                            <button type="button" class="wa-toggle" data-toggle="repeat" aria-pressed="true">Rep</button>
                        </div>
                    </div>
                </section>

                <section class="wa-playlist" aria-label="Playlist">
                    <div class="wa-strip" aria-hidden="true"><span>PLAYLIST EDITOR</span></div>
                    <ol class="wa-list">
                        ${TRACKS.map((track, index) => `
                            <li><button type="button" class="wa-item" data-index="${index}">
                                <span>${trackLabel(track, index)}</span><span>${formatTime(track.duration)}</span>
                            </button></li>`).join('')}
                    </ol>
                    <ul class="wa-credits" id="tunes-credits" hidden>
                        ${CREDITS.map(line => `<li>${line}</li>`).join('')}
                    </ul>
                    <div class="wa-pl-foot">
                        <span>${TRACKS.length} tracks</span>
                        <button type="button" class="wa-toggle wa-credits-btn" aria-expanded="false" aria-controls="tunes-credits">Credits</button>
                        <span class="wa-pl-time">0:00/${formatTime(total)}</span>
                    </div>
                </section>

                <audio class="wa-audio" preload="metadata"></audio>
            </div>
        `;
    },

    onInit() {
        const windowEl = document.querySelector('#window-tunes');
        if (!windowEl) return;
        const root = windowEl.querySelector('.tunes-container');
        const audio = windowEl.querySelector('.wa-audio');
        const seek = windowEl.querySelector('.wa-seek');
        const volume = windowEl.querySelector('.wa-volume');
        const time = windowEl.querySelector('.wa-time');
        TunesApp.audio = audio;
        TunesApp.current = 0;
        TunesApp.peaks = new Array(BARS).fill(0);
        TunesApp.levels = new Array(BARS).fill(0);
        const setVolume = value => {
            const level = Math.min(100, Math.max(0, Math.round(value)));
            volume.value = String(level);
            TunesApp.level = level;
            TunesApp.applyVolume();
            windowEl.querySelector('.wa-volume-value').textContent = `${level}%`;
            try { localStorage.setItem(VOLUME_KEY, String(level)); } catch { /* private mode */ }
        };
        TunesApp.level = Number(volume.value);
        TunesApp.applyVolume();

        const ui = () => TunesApp.updateUI(windowEl);
        TunesApp.load(windowEl, 0, false);

        const actions = {
            prev: () => TunesApp.step(windowEl, -1),
            play: () => TunesApp.play(windowEl),
            pause: () => (audio.paused ? (!TunesApp.stopped && TunesApp.play(windowEl)) : audio.pause()),
            stop: () => { TunesApp.stopped = true; audio.pause(); audio.currentTime = 0; ui(); },
            next: () => TunesApp.step(windowEl, 1)
        };
        windowEl.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => actions[button.dataset.action]());
        });
        windowEl.querySelectorAll('[data-toggle]').forEach(button => {
            button.addEventListener('click', () => {
                const key = button.dataset.toggle;
                TunesApp[key] = !TunesApp[key];
                button.setAttribute('aria-pressed', String(TunesApp[key]));
            });
        });
        windowEl.querySelectorAll('.wa-item').forEach(item => {
            item.addEventListener('dblclick', () => TunesApp.load(windowEl, Number(item.dataset.index), true));
            item.addEventListener('click', event => {
                // Winamp needs a double click; a single tap is enough on touch screens
                if (event.detail === 0 || matchMedia('(pointer: coarse)').matches) TunesApp.load(windowEl, Number(item.dataset.index), true);
            });
        });

        const creditsBtn = windowEl.querySelector('.wa-credits-btn');
        creditsBtn.addEventListener('click', () => {
            const open = creditsBtn.getAttribute('aria-expanded') !== 'true';
            creditsBtn.setAttribute('aria-expanded', String(open));
            windowEl.querySelector('.wa-credits').hidden = !open;
            windowEl.querySelector('.wa-list').hidden = open;
        });
        time.addEventListener('click', () => { TunesApp.remaining = !TunesApp.remaining; ui(); });
        volume.addEventListener('input', () => setVolume(Number(volume.value)));
        seek.addEventListener('input', () => { seek.dataset.dragging = '1'; TunesApp.renderTime(windowEl, Number(seek.value)); });
        seek.addEventListener('change', () => { delete seek.dataset.dragging; audio.currentTime = Number(seek.value); ui(); });

        root.addEventListener('keydown', event => {
            if (event.target.matches('input') || event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                setVolume(Number(volume.value) + (event.key === 'ArrowUp' ? 5 : -5));
                return;
            }
            const action = { z: 'prev', x: 'play', c: 'pause', v: 'stop', b: 'next' }[event.key.toLowerCase()];
            if (!action) return;
            event.preventDefault();
            actions[action]();
        });

        audio.addEventListener('timeupdate', ui);
        audio.addEventListener('play', () => { ui(); TunesApp.startVis(windowEl); });
        audio.addEventListener('pause', ui);
        audio.addEventListener('loadedmetadata', ui);
        audio.addEventListener('ended', () => {
            if (TunesApp.current === TRACKS.length - 1 && !TunesApp.repeat && !TunesApp.shuffle) {
                TunesApp.stopped = true;
                audio.currentTime = 0;
                ui();
                return;
            }
            TunesApp.step(windowEl, 1);
        });
        audio.addEventListener('error', () => {
            if (!audio.getAttribute('src')) return;
            windowEl.querySelector('.wa-marquee-text').textContent = `*** Cannot open ${TRACKS[TunesApp.current].file} ***`;
        });

        TunesApp.drawVis(windowEl.querySelector('.wa-vis'));
        root.focus({ preventScroll: true });
    },

    load(windowEl, index, autoplay) {
        const audio = TunesApp.audio;
        const track = TRACKS[index];
        TunesApp.current = index;
        TunesApp.stopped = true;
        audio.src = track.file;
        const text = `${trackLabel(track, index)} (${formatTime(track.duration)})  ***  `;
        const marquee = windowEl.querySelector('.wa-marquee-text');
        marquee.textContent = text + text;
        marquee.style.setProperty('--marquee-steps', text.length * 2);
        marquee.style.setProperty('--marquee-time', `${text.length * 0.22}s`);
        windowEl.querySelector('.wa-kbps').textContent = track.kbps;
        windowEl.querySelectorAll('.wa-item').forEach(item => {
            const playing = Number(item.dataset.index) === index;
            item.classList.toggle('is-current', playing);
            if (playing) item.setAttribute('aria-current', 'true');
            else item.removeAttribute('aria-current');
        });
        TunesApp.updateUI(windowEl);
        if (autoplay) TunesApp.play(windowEl);
    },

    step(windowEl, direction) {
        const wasPlaying = !TunesApp.audio.paused || TunesApp.audio.ended;
        let index;
        if (TunesApp.shuffle && TRACKS.length > 1) {
            do index = Math.floor(Math.random() * TRACKS.length); while (index === TunesApp.current);
        } else {
            index = (TunesApp.current + direction + TRACKS.length) % TRACKS.length;
        }
        TunesApp.load(windowEl, index, wasPlaying);
    },

    play() {
        TunesApp.stopped = false;
        TunesApp.connectAnalyser();
        TunesApp.context?.resume?.();
        TunesApp.audio.play().catch(() => { /* blocked or interrupted by another load */ });
    },

    // The audio graph has to start from a click, and a media element can be
    // connected only once, so it is built on the first Play.
    connectAnalyser() {
        if (TunesApp.context) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        try {
            const context = new AudioCtx();
            const analyser = context.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.6;
            // Volume is a gain node: once the element feeds Web Audio,
            // Chromium no longer applies audio.volume to what you hear
            const gain = context.createGain();
            context.createMediaElementSource(TunesApp.audio).connect(analyser);
            analyser.connect(gain);
            gain.connect(context.destination);
            TunesApp.gain = gain;
            TunesApp.context = context;
            TunesApp.analyser = analyser;
            TunesApp.applyVolume();
        } catch {
            TunesApp.gain = null;
            TunesApp.context = null;
            TunesApp.analyser = null;
        }
    },

    applyVolume() {
        const value = volumeGain(TunesApp.level);
        if (TunesApp.gain) {
            TunesApp.gain.gain.value = value;
            TunesApp.audio.volume = 1;
        } else if (TunesApp.audio) {
            TunesApp.audio.volume = value;
        }
    },

    renderTime(windowEl, seconds) {
        const track = TRACKS[TunesApp.current];
        const duration = Number.isFinite(TunesApp.audio.duration) ? TunesApp.audio.duration : track.duration;
        const time = windowEl.querySelector('.wa-time');
        time.textContent = TunesApp.remaining ? `-${formatTime(duration - seconds)}` : formatTime(seconds);
    },

    updateUI(windowEl) {
        const audio = TunesApp.audio;
        if (!audio) return;
        const track = TRACKS[TunesApp.current];
        const duration = Number.isFinite(audio.duration) ? audio.duration : track.duration;
        const playing = !audio.paused && !audio.ended;
        const state = playing ? 'play' : TunesApp.stopped ? 'stop' : 'pause';
        const seek = windowEl.querySelector('.wa-seek');

        windowEl.querySelector('.wa-state').dataset.state = state;
        windowEl.querySelector('.tunes-container').dataset.state = state;
        if (!seek.dataset.dragging) {
            seek.max = String(Math.max(1, Math.floor(duration)));
            seek.value = String(Math.floor(audio.currentTime));
            TunesApp.renderTime(windowEl, audio.currentTime);
        }
        const before = TRACKS.slice(0, TunesApp.current).reduce((sum, t) => sum + t.duration, 0);
        const total = TRACKS.reduce((sum, t) => sum + t.duration, 0);
        windowEl.querySelector('.wa-pl-time').textContent = `${formatTime(before + audio.currentTime)}/${formatTime(total)}`;
        TunesApp.setMusicState(playing);
    },

    startVis(windowEl) {
        if (TunesApp.frame) return;
        const canvas = windowEl.querySelector('.wa-vis');
        const data = TunesApp.analyser ? new Uint8Array(TunesApp.analyser.frequencyBinCount) : null;
        const tick = () => {
            const playing = TunesApp.audio && !TunesApp.audio.paused;
            if (data && playing) {
                TunesApp.analyser.getByteFrequencyData(data);
                // Roughly logarithmic bands so the bass doesn't take every bar
                for (let i = 0; i < BARS; i++) {
                    const from = Math.floor(Math.pow(i / BARS, 1.6) * data.length * 0.75);
                    const to = Math.max(from + 1, Math.floor(Math.pow((i + 1) / BARS, 1.6) * data.length * 0.75));
                    let max = 0;
                    for (let j = from; j < to; j++) max = Math.max(max, data[j]);
                    TunesApp.levels[i] = (max / 255) * VIS_H;
                }
            } else {
                TunesApp.levels = TunesApp.levels.map(level => Math.max(0, level - 0.8));
            }
            TunesApp.peaks = TunesApp.peaks.map((peak, i) => Math.max(TunesApp.levels[i], peak - 0.25));
            TunesApp.drawVis(canvas);
            const settled = TunesApp.peaks.every(peak => peak <= 0);
            TunesApp.frame = playing || !settled ? requestAnimationFrame(tick) : 0;
        };
        TunesApp.frame = requestAnimationFrame(tick);
    },

    drawVis(canvas) {
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, VIS_W, VIS_H);
        // Winamp's grid of dark dots behind the bars
        ctx.fillStyle = '#18182a';
        for (let x = 1; x < VIS_W; x += 2) for (let y = 1; y < VIS_H; y += 2) ctx.fillRect(x, y, 1, 1);
        for (let i = 0; i < BARS; i++) {
            const height = Math.round(TunesApp.levels[i]);
            for (let y = 0; y < height; y++) {
                const row = VIS_H - 1 - y;
                ctx.fillStyle = row < 3 ? '#ff2a1a' : row < 6 ? '#e8d01c' : row < 10 ? '#5ce01c' : '#18a818';
                ctx.fillRect(i * 4, row, 3, 1);
            }
            const peak = Math.round(TunesApp.peaks[i]);
            if (peak > 0) {
                ctx.fillStyle = '#c8c8d8';
                ctx.fillRect(i * 4, VIS_H - peak, 3, 1);
            }
        }
    },

    // Lets the profile face put its headphones on while something plays.
    setMusicState(playing) {
        const root = document.documentElement;
        if ((root.dataset.music === 'playing') === playing) return;
        if (playing) root.dataset.music = 'playing';
        else delete root.dataset.music;
        document.dispatchEvent(new CustomEvent('tunes:playback', { detail: { playing } }));
    },

    onClose() {
        cancelAnimationFrame(TunesApp.frame);
        TunesApp.frame = 0;
        if (TunesApp.audio) {
            TunesApp.audio.pause();
            TunesApp.audio.removeAttribute('src');
            TunesApp.audio.load();
        }
        TunesApp.context?.close?.().catch(() => {});
        TunesApp.audio = null;
        TunesApp.context = null;
        TunesApp.analyser = null;
        TunesApp.gain = null;
        TunesApp.setMusicState(false);
    }
};

export default TunesApp;
