/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   editor.js — Fabric.js Canvas Editor
   + Undo/Redo, Custom Template Upload, Save/Load Drafts
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const CertEditor = (() => {
    let canvas = null;
    let currentTemplate = null;

    // ── Undo/Redo State ──
    const undoStack = [];
    const redoStack = [];
    let isRestoring = false;
    const MAX_UNDO = 30;

    function init() {
        canvas = new fabric.Canvas('cert-canvas', {
            width: CertTemplates.W,
            height: CertTemplates.H,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
        });

        // When an object is selected, update toolbar to match
        canvas.on('selection:created', onObjectSelected);
        canvas.on('selection:updated', onObjectSelected);
        canvas.on('selection:cleared', onSelectionCleared);

        // ── Track changes for undo/redo ──
        canvas.on('object:modified', saveState);
        canvas.on('object:added', saveState);
        canvas.on('object:removed', saveState);

        setupToolbar();
        setupKeyboardShortcuts();
        setupGuidelines();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Snapping Guidelines (Canva / Instagram style)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const SNAP_THRESHOLD = 5;       // px distance to trigger snap
    const GUIDELINE_COLOR = '#ff00ff';     // magenta for canvas guidelines
    const GUIDELINE_OBJ_COLOR = '#00d4ff'; // cyan for object-to-object
    let activeGuidelines = [];

    function setupGuidelines() {
        canvas.on('object:moving', onObjectMoving);
        canvas.on('object:modified', clearGuidelines);
        canvas.on('mouse:up', clearGuidelines);
    }

    function onObjectMoving(e) {
        const target = e.target;
        if (!target || !target.selectable) return;

        clearGuidelines();

        const canvasW = canvas.getWidth();
        const canvasH = canvas.getHeight();
        const canvasCX = canvasW / 2;
        const canvasCY = canvasH / 2;

        // Get the bounding rect of the moving object
        const bound = target.getBoundingRect(true, true);
        const objCX = bound.left + bound.width / 2;
        const objCY = bound.top + bound.height / 2;
        const objLeft = bound.left;
        const objRight = bound.left + bound.width;
        const objTop = bound.top;
        const objBottom = bound.top + bound.height;

        let snappedX = false;
        let snappedY = false;

        // ── 1. Canvas center vertical line ──
        if (Math.abs(objCX - canvasCX) < SNAP_THRESHOLD) {
            target.set('left', canvasCX - (objCX - target.left));
            drawGuideline(canvasCX, 0, canvasCX, canvasH, GUIDELINE_COLOR);
            snappedX = true;
        }

        // ── 2. Canvas center horizontal line ──
        if (Math.abs(objCY - canvasCY) < SNAP_THRESHOLD) {
            target.set('top', canvasCY - (objCY - target.top));
            drawGuideline(0, canvasCY, canvasW, canvasCY, GUIDELINE_COLOR);
            snappedY = true;
        }

        // ── 3. Canvas edge snapping (left, right, top, bottom) ──
        const MARGIN = 20; // edge margin
        if (!snappedX && Math.abs(objLeft - MARGIN) < SNAP_THRESHOLD) {
            target.set('left', MARGIN - (objLeft - target.left));
            drawGuideline(MARGIN, 0, MARGIN, canvasH, GUIDELINE_COLOR, true);
        }
        if (!snappedX && Math.abs(objRight - (canvasW - MARGIN)) < SNAP_THRESHOLD) {
            target.set('left', (canvasW - MARGIN) - bound.width - (objLeft - target.left));
            drawGuideline(canvasW - MARGIN, 0, canvasW - MARGIN, canvasH, GUIDELINE_COLOR, true);
        }
        if (!snappedY && Math.abs(objTop - MARGIN) < SNAP_THRESHOLD) {
            target.set('top', MARGIN - (objTop - target.top));
            drawGuideline(0, MARGIN, canvasW, MARGIN, GUIDELINE_COLOR, true);
        }
        if (!snappedY && Math.abs(objBottom - (canvasH - MARGIN)) < SNAP_THRESHOLD) {
            target.set('top', (canvasH - MARGIN) - bound.height - (objTop - target.top));
            drawGuideline(0, canvasH - MARGIN, canvasW, canvasH - MARGIN, GUIDELINE_COLOR, true);
        }

        // ── 4. Object-to-object alignment ──
        const others = canvas.getObjects().filter(o =>
            o !== target && o.selectable !== false && !o._isGuideline
        );

        for (const other of others) {
            const ob = other.getBoundingRect(true, true);
            const oCX = ob.left + ob.width / 2;
            const oCY = ob.top + ob.height / 2;

            // Center-to-center vertical
            if (!snappedX && Math.abs(objCX - oCX) < SNAP_THRESHOLD) {
                target.set('left', oCX - (objCX - target.left));
                drawGuideline(oCX, 0, oCX, canvasH, GUIDELINE_OBJ_COLOR);
                snappedX = true;
            }
            // Center-to-center horizontal
            if (!snappedY && Math.abs(objCY - oCY) < SNAP_THRESHOLD) {
                target.set('top', oCY - (objCY - target.top));
                drawGuideline(0, oCY, canvasW, oCY, GUIDELINE_OBJ_COLOR);
                snappedY = true;
            }

            // Left edge alignment
            if (!snappedX && Math.abs(objLeft - ob.left) < SNAP_THRESHOLD) {
                target.set('left', ob.left - (objLeft - target.left));
                drawGuideline(ob.left, 0, ob.left, canvasH, GUIDELINE_OBJ_COLOR, true);
            }
            // Right edge alignment
            if (!snappedX && Math.abs(objRight - (ob.left + ob.width)) < SNAP_THRESHOLD) {
                target.set('left', (ob.left + ob.width) - bound.width - (objLeft - target.left));
                drawGuideline(ob.left + ob.width, 0, ob.left + ob.width, canvasH, GUIDELINE_OBJ_COLOR, true);
            }
            // Top edge alignment
            if (!snappedY && Math.abs(objTop - ob.top) < SNAP_THRESHOLD) {
                target.set('top', ob.top - (objTop - target.top));
                drawGuideline(0, ob.top, canvasW, ob.top, GUIDELINE_OBJ_COLOR, true);
            }
            // Bottom edge alignment
            if (!snappedY && Math.abs(objBottom - (ob.top + ob.height)) < SNAP_THRESHOLD) {
                target.set('top', (ob.top + ob.height) - bound.height - (objTop - target.top));
                drawGuideline(0, ob.top + ob.height, canvasW, ob.top + ob.height, GUIDELINE_OBJ_COLOR, true);
            }
        }

        target.setCoords();
    }

    function drawGuideline(x1, y1, x2, y2, color, dashed) {
        const line = new fabric.Line([x1, y1, x2, y2], {
            stroke: color || GUIDELINE_COLOR,
            strokeWidth: 1,
            strokeDashArray: dashed ? [4, 4] : null,
            selectable: false,
            evented: false,
            excludeFromExport: true,
            _isGuideline: true,
            opacity: 0.8,
        });
        canvas.add(line);
        line.bringToFront();
        activeGuidelines.push(line);
    }

    function clearGuidelines() {
        activeGuidelines.forEach(line => canvas.remove(line));
        activeGuidelines = [];
    }

    // ── Undo/Redo helpers ──
    function saveState(e) {
        if (isRestoring) return;
        // Skip guideline objects (snap lines being added/removed)
        if (e && e.target && e.target._isGuideline) return;
        if (activeGuidelines.length > 0) return;
        const json = JSON.stringify(canvas.toJSON(['_isNameField', '_isLogo', '_isLogoPlaceholder', '_isCustomBg', 'src', 'crossOrigin']));
        undoStack.push(json);
        if (undoStack.length > MAX_UNDO) undoStack.shift();
        redoStack.length = 0; // Clear redo on new action
        updateUndoRedoButtons();
    }

    function undo() {
        if (undoStack.length <= 1) return;
        redoStack.push(undoStack.pop());
        restoreState(undoStack[undoStack.length - 1]);
    }

    function redo() {
        if (redoStack.length === 0) return;
        const state = redoStack.pop();
        undoStack.push(state);
        restoreState(state);
    }

    function restoreState(json) {
        if (!json) return;
        isRestoring = true;
        canvas.loadFromJSON(JSON.parse(json), () => {
            canvas.renderAll();
            isRestoring = false;
            updateUndoRedoButtons();
        });
    }

    function updateUndoRedoButtons() {
        const undoBtn = document.getElementById('btn-undo');
        const redoBtn = document.getElementById('btn-redo');
        if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
        if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    }

    // ── Keyboard shortcuts ──
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle if not typing in an input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                redo();
            } else if (e.key === 'Delete') {
                const obj = canvas.getActiveObject();
                if (obj && obj.selectable) {
                    canvas.remove(obj);
                    canvas.renderAll();
                }
            }
        });
    }

    function onObjectSelected(e) {
        const obj = e.selected ? e.selected[0] : canvas.getActiveObject();
        if (obj && obj.type === 'textbox') {
            document.getElementById('font-family').value = obj.fontFamily || 'Inter';
            document.getElementById('font-size').value = Math.round(obj.fontSize) || 32;
            document.getElementById('font-color').value = obj.fill || '#1a1a2e';
        }
    }

    function onSelectionCleared() {
        // nothing specific needed
    }

    function setupToolbar() {
        // Font family change
        document.getElementById('font-family').addEventListener('change', (e) => {
            const obj = canvas.getActiveObject();
            if (obj && obj.type === 'textbox') {
                obj.set('fontFamily', e.target.value);
                canvas.renderAll();
            }
        });

        // Font size change
        document.getElementById('font-size').addEventListener('change', (e) => {
            const obj = canvas.getActiveObject();
            if (obj && obj.type === 'textbox') {
                obj.set('fontSize', parseInt(e.target.value));
                canvas.renderAll();
            }
        });

        // Font color change
        document.getElementById('font-color').addEventListener('input', (e) => {
            const obj = canvas.getActiveObject();
            if (obj && obj.type === 'textbox') {
                obj.set('fill', e.target.value);
                canvas.renderAll();
            }
        });

        // Bold toggle
        document.getElementById('btn-bold').addEventListener('click', () => {
            const obj = canvas.getActiveObject();
            if (obj && obj.type === 'textbox') {
                const isBold = obj.fontWeight === 'bold' || obj.fontWeight === 700;
                obj.set('fontWeight', isBold ? 400 : 700);
                canvas.renderAll();
            }
        });

        // Add text
        document.getElementById('btn-add-text').addEventListener('click', () => {
            const text = new fabric.Textbox('Your Text Here', {
                left: CertTemplates.W / 2,
                top: CertTemplates.H / 2,
                originX: 'center',
                originY: 'center',
                fontFamily: 'Inter',
                fontSize: 24,
                fill: '#333333',
                width: 300,
                textAlign: 'center',
            });
            canvas.add(text);
            canvas.setActiveObject(text);
            canvas.renderAll();
        });

        // Delete selected
        document.getElementById('btn-delete').addEventListener('click', () => {
            const obj = canvas.getActiveObject();
            if (obj && obj.selectable) {
                canvas.remove(obj);
                canvas.renderAll();
            }
        });

        // Undo/Redo buttons
        document.getElementById('btn-undo').addEventListener('click', () => undo());
        document.getElementById('btn-redo').addEventListener('click', () => redo());

        // Logo upload
        document.getElementById('logo-upload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                fabric.Image.fromURL(ev.target.result, (img) => {
                    // Remove existing logo placeholder
                    const objects = canvas.getObjects();
                    for (const obj of objects) {
                        if (obj._isLogoPlaceholder) {
                            canvas.remove(obj);
                        }
                    }
                    // Remove previous logo if any
                    for (const obj of canvas.getObjects()) {
                        if (obj._isLogo) {
                            canvas.remove(obj);
                        }
                    }
                    // Scale logo to fit ~120px wide
                    const maxW = 120;
                    const scale = maxW / img.width;
                    img.set({
                        left: CertTemplates.W / 2,
                        top: CertTemplates.H - 70,
                        originX: 'center',
                        originY: 'center',
                        scaleX: scale,
                        scaleY: scale,
                        _isLogo: true,
                    });
                    canvas.add(img);
                    canvas.renderAll();
                });
            };
            reader.readAsDataURL(file);
        });

        // ── Custom template background upload ──
        const customBgInput = document.getElementById('custom-bg-upload');
        if (customBgInput) {
            customBgInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                loadCustomBackground(file);
            });
        }
    }

    // ── Load custom image as template background ──
    function loadCustomBackground(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            fabric.Image.fromURL(ev.target.result, (img) => {
                canvas.clear();
                canvas.backgroundColor = '#ffffff';

                // Scale to fill canvas
                const scaleX = CertTemplates.W / img.width;
                const scaleY = CertTemplates.H / img.height;
                const scale = Math.max(scaleX, scaleY);

                img.set({
                    left: 0, top: 0,
                    scaleX: scale, scaleY: scale,
                    selectable: false, evented: false,
                    _isCustomBg: true,
                });
                canvas.add(img);

                // Add {NAME} placeholder on top
                canvas.add(new fabric.Textbox('{NAME}', {
                    left: CertTemplates.W / 2, top: CertTemplates.H / 2,
                    originX: 'center', originY: 'center',
                    fontFamily: 'Playfair Display',
                    fontSize: 44, fontWeight: 700,
                    fill: '#1a1a2e', textAlign: 'center',
                    width: 500,
                    _isNameField: true,
                }));

                canvas.renderAll();
                currentTemplate = { id: 'custom', name: 'Custom', description: 'Custom uploaded template' };
                saveState();
            });
        };
        reader.readAsDataURL(file);
    }

    function loadTemplate(templateId) {
        const tpl = CertTemplates.templates.find(t => t.id === templateId);
        if (!tpl) return;
        currentTemplate = tpl;
        tpl.render(canvas, false);
        // Save initial state for undo
        undoStack.length = 0;
        redoStack.length = 0;
        saveState();
    }

    function getCanvas() {
        return canvas;
    }

    function getCurrentTemplate() {
        return currentTemplate;
    }

    // Get the {NAME} text field for substitution
    function getNameField() {
        const objects = canvas.getObjects();
        for (const obj of objects) {
            if (obj._isNameField) return obj;
        }
        // Fallback: find any text containing {NAME}
        for (const obj of objects) {
            if (obj.type === 'textbox' && obj.text && obj.text.includes('{NAME}')) {
                obj._isNameField = true;
                return obj;
            }
        }
        return null;
    }

    // Export canvas as data URL
    function toDataURL(format, quality) {
        // Deselect all objects first for clean export
        canvas.discardActiveObject();
        canvas.renderAll();
        return canvas.toDataURL({
            format: format === 'image/jpeg' ? 'jpeg' : 'png',
            quality: quality || 1,
            multiplier: 2,
        });
    }

    // ── Save/Load draft to localStorage ──
    function saveDraft() {
        try {
            // Determine current step from the DOM
            let currentStep = 1;
            document.querySelectorAll('.step-panel').forEach((panel, i) => {
                if (panel.classList.contains('active')) currentStep = i + 1;
            });

            const draft = {
                templateId: currentTemplate ? currentTemplate.id : null,
                canvasJSON: canvas.toJSON(['_isNameField', '_isLogo', '_isLogoPlaceholder', '_isCustomBg', 'src', 'crossOrigin']),
                currentStep: currentStep,
                smtpConfig: {
                    host: document.getElementById('smtp-host')?.value || '',
                    port: document.getElementById('smtp-port')?.value || '',
                    secure: document.getElementById('smtp-secure')?.value || '',
                    user: document.getElementById('smtp-user')?.value || '',
                    fromName: document.getElementById('from-name')?.value || '',
                    subject: document.getElementById('email-subject')?.value || '',
                },
                emailBody: document.getElementById('email-body')?.value || '',
                savedAt: new Date().toISOString(),
            };
            const draftStr = JSON.stringify(draft);
            localStorage.setItem('certifyPro_draft', draftStr);
            return true;
        } catch (e) {
            console.warn('Failed to save draft:', e);
            if (e.name === 'QuotaExceededError') {
                alert('Storage is full. Try deleting old drafts or clearing browser data.');
            }
            return false;
        }
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem('certifyPro_draft');
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function restoreDraft(draft, onComplete) {
        if (!draft || !draft.canvasJSON) return false;
        isRestoring = true;
        canvas.loadFromJSON(draft.canvasJSON, () => {
            canvas.renderAll();
            isRestoring = false;
            currentTemplate = draft.templateId
                ? CertTemplates.templates.find(t => t.id === draft.templateId) || { id: draft.templateId, name: 'Saved' }
                : null;
            undoStack.length = 0;
            redoStack.length = 0;
            saveState();
            // Signal that canvas is ready
            if (typeof onComplete === 'function') onComplete();
        });
        return true;
    }

    function deleteDraft() {
        localStorage.removeItem('certifyPro_draft');
        localStorage.removeItem('certifyPro_draft_csv');
    }

    return {
        init, loadTemplate, getCanvas, getCurrentTemplate, getNameField, toDataURL,
        saveDraft, loadDraft, restoreDraft, deleteDraft, loadCustomBackground,
    };
})();
