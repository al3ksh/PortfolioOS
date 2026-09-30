/**
 * Printer App - "prints" the CV on a dot-matrix printer next to the opened cv.html.
 * Opened by Download CV in Portfolio.exe and Print in Simple View; the CV itself
 * opens straight away, the printer is only decoration.
 */

import { Icons } from '../icons.js?v=15';
import { Profile, featuredProjects } from '../config.js?v=15';
import { t, loc, lang } from '../i18n.js?v=15';
import { SoundManager } from '../managers/SoundManager.js?v=15';

const WIDTH = 58;
const CHARS_PER_TICK = 6;
const TICK_MS = 16;

function wrap(text, indent = '') {
    const lines = [];
    let line = indent;
    String(text).split(/\s+/).filter(Boolean).forEach((word) => {
        if (line.trim() && (line + word).length > WIDTH) {
            lines.push(line.trimEnd());
            line = indent;
        }
        line += `${word} `;
    });
    if (line.trim()) lines.push(line.trimEnd());
    return lines;
}

const center = text => `${' '.repeat(Math.max(0, Math.floor((WIDTH - text.length) / 2)))}${text}`;
const heading = text => ['', text.toUpperCase(), '-'.repeat(text.length)];
const row = (left, right) => `${left}${' '.repeat(Math.max(1, WIDTH - left.length - right.length))}${right}`;

function cvLines() {
    const lines = [
        center(Profile.name.toUpperCase()),
        center(loc(Profile.title)),
        '='.repeat(WIDTH),
        center(`${Profile.contact.email}  |  github.com/${Profile.contact.github}`),
        ...heading(t('cv.profile')),
        ...wrap(loc(Profile.about)),
        ...heading(t('section.experience'))
    ];
    Profile.experience.forEach((job) => {
        lines.push(row(`* ${loc(job.role)}`, loc(job.date)), `  ${loc(job.company)}`, ...wrap(loc(job.description), '  '));
    });
    lines.push(...heading(t('section.projects')));
    featuredProjects().forEach((project) => {
        lines.push(`* ${project.name} (${project.tech || project.language})`, ...wrap(loc(project.description), '  '));
    });
    lines.push(...heading(t('section.education')));
    Profile.education.forEach((edu) => {
        lines.push(row(`* ${loc(edu.degree)}`, loc(edu.date)), `  ${loc(edu.school)}`);
    });
    lines.push(...heading(t('section.skills')), ...wrap(Profile.skills.map(loc).join(', ')));
    if (Profile.interests?.length) {
        lines.push(...heading(t('section.interests')), ...Profile.interests.flatMap((item) => {
            const lines = wrap(loc(item), '  ');
            lines[0] = `- ${lines[0].trimStart()}`;
            return lines;
        }));
    }
    lines.push('', '='.repeat(WIDTH), center('*** END OF DOCUMENT ***'));
    return lines;
}

// A short burst of filtered noise that sounds like a print head pass.
function printSound() {
    const ctx = SoundManager.audioContext;
    if (!SoundManager.enabled || !ctx) return;
    const duration = 0.12;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        const pin = Math.floor(i / (ctx.sampleRate / 900)) % 2;
        data[i] = (Math.random() * 2 - 1) * (pin ? 1 : 0.25);
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 2400;
    filter.Q.value = 1.2;
    gain.gain.value = Math.min(0.25, SoundManager.volume * 25);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
}

export function openCv() {
    window.open(lang === 'pl' ? 'cv.pl.html' : 'cv.html', '_blank', 'noopener');
}

export const PrinterApp = {
    id: 'printer',
    title: 'Printer',
    icon: Icons.actPrint,
    width: 560,
    height: 580,
    minWidth: 360,
    minHeight: 420,
    hasMenu: false,
    timer: null,

    render() {
        return `
            <div class="printer-app">
                <div class="printer-paper-window" aria-hidden="true">
                    <pre class="printer-paper"><span class="printer-text"></span><span class="printer-head"></span><span class="printer-rest"></span></pre>
                </div>
                <div class="printer-body" aria-hidden="true">
                    <div class="printer-slot"></div>
                    <div class="printer-front">
                        <span class="printer-model">${t('printer.model')}</span>
                        <span class="printer-led"></span>
                        <span class="printer-led is-power"></span>
                    </div>
                </div>
                <div class="printer-status" role="status" aria-live="polite">
                    <span class="printer-status-text">${t('printer.status')}</span>
                    <span class="printer-progress"><i></i></span>
                </div>
                <div class="printer-actions">
                    <button class="win-btn" type="button" data-printer="cancel">${t('printer.cancel')}</button>
                    <button class="win-btn win-btn-primary" type="button" data-printer="open">${Icons.actPrint} ${t('printer.open')}</button>
                </div>
            </div>
        `;
    },

    onInit() {
        const windowEl = document.querySelector('#window-printer');
        if (!windowEl) return;
        const paperWindow = windowEl.querySelector('.printer-paper-window');
        const paper = windowEl.querySelector('.printer-paper');
        const text = windowEl.querySelector('.printer-text');
        const rest = windowEl.querySelector('.printer-rest');
        const statusText = windowEl.querySelector('.printer-status-text');
        const bar = windowEl.querySelector('.printer-progress i');
        const openButton = windowEl.querySelector('[data-printer="open"]');
        const cancelButton = windowEl.querySelector('[data-printer="cancel"]');
        const document_ = `${cvLines().join('\n')}\n`;
        const totalLines = document_.split('\n').length;
        let printed = 0;
        let lastLine = 0;

        // The unprinted rest of the page is laid out (transparent) so the paper keeps
        // its final size; feeding moves the line being printed to just above the slot.
        const show = (count) => {
            text.textContent = document_.slice(0, count);
            rest.textContent = document_.slice(count);
        };
        const feed = (line) => {
            const style = getComputedStyle(paper);
            const offset = paperWindow.clientHeight - parseFloat(style.paddingTop) - line * parseFloat(style.lineHeight) - 6;
            paper.style.transform = `translateY(${Math.round(offset)}px)`;
        };
        show(0);
        feed(1);

        const finish = (message) => {
            clearInterval(PrinterApp.timer);
            PrinterApp.timer = null;
            windowEl.classList.remove('is-printing');
            statusText.textContent = message;
            cancelButton.hidden = true;
        };

        const done = () => {
            show(document_.length);
            feed(totalLines + 1);
            bar.style.width = '100%';
            finish(t('printer.done'));
            openButton.focus();
        };

        windowEl.classList.add('is-printing');
        clearInterval(PrinterApp.timer);
        PrinterApp.timer = setInterval(() => {
            printed = Math.min(document_.length, printed + CHARS_PER_TICK);
            show(printed);
            bar.style.width = `${Math.round((printed / document_.length) * 100)}%`;
            const line = document_.slice(0, printed).split('\n').length;
            if (line !== lastLine) {
                lastLine = line;
                feed(line);
                printSound();
            }
            if (printed >= document_.length) done();
        }, TICK_MS);

        windowEl.querySelector('.printer-actions').addEventListener('click', (event) => {
            const action = event.target.closest('[data-printer]')?.dataset.printer;
            if (action === 'open') openCv();
            if (action === 'cancel') finish(t('printer.cancelled'));
        });
    },

    onClose() {
        clearInterval(PrinterApp.timer);
        PrinterApp.timer = null;
    }
};

export default PrinterApp;
