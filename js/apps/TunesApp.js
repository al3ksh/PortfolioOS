/**
 * Tunes App - Audio player with EQ visualization
 */

import { Icons } from '../icons.js';

export const TunesApp = {
    id: 'tunes',
    title: 'Tunes.exe - Music Player',
    icon: Icons.tunes,
    width: 300,
    height: 250,
    hasMenu: false,
    resizable: false,
    
    isPlaying: false,
    audioContext: null,
    oscillator: null,

    render() {
        return `
            <div class="tunes-container">
                <div class="tunes-display">
                    <div class="tunes-title">♪ Lo-Fi Beats ♪</div>
                    <div class="eq-bars paused">
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                    </div>
                </div>
                
                <div class="tunes-controls">
                    <button class="win-btn" data-action="prev">⏮</button>
                    <button class="win-btn primary" data-action="play">▶</button>
                    <button class="win-btn" data-action="next">⏭</button>
                </div>
                
                <div class="tunes-volume">
                    <label>Vol:</label>
                    <input type="range" class="win-slider" min="0" max="100" value="30">
                </div>
                
                <p style="font-size: 11px; color: #808080; margin-top: 10px; text-align: center;">
                    🎵 Now Playing: Ambient Synth Loop
                </p>
            </div>
        `;
    },

    onInit() {
        const window = document.querySelector('#window-tunes');
        if (!window) return;

        const playBtn = window.querySelector('[data-action="play"]');
        const eqBars = window.querySelector('.eq-bars');
        const volumeSlider = window.querySelector('.win-slider');

        playBtn?.addEventListener('click', () => {
            TunesApp.isPlaying = !TunesApp.isPlaying;
            
            if (TunesApp.isPlaying) {
                playBtn.textContent = '⏸';
                eqBars?.classList.remove('paused');
                TunesApp.startAudio(volumeSlider?.value / 100 || 0.3);
            } else {
                playBtn.textContent = '▶';
                eqBars?.classList.add('paused');
                TunesApp.stopAudio();
            }
        });

        volumeSlider?.addEventListener('input', (e) => {
            if (TunesApp.gainNode) {
                TunesApp.gainNode.gain.value = e.target.value / 100 * 0.3;
            }
        });
    },

    startAudio(volume = 0.3) {
        try {
            TunesApp.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a simple ambient sound using oscillators
            const ctx = TunesApp.audioContext;
            
            // Main oscillator (low drone)
            TunesApp.oscillator = ctx.createOscillator();
            TunesApp.oscillator.type = 'sine';
            TunesApp.oscillator.frequency.value = 110; // Low A
            
            // Second oscillator (fifth above)
            TunesApp.oscillator2 = ctx.createOscillator();
            TunesApp.oscillator2.type = 'sine';
            TunesApp.oscillator2.frequency.value = 165; // E
            
            // Third oscillator (ambient pad)
            TunesApp.oscillator3 = ctx.createOscillator();
            TunesApp.oscillator3.type = 'triangle';
            TunesApp.oscillator3.frequency.value = 220; // A
            
            // LFO for modulation
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.2;
            
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 5;
            
            lfo.connect(lfoGain);
            lfoGain.connect(TunesApp.oscillator.frequency);
            
            // Master gain
            TunesApp.gainNode = ctx.createGain();
            TunesApp.gainNode.gain.value = volume * 0.3;
            
            // Connect
            TunesApp.oscillator.connect(TunesApp.gainNode);
            TunesApp.oscillator2.connect(TunesApp.gainNode);
            TunesApp.oscillator3.connect(TunesApp.gainNode);
            TunesApp.gainNode.connect(ctx.destination);
            
            // Start
            TunesApp.oscillator.start();
            TunesApp.oscillator2.start();
            TunesApp.oscillator3.start();
            lfo.start();
            
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    },

    stopAudio() {
        try {
            TunesApp.oscillator?.stop();
            TunesApp.oscillator2?.stop();
            TunesApp.oscillator3?.stop();
            TunesApp.audioContext?.close();
        } catch (e) {
            // Ignore
        }
        TunesApp.audioContext = null;
        TunesApp.oscillator = null;
    },

    onClose() {
        TunesApp.stopAudio();
        TunesApp.isPlaying = false;
    }
};

export default TunesApp;
