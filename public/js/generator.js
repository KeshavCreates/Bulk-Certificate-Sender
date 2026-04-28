/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   generator.js — PDF Generation + Batch Email Sending
   + Email body, Preview before send, Progress persistence
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const Generator = (() => {
    let isRunning = false;

    // ── Generate a single PDF blob from the canvas ──
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        // Use JPEG instead of PNG — much smaller file, faster SMTP transfer
        const dataURL = CertEditor.toDataURL('image/jpeg', 0.7);
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [CertTemplates.W, CertTemplates.H],
            compress: true,
        });
        doc.addImage(dataURL, 'JPEG', 0, 0, CertTemplates.W, CertTemplates.H);
        return doc.output('blob');
    }

    // ── Generate all PDFs from CSV data ──
    async function generateAllPDFs(data) {
        const nameField = CertEditor.getNameField();
        if (!nameField) {
            alert('No {NAME} field found on the canvas.');
            return null;
        }

        const originalName = nameField.text;
        const pdfs = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            nameField.set('text', row.name);
            CertEditor.getCanvas().renderAll();

            // Brief yield to let canvas render
            await sleep(30);

            const pdfBlob = generatePDF();
            pdfs.push(pdfBlob);

            updateProgress(
                i + 1, data.length,
                `📄 Generated PDF: ${row.name}`,
                'info'
            );
        }

        // Restore original
        nameField.set('text', originalName);
        CertEditor.getCanvas().renderAll();

        return pdfs;
    }

    // ── Preview: Generate a single certificate with the first name ──
    function generatePreview() {
        const data = CSVHandler.getData();
        if (data.length === 0) {
            alert('No CSV data loaded. Go back to Step 3 and upload a CSV.');
            return;
        }

        const nameField = CertEditor.getNameField();
        if (!nameField) {
            alert('No {NAME} field found on the canvas.');
            return;
        }

        const originalName = nameField.text;
        const firstName = data[0].name;

        // Set name and render
        nameField.set('text', firstName);
        CertEditor.getCanvas().renderAll();

        // Get preview image
        const previewURL = CertEditor.toDataURL('image/jpeg', 0.8);

        // Restore
        nameField.set('text', originalName);
        CertEditor.getCanvas().renderAll();

        // Show preview modal
        showPreviewModal(previewURL, firstName, data.length);
    }

    function showPreviewModal(imageURL, name, totalCount) {
        // Remove existing modal if any
        const existing = document.getElementById('preview-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'preview-modal';
        modal.className = 'preview-modal-overlay';
        modal.innerHTML = `
            <div class="preview-modal-content">
                <div class="preview-modal-header">
                    <h3>📋 Certificate Preview</h3>
                    <button class="preview-modal-close" id="close-preview">&times;</button>
                </div>
                <p class="preview-modal-info">Showing certificate for <strong>${name}</strong> (first of ${totalCount} recipients)</p>
                <div class="preview-modal-image">
                    <img src="${imageURL}" alt="Certificate Preview" />
                </div>
                <div class="preview-modal-actions">
                    <button class="btn btn-secondary" id="close-preview-btn">Close</button>
                    <button class="btn btn-primary" id="confirm-send-btn">✅ Looks Good — Send All</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        document.getElementById('close-preview').addEventListener('click', () => modal.remove());
        document.getElementById('close-preview-btn').addEventListener('click', () => modal.remove());
        document.getElementById('confirm-send-btn').addEventListener('click', () => {
            modal.remove();
            generateAndSend();
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // ── Download All as ZIP ──
    async function downloadAll() {
        if (isRunning) return;
        isRunning = true;

        const data = CSVHandler.getData();
        if (data.length === 0) {
            alert('No CSV data loaded.');
            isRunning = false;
            return;
        }

        showProgress(true);
        logMessage('📄 Generating PDFs...', 'info');

        const pdfs = await generateAllPDFs(data);
        if (!pdfs) { isRunning = false; return; }

        const zip = new JSZip();
        for (let i = 0; i < data.length; i++) {
            const safeName = data[i].name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
            zip.file(`Certificate_${safeName}.pdf`, pdfs[i]);
        }

        logMessage('📦 Creating ZIP file...', 'info');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Certificates.zip';
        a.click();
        URL.revokeObjectURL(url);

        logMessage('✅ All certificates downloaded!', 'success');
        isRunning = false;
    }

    // ── Generate & Send via Email (Batch) ──
    async function generateAndSend() {
        if (isRunning) return;
        isRunning = true;

        const data = CSVHandler.getData();
        if (data.length === 0) {
            alert('No CSV data loaded.');
            isRunning = false;
            return;
        }

        const smtpHost = document.getElementById('smtp-host').value.trim();
        const smtpPort = document.getElementById('smtp-port').value.trim();
        const smtpSecure = document.getElementById('smtp-secure').value;
        const smtpUser = document.getElementById('smtp-user').value.trim();
        const smtpPass = document.getElementById('smtp-pass').value.trim();
        const subject = document.getElementById('email-subject').value.trim() || 'Your Certificate';
        const fromName = document.getElementById('from-name').value.trim() || 'Certificate App';
        const emailBody = document.getElementById('email-body').value.trim() || '';

        if (!smtpUser || !smtpPass) {
            alert('Please enter your SMTP email and password.');
            isRunning = false;
            return;
        }

        showProgress(true);

        // ── Load progress persistence (resume if interrupted) ──
        const progressKey = `certifyPro_progress_${smtpUser}`;
        const savedProgress = loadProgress(progressKey);
        let startIndex = 0;
        if (savedProgress && savedProgress.total === data.length) {
            const resumeCount = savedProgress.sentEmails.length;
            if (resumeCount > 0 && resumeCount < data.length) {
                const resume = confirm(
                    `Found ${resumeCount} previously sent emails from an interrupted session.\n\nResume from where you left off? (${data.length - resumeCount} remaining)\n\nClick "OK" to resume, or "Cancel" to start fresh.`
                );
                if (resume) {
                    startIndex = resumeCount;
                    logMessage(`⏩ Resuming from email ${startIndex + 1} (${startIndex} already sent)`, 'info');
                } else {
                    clearProgress(progressKey);
                }
            }
        }

        // ─── Phase 1: Generate all PDFs ───
        logMessage('⚡ Phase 1: Generating all PDFs...', 'info');
        const pdfs = await generateAllPDFs(data);
        if (!pdfs) { isRunning = false; return; }
        logMessage(`✅ All ${pdfs.length} PDFs generated!`, 'success');

        // ─── Phase 2: Batch upload & send ───
        logMessage('📤 Phase 2: Uploading to server & sending emails...', 'info');

        const formData = new FormData();
        // Only add PDFs from startIndex onwards
        for (let i = startIndex; i < pdfs.length; i++) {
            formData.append('pdfs', pdfs[i], `cert_${i}.pdf`);
        }
        // Add recipients (only remaining ones)
        const recipients = data.slice(startIndex).map(r => ({ name: r.name, email: r.email }));
        formData.append('recipients', JSON.stringify(recipients));
        // Add SMTP config
        formData.append('smtpHost', smtpHost);
        formData.append('smtpPort', smtpPort);
        formData.append('smtpSecure', smtpSecure);
        formData.append('smtpUser', smtpUser);
        formData.append('smtpPass', smtpPass);
        formData.append('subject', subject);
        formData.append('fromName', fromName);
        formData.append('emailBody', emailBody);

        try {
            // Use fetch with SSE streaming
            const response = await fetch('/api/send-batch', {
                method: 'POST',
                body: formData,
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                // Keep the last incomplete line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event = JSON.parse(line.slice(6));
                            handleServerEvent(event, data.length, progressKey, startIndex);
                        } catch (e) {
                            // ignore parse errors on partial data
                        }
                    }
                }
            }
        } catch (err) {
            logMessage(`❌ Network error: ${err.message}`, 'error');
        }

        isRunning = false;
    }

    // ── Handle SSE events from server ──
    function handleServerEvent(event, totalFallback, progressKey, startIndex) {
        const c = (event.completed || 0) + startIndex;
        const t = event.total ? event.total + startIndex : totalFallback;
        switch (event.type) {
            case 'info':
                logMessage(`ℹ️ ${event.message}`, 'info');
                break;
            case 'success':
                updateProgress(c, t,
                    `✅ Sent to ${event.email} (${event.name})`, 'success');
                // Save progress
                saveProgress(progressKey, c, t, event.email);
                break;
            case 'fail':
                updateProgress(c, t,
                    `❌ Failed: ${event.email} — ${event.message || 'unknown error'}`, 'error');
                break;
            case 'skip':
                updateProgress(c, t,
                    `⚠ Skipped: ${event.name} — ${event.message}`, 'error');
                break;
            case 'error':
                logMessage(`❌ ${event.message}`, 'error');
                break;
            case 'done':
                logMessage(`🏁 Done! ${event.successCount} sent, ${event.failCount} failed.`,
                    event.successCount > 0 ? 'success' : 'error');
                clearProgress(progressKey);
                break;
        }
    }

    // ── Progress Persistence ──
    function saveProgress(key, completed, total, lastEmail) {
        try {
            const existing = JSON.parse(localStorage.getItem(key) || '{}');
            const sentEmails = existing.sentEmails || [];
            if (lastEmail) sentEmails.push(lastEmail);
            localStorage.setItem(key, JSON.stringify({
                completed, total, sentEmails,
                updatedAt: new Date().toISOString(),
            }));
        } catch (e) { /* ignore */ }
    }

    function loadProgress(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function clearProgress(key) {
        try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    }

    // ── Test SMTP ──
    async function testSMTP() {
        const smtpHost = document.getElementById('smtp-host').value.trim();
        const smtpPort = document.getElementById('smtp-port').value.trim();
        const smtpSecure = document.getElementById('smtp-secure').value;
        const smtpUser = document.getElementById('smtp-user').value.trim();
        const smtpPass = document.getElementById('smtp-pass').value.trim();

        const statusEl = document.getElementById('smtp-status');
        statusEl.textContent = 'Testing...';
        statusEl.className = 'smtp-status';

        if (!smtpUser || !smtpPass) {
            statusEl.textContent = '❌ Please enter email & password';
            statusEl.className = 'smtp-status error';
            return;
        }

        try {
            const res = await fetch('/api/test-smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    host: smtpHost,
                    port: smtpPort,
                    secure: smtpSecure === 'true',
                    user: smtpUser,
                    pass: smtpPass,
                }),
            });
            const data = await res.json();

            if (data.success) {
                statusEl.textContent = '✅ Connected!';
                statusEl.className = 'smtp-status success';
            } else {
                statusEl.textContent = '❌ ' + data.message;
                statusEl.className = 'smtp-status error';
            }
        } catch (err) {
            statusEl.textContent = '❌ ' + err.message;
            statusEl.className = 'smtp-status error';
        }
    }

    // ── Progress UI helpers ──
    function showProgress(show) {
        const panel = document.getElementById('progress-panel');
        panel.style.display = show ? 'block' : 'none';
        if (show) {
            document.getElementById('progress-bar').style.width = '0%';
            document.getElementById('progress-text').textContent = '0 / 0';
            document.getElementById('progress-log').innerHTML = '';
        }
    }

    function updateProgress(current, total, message, type) {
        const pct = Math.round((current / total) * 100);
        document.getElementById('progress-bar').style.width = pct + '%';
        document.getElementById('progress-text').textContent = `${current} / ${total}`;
        logMessage(message, type);
    }

    function logMessage(message, type) {
        const log = document.getElementById('progress-log');
        const div = document.createElement('div');
        div.className = `log-item ${type}`;
        div.textContent = message;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    return { downloadAll, generateAndSend, testSMTP, generatePreview };
})();
