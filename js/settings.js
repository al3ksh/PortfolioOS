/**
 * Settings - small key/value store for BIOS, screen saver and boot options.
 * Writes to localStorage (kept only with storage consent, see StorageManager)
 * and to sessionStorage, so a change always lasts at least for this visit.
 */

// Phones have no mouse to move while reading, so the saver starts off there
const touchOnly = typeof matchMedia === 'function' && matchMedia('(hover: none) and (pointer: coarse)').matches;

export const DEFAULTS = {
    screensaver: touchOnly ? 'none' : 'defrag',
    screensaverDelay: '3',
    quickBoot: 'false'
};

export function getSetting(key) {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? DEFAULTS[key] ?? null;
}

export function setSetting(key, value) {
    const text = String(value);
    localStorage.setItem(key, text);
    sessionStorage.setItem(key, text);
}

export default { getSetting, setSetting, DEFAULTS };
