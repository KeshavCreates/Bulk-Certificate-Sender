const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

// Middleware
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer — store uploaded PDFs in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

// ─── Test SMTP Connection ──────────────────────────────────────
app.post('/api/test-smtp', async (req, res) => {
    const { host, port, secure, user, pass } = req.body;

    try {
        const isGmail = host && host.includes('gmail');
        const config = isGmail
            ? { service: 'gmail', auth: { user, pass }, connectionTimeout: 30000, socketTimeout: 60000, tls: { rejectUnauthorized: false } }
            : { host, port: Number(port), secure: secure === true || secure === 'true', auth: { user, pass }, connectionTimeout: 30000, socketTimeout: 60000, tls: { rejectUnauthorized: false } };

        const transporter = nodemailer.createTransport(config);
        await transporter.verify();
        transporter.close();
        res.json({ success: true, message: 'SMTP connection successful!' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ─── Batch Send Certificates (SSE for real-time progress) ──────
app.post('/api/send-batch', upload.array('pdfs', 500), async (req, res) => {
    // SSE for streaming progress
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, subject, fromName, emailBody } = req.body;

    let recipients;
    try {
        recipients = JSON.parse(req.body.recipients);
    } catch (e) {
        sendEvent({ type: 'error', message: 'Invalid recipients data' });
        sendEvent({ type: 'done', successCount: 0, failCount: 0 });
        res.end();
        return;
    }

    const files = req.files || [];
    if (files.length === 0 || recipients.length === 0) {
        sendEvent({ type: 'error', message: 'No files or recipients provided' });
        sendEvent({ type: 'done', successCount: 0, failCount: 0 });
        res.end();
        return;
    }

    // ── Create transporter with POOLING for parallel sends ──
    const isGmail = smtpHost && smtpHost.includes('gmail');
    const transportConfig = isGmail
        ? {
            service: 'gmail',
            auth: { user: smtpUser, pass: smtpPass },
            pool: true,
            maxConnections: 10,
            maxMessages: Infinity,
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 120000,
            tls: { rejectUnauthorized: false },
        }
        : {
            host: smtpHost,
            port: Number(smtpPort),
            secure: smtpSecure === 'true' || smtpSecure === true,
            auth: { user: smtpUser, pass: smtpPass },
            pool: true,
            maxConnections: 3,
            maxMessages: Infinity,
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 120000,
            tls: { rejectUnauthorized: false },
        };

    let transporter;
    try {
        transporter = nodemailer.createTransport(transportConfig);
        await transporter.verify();
        sendEvent({ type: 'info', message: '✅ SMTP connected. Sending emails (rate-limited)...' });
    } catch (err) {
        sendEvent({ type: 'error', message: `SMTP connection failed: ${err.message}` });
        sendEvent({ type: 'done', successCount: 0, failCount: 0 });
        res.end();
        return;
    }

    let successCount = 0;
    let failCount = 0;
    let completed = 0;
    const senderName = fromName || 'Certificate App';
    const total = recipients.length;
    const DELAY_MS = 1500;       // 1.5s between emails
    const MAX_RETRIES = 3;       // retry temporary failures up to 3 times

    // ── Helper: delay ──
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // ── Send ONE email with retry ──
    async function sendOne(i) {
        const recipient = recipients[i];
        const file = files[i];

        if (!recipient.email || !recipient.email.includes('@')) {
            failCount++;
            completed++;
            sendEvent({ type: 'skip', index: i, name: recipient.name, message: 'No valid email', completed, total });
            return;
        }
        if (!file) {
            failCount++;
            completed++;
            sendEvent({ type: 'fail', index: i, name: recipient.name, email: recipient.email, message: 'No PDF', completed, total });
            return;
        }

        // Build email HTML body
        let htmlBody;
        if (emailBody && emailBody.trim()) {
            const personalizedBody = emailBody.replace(/\{NAME\}/gi, recipient.name || 'there');
            const bodyHtml = personalizedBody.replace(/\n/g, '<br>');
            htmlBody = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
                    <p style="color: #333; line-height: 1.7; font-size: 15px;">${bodyHtml}</p>
                    <p style="color: #888; font-size: 13px; margin-top: 24px;">Sent via CertifyPro.</p>
                </div>
            `;
        } else {
            htmlBody = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
                    <h2 style="color: #1a1a2e;">Congratulations${recipient.name ? ', ' + recipient.name : ''}! 🎉</h2>
                    <p style="color: #444; line-height: 1.6;">Please find your certificate attached.</p>
                    <p style="color: #888; font-size: 13px; margin-top: 24px;">Sent via CertifyPro.</p>
                </div>
            `;
        }

        const mailOptions = {
            from: `"${senderName}" <${smtpUser}>`,
            to: recipient.email,
            subject: subject || 'Your Certificate',
            html: htmlBody,
            attachments: [{
                filename: `Certificate-${recipient.name || 'document'}.pdf`,
                content: file.buffer,
                contentType: 'application/pdf',
            }],
        };

        // Retry loop for temporary failures (4xx)
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                await transporter.sendMail(mailOptions);
                successCount++;
                completed++;
                sendEvent({ type: 'success', index: i, name: recipient.name, email: recipient.email, completed, total });
                return; // success — exit retry loop
            } catch (err) {
                const isTemporary = err.responseCode && err.responseCode >= 400 && err.responseCode < 500;
                if (isTemporary && attempt < MAX_RETRIES) {
                    const backoff = attempt * 3000; // 3s, 6s, 9s
                    sendEvent({ type: 'info', message: `⏳ Retry ${attempt}/${MAX_RETRIES} for ${recipient.email} (waiting ${backoff / 1000}s)...` });
                    await sleep(backoff);
                } else {
                    failCount++;
                    completed++;
                    sendEvent({ type: 'fail', index: i, name: recipient.name, email: recipient.email, message: err.message, completed, total });
                    return;
                }
            }
        }
    }

    // ── SEQUENTIAL SEND with rate limiting ──
    for (let i = 0; i < recipients.length; i++) {
        await sendOne(i);
        // Delay between emails to avoid rate limits (skip delay after last one)
        if (i < recipients.length - 1) {
            await sleep(DELAY_MS);
        }
    }

    transporter.close();
    sendEvent({ type: 'done', successCount, failCount });
    res.end();
});

// ─── Fallback ──────────────────────────────────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n  🎓 Certificate Generator running at http://localhost:${PORT}\n`);
});
