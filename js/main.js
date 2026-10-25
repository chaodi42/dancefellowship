// js/main.js
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

async function initializeApp() {
    updateDateDisplay();
    attachEventListeners();
    await loadDataFromGoogleSheets();
    renderRoster();
    updateSummaryStats();
}

function updateDateDisplay() {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const el = document.getElementById('currentDate');
    if (el) {
        el.innerText = new Date().toLocaleDateString('zh-HK', options);
    }
}

function getTodayKey() {
    return 'attendance_' + new Date().toDateString();
}

function attachEventListeners() {
    document.getElementById('markAllBtn').onclick = markAllPresent;
    document.getElementById('resetAttendanceBtn').onclick = resetAttendance;
    document.getElementById('saveAttendanceBtn').onclick = saveToGoogleSheets;
    document.getElementById('copyBtn').onclick = copyAttendanceToClipboard;
    document.getElementById('emailBtn').onclick = emailAttendance;
    document.getElementById('openModalBtn').onclick = showModal;
    document.getElementById('closeModalBtn').onclick = hideModal;
    document.getElementById('confirmAddBtn').onclick = addNewStudentFromModal;
    document.getElementById('exportCsvBtn').onclick = exportAllToCSV;

    document.getElementById('tabAttendanceBtn').onclick = function () { switchTab('attendance'); };
    document.getElementById('tabHistoryBtn').onclick = function () { switchTab('history'); };

    window.onclick = function (e) {
        if (e.target === document.getElementById('addStudentModal')) hideModal();
    };
}

function switchTab(tab) {
    const attTab = document.getElementById('attendanceTab');
    const histTab = document.getElementById('historyTab');
    const btnAtt = document.getElementById('tabAttendanceBtn');
    const btnHist = document.getElementById('tabHistoryBtn');

    if (tab === 'attendance') {
        attTab.classList.add('active');
        histTab.classList.remove('active');
        btnAtt.classList.add('active');
        btnHist.classList.remove('active');
        renderRoster();
        updateSummaryStats();
    } else {
        attTab.classList.remove('active');
        histTab.classList.add('active');
        btnAtt.classList.remove('active');
        btnHist.classList.add('active');
        loadHistoryTab();
    }
}

/* ---------- Modal helpers (referenced by main.js) ---------- */
function showModal() {
    document.getElementById('addStudentModal').classList.add('active');
}

function hideModal() {
    document.getElementById('addStudentModal').classList.remove('active');
}

function clearModalInputs() {
    document.getElementById('studentName').value = '';
    document.getElementById('studentEmail').value = '';
    document.getElementById('studentPhone').value = '';
    document.getElementById('studentGroup').value = '';

    const genderSis = document.querySelector('input[name="gender"][value="姊妹"]');
    if (genderSis) genderSis.checked = true;

    const bgChristian = document.querySelector('input[name="background"][value="基督徒"]');
    if (bgChristian) bgChristian.checked = true;

    document.getElementById('markPresent').checked = true;
}
