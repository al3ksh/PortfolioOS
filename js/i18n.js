/**
 * i18n - English / Polish translations for the portfolio-facing UI.
 *
 * Profile values in config.js can be plain strings or { en, pl } objects;
 * pass them through loc(). UI strings live in js/strings.js and are
 * read with t(key). Static HTML uses data-i18n / data-i18n-* attributes.
 */

import { STRINGS } from './strings.js?v=15';

export const LANGUAGES = ['en', 'pl'];

const dictionary = STRINGS;

function detectLanguage() {
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get('lang');
    if (LANGUAGES.includes(fromUrl)) return fromUrl;
    const stored = sessionStorage.getItem('lang') || localStorage.getItem('lang');
    if (LANGUAGES.includes(stored)) return stored;
    return 'en';
}

export const lang = detectLanguage();

export function t(key, params = {}) {
    const value = dictionary[lang][key] ?? dictionary.en[key] ?? key;
    if (typeof value !== 'string') return value;
    return value.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);
}

export function loc(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value[lang] ?? value.en ?? Object.values(value)[0] ?? '';
    }
    return value ?? '';
}

export function setLanguage(next) {
    if (!LANGUAGES.includes(next) || next === lang) return;
    sessionStorage.setItem('lang', next);
    localStorage.setItem('lang', next);
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    document.documentElement.dataset.reloading = 'true';
    location.replace(url);
}

export function applyStaticTranslations(root = document) {
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
        el.title = t(el.dataset.i18nTitle);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
}

export default { lang, t, loc, setLanguage, applyStaticTranslations };
