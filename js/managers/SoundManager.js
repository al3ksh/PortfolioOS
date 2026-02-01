/**
 * Sound Manager - Handles system sounds
 */

class SoundManagerClass {
    constructor() {
        this._enabled = false;
        this.volume = 0.006;
        this.sounds = {};
        this.onChangeCallbacks = [];
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value) {
        this._enabled = value;
        this.notifyChange();
    }

    addChangeListener(callback) {
        this.onChangeCallbacks.push(callback);
    }

    notifyChange() {
        this.onChangeCallbacks.forEach(cb => cb(this._enabled));
    }

    init() {
        // Create audio context for generating sounds
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Predefine sound configurations
        this.soundConfigs = {
            click: { frequency: 800, duration: 0.05, type: 'square' },
            open: { frequency: 600, duration: 0.1, type: 'square', frequency2: 800 },
            close: { frequency: 800, duration: 0.1, type: 'square', frequency2: 500 },
            error: { frequency: 200, duration: 0.3, type: 'square' },
            chord: { frequencies: [523, 659, 784], duration: 0.5, type: 'sine' }
        };
    }

    play(soundName) {
        if (!this._enabled || !this.audioContext) return;
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const config = this.soundConfigs[soundName];
        if (!config) return;

        if (config.frequencies) {
            // Chord - play multiple frequencies
            config.frequencies.forEach((freq, i) => {
                setTimeout(() => this.playTone(freq, config.duration, config.type), i * 50);
            });
        } else if (config.frequency2) {
            // Two-tone sound
            this.playTone(config.frequency, config.duration / 2, config.type);
            setTimeout(() => {
                this.playTone(config.frequency2, config.duration / 2, config.type);
            }, config.duration * 500);
        } else {
            this.playTone(config.frequency, config.duration, config.type);
        }
    }

    playTone(frequency, duration, type = 'square') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.value = this.volume;
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    toggle() {
        this.enabled = !this._enabled;
        return this._enabled;
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }
}

export const SoundManager = new SoundManagerClass();
export default SoundManager;
