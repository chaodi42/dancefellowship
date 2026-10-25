// js/render.js
function setSyncStatus(status, text) {
    const el = document.getElementById('syncStatus');
    if (el) {
        el.className = 'sync-status ' + status;
        el.textContent = text;
    }
}

function renderRoster() {
    const container = document.getElementById('studentList');
    if (!container) return;

    if (!students || !students.length) {
        container.innerHTML = '<li style="text-align:center;padding:30px;">📭 尚無成員，請新增或檢查資料</li>';
        return;
    }

    container.innerHTML = '';
    students.forEach((student, idx) => {
        const li = document.createElement('li');
        li.className = 'student-item';
        if (attendance[idx]) li.className += ' present';
        if (student.temporary) li.className += ' temporary';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'student-info';

        const nameSpan = document.createElement('div');
        nameSpan.className = 'student-name';
        const idStr = student.id ? String(student.id).trim() : '';
        const nameStr = (student.name || '').toString().trim();
        nameSpan.textContent = idStr ? (idStr + '. ' + nameStr) : nameStr;

        if (student.temporary) {
            const badge = document.createElement('span');
            badge.className = 'student-badge';
            badge.textContent = '臨時';
            nameSpan.appendChild(badge);
        }

        const emailSpan = document.createElement('div');
        emailSpan.className = 'student-email';
        emailSpan.textContent = student.email || '';

        const groupSpan = document.createElement('div');
        groupSpan.className = 'student-meta';
        groupSpan.textContent = student.group || '';

        infoDiv.appendChild(nameSpan);
        if (emailSpan.textContent) infoDiv.appendChild(emailSpan);
        if (groupSpan.textContent) infoDiv.appendChild(groupSpan);

        const checkWrapper = document.createElement('div');
        checkWrapper.className = 'attendance-checkbox';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!attendance[idx];
        cb.addEventListener('change', (e) => {
            e.stopPropagation();
            toggleAttendanceByIdx(idx);
        });
        checkWrapper.appendChild(cb);

        li.appendChild(infoDiv);
        li.appendChild(checkWrapper);

        if (student.temporary) {
            const delBtn = document.createElement('span');
            delBtn.className = 'delete-student';
            delBtn.textContent = '✖';
            delBtn.title = '刪除此成員';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTemporaryStudent(idx);
            });
            li.appendChild(delBtn);
        }
        container.appendChild(li);
    });
}

function updateSummaryStats() {
    let presentCount = 0;
    for (const key in attendance) {
        if (attendance[key] === true) presentCount++;
    }
    const presentEl = document.getElementById('presentCount');
    const totalEl = document.getElementById('totalStudents');
    if (presentEl) presentEl.innerText = presentCount;
    if (totalEl) totalEl.innerText = students.length;
}
