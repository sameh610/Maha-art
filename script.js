document.addEventListener('DOMContentLoaded', () => {
    const groupForm = document.getElementById('group-form');
    const groupList = document.getElementById('group-list');
    const kidForm = document.getElementById('kid-form');
    const kidList = document.getElementById('kid-list');
    const attendanceForm = document.getElementById('attendance-form');
    const attendanceGroupSelect = document.getElementById('attendance-group');
    const attendanceListContainer = document.getElementById('attendance-list-container');
    const attendanceListForm = document.getElementById('attendance-list-form');
    const attendanceList = document.getElementById('attendance-list');
    const parentViewForm = document.getElementById('parent-view-form');
    const parentViewContainer = document.getElementById('parent-view-container');
    const parentViewList = document.getElementById('parent-view-list');
    
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const kids = JSON.parse(localStorage.getItem('kids')) || [];
    const attendance = JSON.parse(localStorage.getItem('attendance')) || [];

    function renderGroups() {
        groupList.innerHTML = '';
        attendanceGroupSelect.innerHTML = '';
        groups.forEach((group, index) => {
            const li = document.createElement('li');
            li.textContent = `${group.day} - ${group.time}`;
            groupList.appendChild(li);

            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${group.day} - ${group.time}`;
            attendanceGroupSelect.appendChild(option);
        });
    }

    function renderKids() {
        kidList.innerHTML = '';
        kids.forEach((kid, index) => {
            const li = document.createElement('li');
            li.textContent = `${kid.name} - أم: ${kid.mother}`;
            kidList.appendChild(li);
        });
    }

    if (groupForm) {
        groupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const day = e.target['group-day'].value;
            const time = e.target['group-time'].value;
            groups.push({ day, time });
            localStorage.setItem('groups', JSON.stringify(groups));
            renderGroups();
            groupForm.reset();
        });
    }

    if (kidForm) {
        kidForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = e.target['kid-name'].value;
            const mother = e.target['mother-name'].value;
            kids.push({ name, mother });
            localStorage.setItem('kids', JSON.stringify(kids));
            renderKids();
            kidForm.reset();
        });
    }

    if (attendanceForm) {
        attendanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const groupIndex = e.target['attendance-group'].value;
            const groupKids = kids.map((kid, index) => {
                return { ...kid, present: false };
            });

            attendanceListContainer.style.display = 'block';
            attendanceList.innerHTML = '';
            groupKids.forEach((kid, index) => {
                const li = document.createElement('li');
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = `attendance-${index}`;
                checkbox.checked = attendance[groupIndex] && attendance[groupIndex][index] && attendance[groupIndex][index].present;
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${kid.name}`));
                li.appendChild(label);
                attendanceList.appendChild(li);
            });

            attendanceListForm.addEventListener('submit', (e) => {
                e.preventDefault();
                groupKids.forEach((kid, index) => {
                    const checkbox = document.querySelector(`input[name="attendance-${index}"]`);
                    kid.present = checkbox.checked;
                });

                attendance[groupIndex] = groupKids;
                localStorage.setItem('attendance', JSON.stringify(attendance));
            });
        });
    }

    if (parentViewForm) {
        parentViewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const kidName = e.target['kid-name-search'].value;
            const kidAttendance = attendance.flat().filter(kid => kid.name === kidName);

            parentViewContainer.style.display = 'block';
            parentViewList.innerHTML = '';
            kidAttendance.forEach((attendanceRecord, index) => {
                const li = document.createElement('li');
                li.textContent = `${attendanceRecord.name} - ${attendanceRecord.present ? 'حاضر' : 'غائب'}`;
                parentViewList.appendChild(li);
            });
        });
    }

    renderGroups();
    renderKids();
});
