        // Rebuild attendance
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
            });
            attendance = newAttendance;
            renderRoster();
            updateSummaryStats();
            autoSaveLocal();
        }
    }
