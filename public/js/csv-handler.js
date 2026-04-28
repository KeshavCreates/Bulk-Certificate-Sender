/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   csv-handler.js — CSV Upload & Parse with PapaParse
   + Duplicate email detection & removal
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const CSVHandler = (() => {
    let parsedData = []; // Array of { name, email }

    function init() {
        const dropZone = document.getElementById('csv-drop-zone');
        const fileInput = document.getElementById('csv-upload');

        // Click to upload
        dropZone.addEventListener('click', (e) => {
            if (e.target === fileInput || e.target.tagName === 'LABEL') return;
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                parseFile(e.target.files[0]);
            }
        });

        // Drag & drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                parseFile(e.dataTransfer.files[0]);
            }
        });
    }

    function parseFile(file) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                processParsed(results);
            },
            error: (err) => {
                alert('Error parsing CSV: ' + err.message);
            },
        });
    }

    function processParsed(results) {
        const fields = results.meta.fields || [];

        // Try to find Name and Email columns (case-insensitive)
        const nameCol = fields.find(f => /^name$/i.test(f.trim()));
        const emailCol = fields.find(f => /^e[-]?mail$/i.test(f.trim()));

        if (!nameCol) {
            alert('CSV must have a "Name" column. Found columns: ' + fields.join(', '));
            return;
        }

        parsedData = results.data
            .map((row, i) => ({
                idx: i + 1,
                name: (row[nameCol] || '').trim(),
                email: emailCol ? (row[emailCol] || '').trim() : '',
            }))
            .filter(r => r.name.length > 0);

        renderPreview();
    }

    function renderPreview() {
        const wrapper = document.getElementById('csv-preview-wrapper');
        const countEl = document.getElementById('csv-count');
        const tbody = document.querySelector('#csv-table tbody');

        wrapper.style.display = 'block';

        // ── Detect duplicates ──
        const duplicates = findDuplicateEmails();
        const dupSet = new Set(duplicates.map(d => d.toLowerCase()));

        // Update count with duplicate warning
        let countText = `(${parsedData.length} entries)`;
        if (duplicates.length > 0) {
            countText += ` — ⚠ ${duplicates.length} duplicate email(s)`;
        }
        countEl.innerHTML = countText;

        // Show duplicate warning banner
        let dupBanner = document.getElementById('duplicate-warning');
        if (duplicates.length > 0) {
            if (!dupBanner) {
                dupBanner = document.createElement('div');
                dupBanner.id = 'duplicate-warning';
                dupBanner.className = 'duplicate-warning';
                wrapper.insertBefore(dupBanner, wrapper.querySelector('.table-scroll'));
            }
            dupBanner.innerHTML = `
                <span class="dup-icon">⚠️</span>
                <div class="dup-body">
                    <strong>Duplicate emails detected!</strong>
                    <p>${duplicates.join(', ')}</p>
                    <p class="dup-hint">These recipients will receive multiple certificates. Click below to keep only the first occurrence of each.</p>
                </div>
                <button class="btn btn-sm btn-danger" id="btn-remove-dups">🗑 Remove Duplicates</button>
            `;
            dupBanner.style.display = 'flex';

            // Attach remove handler
            document.getElementById('btn-remove-dups').addEventListener('click', removeDuplicates);
        } else if (dupBanner) {
            dupBanner.style.display = 'none';
        }

        tbody.innerHTML = '';
        parsedData.forEach((row) => {
            const tr = document.createElement('tr');
            const emailClass = row.email ? '' : ' class="csv-error"';
            const isDup = row.email && dupSet.has(row.email.toLowerCase());
            const dupTag = isDup ? ' <span class="dup-tag">DUP</span>' : '';
            tr.innerHTML = `
        <td>${row.idx}</td>
        <td>${escapeHtml(row.name)}</td>
        <td${emailClass}>${row.email ? escapeHtml(row.email) + dupTag : '⚠ No email'}</td>
      `;
            if (isDup) tr.classList.add('row-duplicate');
            tbody.appendChild(tr);
        });

        // Enable next button
        document.getElementById('btn-next-3').disabled = parsedData.length === 0;
    }

    // ── Remove duplicate emails (keep first occurrence) ──
    function removeDuplicates() {
        const seen = new Set();
        const before = parsedData.length;
        parsedData = parsedData.filter(row => {
            if (!row.email) return true;
            const key = row.email.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        // Re-index
        parsedData.forEach((row, i) => { row.idx = i + 1; });
        const removed = before - parsedData.length;
        renderPreview();
        // Brief visual feedback
        if (removed > 0) {
            const countEl = document.getElementById('csv-count');
            countEl.innerHTML = `(${parsedData.length} entries) — ✅ Removed ${removed} duplicate(s)`;
        }
    }

    function findDuplicateEmails() {
        const emailCount = {};
        parsedData.forEach(r => {
            if (r.email) {
                const key = r.email.toLowerCase();
                emailCount[key] = (emailCount[key] || 0) + 1;
            }
        });
        return Object.keys(emailCount).filter(e => emailCount[e] > 1);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getData() {
        return parsedData;
    }

    function hasEmails() {
        return parsedData.some(r => r.email && r.email.includes('@'));
    }

    // Restore CSV data from a draft (without re-uploading a file)
    function setData(data) {
        if (!Array.isArray(data) || data.length === 0) return;
        parsedData = data;
        renderPreview();
    }

    return { init, getData, hasEmails, setData };
})();
