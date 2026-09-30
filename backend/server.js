const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || process.env.SMTP_USER;

// Security middleware
app.use(helmet());
app.set('trust proxy', 1);
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost'
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// The no-JavaScript contact form posts a regular HTML form; answer it with a
// redirect to a static page instead of JSON.
const isFormPost = req => req.is('application/x-www-form-urlencoded');
const replyPage = (req, kind) => `/contact-${kind}${req.body?.lang === 'pl' ? '.pl' : ''}.html`;

function reply(req, res, status, body) {
    if (isFormPost(req)) return res.redirect(303, replyPage(req, status < 400 ? 'sent' : 'error'));
    return res.status(status).json(body);
}

// Visitor address: behind the Cloudflare tunnel and nginx, req.ip is the proxy,
// so prefer the header Cloudflare sets.
const clientIp = req => req.get('cf-connecting-ip') || req.ip;

// Cloudflare Turnstile: when TURNSTILE_SECRET is set, every message needs a token
// that the widget produced in the visitor's browser.
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || '';

async function verifyTurnstile(token, ip) {
    if (typeof token !== 'string' || !token || token.length > 2048) return false;
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip || '' }),
            signal: AbortSignal.timeout(5000)
        });
        return (await response.json()).success === true;
    } catch (error) {
        console.error('Turnstile verification failed:', error.message);
        return false;
    }
}

// Rate limiting - max 5 contact requests per 15 minutes per IP
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: clientIp,
    handler: (req, res) => reply(req, res, 429, { error: 'Too many requests, please try again later.' })
});

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Service status for the Network app.
// STATUS_SERVICES="Name|https://service.example.com,Other|https://other.example.com"
// The list comes only from the environment, never from the request.
const STATUS_SERVICES = (process.env.STATUS_SERVICES || '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .map((entry) => {
        const [name, url] = entry.includes('|') ? entry.split('|') : [entry, entry];
        return { name: name.trim(), url: url.trim() };
    })
    .filter(service => /^https?:\/\//.test(service.url));
const STATUS_TTL = 60 * 1000;
let statusCache = null;

async function checkService(service) {
    const started = Date.now();
    try {
        const response = await fetch(service.url, {
            method: 'GET',
            redirect: 'manual',
            signal: AbortSignal.timeout(5000),
            headers: { 'User-Agent': 'PortfolioOS-Status/1.0' }
        });
        response.body?.cancel().catch(() => {});
        return { ...service, up: response.status < 500, code: response.status, ms: Date.now() - started };
    } catch (error) {
        return { ...service, up: false, code: null, ms: null };
    }
}

async function buildStatus() {
    const services = await Promise.all(STATUS_SERVICES.map(checkService));
    return {
        host: {
            label: process.env.STATUS_HOST_LABEL || os.hostname(),
            platform: `${os.type()} ${os.arch()}`,
            uptime: Math.round(os.uptime()),
            load: os.loadavg().map(value => Math.round(value * 100) / 100),
            cpus: os.cpus().length,
            memory: { total: os.totalmem(), free: os.freemem() }
        },
        services,
        checkedAt: new Date().toISOString()
    };
}

app.get('/status', async (req, res) => {
    try {
        if (!STATUS_SERVICES.length) return res.status(404).json({ error: 'Status is not configured.' });
        if (!statusCache || Date.now() - statusCache.time > STATUS_TTL) {
            statusCache = { time: Date.now(), promise: buildStatus() };
        }
        res.set('Cache-Control', 'public, max-age=30');
        res.json(await statusCache.promise);
    } catch (error) {
        statusCache = null;
        res.status(500).json({ error: 'Status check failed.' });
    }
});

// Contact form endpoint
app.post('/contact', contactLimiter, async (req, res) => {
    try {
        const input = req.body || {};
        const name = typeof input.name === 'string' ? input.name.trim() : '';
        const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
        const subject = typeof input.subject === 'string' ? input.subject.trim() : '';
        const message = typeof input.message === 'string' ? input.message.trim() : '';

        // Honeypot field of the no-JS form: bots fill it, people never see it.
        if (typeof input.website === 'string' && input.website.trim()) {
            return reply(req, res, 200, { success: true, message: 'Message sent successfully!' });
        }

        if (TURNSTILE_SECRET && !(await verifyTurnstile(input.turnstileToken || input['cf-turnstile-response'], clientIp(req)))) {
            return reply(req, res, 400, { error: 'Verification failed. Please reload the page and try again.' });
        }

        const escapeHtml = (value) => String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        // Validation
        if (!name || !email || !message) {
            return reply(req, res, 400, { error: 'Name, email, and message are required.' });
        }

        if (name.length > 120 || email.length > 254 || message.length > 5000) {
            return reply(req, res, 400, { error: 'Name, email, or message is too long.' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return reply(req, res, 400, { error: 'Invalid email address.' });
        }

        // Subject mapping
        const subjectMap = {
            'general': 'General Inquiry',
            'job': 'Job Opportunity',
            'project': 'Project Collaboration',
            'feedback': 'Feedback',
            'bug': 'Bug Report'
        };

        const subjectText = subjectMap[subject] || 'Contact Form';
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subjectText);
        const safeMessage = escapeHtml(message);

        // Send email
        const mailOptions = {
            from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
            to: CONTACT_EMAIL,
            replyTo: email,
            subject: `[Portfolio] ${subjectText} from ${name}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #000080, #1084d0); color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">📧 New Contact Message</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Portfolio OS Contact Form</p>
                    </div>
                    <div style="background: #f5f5f5; padding: 20px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 100px;">From:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${safeName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Subject:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${safeSubject}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #000080;">
                            <h3 style="margin: 0 0 10px 0; color: #000080;">Message:</h3>
                            <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
                        </div>
                    </div>
                    <div style="background: #c0c0c0; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                        Sent from Portfolio OS • ${new Date().toLocaleString()}
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log(`✅ Contact email sent from ${name} <${email}>`);
        reply(req, res, 200, { success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('❌ Email error:', error);
        reply(req, res, 500, { error: 'Failed to send message. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Portfolio Backend running on port ${PORT}`);
    if (CONTACT_EMAIL) {
        console.log(`📧 Contact emails will be sent to: ${CONTACT_EMAIL}`);
    } else {
        console.warn('⚠️  CONTACT_EMAIL and SMTP_USER are not set - the contact form will not be able to send emails.');
    }
});
