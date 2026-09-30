/**
 * Contact App - Contact form with email simulation
 */

import { Icons } from '../icons.js?v=15';
import { Profile, githubUrl } from '../config.js?v=15';
import { t } from '../i18n.js?v=15';
import { SoundManager } from '../managers/SoundManager.js?v=15';

const escapeHtml = (value) => {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
};

export const ContactApp = {
    id: 'contact',
    title: 'Contact Me',
    icon: Icons.contact,
    width: 450,
    height: 650,
    hasMenu: false,
    resizable: true,
    minWidth: 400,
    minHeight: 600,

    render() {
        return `
            <div class="contact-container">
                <div class="contact-header">
                    <div class="contact-icon">${Icons.secMail}</div>
                    <div class="contact-title">
                        <h2>${t('contact.heading')}</h2>
                        <p>${t('contact.intro')}</p>
                    </div>
                </div>

                <form class="contact-form" id="contactForm">
                    <div class="form-group">
                        <label for="contactName">
                            <span class="label-icon">${Icons.labelName}</span> ${t('contact.name')}
                        </label>
                        <input type="text" id="contactName" class="win-input" placeholder="John Doe" required>
                    </div>

                    <div class="form-group">
                        <label for="contactEmail">
                            <span class="label-icon">${Icons.labelEmail}</span> ${t('contact.email')}
                        </label>
                        <input type="email" id="contactEmail" class="win-input" placeholder="john@example.com" required>
                    </div>

                    <div class="form-group">
                        <label for="contactSubject">
                            <span class="label-icon">${Icons.labelSubject}</span> ${t('contact.subject')}
                        </label>
                        <select id="contactSubject" class="win-select">
                            <option value="general">${t('contact.subject.general')}</option>
                            <option value="job">${t('contact.subject.job')}</option>
                            <option value="project">${t('contact.subject.project')}</option>
                            <option value="feedback">${t('contact.subject.feedback')}</option>
                            <option value="bug">${t('contact.subject.bug')}</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="contactMessage">
                            <span class="label-icon">${Icons.labelMessage}</span> ${t('contact.message')}
                        </label>
                        <textarea id="contactMessage" class="win-textarea" rows="4" 
                            placeholder="${t('contact.messagePlaceholder')}" required></textarea>
                    </div>

                    ${Profile.turnstileSiteKey ? '<div class="form-group contact-turnstile" id="contactTurnstile"></div>' : ''}

                    <div class="form-actions">
                        <button type="submit" class="win-btn win-btn-primary"${Profile.turnstileSiteKey ? ' disabled' : ''}>
                            ${Icons.actSend} ${t('contact.send')}
                        </button>
                        <button type="reset" class="win-btn">
                            ${Icons.actTrash} ${t('contact.clear')}
                        </button>
                    </div>
                </form>

                <div class="contact-links">
                    <a href="${githubUrl()}" target="_blank" rel="noopener noreferrer" class="contact-link">
                        <span>${Icons.socialGithub}</span> GitHub
                    </a>
                    <a href="https://discord.com/users/${Profile.contact.discord}" target="_blank" rel="noopener noreferrer" class="contact-link">
                        <span>${Icons.socialDiscord}</span> Discord: ${Profile.contact.discord}
                    </a>
                    <a href="mailto:${Profile.contact.email}" class="contact-link">
                        <span>${Icons.secMail}</span> Email
                    </a>
                </div>
            </div>
        `;
    },

    onInit() {
        const container = document.querySelector('#window-contact');
        if (!container) return;

        const form = container.querySelector('#contactForm');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            ContactApp.sendMessage(container);
        });

        form?.addEventListener('reset', () => {
            SoundManager.play('click');
        });

        ContactApp.token = '';
        if (Profile.turnstileSiteKey && form) ContactApp.mountTurnstile(form);
    },

    // Cloudflare Turnstile anti-spam check; the script is loaded only when
    // the contact window opens. Send stays disabled until it passes.
    mountTurnstile(form) {
        const submit = form.querySelector('button[type="submit"]');
        const slot = form.querySelector('#contactTurnstile');
        const render = () => window.turnstile?.render(slot, {
            sitekey: Profile.turnstileSiteKey,
            callback: (token) => { ContactApp.token = token; submit.disabled = false; },
            'expired-callback': () => { ContactApp.token = ''; submit.disabled = true; },
            'error-callback': () => { ContactApp.token = ''; submit.disabled = true; }
        });
        if (window.turnstile) return render();
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.addEventListener('load', render);
        document.head.append(script);
    },

    sendMessage(container) {
        const name = container.querySelector('#contactName').value;
        const email = container.querySelector('#contactEmail').value;
        const subject = container.querySelector('#contactSubject').value;
        const message = container.querySelector('#contactMessage').value;
        const turnstileToken = ContactApp.token;

        // Show sending animation
        const formEl = container.querySelector('.contact-form');
        formEl.innerHTML = `
            <div class="contact-sending">
                <div class="sending-animation">
                    <div class="envelope">${Icons.secMail}</div>
                    <div class="dots">
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                </div>
                <p>${t('contact.sending')}</p>
            </div>
        `;

        SoundManager.play('click');

        // Send to backend API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, subject, message, turnstileToken }),
            signal: controller.signal
        })
        .then(response => response.json())
        .then(data => {
            clearTimeout(timeoutId);
            if (data.success) {
                SoundManager.play('chord');
                formEl.innerHTML = `
                    <div class="contact-success">
                        <div class="success-icon">${Icons.statusSuccess}</div>
                        <h3>${t('contact.sent')}</h3>
                        <p>${t('contact.thanks')} <strong>${escapeHtml(name)}</strong>!</p>
                        <p>${t('contact.willRespond', { email: `<strong>${escapeHtml(email)}</strong>` })}</p>
                        <div class="message-preview">
                            <div class="preview-label">${t('contact.yourMessage')}</div>
                            <div class="preview-content">"${escapeHtml(message.substring(0, 100))}${message.length > 100 ? '...' : ''}"</div>
                        </div>
                        <button class="win-btn" onclick="location.reload()">
                            📝 ${t('contact.sendAnother')}
                        </button>
                    </div>
                `;
            } else {
                throw new Error(data.error || 'Failed to send');
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.error('Contact form error:', error);
            SoundManager.play('error');
            formEl.innerHTML = `
                <div class="contact-success">
                    <div class="success-icon">${Icons.statusError}</div>
                    <h3>${t('contact.failed')}</h3>
                    <p>${escapeHtml(error.name === 'AbortError' ? t('contact.timeout') : error.message || t('contact.genericError'))}</p>
                        <button class="win-btn" onclick="location.reload()">
                            ${Icons.ctxRefresh} ${t('contact.tryAgain')}
                    </button>
                </div>
            `;
        });
    }
};

export default ContactApp;
