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
    document.getElementById('totalUsers').textContent = employees.length;

    // Average temperature
    const temps = employees
        .filter((emp) => emp.temperature !== null && !isNaN(emp.temperature))
        .map((emp) => parseFloat(emp.temperature));
    const avgTemp = temps.length
        ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
        : 0;
    document.getElementById('avgTemp').textContent = `${avgTemp}°C`;

    // Total logins (example: counting any non-null last_login)
    const totalLogins = employees.filter((emp) => emp.last_login).length;
    document.getElementById('totalLogins').textContent = totalLogins;
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
    // 5.1) Temperature Trend Chart
    const tempCtx = document.getElementById('temperatureChart')?.getContext('2d');
    if (tempCtx) {
        const temps = employees
            .filter(emp => emp.temperature !== null)
            .map(emp => parseFloat(emp.temperature));

        // Example: simple line chart of all temperatures
        new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: temps.map((_, i) => i + 1), // 1..N
                datasets: [{
                    label: 'Temperatures',
                    data: temps,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ display: true }],
                    yAxes: [{ display: true }]
                }
            }
        });
    }

    // 5.2) Login Activity Chart
    const loginCtx = document.getElementById('loginChart')?.getContext('2d');
    if (loginCtx) {
        // Example: count how many employees have last_login set
        const withLogins = employees.filter(emp => emp.last_login).length;
        const withoutLogins = employees.length - withLogins;

        new Chart(loginCtx, {
            type: 'pie',
            data: {
                labels: ['Logged In Before', 'Never Logged In'],
                datasets: [{
                    data: [withLogins, withoutLogins],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)'
                    ]
                }]
            },
            options: {
                responsive: true,
                legend: { position: 'bottom' }
            }
        });
    }
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
