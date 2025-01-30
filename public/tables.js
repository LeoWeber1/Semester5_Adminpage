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
    renderCharts(employees); // Charts aktualisieren
    const tableBody = document.querySelector('tbody.bg-white.divide-y');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }

    tableBody.innerHTML = ''; // Clear existing data

    employees.forEach((log) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors duration-150';

        // Create table columns with data
        const columns = [
            log.id || 'N/A',
            log.first_name || 'N/A',
            log.last_name || 'N/A',
            log.id_number || 'N/A',
            log.email || 'N/A',
            log.last_login || 'N/A',
            log.temperature != null ? `${parseFloat(log.temperature).toFixed(1)}°C` : 'N/A',
            log.threshold_value || 'N/A',
            log.personal_number || 'N/A'
        ];

        columns.forEach((value, colIndex) => {
            const td = document.createElement('td');
            td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

            // Special styling for temperature column
            if (colIndex === 6 && value !== 'N/A') {
                const temp = parseFloat(value);
                const threshold = parseFloat(log.threshold_value || 37.5);
                td.classList.add(temp >= threshold ? 'text-red-600' : 'text-green-600');
            }

            td.textContent = value;
            row.appendChild(td);
        });

        tableBody.appendChild(row);
    });

    // Update dashboard metrics
    displayMetrics(employees);
}

/**
 * Calculate and display metrics
 */
function displayMetrics(employees) {
    // Total users
    document.getElementById('totalUsers').textContent = employees.length;

    // Average temperature
    const temps = employees
        .filter(emp => emp.temperature !== null && !isNaN(emp.temperature))
        .map(emp => parseFloat(emp.temperature));
    const avgTemp = temps.length
        ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
        : 0;
    document.getElementById('avgTemp').textContent = `${avgTemp}°C`;

    // Total logins
    const totalLogins = employees.filter(emp => emp.last_login).length;
    document.getElementById('totalLogins').textContent = totalLogins;
}

/**
 * Setup search functionality for the table
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
 * Render dashboard charts
 */
let tempChartInstance;

function renderCharts(employees) {
    // Temperature Distribution Chart
    const tempCtx = document.getElementById('temperatureChart')?.getContext('2d');
    if (tempCtx) {
        if (tempChartInstance) {
            tempChartInstance.destroy(); // Vorheriges Diagramm entfernen
        }

        const tempRanges = {
            'Normal (<37.5°C)': 0,
            'Elevated (37.5-38.5°C)': 0,
            'Fever (38.5-39.5°C)': 0,
            'High Fever (>39.5°C)': 0
        };

        employees.forEach(emp => {
            const temp = parseFloat(emp.temperature || 0);
            if (temp < 37.5) tempRanges['Normal (<37.5°C)']++;
            else if (temp >= 37.5 && temp < 38.5) tempRanges['Elevated (37.5-38.5°C)']++;
            else if (temp >= 38.5 && temp <= 39.5) tempRanges['Fever (38.5-39.5°C)']++;
            else if (temp > 39.5) tempRanges['High Fever (>39.5°C)']++;
        });

        tempChartInstance = new Chart(tempCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(tempRanges),
                datasets: [{
                    label: 'Number of Employees',
                    data: Object.values(tempRanges),
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',  // green
                        'rgba(255, 206, 86, 0.6)',  // yellow
                        'rgba(255, 159, 64, 0.6)',  // orange
                        'rgba(255, 99, 132, 0.6)'   // red
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }



    // 2. Role Distribution Chart
    const roleCtx = document.getElementById('roleChart')?.getContext('2d');
    if (roleCtx) {
        // Count employees by role
        const roleCount = employees.reduce((acc, emp) => {
            acc[emp.role] = (acc[emp.role] || 0) + 1;
            return acc;
        }, {});

        new Chart(roleCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(roleCount),
                datasets: [{
                    data: Object.values(roleCount),
                    backgroundColor: [
'rgba(54, 162, 235, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(255, 99, 132, 0.6)'
],
borderWidth: 1
}]
},
options: {
    responsive: true,
        legend: {
        position: 'bottom'
    },
    title: {
        display: true,
            text: 'Employee Role Distribution'
    }
}
});
}
}

/**
 * Setup logout functionality
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
 * Initialize everything when DOM loads
 */
function init() {
    displayEmployees();
    setupSearch();
    setupLogout();
}

// Run initialization once
if (!window.tableInitialized) {
    window.tableInitialized = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

// Add this to your tables.js file

/**
 * Setup form submission handling
 */
function setupAddUserForm() {
    const form = document.getElementById('addUserForm');
    const statusAlert = document.getElementById('statusAlert');
    const statusMessage = document.getElementById('statusMessage');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect form data
        const formData = {
            first_name: form.first_name.value,
            last_name: form.last_name.value,
            id_number: form.id_number.value,
            email: form.email.value,
            personal_number: form.personal_number.value,
            temperature: null,
            last_login: null
        };

        try {
            const response = await fetch('http://localhost:3001/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to add user');
            }

            // Show success message
            showStatus('User added successfully!', 'success');

            // Clear form
            form.reset();

            // Refresh the table
            await displayEmployees();

        } catch (error) {
            console.error('Error adding user:', error);
            showStatus('Failed to add user. Please try again.', 'error');
        }
    });
}

/**
 * Display status message
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

    // Hide the message after 3 seconds
    setTimeout(() => {
        statusAlert.classList.add('hidden');
    }, 3000);
}

/**
 * Modify your renderCharts function to only include the temperature chart
 */
function renderCharts(employees) {
    // Temperature Distribution Chart
    const tempCtx = document.getElementById('temperatureChart')?.getContext('2d');
    if (tempCtx) {
        // Group temperatures into ranges
        const tempRanges = {
            'Normal (<37.5°C)': 0,
            'Elevated (37.5-38.5°C)': 0,
            'Fever (38.5-39.5°C)': 0,
            'High Fever (>39.5°C)': 0
        };

        employees.forEach(emp => {
            const temp = parseFloat(emp.temperature || 0);
            if (temp < 37.5) tempRanges['Normal (<37.5°C)']++;
            else if (temp >= 37.5 && temp < 38.5) tempRanges['Elevated (37.5-38.5°C)']++;
            else if (temp >= 38.5 && temp <= 39.5) tempRanges['Fever (38.5-39.5°C)']++;
            else if (temp > 39.5) tempRanges['High Fever (>39.5°C)']++;
        });

        new Chart(tempCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(tempRanges),
                datasets: [{
                    label: 'Number of Employees',
                    data: Object.values(tempRanges),
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',  // green
                        'rgba(255, 206, 86, 0.6)',  // yellow
                        'rgba(255, 159, 64, 0.6)',  // orange
                        'rgba(255, 99, 132, 0.6)'   // red
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

/**
 * Update your init function to include the form setup
 */
function init() {
    displayEmployees();
    setupSearch();
    setupLogout();
    setupAddUserForm();  // Add this line
}