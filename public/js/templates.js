/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   templates.js — 3 Certificate Template Definitions
   Drawn programmatically on Fabric.js canvas
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const CertTemplates = (() => {
    const W = 842; // A4 landscape width in px
    const H = 595; // A4 landscape height in px

    // ───────────── Helper: Create corner ornament ─────────────
    function cornerOrnament(x, y, size, color, angle) {
        const line1 = new fabric.Line([0, 0, size, 0], {
            stroke: color, strokeWidth: 2, selectable: false,
        });
        const line2 = new fabric.Line([0, 0, 0, size], {
            stroke: color, strokeWidth: 2, selectable: false,
        });
        const group = new fabric.Group([line1, line2], {
            left: x, top: y, angle: angle, selectable: false, evented: false,
        });
        return group;
    }

    // ═══════════════════════════════════════════════════════════
    //  TEMPLATE 1: Royal Blue
    // ═══════════════════════════════════════════════════════════
    function royalBlue(canvas, isPreview = false) {
        canvas.clear();
        canvas.backgroundColor = '#ffffff';

        const scale = isPreview ? 0.35 : 1;
        const s = (v) => v * scale;

        // Outer border
        canvas.add(new fabric.Rect({
            left: s(15), top: s(15),
            width: s(W - 30), height: s(H - 30),
            fill: 'transparent',
            stroke: '#1a3a6b',
            strokeWidth: s(4),
            rx: s(4), ry: s(4),
            selectable: false, evented: false,
        }));

        // Inner border
        canvas.add(new fabric.Rect({
            left: s(25), top: s(25),
            width: s(W - 50), height: s(H - 50),
            fill: 'transparent',
            stroke: '#c9a84c',
            strokeWidth: s(2),
            rx: s(2), ry: s(2),
            selectable: false, evented: false,
        }));

        // Gold accent line top
        canvas.add(new fabric.Line([s(100), s(130), s(W - 100), s(130)], {
            stroke: '#c9a84c', strokeWidth: s(1.5), selectable: false, evented: false,
        }));

        // Corner ornaments
        const ornSize = s(30);
        canvas.add(cornerOrnament(s(30), s(30), ornSize, '#c9a84c', 0));
        canvas.add(cornerOrnament(s(W - 30), s(30), ornSize, '#c9a84c', 90));
        canvas.add(cornerOrnament(s(W - 30), s(H - 30), ornSize, '#c9a84c', 180));
        canvas.add(cornerOrnament(s(30), s(H - 30), ornSize, '#c9a84c', 270));

        // "CERTIFICATE" title
        canvas.add(new fabric.Textbox('CERTIFICATE', {
            left: s(W / 2), top: s(60),
            originX: 'center', originY: 'top',
            fontFamily: 'Playfair Display',
            fontSize: s(42),
            fontWeight: 700,
            fill: '#1a3a6b',
            textAlign: 'center',
            width: s(600),
            charSpacing: s(300),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // "OF ACHIEVEMENT"
        canvas.add(new fabric.Textbox('OF ACHIEVEMENT', {
            left: s(W / 2), top: s(108),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(16),
            fontWeight: 400,
            fill: '#888888',
            textAlign: 'center',
            width: s(300),
            charSpacing: s(500),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // "This is proudly presented to"
        canvas.add(new fabric.Textbox('This is proudly presented to', {
            left: s(W / 2), top: s(165),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(14),
            fill: '#666666',
            textAlign: 'center',
            width: s(400),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // {NAME} placeholder
        canvas.add(new fabric.Textbox('{NAME}', {
            left: s(W / 2), top: s(205),
            originX: 'center', originY: 'top',
            fontFamily: 'Playfair Display',
            fontSize: s(44),
            fontWeight: 700,
            fill: '#1a3a6b',
            textAlign: 'center',
            width: s(600),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
            _isNameField: true,
        }));

        // Decorative line under name
        canvas.add(new fabric.Line([s(250), s(268), s(W - 250), s(268)], {
            stroke: '#c9a84c', strokeWidth: s(1), selectable: false, evented: false,
        }));

        // Description
        canvas.add(new fabric.Textbox('For outstanding performance and dedication in completing the program with excellence and distinction.', {
            left: s(W / 2), top: s(290),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(13),
            fill: '#777777',
            textAlign: 'center',
            width: s(480),
            lineHeight: 1.5,
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Date
        canvas.add(new fabric.Textbox('{DATE}', {
            left: s(W / 2), top: s(380),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(13),
            fill: '#888888',
            textAlign: 'center',
            width: s(200),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Signature lines
        canvas.add(new fabric.Line([s(120), s(470), s(320), s(470)], {
            stroke: '#bbbbbb', strokeWidth: s(1), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('Signature', {
            left: s(220), top: s(478),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(11),
            fill: '#999999',
            textAlign: 'center',
            width: s(200),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        canvas.add(new fabric.Line([s(W - 320), s(470), s(W - 120), s(470)], {
            stroke: '#bbbbbb', strokeWidth: s(1), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('{ORG}', {
            left: s(W - 220), top: s(478),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(11),
            fill: '#999999',
            textAlign: 'center',
            width: s(200),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Logo placeholder area — small text indicator
        canvas.add(new fabric.Textbox('[ Logo ]', {
            left: s(W / 2), top: s(520),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(10),
            fill: '#cccccc',
            textAlign: 'center',
            width: s(100),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
            _isLogoPlaceholder: true,
        }));

        // Bottom gold line
        canvas.add(new fabric.Line([s(100), s(510), s(W - 100), s(510)], {
            stroke: '#c9a84c', strokeWidth: s(1.5), selectable: false, evented: false,
        }));

        canvas.renderAll();
    }

    // ═══════════════════════════════════════════════════════════
    //  TEMPLATE 2: Modern Minimal
    // ═══════════════════════════════════════════════════════════
    function modernMinimal(canvas, isPreview = false) {
        canvas.clear();
        canvas.backgroundColor = '#fafafa';

        const scale = isPreview ? 0.35 : 1;
        const s = (v) => v * scale;

        // Left accent bar
        canvas.add(new fabric.Rect({
            left: 0, top: 0,
            width: s(8), height: s(H),
            fill: '#2d3436',
            selectable: false, evented: false,
        }));

        // Top thin line
        canvas.add(new fabric.Line([s(40), s(40), s(W - 40), s(40)], {
            stroke: '#e0e0e0', strokeWidth: s(1), selectable: false, evented: false,
        }));

        // Bottom thin line
        canvas.add(new fabric.Line([s(40), s(H - 40), s(W - 40), s(H - 40)], {
            stroke: '#e0e0e0', strokeWidth: s(1), selectable: false, evented: false,
        }));

        // Accent circle (decorative)
        canvas.add(new fabric.Circle({
            left: s(W - 120), top: s(60),
            radius: s(40),
            fill: 'transparent',
            stroke: '#00b894',
            strokeWidth: s(2),
            selectable: false, evented: false,
        }));
        canvas.add(new fabric.Circle({
            left: s(W - 110), top: s(70),
            radius: s(20),
            fill: '#00b894',
            opacity: 0.15,
            selectable: false, evented: false,
        }));

        // "CERTIFICATE"
        canvas.add(new fabric.Textbox('CERTIFICATE', {
            left: s(60), top: s(70),
            fontFamily: 'Inter',
            fontSize: s(36),
            fontWeight: 700,
            fill: '#2d3436',
            width: s(500),
            charSpacing: s(200),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // "of completion"
        canvas.add(new fabric.Textbox('of completion', {
            left: s(62), top: s(110),
            fontFamily: 'Inter',
            fontSize: s(16),
            fontWeight: 300,
            fill: '#00b894',
            width: s(300),
            charSpacing: s(100),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // "Awarded to"
        canvas.add(new fabric.Textbox('Awarded to', {
            left: s(60), top: s(175),
            fontFamily: 'Inter',
            fontSize: s(13),
            fill: '#999999',
            width: s(200),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // {NAME}
        canvas.add(new fabric.Textbox('{NAME}', {
            left: s(60), top: s(200),
            fontFamily: 'Inter',
            fontSize: s(48),
            fontWeight: 700,
            fill: '#2d3436',
            width: s(600),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
            _isNameField: true,
        }));

        // Accent underline
        canvas.add(new fabric.Rect({
            left: s(60), top: s(262),
            width: s(60), height: s(3),
            fill: '#00b894',
            selectable: false, evented: false,
        }));

        // Description
        canvas.add(new fabric.Textbox('For successfully completing the program requirements and demonstrating exceptional skill and commitment.', {
            left: s(60), top: s(285),
            fontFamily: 'Inter',
            fontSize: s(13),
            fill: '#888888',
            width: s(500),
            lineHeight: 1.6,
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Date
        canvas.add(new fabric.Textbox('{DATE}', {
            left: s(60), top: s(370),
            fontFamily: 'Inter',
            fontSize: s(12),
            fill: '#aaaaaa',
            width: s(200),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Signature section
        canvas.add(new fabric.Line([s(60), s(460), s(240), s(460)], {
            stroke: '#dddddd', strokeWidth: s(1), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('Signature', {
            left: s(60), top: s(466),
            fontFamily: 'Inter',
            fontSize: s(10),
            fill: '#bbbbbb',
            width: s(180),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        canvas.add(new fabric.Line([s(300), s(460), s(480), s(460)], {
            stroke: '#dddddd', strokeWidth: s(1), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('{ORG}', {
            left: s(300), top: s(466),
            fontFamily: 'Inter',
            fontSize: s(10),
            fill: '#bbbbbb',
            width: s(180),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Logo placeholder
        canvas.add(new fabric.Textbox('[ Logo ]', {
            left: s(W - 140), top: s(H - 80),
            fontFamily: 'Inter',
            fontSize: s(10),
            fill: '#cccccc',
            textAlign: 'center',
            width: s(80),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
            _isLogoPlaceholder: true,
        }));

        canvas.renderAll();
    }

    // ═══════════════════════════════════════════════════════════
    //  TEMPLATE 3: Emerald Classic
    // ═══════════════════════════════════════════════════════════
    function emeraldClassic(canvas, isPreview = false) {
        canvas.clear();
        canvas.backgroundColor = '#fffef8';

        const scale = isPreview ? 0.35 : 1;
        const s = (v) => v * scale;

        // Green outer border
        canvas.add(new fabric.Rect({
            left: s(10), top: s(10),
            width: s(W - 20), height: s(H - 20),
            fill: 'transparent',
            stroke: '#1a5c38',
            strokeWidth: s(5),
            selectable: false, evented: false,
        }));

        // Gold inner border
        canvas.add(new fabric.Rect({
            left: s(22), top: s(22),
            width: s(W - 44), height: s(H - 44),
            fill: 'transparent',
            stroke: '#b8860b',
            strokeWidth: s(2),
            selectable: false, evented: false,
        }));

        // Decorative inner border with dashes
        canvas.add(new fabric.Rect({
            left: s(32), top: s(32),
            width: s(W - 64), height: s(H - 64),
            fill: 'transparent',
            stroke: '#1a5c38',
            strokeWidth: s(1),
            strokeDashArray: [s(8), s(4)],
            selectable: false, evented: false,
        }));

        // Gold ribbon banner at top
        const ribbonPoints = [
            { x: s(W / 2 - 160), y: s(50) },
            { x: s(W / 2 + 160), y: s(50) },
            { x: s(W / 2 + 150), y: s(75) },
            { x: s(W / 2 + 160), y: s(100) },
            { x: s(W / 2 - 160), y: s(100) },
            { x: s(W / 2 - 150), y: s(75) },
        ];
        canvas.add(new fabric.Polygon(ribbonPoints, {
            fill: '#1a5c38',
            selectable: false, evented: false,
        }));

        canvas.add(new fabric.Textbox('CERTIFICATE', {
            left: s(W / 2), top: s(58),
            originX: 'center', originY: 'top',
            fontFamily: 'Playfair Display',
            fontSize: s(26),
            fontWeight: 700,
            fill: '#f0e6c0',
            textAlign: 'center',
            width: s(300),
            charSpacing: s(400),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // "OF EXCELLENCE"
        canvas.add(new fabric.Textbox('OF EXCELLENCE', {
            left: s(W / 2), top: s(118),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(14),
            fill: '#b8860b',
            textAlign: 'center',
            width: s(200),
            charSpacing: s(400),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Decorative rule
        canvas.add(new fabric.Line([s(200), s(150), s(W - 200), s(150)], {
            stroke: '#b8860b', strokeWidth: s(1), selectable: false, evented: false,
        }));

        // "This certifies that"
        canvas.add(new fabric.Textbox('This certifies that', {
            left: s(W / 2), top: s(168),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(13),
            fill: '#666666',
            textAlign: 'center',
            width: s(300),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // {NAME}
        canvas.add(new fabric.Textbox('{NAME}', {
            left: s(W / 2), top: s(200),
            originX: 'center', originY: 'top',
            fontFamily: 'Playfair Display',
            fontSize: s(46),
            fontWeight: 700,
            fill: '#1a5c38',
            textAlign: 'center',
            width: s(600),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
            _isNameField: true,
        }));

        // Gold underline
        canvas.add(new fabric.Line([s(250), s(260), s(W - 250), s(260)], {
            stroke: '#b8860b', strokeWidth: s(1.5), selectable: false, evented: false,
        }));

        // Description
        canvas.add(new fabric.Textbox('Has demonstrated exceptional commitment and excellence in completing all requirements, hereby earning this certificate of recognition.', {
            left: s(W / 2), top: s(285),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(12),
            fill: '#777777',
            textAlign: 'center',
            width: s(460),
            lineHeight: 1.6,
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Date
        canvas.add(new fabric.Textbox('{DATE}', {
            left: s(W / 2), top: s(370),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(12),
            fill: '#888888',
            textAlign: 'center',
            width: s(200),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Signature lines
        canvas.add(new fabric.Line([s(120), s(460), s(300), s(460)], {
            stroke: '#b8860b', strokeWidth: s(0.5), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('Authorized Signature', {
            left: s(210), top: s(466),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(9),
            fill: '#aaaaaa',
            textAlign: 'center',
            width: s(180),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        canvas.add(new fabric.Line([s(W - 300), s(460), s(W - 120), s(460)], {
            stroke: '#b8860b', strokeWidth: s(0.5), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('{ORG}', {
            left: s(W - 210), top: s(466),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(9),
            fill: '#aaaaaa',
            textAlign: 'center',
            width: s(180),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
        }));

        // Logo placeholder
        canvas.add(new fabric.Textbox('[ Logo ]', {
            left: s(W / 2), top: s(510),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter',
            fontSize: s(10),
            fill: '#cccccc',
            textAlign: 'center',
            width: s(100),
            selectable: !isPreview,
            evented: !isPreview,
            editable: !isPreview,
            _isLogoPlaceholder: true,
        }));

        // Bottom decorative line
        canvas.add(new fabric.Line([s(200), s(500), s(W - 200), s(500)], {
            stroke: '#b8860b', strokeWidth: s(1), selectable: false, evented: false,
        }));

        canvas.renderAll();
    }

    // ═══════════════════════════════════════════════════════════
    //  TEMPLATE 4: Crimson Prestige
    // ═══════════════════════════════════════════════════════════
    function crimsonPrestige(canvas, isPreview = false) {
        canvas.clear();
        canvas.backgroundColor = '#fdf8f4';

        const scale = isPreview ? 0.35 : 1;
        const s = (v) => v * scale;

        // Deep red outer border
        canvas.add(new fabric.Rect({
            left: s(12), top: s(12),
            width: s(W - 24), height: s(H - 24),
            fill: 'transparent',
            stroke: '#8b1a1a', strokeWidth: s(4),
            selectable: false, evented: false,
        }));

        // Gold double inner border
        canvas.add(new fabric.Rect({
            left: s(20), top: s(20),
            width: s(W - 40), height: s(H - 40),
            fill: 'transparent',
            stroke: '#d4a634', strokeWidth: s(1.5),
            selectable: false, evented: false,
        }));
        canvas.add(new fabric.Rect({
            left: s(26), top: s(26),
            width: s(W - 52), height: s(H - 52),
            fill: 'transparent',
            stroke: '#d4a634', strokeWidth: s(1),
            selectable: false, evented: false,
        }));

        // Corner ornaments
        const ornSize = s(35);
        canvas.add(cornerOrnament(s(30), s(30), ornSize, '#8b1a1a', 0));
        canvas.add(cornerOrnament(s(W - 30), s(30), ornSize, '#8b1a1a', 90));
        canvas.add(cornerOrnament(s(W - 30), s(H - 30), ornSize, '#8b1a1a', 180));
        canvas.add(cornerOrnament(s(30), s(H - 30), ornSize, '#8b1a1a', 270));

        // Top decorative accent bar
        canvas.add(new fabric.Rect({
            left: s(W / 2 - 100), top: s(42),
            width: s(200), height: s(3),
            fill: '#d4a634', selectable: false, evented: false,
        }));

        // "CERTIFICATE" title
        canvas.add(new fabric.Textbox('CERTIFICATE', {
            left: s(W / 2), top: s(65),
            originX: 'center', originY: 'top',
            fontFamily: 'Playfair Display',
            fontSize: s(40), fontWeight: 700,
            fill: '#8b1a1a', textAlign: 'center',
            width: s(600), charSpacing: s(350),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // "OF DISTINCTION"
        canvas.add(new fabric.Textbox('OF DISTINCTION', {
            left: s(W / 2), top: s(112),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(14),
            fill: '#d4a634', textAlign: 'center',
            width: s(300), charSpacing: s(500),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Gold line
        canvas.add(new fabric.Line([s(150), s(145), s(W - 150), s(145)], {
            stroke: '#d4a634', strokeWidth: s(1), selectable: false, evented: false,
        }));

        // "Proudly Presented To"
        canvas.add(new fabric.Textbox('Proudly Presented To', {
            left: s(W / 2), top: s(165),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(13), fill: '#888',
            textAlign: 'center', width: s(300),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // {NAME}
        canvas.add(new fabric.Textbox('{NAME}', {
            left: s(W / 2), top: s(200),
            originX: 'center', originY: 'top',
            fontFamily: 'Playfair Display',
            fontSize: s(46), fontWeight: 700,
            fill: '#8b1a1a', textAlign: 'center', width: s(620),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
            _isNameField: true,
        }));

        // Decorative underline
        canvas.add(new fabric.Rect({
            left: s(W / 2 - 50), top: s(262),
            width: s(100), height: s(2),
            fill: '#d4a634', selectable: false, evented: false,
        }));

        // Description
        canvas.add(new fabric.Textbox('In recognition of exceptional achievement, leadership, and unwavering dedication to excellence in all endeavors.', {
            left: s(W / 2), top: s(285),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(12), fill: '#777',
            textAlign: 'center', width: s(460), lineHeight: 1.6,
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Date
        canvas.add(new fabric.Textbox('{DATE}', {
            left: s(W / 2), top: s(370),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(12), fill: '#999',
            textAlign: 'center', width: s(200),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Signature lines
        canvas.add(new fabric.Line([s(120), s(465), s(300), s(465)], {
            stroke: '#d4a634', strokeWidth: s(0.5), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('Signature', {
            left: s(210), top: s(472), originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(10), fill: '#aaa',
            textAlign: 'center', width: s(180),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));
        canvas.add(new fabric.Line([s(W - 300), s(465), s(W - 120), s(465)], {
            stroke: '#d4a634', strokeWidth: s(0.5), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('{ORG}', {
            left: s(W - 210), top: s(472), originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(10), fill: '#aaa',
            textAlign: 'center', width: s(180),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Logo placeholder
        canvas.add(new fabric.Textbox('[ Logo ]', {
            left: s(W / 2), top: s(520), originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(10), fill: '#ccc',
            textAlign: 'center', width: s(100),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
            _isLogoPlaceholder: true,
        }));

        // Bottom gold line
        canvas.add(new fabric.Line([s(150), s(505), s(W - 150), s(505)], {
            stroke: '#d4a634', strokeWidth: s(1), selectable: false, evented: false,
        }));

        canvas.renderAll();
    }

    // ═══════════════════════════════════════════════════════════
    //  TEMPLATE 5: Midnight Galaxy
    // ═══════════════════════════════════════════════════════════
    function midnightGalaxy(canvas, isPreview = false) {
        canvas.clear();
        canvas.backgroundColor = '#0f0c29';

        const scale = isPreview ? 0.35 : 1;
        const s = (v) => v * scale;

        // Dark gradient background layers
        canvas.add(new fabric.Rect({
            left: 0, top: 0, width: s(W), height: s(H),
            fill: '#0f0c29', selectable: false, evented: false,
        }));
        canvas.add(new fabric.Rect({
            left: 0, top: s(H * 0.3), width: s(W), height: s(H * 0.7),
            fill: '#1a1440', opacity: 0.6,
            selectable: false, evented: false,
        }));

        // Glowing border
        canvas.add(new fabric.Rect({
            left: s(18), top: s(18),
            width: s(W - 36), height: s(H - 36),
            fill: 'transparent',
            stroke: '#7c5cbf', strokeWidth: s(2),
            rx: s(8), ry: s(8),
            selectable: false, evented: false,
        }));
        canvas.add(new fabric.Rect({
            left: s(24), top: s(24),
            width: s(W - 48), height: s(H - 48),
            fill: 'transparent',
            stroke: '#4ecdc4', strokeWidth: s(1),
            strokeDashArray: [s(12), s(6)],
            rx: s(6), ry: s(6),
            selectable: false, evented: false,
        }));

        // Decorative circles (stars)
        const starPositions = [[80, 80], [W - 90, 70], [120, H - 90], [W - 100, H - 80], [W / 2 + 200, 60]];
        starPositions.forEach(([x, y]) => {
            canvas.add(new fabric.Circle({
                left: s(x), top: s(y), radius: s(3),
                fill: '#4ecdc4', opacity: 0.5,
                selectable: false, evented: false,
            }));
        });

        // "CERTIFICATE" with glow effect
        canvas.add(new fabric.Textbox('CERTIFICATE', {
            left: s(W / 2), top: s(65),
            originX: 'center', originY: 'top',
            fontFamily: 'Playfair Display',
            fontSize: s(40), fontWeight: 700,
            fill: '#e8d8f5', textAlign: 'center',
            width: s(600), charSpacing: s(350),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // "OF EXCELLENCE"
        canvas.add(new fabric.Textbox('OF EXCELLENCE', {
            left: s(W / 2), top: s(112),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(14),
            fill: '#4ecdc4', textAlign: 'center',
            width: s(300), charSpacing: s(500),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Accent line
        canvas.add(new fabric.Line([s(200), s(142), s(W - 200), s(142)], {
            stroke: '#7c5cbf', strokeWidth: s(1), selectable: false, evented: false,
        }));

        // "Awarded to"
        canvas.add(new fabric.Textbox('Awarded to', {
            left: s(W / 2), top: s(165),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(13), fill: '#9b8ec4',
            textAlign: 'center', width: s(300),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // {NAME}
        canvas.add(new fabric.Textbox('{NAME}', {
            left: s(W / 2), top: s(200),
            originX: 'center', originY: 'top',
            fontFamily: 'Playfair Display',
            fontSize: s(46), fontWeight: 700,
            fill: '#ffffff', textAlign: 'center', width: s(620),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
            _isNameField: true,
        }));

        // Teal underline
        canvas.add(new fabric.Rect({
            left: s(W / 2 - 40), top: s(262),
            width: s(80), height: s(3),
            fill: '#4ecdc4', selectable: false, evented: false,
        }));

        // Description
        canvas.add(new fabric.Textbox('For demonstrating extraordinary talent and commitment, reaching new heights of accomplishment and inspiring others along the way.', {
            left: s(W / 2), top: s(288),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(12), fill: '#a89cc8',
            textAlign: 'center', width: s(460), lineHeight: 1.6,
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Date
        canvas.add(new fabric.Textbox('{DATE}', {
            left: s(W / 2), top: s(370),
            originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(12), fill: '#7c5cbf',
            textAlign: 'center', width: s(200),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Signature lines
        canvas.add(new fabric.Line([s(120), s(465), s(300), s(465)], {
            stroke: '#4ecdc4', strokeWidth: s(0.5), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('Signature', {
            left: s(210), top: s(472), originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(10), fill: '#7c5cbf',
            textAlign: 'center', width: s(180),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));
        canvas.add(new fabric.Line([s(W - 300), s(465), s(W - 120), s(465)], {
            stroke: '#4ecdc4', strokeWidth: s(0.5), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('{ORG}', {
            left: s(W - 210), top: s(472), originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(10), fill: '#7c5cbf',
            textAlign: 'center', width: s(180),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Logo placeholder
        canvas.add(new fabric.Textbox('[ Logo ]', {
            left: s(W / 2), top: s(520), originX: 'center', originY: 'top',
            fontFamily: 'Inter', fontSize: s(10), fill: '#5a4f7a',
            textAlign: 'center', width: s(100),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
            _isLogoPlaceholder: true,
        }));

        // Bottom accent
        canvas.add(new fabric.Line([s(200), s(505), s(W - 200), s(505)], {
            stroke: '#7c5cbf', strokeWidth: s(1), selectable: false, evented: false,
        }));

        canvas.renderAll();
    }

    // ═══════════════════════════════════════════════════════════
    //  TEMPLATE 6: Coral Sunset
    // ═══════════════════════════════════════════════════════════
    function coralSunset(canvas, isPreview = false) {
        canvas.clear();
        canvas.backgroundColor = '#fff9f5';

        const scale = isPreview ? 0.35 : 1;
        const s = (v) => v * scale;

        // Warm coral left accent
        canvas.add(new fabric.Rect({
            left: 0, top: 0,
            width: s(6), height: s(H),
            fill: '#e17055', selectable: false, evented: false,
        }));

        // Right side accent
        canvas.add(new fabric.Rect({
            left: s(W - 6), top: 0,
            width: s(6), height: s(H),
            fill: '#fab1a0', selectable: false, evented: false,
        }));

        // Top and bottom subtle lines
        canvas.add(new fabric.Line([s(30), s(30), s(W - 30), s(30)], {
            stroke: '#fab1a0', strokeWidth: s(1), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Line([s(30), s(H - 30), s(W - 30), s(H - 30)], {
            stroke: '#fab1a0', strokeWidth: s(1), selectable: false, evented: false,
        }));

        // Decorative circle top-right
        canvas.add(new fabric.Circle({
            left: s(W - 130), top: s(50),
            radius: s(35), fill: 'transparent',
            stroke: '#e17055', strokeWidth: s(2), opacity: 0.3,
            selectable: false, evented: false,
        }));
        canvas.add(new fabric.Circle({
            left: s(W - 115), top: s(65),
            radius: s(15), fill: '#e17055', opacity: 0.08,
            selectable: false, evented: false,
        }));

        // "CERTIFICATE"
        canvas.add(new fabric.Textbox('CERTIFICATE', {
            left: s(60), top: s(65),
            fontFamily: 'Playfair Display',
            fontSize: s(38), fontWeight: 700,
            fill: '#2d3436', width: s(500), charSpacing: s(250),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // "of appreciation"
        canvas.add(new fabric.Textbox('of appreciation', {
            left: s(62), top: s(108),
            fontFamily: 'Inter', fontSize: s(15), fontWeight: 300,
            fill: '#e17055', width: s(300), charSpacing: s(150),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Coral accent bar
        canvas.add(new fabric.Rect({
            left: s(60), top: s(145),
            width: s(50), height: s(3),
            fill: '#e17055', selectable: false, evented: false,
        }));

        // "Presented to"
        canvas.add(new fabric.Textbox('Presented to', {
            left: s(60), top: s(170),
            fontFamily: 'Inter', fontSize: s(13), fill: '#999',
            width: s(200),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // {NAME}
        canvas.add(new fabric.Textbox('{NAME}', {
            left: s(60), top: s(198),
            fontFamily: 'Playfair Display',
            fontSize: s(46), fontWeight: 700,
            fill: '#2d3436', width: s(620),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
            _isNameField: true,
        }));

        // Peach underline
        canvas.add(new fabric.Rect({
            left: s(60), top: s(260),
            width: s(70), height: s(3),
            fill: '#fab1a0', selectable: false, evented: false,
        }));

        // Description
        canvas.add(new fabric.Textbox('For outstanding contributions, heartfelt dedication, and a spirit of generosity that has positively impacted our community.', {
            left: s(60), top: s(283),
            fontFamily: 'Inter', fontSize: s(12), fill: '#888',
            width: s(500), lineHeight: 1.6,
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Date
        canvas.add(new fabric.Textbox('{DATE}', {
            left: s(60), top: s(365),
            fontFamily: 'Inter', fontSize: s(12), fill: '#aaa', width: s(200),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Signature section
        canvas.add(new fabric.Line([s(60), s(460), s(240), s(460)], {
            stroke: '#e17055', strokeWidth: s(0.5), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('Signature', {
            left: s(60), top: s(466),
            fontFamily: 'Inter', fontSize: s(10), fill: '#bbb', width: s(180),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));
        canvas.add(new fabric.Line([s(300), s(460), s(480), s(460)], {
            stroke: '#e17055', strokeWidth: s(0.5), selectable: false, evented: false,
        }));
        canvas.add(new fabric.Textbox('{ORG}', {
            left: s(300), top: s(466),
            fontFamily: 'Inter', fontSize: s(10), fill: '#bbb', width: s(180),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
        }));

        // Logo placeholder
        canvas.add(new fabric.Textbox('[ Logo ]', {
            left: s(W - 140), top: s(H - 80),
            fontFamily: 'Inter', fontSize: s(10), fill: '#ddd',
            textAlign: 'center', width: s(80),
            selectable: !isPreview, evented: !isPreview, editable: !isPreview,
            _isLogoPlaceholder: true,
        }));

        canvas.renderAll();
    }

    // ── Public definitions ──
    const templates = [
        {
            id: 'royal-blue',
            name: 'Royal Blue',
            description: 'Elegant blue & gold design with ornamental details',
            render: royalBlue,
        },
        {
            id: 'modern-minimal',
            name: 'Modern Minimal',
            description: 'Clean, contemporary design with green accents',
            render: modernMinimal,
        },
        {
            id: 'emerald-classic',
            name: 'Emerald Classic',
            description: 'Traditional green & gold with a ribbon banner',
            render: emeraldClassic,
        },
        {
            id: 'crimson-prestige',
            name: 'Crimson Prestige',
            description: 'Luxurious red & gold with distinguished styling',
            render: crimsonPrestige,
        },
        {
            id: 'midnight-galaxy',
            name: 'Midnight Galaxy',
            description: 'Dark cosmic theme with purple & teal accents',
            render: midnightGalaxy,
        },
        {
            id: 'coral-sunset',
            name: 'Coral Sunset',
            description: 'Warm coral & peach modern appreciation design',
            render: coralSunset,
        },
    ];

    return { templates, W, H };
})();
