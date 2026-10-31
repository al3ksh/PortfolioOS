/**
 * Landing page behaviour (index.html / pl.html). The page is complete without it;
 * this adds the light/dark switch, the skill filter, copy-email button, menu highlight, the tray clock
 * and sends the contact form in the background (with Turnstile when configured).
 * On the cookies page it also runs the switch for data PortfolioOS saves.
 * Everything it needs is in data-* attributes written by scripts/build-static.mjs.
 */

const lang = document.documentElement.lang === 'pl' ? 'pl' : 'en';

// PortfolioOS skips its boot sequence on reloads within a tab (hasBooted). Coming
// from these pages it should boot properly again, also after Back from the desktop.
window.addEventListener('pageshow', () => {
    try { sessionStorage.removeItem('hasBooted'); } catch { /* storage blocked */ }
});

// ---------- Light / dark look ----------

// Dark is the default; the inline script in <head> applies a saved 'light' before
// the first paint. Nothing is saved when PortfolioOS saving is switched off.
const THEME = 'homeTheme';
const isLight = () => document.documentElement.dataset.theme === 'light';

function initTheme() {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    const render = () => {
        button.setAttribute('aria-pressed', String(!isLight()));
        if (meta) meta.content = isLight() ? '#008080' : '#1a1a2e';
    };
    button.hidden = false;
    button.addEventListener('click', () => {
        if (isLight()) delete document.documentElement.dataset.theme;
        else document.documentElement.dataset.theme = 'light';
        try {
            if (localStorage.getItem('storagePrefs') === 'no') localStorage.removeItem(THEME);
            else if (isLight()) localStorage.setItem(THEME, 'light');
            else localStorage.removeItem(THEME);
        } catch { /* storage blocked: the switch still works until the page closes */ }
        render();
    });
    render();
}

// ---------- Skill filter ----------

// Whole-word match so "C" does not hit "CSS"; "Node.js" also matches "node"
const mentions = (text, skill) => {
    const s = skill.toLowerCase();
    return text.split(/\s+/).some(word => word === s || word === s.replace(/\.js$/, ''));
};

function initFilter() {
    const filter = document.querySelector('.filter');
    if (!filter) return;
    filter.hidden = false;
    const chips = [...filter.querySelectorAll('.chip')];
    const items = [...document.querySelectorAll('.items .item')];
    const empty = document.querySelector('.items .empty');
    const count = document.querySelector('[data-count]');
    let active = null;

    const apply = () => {
        let shown = 0;
        items.forEach(item => {
            const match = !active || mentions(item.dataset.text || '', active);
            item.classList.toggle('is-out', !match);
            item.classList.remove('is-in');
            if (match) {
                shown++;
                void item.offsetWidth; // restart the appear animation
                item.classList.add('is-in');
            }
        });
        if (empty) empty.hidden = shown > 0;
        if (count) count.textContent = count.dataset.count.replace('{n}', shown);
        chips.forEach(chip => chip.setAttribute('aria-pressed', String((chip.dataset.skill || null) === active)));
    };

    chips.forEach(chip => chip.addEventListener('click', () => {
        active = chip.dataset.skill && chip.dataset.skill !== active ? chip.dataset.skill : null;
        apply();
    }));
}

// ---------- Copy email ----------

function initCopy() {
    const button = document.querySelector('[data-copy-email]');
    if (!button) return;
    button.hidden = false;
    const label = button.textContent;
    let timer;
    button.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(button.dataset.copyEmail);
        } catch {
            return; // clipboard blocked: the mailto link next to it still works
        }
        button.textContent = button.dataset.copied;
        clearTimeout(timer);
        timer = setTimeout(() => { button.textContent = label; }, 1600);
    });
}

// ---------- Menu highlight + tray clock ----------

function initScroll() {
    if (!('IntersectionObserver' in window)) return;
    const links = Object.fromEntries([...document.querySelectorAll('.nav a[data-id]')].map(a => [a.dataset.id, a]));
    const spy = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        Object.values(links).forEach(a => a.classList.toggle('is-active', a === links[entry.target.id]));
    }), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[id]').forEach(section => spy.observe(section));
}

function initClock() {
    const clock = document.querySelector('[data-clock]');
    if (!clock) return;
    const tick = () => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString(lang === 'pl' ? 'pl-PL' : 'en-US', { hour: 'numeric', minute: '2-digit' });
        clock.dateTime = now.toISOString();
    };
    tick();
    setInterval(tick, 15000);
}

// ---------- Contact card ----------

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let turnstileLoading = null;

