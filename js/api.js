// js/api.js
// Global state
let students = [];
let attendance = {};
let isSaving = false;

// Parse CSV string into array of objects
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Simple CSV parser (handles quoted fields)
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
            const ch = line[j];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        values.push(current.trim());
        const obj = {};
        headers.forEach((h, idx) => {
            obj[h] = values[idx] || '';
        });
        rows.push(obj);
    }
    return rows;
}

// Load data from published CSV (Info tab)
async function loadDataFromGoogleSheets() {
    setSyncStatus('syncing', '🔄 同步中...');
    const container = document.getElementById('studentList');
    if (container) container.innerHTML = '<li class="loading-spinner">📖 載入成員資料中...</li>';

    try {
        console.log('📡 Fetching info CSV from:', CONFIG.INFO_CSV_URL);
        const response = await fetch(CONFIG.INFO_CSV_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const csvText = await response.text();
        console.log('📡 CSV received, length:', csvText.length);

        const rows = parseCSV(csvText);
        console.log('📡 Parsed rows:', rows);

        if (!rows || rows.length === 0) {
            if (container) container.innerHTML = '<li style="text-align:center;padding:30px;color:#666;">📭 尚未有成員資料<br><small>請在 Google Sheets 的 "Info" 分頁中加入成員資料</small></li>';
            students = [];
            attendance = {};
            setSyncStatus('synced', '✅ 已同步 (0位成員)');
            updateSummaryStats();
            return;
        }

        // Map CSV columns to student objects
        students = rows.map((row, idx) => ({
            id: row.ID || String(idx + 1),
            name: row.Name || '',
            email: row.Email || '',
            phone: row.Phone || '',
            group: row.Group || '',
            gender: row.Gender || '',
            background: row.Background || '',
            temporary: false
        })).filter(s => s.name);

        // Sort by numeric ID
        students.sort((a, b) => {
            const idA = parseInt(a.id, 10);
            const idB = parseInt(b.id, 10);
            if (isNaN(idA)) return 1;
            if (isNaN(idB)) return -1;
            return idA - idB;
        });

        attendance = {};
        students.forEach((_, idx) => { attendance[idx] = false; });

        setSyncStatus('synced', '✅ 已同步 (' + students.length + '位成員)');
        console.log('✅ Loaded ' + students.length + ' members from Info tab');

        renderRoster();
        updateSummaryStats();

    } catch (error) {
        console.error('❌ Failed to load data:', error);
        setSyncStatus('error', '❌ 載入失敗');
        if (container) container.innerHTML = '<li class="error-message">⚠️ 無法載入資料: ' + error.message + '</li>';
        students = [];
        attendance = {};
        updateSummaryStats();
    }
}

// Save attendance to Google Sheets via Apps Script
function saveToGoogleSheets() {
    if (isSaving) {
        console.log('⏳ Save already in progress...');
        return;
    }
    if (students.length === 0) {
        alert('⚠️ 沒有成員資料可以儲存！');
        return;
    }

    isSaving = true;
    const saveBtn = document.getElementById('saveAttendanceBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '⏳ 儲存中...';
    saveBtn.disabled = true;
    setSyncStatus('syncing', '🔄 儲存中...');

    const today = new Date();
    const payload = {
        date: today.toISOString(),
        students: students.map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
            phone: s.phone,
            group: s.group,
            gender: s.gender,
            background: s.background
        })),
        attendance: attendance
    };

    console.log('📤 Saving to Google Sheets:', payload);

    fetch(CONFIG.API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(() => {
        console.log('✅ Save request sent');
        setSyncStatus('synced', '✅ 已儲存');
        saveBtn.textContent = '✅ 儲存成功!';
        saveBtn.style.backgroundColor = '#27ae60';
        autoSaveLocal();

        setTimeout(() => {
            saveBtn.textContent = '💾 保存到雲端';
            saveBtn.style.backgroundColor = '#3498db';
            saveBtn.disabled = false;
        }, 2000);
        isSaving = false;
    }).catch((error) => {
        console.error('❌ Save failed:', error);
        setSyncStatus('error', '❌ 儲存失敗');
        saveBtn.textContent = '⚠️ 儲存失敗，請重試';
        saveBtn.style.backgroundColor = '#e74c3c';
        setTimeout(() => {
            saveBtn.textContent = '💾 保存到雲端';
            saveBtn.style.backgroundColor = '#3498db';
            saveBtn.disabled = false;
        }, 3000);
        isSaving = false;
    });
}

// Local backup
function autoSaveLocal() {
    try {
        const todayKey = 'attendance_' + new Date().toDateString();
        localStorage.setItem(todayKey, JSON.stringify(attendance));
        localStorage.setItem('cbcgb_students_backup', JSON.stringify(students));
        localStorage.setItem('cbcgb_attendance_backup', JSON.stringify(attendance));
    } catch (e) {
        console.warn('Local backup failed:', e);
    }
}
