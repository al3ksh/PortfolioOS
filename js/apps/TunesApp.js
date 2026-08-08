/**
 * Tunes App - Windows 98 inspired Spotify player.
 */

import { Icons } from '../icons.js?v=15';

const TRACK = {
    uri: 'spotify:track:3GFUIOx4qdGwFxKXgfy7ap',
    url: 'https://open.spotify.com/track/3GFUIOx4qdGwFxKXgfy7ap',
    title: 'SZUBIENICAPESTYCYDYBROŃ',
    artist: 'Quebonafide',
    album: 'ROMANTIC PSYCHO'
};

const playerIcons = {
    restart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7H4v-4M4.5 7.2A9 9 0 1 1 3 15"/><path d="M4 7l4-4"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 6 4 12l7 6V6Zm9 0-7 6 7 6V6Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="icon-fill" d="m8 5 11 7-11 7V5Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="icon-fill" d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/></svg>',
    forward: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 6 7 6-7 6V6Zm9 0 7 6-7 6V6Z"/></svg>',
    spotify: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" class="icon-fill"/><path class="spotify-wave" d="M6.5 9.2c3.7-1 7.8-.7 11.1 1M7.2 12.4c3.1-.8 6.8-.5 9.6.9M8 15.3c2.5-.6 5.3-.3 7.7.7"/></svg>'
};