function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    turnstileLoading ??= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = TURNSTILE_SRC;
        script.async = true;
        script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile missing')));
        script.onerror = () => { turnstileLoading = null; reject(new Error('Turnstile failed to load')); };
        document.head.appendChild(script);
    });
    return turnstileLoading;
}

function initContact() {
    const form = document.querySelector('form.postcard');
    if (!form) return;
    const submit = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');
    const slot = form.querySelector('.turnstile');
    const sitekey = form.dataset.sitekey;
    const sendLabel = submit.innerHTML;
    let token = '';
    let widget = null;

    const say = (text, isError = false) => {
        status.classList.toggle('is-error', isError);
        status.textContent = text;
        if (isError && form.dataset.email) {
            const link = document.createElement('a');
            link.href = `mailto:${form.dataset.email}`;
            link.textContent = form.dataset.email;
            status.append(' ', link);
        }
    };

    // The anti-spam widget only loads once someone shows interest in the card
    const startTurnstile = () => {
        if (!sitekey || widget !== null) return;
        widget = false;
        loadTurnstile().then(turnstile => {
            widget = turnstile.render(slot, {
                sitekey,
                language: lang,
                theme: isLight() ? 'light' : 'dark',
                callback: value => { token = value; submit.disabled = false; },
                'expired-callback': () => { token = ''; submit.disabled = true; },
                'error-callback': () => { token = ''; submit.disabled = true; }
            });
        }).catch(() => {
            widget = null;
            say(form.dataset.error, true);
        });
    };

    if (sitekey) {
        submit.disabled = true;
        form.addEventListener('focusin', startTurnstile, { once: true });
        if ('IntersectionObserver' in window) {
            const seen = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) { seen.disconnect(); startTurnstile(); }
            }, { rootMargin: '200px 0px' });
            seen.observe(form);
        }
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (sitekey && !token) return;
        const data = Object.fromEntries(new FormData(form));
        delete data['cf-turnstile-response'];
        if (sitekey) data.turnstileToken = token;

        submit.disabled = true;
        submit.textContent = form.dataset.sending;
        say('');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let ok = false;
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            const result = await response.json().catch(() => ({}));
            ok = response.ok && result.success !== false;
        } catch {
            ok = false;
        } finally {
            clearTimeout(timeout);
        }

        submit.innerHTML = sendLabel;
        if (ok) {
            form.reset();
            say(form.dataset.sent);
        } else {
            say(form.dataset.error, true);
        }
        // A Turnstile token is single use
        if (sitekey && window.turnstile && widget) {
            token = '';
            window.turnstile.reset(widget);
            submit.disabled = true;
        } else {
            submit.disabled = false;
        }
    });
}

// ---------- Cookies page: data PortfolioOS saves ----------

// Same key StorageManager reads in the desktop: 'no' means saving is off
const PREFS = 'storagePrefs';

function initStorage() {
    const panel = document.querySelector('[data-storage]');
    if (!panel) return;
    const toggle = panel.querySelector('[data-storage-toggle]');
    const count = panel.querySelector('[data-storage-count]');
    const clear = panel.querySelector('[data-storage-clear]');
    const status = panel.querySelector('.storage-status');
    panel.querySelector('.storage-ui').hidden = false;

    let local;
    try {
        local = window.localStorage;
        local.getItem(PREFS);
    } catch {
        panel.querySelector('.storage-ui').hidden = true;
        panel.querySelector('.storage-nojs').textContent = panel.dataset.blocked;
        panel.querySelector('.storage-nojs').style.display = 'block';
        return;
    }

    const saved = () => Object.keys(local).filter(key => key !== PREFS).length + sessionStorage.length;
    const wipe = () => {
        Object.keys(local).filter(key => key !== PREFS).forEach(key => local.removeItem(key));
        sessionStorage.clear();
    };
    const render = () => {
        toggle.checked = local.getItem(PREFS) !== 'no';
        count.textContent = panel.dataset.count.replace('{n}', saved());
        clear.disabled = saved() === 0;
    };

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            local.removeItem(PREFS);
        } else {
            wipe();
            local.setItem(PREFS, 'no');
        }
        status.textContent = toggle.checked ? panel.dataset.on : panel.dataset.off;
        render();
    });

    clear.addEventListener('click', () => {
        wipe();
        status.textContent = panel.dataset.cleared;
        render();
    });

    // Another tab with PortfolioOS open may save something meanwhile
    window.addEventListener('storage', render);
    render();
}

initTheme();
initFilter();
initCopy();
initScroll();
initClock();
initContact();
initStorage();
