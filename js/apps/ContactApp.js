/**
 * Contact App - Contact form with email simulation
 */

import { Icons } from '../icons.js';
import { SoundManager } from '../managers/SoundManager.js';

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
                    <div class="contact-icon">📧</div>
                    <div class="contact-title">
                        <h2>Get In Touch</h2>
                        <p>Send me a message and I'll get back to you!</p>
                    </div>
                </div>

                <form class="contact-form" id="contactForm">
                    <div class="form-group">
                        <label for="contactName">
                            <span class="label-icon">👤</span> Your Name:
                        </label>
                        <input type="text" id="contactName" class="win-input" placeholder="John Doe" required>
                    </div>

                    <div class="form-group">
                        <label for="contactEmail">
                            <span class="label-icon">📫</span> Email Address:
                        </label>
                        <input type="email" id="contactEmail" class="win-input" placeholder="john@example.com" required>
                    </div>

                    <div class="form-group">
                        <label for="contactSubject">
                            <span class="label-icon">📋</span> Subject:
                        </label>
                        <select id="contactSubject" class="win-select">
                            <option value="general">General Inquiry</option>
                            <option value="job">Job Opportunity</option>
                            <option value="project">Project Collaboration</option>
                            <option value="feedback">Feedback</option>
                            <option value="bug">Bug Report</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="contactMessage">
                            <span class="label-icon">💬</span> Message:
                        </label>
                        <textarea id="contactMessage" class="win-textarea" rows="4" 
                            placeholder="Type your message here..." required></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="win-btn win-btn-primary">
                            📤 Send Message
                        </button>
                        <button type="reset" class="win-btn">
                            🗑️ Clear
                        </button>
                    </div>
                </form>

                <div class="contact-links">
                    <a href="https://github.com/al3ksh" target="_blank" class="contact-link">
                        <span>🐙</span> GitHub
                    </a>
                    <a href="https://discord.com/users/aleksh8" target="_blank" class="contact-link">
                        <span>💬</span> Discord: aleksh8
                    </a>
                    <a href="mailto:alex.szotek@gmail.com" class="contact-link">
                        <span>📧</span> Email
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
    },

    sendMessage(container) {
        const name = container.querySelector('#contactName').value;
        const email = container.querySelector('#contactEmail').value;
        const subject = container.querySelector('#contactSubject').value;
        const message = container.querySelector('#contactMessage').value;

        // Show sending animation
        const formEl = container.querySelector('.contact-form');
        formEl.innerHTML = `
            <div class="contact-sending">
                <div class="sending-animation">
                    <div class="envelope">📧</div>
                    <div class="dots">
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                </div>
                <p>Sending message...</p>
            </div>
        `;

        SoundManager.play('click');

        // Send to backend API
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, subject, message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                SoundManager.play('chord');
                formEl.innerHTML = `
                    <div class="contact-success">
                        <div class="success-icon">✅</div>
                        <h3>Message Sent!</h3>
                        <p>Thanks <strong>${name}</strong>!</p>
                        <p>I'll respond to <strong>${email}</strong> as soon as possible.</p>
                        <div class="message-preview">
                            <div class="preview-label">Your message:</div>
                            <div class="preview-content">"${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"</div>
                        </div>
                        <button class="win-btn" onclick="location.reload()">
                            📝 Send Another
                        </button>
                    </div>
                `;
            } else {
                throw new Error(data.error || 'Failed to send');
            }
        })
        .catch(error => {
            console.error('Contact form error:', error);
            SoundManager.play('error');
            formEl.innerHTML = `
                <div class="contact-success">
                    <div class="success-icon">❌</div>
                    <h3>Failed to Send</h3>
                    <p>${error.message || 'Something went wrong. Please try again.'}</p>
                    <button class="win-btn" onclick="location.reload()">
                        🔄 Try Again
                    </button>
                </div>
            `;
        });
    }
};

export default ContactApp;
