const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// Rate limiting - max 5 contact requests per 15 minutes per IP
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many requests, please try again later.' }
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

// Contact form endpoint
app.post('/contact', contactLimiter, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address.' });
        }

        // Subject mapping
        const subjectMap = {
            'general': 'General Inquiry',
            'job': 'Job Opportunity',
            'project': 'Project Collaboration',
            'feedback': 'Feedback',
            'bug': 'Bug Report'
        };

        const subjectText = subjectMap[subject] || subject || 'Contact Form';

        // Send email
        const mailOptions = {
            from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_EMAIL || 'alex.szotek@gmail.com',
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
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Subject:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${subjectText}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #000080;">
                            <h3 style="margin: 0 0 10px 0; color: #000080;">Message:</h3>
                            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
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
        res.json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('❌ Email error:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Portfolio Backend running on port ${PORT}`);
    console.log(`📧 Contact emails will be sent to: ${process.env.CONTACT_EMAIL || 'alex.szotek@gmail.com'}`);
});
