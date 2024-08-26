document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const groupForm = document.getElementById('group-form');
    const groupList = document.getElementById('group-list');
    const kidForm = document.getElementById('kid-form');
    const kidList = document.getElementById('kid-list');
    const attendanceForm = document.getElementById('attendance-form');
    const attendanceGroupSelect = document.getElementById('attendance-group');
    const attendanceListContainer = document.getElementById('attendance-list-container');
    const attendanceList = document.getElementById('attendance-list');
    const parentViewForm = document.getElementById('parent-view-form');
    const parentViewList = document.getElementById('parent-view-list');
    const parentViewContainer = document.getElementById('parent-view-container');

    // Data storage
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const kids = JSON.parse(localStorage.getItem('kids')) || [];

    // Render group lists and dropdowns
    function renderGroups() {
        if (groupList) {
            groupList.innerHTML = '';
            groups.forEach(group => {
                const li = document.createElement('li');
                li.textContent = `${group.name}: ${group.day} - ${group.time}`;
                groupList.appendChild(li);
            });
        }
        if (attendanceGroupSelect) {
            attendanceGroupSelect.innerHTML = '';
            groups.forEach((group, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${group.name}: ${group.day} - ${group.time}`;
                attendanceGroupSelect.appendChild(option);
            });
        }
    }

    // Render kid list
    function renderKids() {
        if (kidList) {
            kidList.innerHTML = '';
            kids.forEach(kid => {
                const li = document.createElement('li');
                li.textContent = `${kid.name} - العائلة: ${kid.mother}, مجموعة: ${kid.group}`;
                kidList.appendChild(li);
            });
        }
    }

    // Render parent view
    function renderParentView() {
        if (parentViewList) {
            parentViewList.innerHTML = '';
            kids.forEach(kid => {
                const li = document.createElement('li');
                li.textContent = `${kid.name}: الحضور - ${kid.attendanceCount || 0}`;
                parentViewList.appendChild(li);
            });
            parentViewContainer.style.display = 'block';
        }
    }

    // Event handling for form submissions
    groupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target['group-name'].value;
        const day = e.target['group-day'].value;
        const time = e.target['group-time'].value;
        if (!groups.some(group => group.name === name)) {
            groups.push({ name, day, time });
            localStorage.setItem('groups', JSON.stringify(groups));
            renderGroups();
            groupForm.reset();
        } else {
            alert('اسم المجموعة موجود بالفعل. يرجى اختيار اسم آخر.');
        }
    });

    kidForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target['kid-name'].value;
        const mother = e.target['mother-name'].value;
        const groupName = e.target['group-name'].value;
        if (groups.some(group => group.name === groupName)) {
            kids.push({ name, mother, group: groupName });
            localStorage.setItem('kids', JSON.stringify(kids));
            renderKids();
            kidForm.reset();
        } else {
            alert('المجموعة المحددة غير موجودة');
        }
    });

    attendanceForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const groupIndex = attendanceGroupSelect.value;
        const groupKids = kids.filter(kid => kid.group === groups[groupIndex]?.name);
        attendanceListContainer.style.display = 'block';
        attendanceList.innerHTML = '';
        groupKids.forEach(kid => {
            const li = document.createElement('li');
            const nameText = `${kid.name} - `;
            const attendedButton = document.createElement('button');
            attendedButton.textContent = 'حضر لقاء';
            attendedButton.onclick = () => {
                kid.attendanceCount = (kid.attendanceCount || 0) + 1;
                localStorage.setItem('kids', JSON.stringify(kids));
            };

            const countDisplay = document.createElement('span');
            countDisplay.textContent = ` الحضور: ${kid.attendanceCount || 0} `;

            const payButton = document.createElement('button');
            payButton.textContent = 'دفع';
            payButton.onclick = () => {
                if (kid.attendanceCount >= 4) {
                    kid.attendanceCount -= 4;
                    countDisplay.textContent = ` الحضور: ${kid.attendanceCount} `;
                    localStorage.setItem('kids', JSON.stringify(kids));
                }
            };

            li.append(nameText, attendedButton, countDisplay, payButton);
            attendanceList.appendChild(li);
        });
    });

    parentViewForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        renderParentView();
    });

    // Initial render calls
    renderGroups();
    renderKids();
});
