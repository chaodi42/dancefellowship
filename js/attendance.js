// js/attendance.js
function toggleAttendanceByIdx(index) {
    attendance[index] = !attendance[index];
    renderRoster();
    updateSummaryStats();
    autoSaveLocal();
}

function markAllPresent() {
    if (confirm("📌 標記所有人今日出席？")) {
        students.forEach((_, idx) => { attendance[idx] = true; });
        renderRoster();
        updateSummaryStats();
        autoSaveLocal();
    }
}

function resetAttendance() {
    if (confirm("⚠️ 重設今日所有出席記錄？")) {
        students.forEach((_, idx) => { attendance[idx] = false; });
        renderRoster();
        updateSummaryStats();
        autoSaveLocal();
    }
}

function generateTodayCSV() {
    const dateLabel = new Date().toLocaleDateString('zh-HK');
    let csv = '日期,ID,姓名,電郵,電話,小組,性別,信仰狀況,出席狀態\n';
    students.forEach((stu, idx) => {
        const status = attendance[idx] ? '1' : '0';
        csv += '"' + dateLabel + '","' + (stu.id || '') + '","' + stu.name + '","' +
               (stu.email || '') + '","' + (stu.phone || '') + '","' +
               (stu.group || '') + '","' + (stu.gender || '') + '","' +
               (stu.background || '') + '",' + status + '\n';
    });
    return csv;
}

function copyAttendanceToClipboard() {
    const csvText = generateTodayCSV();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(csvText).then(() => {
            const copyBtn = document.getElementById('copyBtn');
            const orig = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓ 已複製';
            copyBtn.style.backgroundColor = '#27ae60';
            setTimeout(() => {
                copyBtn.innerHTML = orig;
                copyBtn.style.backgroundColor = '#5856d6';
            }, 2000);
        }).catch(() => {
            alert("無法複製，請手動選取");
        });
    } else {
        alert("請手動複製資料: \n" + csvText.substring(0, 500));
    }
}

function emailAttendance() {
    const subject = '出席記錄 ' + new Date().toLocaleDateString();
    const body = generateTodayCSV();
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

function exportAllToCSV() {
    let masterCSV = '日期,ID,姓名,電郵,電話,小組,性別,信仰狀況,出席狀態\n';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('attendance_')) {
            const datePart = key.replace('attendance_', '');
            let displayDate = datePart;
            try { displayDate = new Date(datePart).toLocaleDateString('zh-HK'); } catch (e) {}
            const storedData = JSON.parse(localStorage.getItem(key) || '{}');
            students.forEach((student, idx) => {
                if (storedData.hasOwnProperty(idx)) {
                    const status = storedData[idx] ? '1' : '0';
                    masterCSV += '"' + displayDate + '","' + (student.id || '') + '","' +
                                 student.name + '","' + (student.email || '') + '","' +
                                 (student.phone || '') + '","' + (student.group || '') + '","' +
                                 (student.gender || '') + '","' + (student.background || '') + '",' +
                                 status + '\n';
                }
            });
        }
    }
    const blob = new Blob(['\uFEFF' + masterCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '出席全紀錄_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
}
