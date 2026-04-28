/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   app.js — Main App Controller & UI Orchestration
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    let selectedTemplateId = null;
    let restoringDraft = false;  // flag to prevent loadTemplate during draft restore

    // ── Initialize Modules ──
    CertEditor.init();
    CSVHandler.init();
    renderTemplateCards();

    // ── Check for saved draft ──
    const draft = CertEditor.loadDraft();
    if (draft) {
        showDraftBanner(draft);
    }

    // ── Step Navigation ──
    function goToStep(step) {
        currentStep = step;

        // Update panels
        document.querySelectorAll('.step-panel').forEach((panel) => {
            panel.classList.remove('active');
        });
        document.getElementById(`step-${step}`).classList.add('active');

        // Update step indicator
        document.querySelectorAll('.steps-bar .step').forEach((el) => {
            const s = parseInt(el.dataset.step);
            el.classList.remove('active', 'completed');
            if (s === step) el.classList.add('active');
            else if (s < step) el.classList.add('completed');
        });

        // Show floating draft button from step 2 onwards
        const floatingDraft = document.getElementById('floating-draft-actions');
        floatingDraft.style.display = step >= 2 ? 'flex' : 'none';

        // If entering step 2, load the template on the main editor canvas
        // BUT skip if we're restoring a draft (canvas is already loaded)
        if (step === 2 && selectedTemplateId && selectedTemplateId !== 'custom' && !restoringDraft) {
            CertEditor.loadTemplate(selectedTemplateId);
        }
    }

    // ── Template Cards (Step 1) ──
    function renderTemplateCards() {
        const grid = document.getElementById('template-grid');
        grid.innerHTML = '';

        CertTemplates.templates.forEach((tpl) => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.dataset.id = tpl.id;

            card.innerHTML = `
        <div class="template-preview">
          <canvas id="preview-${tpl.id}"></canvas>
        </div>
        <h3>${tpl.name}</h3>
        <p>${tpl.description}</p>
      `;

            card.addEventListener('click', () => {
                document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedTemplateId = tpl.id;
                document.getElementById('btn-next-1').disabled = false;
            });

            grid.appendChild(card);

            // Render preview on mini canvas
            setTimeout(() => {
                const previewCanvas = new fabric.StaticCanvas(`preview-${tpl.id}`, {
                    width: Math.round(CertTemplates.W * 0.35),
                    height: Math.round(CertTemplates.H * 0.35),
                });
                tpl.render(previewCanvas, true);
            }, 100);
        });
    }

    // ── Custom template upload (Step 1) ──
    document.getElementById('custom-bg-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Deselect any template card
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        selectedTemplateId = 'custom';
        document.getElementById('btn-next-1').disabled = false;
        // Load on editor canvas and go to step 2
        CertEditor.loadCustomBackground(file);
        goToStep(2);
    });

    // ── Button Bindings (5 steps) ──
    document.getElementById('btn-next-1').addEventListener('click', () => goToStep(2));
    document.getElementById('btn-back-2').addEventListener('click', () => goToStep(1));
    document.getElementById('btn-next-2').addEventListener('click', () => goToStep(3));
    document.getElementById('btn-back-3').addEventListener('click', () => goToStep(2));
    document.getElementById('btn-next-3').addEventListener('click', () => goToStep(4));
    document.getElementById('btn-back-4').addEventListener('click', () => goToStep(3));
    document.getElementById('btn-next-4').addEventListener('click', () => goToStep(5));
    document.getElementById('btn-back-5').addEventListener('click', () => goToStep(4));

    // ── SMTP Presets ──
    document.querySelectorAll('.smtp-preset').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.smtp-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const host = btn.dataset.host;
            const port = btn.dataset.port;
            const secure = btn.dataset.secure;
            document.getElementById('smtp-host').value = host;
            document.getElementById('smtp-port').value = port;
            document.getElementById('smtp-secure').value = secure;
        });
    });

    // ── Generate & Send / Download / Preview ──
    document.getElementById('btn-test-smtp').addEventListener('click', () => Generator.testSMTP());
    document.getElementById('btn-generate-send').addEventListener('click', () => Generator.generateAndSend());
    document.getElementById('btn-download-all').addEventListener('click', () => Generator.downloadAll());
    document.getElementById('btn-preview-cert').addEventListener('click', () => Generator.generatePreview());

    // ── Email Body Toggle (Default vs Custom) ──
    document.querySelectorAll('.email-body-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.email-body-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.mode;
            document.getElementById('email-body-default-preview').style.display = mode === 'default' ? 'block' : 'none';
            document.getElementById('email-body-custom').style.display = mode === 'custom' ? 'block' : 'none';
            // Clear custom textarea when switching to default
            if (mode === 'default') {
                document.getElementById('email-body').value = '';
            }
        });
    });

    // ── Save Draft (both inline Step 2 button & floating button) ──
    function handleSaveDraft(btn) {
        // Save the editor draft (canvas, SMTP, email body, step)
        const ok = CertEditor.saveDraft();
        if (ok) {
            // Also save CSV data alongside the draft
            try {
                const csvData = CSVHandler.getData();
                if (csvData && csvData.length > 0) {
                    localStorage.setItem('certifyPro_draft_csv', JSON.stringify(csvData));
                }
            } catch (e) { /* CSV save is best-effort */ }

            const orig = btn.textContent;
            btn.textContent = '✅ Saved!';
            btn.disabled = true;
            setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2000);
        } else {
            alert('Failed to save draft. Your browser may not support localStorage.');
        }
    }

    document.getElementById('btn-save-draft').addEventListener('click', function () {
        handleSaveDraft(this);
    });
    document.getElementById('btn-save-draft-float').addEventListener('click', function () {
        handleSaveDraft(this);
    });

    // ── Draft banner ──
    function showDraftBanner(draft) {
        const banner = document.createElement('div');
        banner.className = 'draft-banner';
        banner.innerHTML = `
            <span class="draft-banner-icon">💾</span>
            <div class="draft-banner-text">
                <strong>Saved draft found!</strong>
                <span>Saved ${formatTimeAgo(draft.savedAt)}</span>
            </div>
            <button class="btn btn-sm btn-primary" id="btn-restore-draft">Restore Draft</button>
            <button class="btn btn-sm btn-secondary" id="btn-dismiss-draft">Dismiss</button>
        `;

        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(banner, mainContent.firstChild);

        document.getElementById('btn-restore-draft').addEventListener('click', () => {
            restoringDraft = true;
            selectedTemplateId = draft.templateId;
            const targetStep = draft.currentStep || 2;

            // Step 1: Navigate to step 2 so canvas is visible
            goToStep(2);

            // Step 2: Restore canvas — onComplete fires when loadFromJSON is done
            const success = CertEditor.restoreDraft(draft, () => {
                // Canvas is now fully loaded and rendered

                // Step 3: Restore CSV data
                try {
                    const csvRaw = localStorage.getItem('certifyPro_draft_csv');
                    if (csvRaw) {
                        const csvData = JSON.parse(csvRaw);
                        if (csvData && csvData.length > 0) {
                            CSVHandler.setData(csvData);
                        }
                    }
                } catch (e) { /* CSV restore is best-effort */ }

                // Step 4: Restore SMTP config fields
                if (draft.smtpConfig) {
                    const sc = draft.smtpConfig;
                    if (sc.host) document.getElementById('smtp-host').value = sc.host;
                    if (sc.port) document.getElementById('smtp-port').value = sc.port;
                    if (sc.secure) document.getElementById('smtp-secure').value = sc.secure;
                    if (sc.user) document.getElementById('smtp-user').value = sc.user;
                    if (sc.fromName) document.getElementById('from-name').value = sc.fromName;
                    if (sc.subject) document.getElementById('email-subject').value = sc.subject;
                }

                // Step 5: Restore email body
                if (draft.emailBody) {
                    const bodyEl = document.getElementById('email-body');
                    if (bodyEl) {
                        bodyEl.value = draft.emailBody;
                        const customOpt = document.getElementById('email-body-custom');
                        const defaultOpt = document.getElementById('email-body-default');
                        const defaultPreview = document.getElementById('email-body-default-preview');
                        if (customOpt && defaultOpt && defaultPreview) {
                            customOpt.classList.add('active');
                            defaultOpt.classList.remove('active');
                            bodyEl.style.display = 'block';
                            defaultPreview.style.display = 'none';
                        }
                    }
                }

                // Step 6: Navigate to saved step
                if (targetStep > 2) {
                    goToStep(targetStep);
                }

                restoringDraft = false;
                banner.remove();
            });

            if (!success) {
                restoringDraft = false;
                alert('Failed to restore draft. The draft may be corrupted.');
            }
        });

        document.getElementById('btn-dismiss-draft').addEventListener('click', () => {
            CertEditor.deleteDraft();
            banner.remove();
        });
    }

    function formatTimeAgo(isoString) {
        const diff = Date.now() - new Date(isoString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins} min ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
});
