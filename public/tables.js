/**
 * 1) Fetch employees from your Node/Express -> Postgres DB.
 */
async function fetchEmployees() {
    try {
        const response = await fetch('http://localhost:3000/api/employees');
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
 * 2) Display employees in the HTML table.
 */
async function displayEmployees() {
    const employees = await fetchEmployees();
    const tableBody = document.querySelector('tbody.bg-white.divide-y');
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }

    tableBody.innerHTML = ''; // Clear existing data

    employees.forEach((emp) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors duration-150';

        const columns = [
            `${emp.first_name || 'N/A'} ${emp.last_name || ''}`,
            emp.phone || 'N/A',
            emp.email || 'N/A',
            emp.last_login || 'N/A',
            emp.temperature != null ? parseFloat(emp.temperature).toFixed(1) : 'N/A',
            emp.role || 'N/A'
        ];

        columns.forEach((value, colIndex) => {
            const td = document.createElement('td');
            td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

            // For the Temperature column with conditional styling
            if (colIndex === 4 && value !== 'N/A') {
                const temp = parseFloat(value);
                td.textContent = `${temp}°C`;
                // Show red if >= 39
                td.classList.add(temp >= 39 ? 'text-red-600' : 'text-green-600');
            } else {
                td.textContent = value;
            }
            row.appendChild(td);
        });

        tableBody.appendChild(row);
    });

    // Calculate and display metrics (total users, avg temp, total logins).
    displayMetrics(employees);
    renderCharts(employees);
}

/**
 * 3) Display metrics.
 */
function displayMetrics(employees) {
    // Total users

    // Average temperature
    const temps = employees
        .filter((emp) => emp.temperature !== null && !isNaN(emp.temperature))
        .map((emp) => parseFloat(emp.temperature));
    const avgTemp = temps.length
        ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
        : 0;

    // Total logins (example: counting any non-null last_login)
    const totalLogins = employees.filter((emp) => emp.last_login).length;
}

/**
 * 4) Setup search for the table.
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
 * 5) Render Charts (Temperature Trend, Login Activity, etc.).
 *    This is just a placeholder. Customize as needed.
 */
function renderCharts(employees) {
    // 1. Temperature Distribution Chart
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
            const temp = parseFloat(emp.temperature);
            if (temp < 37.5) tempRanges['Normal (<37.5°C)']++;
            else if (temp < 38.5) tempRanges['Elevated (37.5-38.5°C)']++;
            else if (temp < 39.5) tempRanges['Fever (38.5-39.5°C)']++;
            else tempRanges['High Fever (>39.5°C)']++;
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
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Temperature Distribution'
                    }
                }
            }
        });
    }

    // 2. Role Distribution Chart (replacing login chart)
    const roleCtx = document.getElementById('loginChart')?.getContext('2d');
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
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Employee Role Distribution'
                    }
                }
            }
        });
    }

    // Update metrics display
    const avgTemp = employees.reduce((sum, emp) => sum + parseFloat(emp.temperature), 0) / employees.length;
    document.getElementById('avgTemp').textContent = `${avgTemp.toFixed(1)}°C`;
}
/**
 * 6) Initialize everything on DOM load
 */
function init() {
    displayEmployees();
    setupSearch();
}

// Only run once
if (!window.tableInitialized) {
    window.tableInitialized = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}
