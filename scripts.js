document.addEventListener('DOMContentLoaded', () => {
    const correctCode = "1234"; // Your access code
    const userCode = prompt("Enter access code:");

    if (userCode === correctCode) {
        alert("Access granted");

        // Base URL for the backend
        const BASE_URL = 'https://https-mamha-onrender-com.onrender.com/api';

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

        // Fetch and render groups
        async function fetchGroups() {
            try {
                const response = await fetch(`${BASE_URL}/groups`);
                const groups = await response.json();
                renderGroups(groups);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        }

        // Render group lists and dropdowns
        function renderGroups(groups) {
            if (groupList) {
                groupList.innerHTML = '';
                groups.forEach(group => {
                    const li = document.createElement('li');
                    li.textContent = `${group.name}: ${group.day} - ${group.time}`;

                    // Add delete button for each group
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'حذف';
                    deleteButton.addEventListener('click', async () => {
                        try {
                            const response = await fetch(`${BASE_URL}/groups/${group._id}`, {
                                method: 'DELETE'
                            });
                            if (response.ok) {
                                fetchGroups();  // Refresh groups
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

        // Fetch and render kids
        async function fetchKids() {
            try {
                const response = await fetch(`${BASE_URL}/kids`);
                const kids = await response.json();
                renderKids(kids);
            } catch (error) {
                console.error('Error fetching kids:', error);
            }
        }

        // Render kid list
        function renderKids(kids) {
            if (kidList) {
                kidList.innerHTML = '';
                kids.forEach(kid => {
                    const li = document.createElement('li');
                    li.textContent = `${kid.name} - العائلة: ${kid.mother}, مجموعة: ${kid.group.name}`;

                    // Add delete button for each kid
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'حذف';
                    deleteButton.addEventListener('click', async () => {
                        try {
                            const response = await fetch(`${BASE_URL}/kids/${kid._id}`, {
                                method: 'DELETE'
                            });
                            if (response.ok) {
                                fetchKids();  // Refresh kids
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

        // Add group
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
                    fetchGroups();  // Refresh groups
                    groupForm.reset();
                } else {
                    alert('Failed to add group');
                }
            })
            .catch(error => console.error('Error adding group:', error));
        });

        // Add kid
        kidForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = e.target['kid-name'].value;
            const mother = e.target['mother-name'].value;
            const groupId = e.target['group-name'].value;

            fetch(`${BASE_URL}/kids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, mother, group: groupId })
            })
            .then(response => {
                if (response.ok) {
                    fetchKids();  // Refresh kids
                    kidForm.reset();
                } else {
                    alert('Failed to add kid');
                }
            })
            .catch(error => console.error('Error adding kid:', error));
        });

        // Handle attendance submission
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
                                    fetchKids();  // Refresh kids to update attendance count
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
                                // Ideally, update the backend here as well
                            }
                        });

                        li.append(nameText, attendedButton, countDisplay, payButton);
                        attendanceList.appendChild(li);
                    });
                });
        });

        // Initial fetch and render
        fetchGroups();
        fetchKids();

    } else {
        alert("Access denied");
    }

    // Parent view functionality that doesn't require an access code
    // Fetch kids and render their attendance information for parents
    if (parentViewForm) {
        parentViewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            fetchKids().then(renderParentView); // Render parent view with fetched kids data
        });
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

});
