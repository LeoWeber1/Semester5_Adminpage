(function() {
    if (window.userTableInitialized) return;
    window.userTableInitialized = true;

    const ROLES = ['User', 'Admin', 'Manager', 'Support', 'Developer'];

    // Add data processing functions
    function updateDashboardMetrics(data) {
        // Update total users
        const totalUsers = data.length;

        // Calculate and update average temperature
        const avgTemp = data.reduce((sum, row) => {
            const temp = parseFloat(row[5] || 0);
            return sum + (isNaN(temp) ? 0 : temp);
        }, 0) / totalUsers;
        document.getElementById('avgTemp').textContent = `${avgTemp.toFixed(1)}°C`;

        // Calculate total logins (assuming login data is in row[4])
        const totalLogins = data.reduce((sum, row) => sum + (row[4] ? 1 : 0), 0);
        document.getElementById('totalLogins').textContent = totalLogins;

        // Update charts if they exist
        updateCharts(data);
    }

    function updateCharts(data) {
        // Temperature Chart
        const tempChart = document.getElementById('temperatureChart');
        if (tempChart) {
            const tempData = data.map(row => parseFloat(row[4] || 0));
            const labels = data.map(row => row[0]);

            new Chart(tempChart.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature',
                        data: tempData,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            ticks: {
                                display: false // Hide x-axis labels
                            }
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Login Chart
        const loginChart = document.getElementById('loginChart');
        if (loginChart) {
            const loginData = processLoginData(data);
            new Chart(loginChart.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Today', 'Yesterday', 'Last Week'],
                    datasets: [{
                        label: 'Login Activity',
                        data: loginData,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgb(54, 162, 235)',
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

    function processLoginData(data) {
        // Simulate login distribution for demonstration
        return [
            Math.floor(data.length * 0.4), // Today
            Math.floor(data.length * 0.3), // Yesterday
            Math.floor(data.length * 0.3)  // Last Week
        ];
    }

    function showNotification(message, type = 'success') {
        const existingNotification = document.querySelector('.notification-toast');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification-toast fixed top-4 right-4 px-6 py-3 rounded-lg text-white ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } shadow-lg transform transition-transform duration-300 ease-in-out z-50`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateY(10px)';
            setTimeout(() => {
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    }

    function handleRoleChange(event) {
        const select = event.target;
        const rowIndex = select.dataset.rowIndex;
        const newRole = select.value;

        const row = select.closest('tr');
        row.classList.add('bg-blue-50');
        setTimeout(() => row.classList.remove('bg-blue-50'), 500);

        showNotification('Role updated successfully!', 'success');
    }

    function createRoleSelect(currentRole, rowIndex) {
        currentRole = ROLES.find(role => role.toLowerCase() === (currentRole || '').toLowerCase()) || ROLES[0];

        const select = document.createElement('select');
        select.className = 'px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
        select.dataset.rowIndex = rowIndex;

        ROLES.forEach(role => {
            const option = document.createElement('option');
            option.value = role.toLowerCase();
            option.textContent = role;
            option.selected = role.toLowerCase() === currentRole.toLowerCase();
            select.appendChild(option);
        });

        select.addEventListener('change', handleRoleChange);
        return select;
    }

    async function fetchNamesData(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();

            // Use PapaParse for more reliable CSV parsing
            const result = Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true
            });

            return {
                headers: result.data[0],
                dataRows: result.data.slice(1)
            };
        } catch (error) {
            console.error('Error fetching or parsing CSV:', error);
            showNotification('Error loading data: ' + error.message, 'error');
            return { headers: [], dataRows: [] };
        }
    }


    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) {
            console.error('Search input not found');
            return;
        }

        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('tbody tr');

                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }, 300);
        });
    }

    function createEnhancedTable(headers, dataRows) {
        const tableBody = document.querySelector('tbody.bg-white.divide-y');
        if (!tableBody) {
            showNotification('Table body element not found', 'error');
            return;
        }

        tableBody.innerHTML = '';

        dataRows.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors duration-150';

            // Assuming CSV structure: name,phone,email,login,temp,role
            const cells = [
                row[0] || '', // Name
                row[1] || '', // Phone
                row[2] || '', // Email
                row[3] || '', // Login
                row[4] || '', // Temperature
                row[5] || ''  // Role
            ];

            cells.forEach((cellValue, index) => {
                const td = document.createElement('td');
                td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

                switch(index) {
                    case 1: // Phone
                        const phoneLink = document.createElement('a');
                        phoneLink.href = `tel:${cellValue}`;
                        phoneLink.className = 'text-blue-600 hover:text-blue-800';
                        phoneLink.textContent = cellValue;
                        td.appendChild(phoneLink);
                        break;

                    case 2: // Email
                        const emailLink = document.createElement('a');
                        emailLink.href = `mailto:${cellValue}`;
                        emailLink.className = 'text-blue-600 hover:text-blue-800';
                        emailLink.textContent = cellValue;
                        td.appendChild(emailLink);
                        break;

                    case 4: // Temperature
                        const temp = parseFloat(cellValue);
                        td.className += temp >= 39 ? ' text-red-600' : ' text-green-600';
                        td.textContent = `${cellValue}°C`;
                        break;

                    case 5: // Role
                        td.appendChild(createRoleSelect(cellValue, rowIndex));
                        break;

                    default:
                        td.textContent = cellValue;
                }

                tr.appendChild(td);
            });

            tableBody.appendChild(tr);
        });

        // Update dashboard metrics after table is created
        updateDashboardMetrics(dataRows);
    }

    async function initializeEnhancedTable(csvPath) {
        const tableContainer = document.querySelector('.overflow-x-auto');
        if (!tableContainer) {
            showNotification('Table container not found', 'error');
            return;
        }

        const tbody = document.querySelector('tbody');
        if (tbody) {
            const loadingRow = document.createElement('tr');
            loadingRow.innerHTML = '<td colspan="6" class="px-6 py-4 text-center">Loading...</td>';
            tbody.innerHTML = '';
            tbody.appendChild(loadingRow);
        }

        try {
            const { headers, dataRows } = await fetchNamesData(csvPath);
            console.log('Headers:', headers, 'Data Rows:', dataRows);
            if (headers && dataRows) {
                createEnhancedTable(headers, dataRows);
                setupSearch();
                updateCharts(dataRows); // Ensure charts are updated with the data
            } else {
                console.log("Error loading data");
            }
        } catch (error) {
            console.error('Error initializing table:', error);
        }
    }


    // Initialize when DOM is ready
    function init() {
        initializeEnhancedTable('names.csv');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function () {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html'; // Redirect to login if not logged in
    }
})();