function formatTime(milliseconds) {
    const seconds = Math.max(0, Math.floor((milliseconds || 0) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function renderEqualizer() {
    const heights = [34, 54, 82, 118, 146, 96, 102, 132, 76, 92, 72, 104, 124, 98, 68, 58, 86, 70];
    return heights.map((height, index) => (
        `<span class="tunes-eq-bar" style="--bar-height:${height}px;--bar-delay:${index * -43}ms"></span>`
    )).join('');
}

export const TunesApp = {
    id: 'tunes',
    title: 'Tunes.exe - Music Player',
    icon: Icons.tunes,
    width: 860,
    height: 620,
    minWidth: 520,
    minHeight: 520,
    hasMenu: false,
    resizable: true,

    controller: null,
    spotifyApiPromise: null,
    playbackPosition: 0,
    playbackDuration: 0,

    render() {
        return `
            <div class="tunes-container" data-player-state="loading">
                <section class="tunes-display" aria-label="Now playing">
                    <div class="tunes-track-copy">
                        <span class="tunes-music-mark" aria-hidden="true">${Icons.tunes}</span>
                        <div>
                            <strong>${TRACK.artist} — ${TRACK.title}</strong>
                            <span>${TRACK.album}</span>
                        </div>
                    </div>

                    <div class="tunes-equalizer paused" aria-hidden="true">
                        ${renderEqualizer()}
                    </div>

                    <div class="tunes-progress-row">
                        <output class="tunes-current-time" aria-label="Current time">0:00</output>
                        <input class="tunes-progress" type="range" min="0" max="231" value="0" step="1" aria-label="Track position">
                        <output class="tunes-duration" aria-label="Track duration">3:51</output>
                    </div>
                </section>

                <section class="tunes-spotify-panel" aria-label="Spotify player">
                    <div id="tunesSpotifyEmbed" class="tunes-spotify-embed">
                        <div class="tunes-spotify-loading" role="status">
                            <span class="tunes-loading-meter" aria-hidden="true"><i></i></span>
                            Connecting to Spotify…
                        </div>
                    </div>
                </section>

                <div class="tunes-controls" aria-label="Playback controls">
                    <button class="tunes-control-btn" type="button" data-action="restart" aria-label="Restart track" disabled>${playerIcons.restart}</button>
                    <button class="tunes-control-btn" type="button" data-action="back" aria-label="Back 15 seconds" disabled>${playerIcons.back}<span>15</span></button>
                    <button class="tunes-control-btn tunes-play-btn" type="button" data-action="play" aria-label="Play" disabled>${playerIcons.play}</button>
                    <button class="tunes-control-btn" type="button" data-action="forward" aria-label="Forward 15 seconds" disabled>${playerIcons.forward}<span>15</span></button>
                </div>

                <footer class="tunes-statusbar">
                    <span class="tunes-now-playing">${Icons.tunes}<span>Now Playing: ${TRACK.artist} — ${TRACK.title}</span></span>
                    <a href="${TRACK.url}" target="_blank" rel="noopener noreferrer" class="tunes-spotify-link">
                        ${playerIcons.spotify}<span>Open in Spotify</span>
                    </a>
                </footer>
            </div>
        `;
    },

    onInit() {
        const windowEl = document.querySelector('#window-tunes');
        if (!windowEl) return;

        TunesApp.playbackPosition = 0;
        TunesApp.playbackDuration = 231000;
        const mount = windowEl.querySelector('#tunesSpotifyEmbed');

        TunesApp.loadSpotifyApi()
            .then((IFrameAPI) => {
                if (!mount || !document.contains(windowEl)) return;

                IFrameAPI.createController(mount, {
                    width: '100%',
                    height: 152,
                    uri: TRACK.uri
                }, (controller) => {
                    if (!document.contains(windowEl)) {
                        controller.destroy?.();
                        return;
                    }
                    TunesApp.controller = controller;
                    TunesApp.bindController(windowEl, controller);
                });
            })
            .catch(() => TunesApp.renderFallbackEmbed(windowEl));

        TunesApp.bindControls(windowEl);
    },

    loadSpotifyApi() {
        if (window.__portfolioSpotifyIframeAPI) {
            return Promise.resolve(window.__portfolioSpotifyIframeAPI);
        }
        if (TunesApp.spotifyApiPromise) return TunesApp.spotifyApiPromise;

        TunesApp.spotifyApiPromise = new Promise((resolve, reject) => {
            window.onSpotifyIframeApiReady = (IFrameAPI) => {
                window.__portfolioSpotifyIframeAPI = IFrameAPI;
                resolve(IFrameAPI);
            };

            const existingScript = document.querySelector('script[data-portfolio-spotify-api]');
            if (existingScript) return;

            const script = document.createElement('script');
            script.src = 'https://open.spotify.com/embed/iframe-api/v1';
            script.async = true;
            script.dataset.portfolioSpotifyApi = 'true';
            script.addEventListener('error', () => {
                TunesApp.spotifyApiPromise = null;
                reject(new Error('Spotify iFrame API failed to load.'));
            }, { once: true });
            document.head.appendChild(script);
        });

        return TunesApp.spotifyApiPromise;
    },

    bindController(windowEl, controller) {
        const setReady = () => {
            windowEl.querySelectorAll('.tunes-control-btn').forEach(button => { button.disabled = false; });
            windowEl.querySelector('.tunes-container')?.setAttribute('data-player-state', 'ready');
        };

        controller.addListener('ready', setReady);
        controller.addListener('playback_started', () => {
            setReady();
            TunesApp.updatePlaybackUI(windowEl, false);
        });
        controller.addListener('playback_update', (event) => {
            const data = event?.data || {};
            TunesApp.playbackPosition = Number(data.position) || 0;
            TunesApp.playbackDuration = Number(data.duration) || TunesApp.playbackDuration;
            TunesApp.updatePlaybackUI(windowEl, Boolean(data.isPaused));
        });
    },

    bindControls(windowEl) {
        const progress = windowEl.querySelector('.tunes-progress');

        windowEl.querySelector('[data-action="play"]')?.addEventListener('click', () => {
            TunesApp.controller?.togglePlay();
        });
        windowEl.querySelector('[data-action="restart"]')?.addEventListener('click', () => {
            TunesApp.controller?.restart();
        });
        windowEl.querySelector('[data-action="back"]')?.addEventListener('click', () => {
            const target = Math.max(0, TunesApp.playbackPosition / 1000 - 15);
            TunesApp.controller?.seek(Math.floor(target));
        });
        windowEl.querySelector('[data-action="forward"]')?.addEventListener('click', () => {
            const duration = TunesApp.playbackDuration / 1000;
            const target = Math.min(duration, TunesApp.playbackPosition / 1000 + 15);
            TunesApp.controller?.seek(Math.floor(target));
        });
        progress?.addEventListener('change', () => {
            TunesApp.controller?.seek(Number(progress.value));
        });
        progress?.addEventListener('input', () => {
            const current = windowEl.querySelector('.tunes-current-time');
            if (current) current.textContent = formatTime(Number(progress.value) * 1000);
        });
    },

    updatePlaybackUI(windowEl, isPaused) {
        const playButton = windowEl.querySelector('[data-action="play"]');
        const equalizer = windowEl.querySelector('.tunes-equalizer');
        const progress = windowEl.querySelector('.tunes-progress');
        const current = windowEl.querySelector('.tunes-current-time');
        const duration = windowEl.querySelector('.tunes-duration');

        if (playButton) {
            playButton.innerHTML = isPaused ? playerIcons.play : playerIcons.pause;
            playButton.setAttribute('aria-label', isPaused ? 'Play' : 'Pause');
        }
        equalizer?.classList.toggle('paused', isPaused);
        if (progress) {
            progress.max = String(Math.max(1, Math.floor(TunesApp.playbackDuration / 1000)));
            progress.value = String(Math.floor(TunesApp.playbackPosition / 1000));
        }
        if (current) current.textContent = formatTime(TunesApp.playbackPosition);
        if (duration) duration.textContent = formatTime(TunesApp.playbackDuration);
    },

    renderFallbackEmbed(windowEl) {
        const mount = windowEl.querySelector('#tunesSpotifyEmbed');
        if (!mount) return;
        mount.innerHTML = `
            <iframe
                title="Spotify player: ${TRACK.artist} — ${TRACK.title}"
                src="https://open.spotify.com/embed/track/3GFUIOx4qdGwFxKXgfy7ap?utm_source=generator&theme=0"
                width="100%"
                height="152"
                frameborder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="eager"></iframe>
        `;
        windowEl.querySelector('.tunes-container')?.setAttribute('data-player-state', 'fallback');
    },

    onClose() {
        TunesApp.controller?.destroy?.();
        TunesApp.controller = null;
        TunesApp.playbackPosition = 0;
        TunesApp.playbackDuration = 0;
    }
};

export default TunesApp;
