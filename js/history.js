// js/history.js
function loadHistoryTab() {
    const historyDiv = document.getElementById('historyList');
    const detailDiv = document.getElementById('historyDetail');
    if (detailDiv) detailDiv.style.display = 'none';

    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('attendance_')) keys.push(k);
    }

    if (keys.length === 0) {
        historyDiv.innerHTML = '<p style="text-align:center;padding:20px;">📭 尚無歷史出席記錄</p>';
        return;
    }

    keys.sort().reverse();

    let html = '<h3 style="margin-top:0;">📆 歷史出席記錄</h3>';
    keys.forEach(function (key) {
        const dateRaw = key.replace('attendance_', '');
        let dateShow = dateRaw;
        try { dateShow = new Date(dateRaw).toLocaleDateString('zh-HK'); } catch (e) {}

        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const total = Object.keys(data).length;
        let present = 0;
        for (const k in data) if (data[k] === true) present++;

        html += '<div class="history-item" data-datekey="' + dateRaw + '">' +
                '<div class="history-date">📅 ' + dateShow + '</div>' +
                '<div class="history-stats">✅ 出席: ' + present + '/' + total +
                ' &nbsp; ❌ 缺席: ' + (total - present) + '</div>' +
                '</div>';
    });

    historyDiv.innerHTML = html;

    document.querySelectorAll('.history-item').forEach(function (el) {
        el.addEventListener('click', function () {
            viewHistoryDetail(el.getAttribute('data-datekey'));
        });
    });
}

function viewHistoryDetail(dateKey) {
    const data = JSON.parse(localStorage.getItem('attendance_' + dateKey) || '{}');
    const detailDiv = document.getElementById('historyDetail');

    let detailHtml = '<button class="back-button" id="backHistoryBtn">← 返回列表</button>' +
                     '<h3>📅 ' + new Date(dateKey).toLocaleDateString('zh-HK') + '</h3>' +
                     '<button class="delete-btn" id="delHistoryBtn">🗑️ 刪除此日記錄</button>' +
                     '<ul class="student-list" style="margin-top:16px;">';

    students.forEach(function (stu, idx) {
        const isPresent = data[idx] === true;
        detailHtml += '<li class="student-item ' + (isPresent ? 'present' : '') + '" style="opacity:0.9">' +
                      '<div class="student-info">' +
                      '<div class="student-name">' + stu.name + '</div>' +
                      '<div class="student-email">' + (stu.email || '') + '</div>' +
                      '</div>' +
                      '<div style="font-weight:bold;">' + (isPresent ? '✅ 出席' : '❌ 缺席') + '</div>' +
                      '</li>';
    });

    detailHtml += '</ul>';
    detailDiv.innerHTML = detailHtml;
    detailDiv.style.display = 'block';
    document.getElementById('historyList').style.display = 'none';

    document.getElementById('backHistoryBtn').addEventListener('click', function () {
        document.getElementById('historyList').style.display = 'block';
        detailDiv.style.display = 'none';
    });

    document.getElementById('delHistoryBtn').addEventListener('click', function () {
        if (confirm('刪除該天出席記錄？')) {
            localStorage.removeItem('attendance_' + dateKey);
            loadHistoryTab();
        }
    });
}
