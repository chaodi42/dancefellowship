// js/student.js
function addNewStudentFromModal() {
    const name = document.getElementById('studentName').value.trim();
    if (!name) {
        alert("請填寫成員姓名");
        return;
    }
    const email = document.getElementById('studentEmail').value.trim();
    const phone = document.getElementById('studentPhone').value.trim();
    const group = document.getElementById('studentGroup').value.trim();
    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : '弟兄';
    const background = document.getElementById('studentBackground').value;
    const markNow = document.getElementById('markPresent').checked;

    // Prevent duplicates
    if (students.some(s => s.name === name)) {
        alert('⚠️ 成員 "' + name + '" 已存在！');
        return;
    }

    // Auto-assign next ID
    let maxId = 0;
    students.forEach(s => {
        const n = parseInt(s.id, 10);
        if (!isNaN(n) && n > maxId) maxId = n;
    });
    const newId = maxId + 1;

    const newStudent = {
        id: newId,
        name: name,
        email: email,
        phone: phone,
        group: group,
        gender: gender,
        background: background,
        temporary: true
    };

    // Snapshot attendance by name before sorting
    const attendanceByName = {};
    students.forEach((s, i) => { attendanceByName[s.name] = !!attendance[i]; });

    students.push(newStudent);

    // Sort by numeric ID
    students.sort((a, b) => {
        const idA = parseInt(a.id, 10);
        const idB = parseInt(b.id, 10);
        if (isNaN(idA)) return 1;
        if (isNaN(idB)) return -1;
        return idA - idB;
    });

    // Rebuild attendance map against new indices
    const newAttendance = {};
    students.forEach((s, i) => {
        if (s === newStudent) newAttendance[i] = markNow;
        else newAttendance[i] = attendanceByName.hasOwnProperty(s.name) ? attendanceByName[s.name] : false;
    });
    attendance = newAttendance;

    renderRoster();
    updateSummaryStats();
    autoSaveLocal();
    hideModal();
    clearModalInputs();
    alert('✨ 已加入 ' + name + ' (ID: ' + newId + ') ✨\n\n請點擊「保存到雲端」將資料儲存至 Google Sheets');
}

function deleteTemporaryStudent(index) {
    const student = students[index];
    if (!student.temporary) {
        alert("基礎成員無法刪除，僅能刪除臨時加入的成員");
        return;
    }
    if (confirm('確定刪除「' + student.name + '」嗎？')) {
        students.splice(index, 1);

        const newAttendance = {};
        Object.keys(attendance).forEach(k => {
            const i = parseInt(k, 10);
            if (i < index) newAttendance[i] = attendance[k];
            else if (i > index) newAttendance[i - 1] = attendance[k];
            // i === index is dropped
        });
        attendance = newAttendance;

        renderRoster();
        updateSummaryStats();
        autoSaveLocal();
    }
}
