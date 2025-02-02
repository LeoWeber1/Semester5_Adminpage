/**
 * Fetch employees from the backend API
 */
async function fetchEmployees() {
    try {
        const response = await fetch('http://localhost:3001/api/employees');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const employees = await response.json();
        return employees;
    } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
    }
}

/**
 * Display employees in the HTML table
 */
async function displayEmployees() {
    const employees = await fetchEmployees();
    renderCharts(employees);
    const tableBody = document.querySelector('tbody.bg-white.divide-y');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }

    tableBody.innerHTML = ''; // Clear existing data

    employees.forEach((employee) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors duration-150';
        row.dataset.id = employee.id;

        // Create table columns with data
        const columns = [
            `${employee.first_name || 'N/A'} ${employee.last_name || ''}`,
            employee.id_number || 'N/A',
            employee.email || 'N/A',
            employee.last_login ? new Date(employee.last_login).toLocaleString() : 'N/A',
            employee.temperature != null ? `${parseFloat(employee.temperature).toFixed(1)}°C` : 'N/A', // Display temperature
            employee.personal_number || 'N/A'
        ];

        columns.forEach((value, colIndex) => {
            const td = document.createElement('td');
            td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

            if (colIndex === 4 && value !== 'N/A') { // Temperature column
                const temp = parseFloat(employee.temperature);
                const threshold = parseFloat(employee.threshold_value || 37.5); // Make sure threshold_value is available or provide a default.
                td.classList.add(temp >= threshold ? 'text-red-600' : 'text-green-600');
            }

            td.textContent = value;
            row.appendChild(td);
        });

        // Add action buttons
        const actionsTd = document.createElement('td');
        actionsTd.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'text-blue-600 hover:text-blue-900 mr-2';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', () => openEditModal(employee));

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-red-600 hover:text-red-900';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', handleDelete);

        actionsTd.appendChild(editBtn);
        actionsTd.appendChild(deleteBtn);
        row.appendChild(actionsTd);

        tableBody.appendChild(row);
    });

    displayMetrics(employees);
}

/**
 * Calculate and display metrics
 */
function displayMetrics(employees) {
    document.getElementById('totalUsers').textContent = employees.length;

    const temps = employees
        .filter(emp => emp.temperature !== null && !isNaN(emp.temperature))
        .map(emp => parseFloat(emp.temperature));
    const avgTemp = temps.length
        ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
        : 0;
    document.getElementById('avgTemp').textContent = `${avgTemp}°C`;

    const totalLogins = employees.filter(emp => emp.last_login).length;
    document.getElementById('totalLogins').textContent = totalLogins;
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('tbody.bg-white.divide-y tr');

            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
        }, 300);
    });
}

/**
 * Handle user deletion
 */
async function handleDelete(event) {
    const row = event.target.closest('tr');
    const employeeId = row.dataset.id;

    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`http://localhost:3001/api/employees/${employeeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Delete failed');

            row.remove();
            showStatus('User deleted successfully!', 'success');
            updateMetricsAfterDelete();
        } catch (error) {
            console.error('Delete error:', error);
            showStatus('Failed to delete user', 'error');
        }
    }
}

function updateMetricsAfterDelete() {
    const totalUsers = document.getElementById('totalUsers');
    totalUsers.textContent = parseInt(totalUsers.textContent) - 1;
}

/**
 * Edit user functionality
 */
let currentEditRow = null;

function openEditModal(employee) {
    currentEditRow = document.querySelector(`tr[data-id="${employee.id}"]`);
    document.getElementById('editId').value = employee.id;
    document.getElementById('editFirstName').value = employee.first_name;
    document.getElementById('editLastName').value = employee.last_name;
    document.getElementById('editEmail').value = employee.email;
    document.getElementById('editPersonalNumber').value = employee.personal_number;
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    currentEditRow = null;
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedData = {
        first_name: document.getElementById('editFirstName').value,
        last_name: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value,
        personal_number: document.getElementById('editPersonalNumber').value
    };

    try {
        const response = await fetch(
            `http://localhost:3001/api/employees/${document.getElementById('editId').value}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            }
        );

        if (!response.ok) throw new Error('Update failed');

        // Update the table row
        const cells = currentEditRow.cells;
        cells[0].textContent = `${updatedData.first_name} ${updatedData.last_name}`;
        cells[2].textContent = updatedData.email;
        cells[5].textContent = updatedData.personal_number;

        closeEditModal();
        showStatus('User updated successfully!', 'success');
    } catch (error) {
        console.error('Update error:', error);
        showStatus('Failed to update user', 'error');
    }
});

/**
 * Status message handling
 */
function showStatus(message, type) {
    const statusAlert = document.getElementById('statusAlert');
    const statusMessage = document.getElementById('statusMessage');

    statusAlert.className = `mb-4 p-4 rounded-md ${
        type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
    }`;

    statusMessage.textContent = message;
    statusAlert.classList.remove('hidden');

    setTimeout(() => {
        statusAlert.classList.add('hidden');
    }, 3000);
}

/**
 * Chart rendering
 */
let tempChartInstance;

function renderCharts(employees) {
    const tempCtx = document.getElementById('temperatureChart')?.getContext('2d');
    if (tempCtx) {
        if (tempChartInstance) tempChartInstance.destroy();

        const tempRanges = {
            'Normal (<37.5°C)': 0,
            'Elevated (37.5-38.5°C)': 0,
            'Fever (38.5-39.5°C)': 0,
            'High Fever (>39.5°C)': 0
        };

        employees.forEach(emp => {
            const temp = parseFloat(emp.temperature || 0);
            if (temp < 37.5) tempRanges['Normal (<37.5°C)']++;
            else if (temp < 38.5) tempRanges['Elevated (37.5-38.5°C)']++;
            else if (temp <= 39.5) tempRanges['Fever (38.5-39.5°C)']++;
            else tempRanges['High Fever (>39.5°C)']++;
        });

        tempChartInstance = new Chart(tempCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(tempRanges),
                datasets: [{
                    label: 'Number of Employees',
                    data: Object.values(tempRanges),
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

/**
 * User management form handling
 */
/**
 * User management form handling
 */
function setupAddUserForm() {
    const form = document.getElementById('addUserForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            first_name: form.first_name.value,
            last_name: form.last_name.value,
            id_number: form.id_number.value,
            email: form.email.value,
            personal_number: form.personal_number.value,
            temperature: form.temperature.value || null, // Get temperature value, allow null
            last_login: null // last_login will be handled by the server (creation time)
        };

        try {
            const response = await fetch('http://localhost:3001/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json(); // Parse response body
            if (!response.ok) throw new Error(data.error || 'Failed to add user');

            showStatus('User added successfully!', 'success');
            form.reset();
            await displayEmployees();
        } catch (error) {
            console.error('Error adding user:', error);
            showStatus(error.message || 'Failed to add user. Please try again.', 'error');
        }
    });
}


/**
 * Logout handling
 */
function setupLogout() {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }
}

/**
 * Initialize application
 */
function init() {
    displayEmployees();
    setupSearch();
    setupLogout();
    setupAddUserForm();

    // Close modal on outside click
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') closeEditModal();
    });
}

if (!window.tableInitialized) {
    window.tableInitialized = true;
    document.addEventListener('DOMContentLoaded', init);
}