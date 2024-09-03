document.addEventListener('DOMContentLoaded', () => {
    const correctCode = "XY675";
    const accessCodeForm = document.getElementById('access-code-form');
    let accessGranted = false;

    accessCodeForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const userCode = e.target['access-code'].value;

        if (userCode === correctCode) {
            accessGranted = true;
            alert("تم منح الوصول");
        } else {
            accessGranted = false;
            alert("رمز الدخول غير صحيح");
        }
    });

    function checkAccess(event) {
        if (!accessGranted) {
            event.preventDefault();
            alert("ليس لديك حق الوصول إلى هذه الصفحة.");
        }
    }

    const protectedLinks = document.querySelectorAll('a.protected');
    protectedLinks.forEach(link => {
        link.addEventListener('click', checkAccess);
    });

    const BASE_URL = 'https://https-mamha-onrender-com.onrender.com/api';
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

    async function fetchGroups() {
        try {
            const response = await fetch(`${BASE_URL}/groups`);
            const groups = await response.json();
            renderGroups(groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    }

    function renderGroups(groups) {
        if (groupList) {
            groupList.innerHTML = '';
            groups.forEach(group => {
                const li = document.createElement('li');
                li.textContent = `${group.name}: ${group.day} - ${group.time}`;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'حذف';
                deleteButton.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`${BASE_URL}/groups/${group._id}`, {
                            method: 'DELETE'
                        });
                        if (response.ok) {
                            fetchGroups();
                        } else {
                            alert('Failed to delete group');
                        }
                    } catch (error) {
                        console.error('Error deleting group:', error);
                    }
                });

                li.appendChild(deleteButton);
                groupList.appendChild(li);
            });
        }
        if (attendanceGroupSelect) {
            attendanceGroupSelect.innerHTML = '';
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group._id;
                option.textContent = `${group.name}: ${group.day} - ${group.time}`;
                attendanceGroupSelect.appendChild(option);
            });
        }
    }

    async function fetchKids() {
        try {
            const response = await fetch(`${BASE_URL}/kids`);
            const kids = await response.json();
            renderKids(kids);
        } catch (error) {
            console.error('Error fetching kids:', error);
        }
    }

    function renderKids(kids) {
        if (kidList) {
            kidList.innerHTML = '';
            kids.forEach(kid => {
                const li = document.createElement('li');
                li.textContent = `${kid.name} - العائلة: ${kid.mother}, مجموعة: ${kid.group.name}`;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'حذف';
                deleteButton.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`${BASE_URL}/kids/${kid._id}`, {
                            method: 'DELETE'
                        });
                        if (response.ok) {
                            fetchKids();
                        } else {
                            alert('Failed to delete kid');
                        }
                    } catch (error) {
                        console.error('Error deleting kid:', error);
                    }
                });

                li.appendChild(deleteButton);
                kidList.appendChild(li);
            });
        }
    }

    function renderParentView(kids) {
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

    groupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target['group-name'].value;
        const day = e.target['group-day'].value;
        const time = e.target['group-time'].value;

        fetch(`${BASE_URL}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, day, time })
        })
        .then(response => {
            if (response.ok) {
                fetchGroups();
                groupForm.reset();
            } else {
                alert('Failed to add group');
            }
        })
        .catch(error => console.error('Error adding group:', error));
    });

    kidForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = e.target['kid-name'].value;
        const mother = e.target['mother-name'].value;
        const groupName = e.target['group-name'].value;
    
        try {
            // Fetch the group by name
            const groupResponse = await fetch(`${BASE_URL}/groups?name=${encodeURIComponent(groupName)}`);
            const groups = await groupResponse.json();
    
            // Check if the group was found
            if (groups.length === 0) {
                alert(`Group with name "${groupName}" not found.`);
                return;
            }
    
            const groupId = groups[0]._id; // Assuming group names are unique and taking the first match
    
            // Ensure groupId is logged to check its format
            console.log('Selected Group ID:', groupId);
    
            // Proceed to add the kid with the fetched group ID
            const kidResponse = await fetch(`${BASE_URL}/kids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, mother, group: groupId })
            });
    
            if (kidResponse.ok) {
                fetchKids();  // Refresh kids
                kidForm.reset();
            } else {
                const data = await kidResponse.json();
                console.error('Failed to add kid:', data);
                alert(`Failed to add kid: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching group or adding kid:', error);
            alert('Error adding kid. Check console for more details.');
        }
    });
    

    attendanceForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const groupId = attendanceGroupSelect.value;
        fetch(`${BASE_URL}/kids`)
            .then(response => response.json())
            .then(kids => {
                const groupKids = kids.filter(kid => kid.group._id === groupId);
                attendanceListContainer.style.display = 'block';
                attendanceList.innerHTML = '';
                groupKids.forEach(kid => {
                    const li = document.createElement('li');
                    const nameText = `${kid.name} - `;
                    const attendedButton = document.createElement('button');
                    attendedButton.textContent = 'حضر لقاء';
                    attendedButton.addEventListener('click', async () => {
                        try {
                            const response = await fetch(`${BASE_URL}/kids/${kid._id}/attendance`, {
                                method: 'PUT'
                            });

                            if (response.ok) {
                                fetchKids();
                            } else {
                                alert('Failed to update attendance');
                            }
                        } catch (error) {
                            console.error('Error updating attendance:', error);
                        }
                    });

                    const countDisplay = document.createElement('span');
                    countDisplay.textContent = ` الحضور: ${kid.attendanceCount || 0} `;

                    const payButton = document.createElement('button');
                    payButton.textContent = 'دفع';
                    payButton.addEventListener('click', () => {
                        if (kid.attendanceCount >= 4) {
                            kid.attendanceCount -= 4;
                            countDisplay.textContent = ` الحضور: ${kid.attendanceCount} `;
                        }
                    });

                    li.append(nameText, attendedButton, countDisplay, payButton);
                    attendanceList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error fetching kids for attendance:', error);
                alert('Error fetching kids. Check console for more details.');
            });
    });

    parentViewForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchKids().then(renderParentView);
    });

    fetchGroups();
    fetchKids();
});
