// Global variables
let users = [];
let charts = {
    temperature: null,
    login: null,
    monthly: null
};

// Utility Functions
const formatDate = date => new Date(date).toLocaleDateString();
const calculateAverage = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

// Chart Initialization
function initializeCharts() {
    // Temperature Chart
    charts.temperature = new Chart(document.getElementById('temperatureChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Average Temperature (°C)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                data: [],
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 36,
                    max: 38
                }
            }
        }
    });

    // Login Activity Chart
    charts.login = new Chart(document.getElementById('loginChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Number of Logins',
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                data: []
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }
        }
    });

    // Monthly Report Chart
    charts.monthly = new Chart(document.getElementById('chartOne').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Monthly Active Users',
                backgroundColor: 'rgba(61, 104, 255, 0.2)',
                borderColor: 'rgba(61, 104, 255, 1)',
                data: [],
                fill: true
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

// Data Processing Functions
function processTemperatureData(users) {
    const dates = [...new Set(users.map(user => user.lastLogin))].sort();
    const tempData = dates.map(date => {
        const dayUsers = users.filter(user => user.lastLogin === date);
        return calculateAverage(dayUsers.map(user => parseFloat(user.temperature)));
    });
    return { dates, tempData };
}

function processLoginData(users) {
    const dates = [...new Set(users.map(user => user.lastLogin))].sort();
    const loginCounts = dates.map(date =>
        users.filter(user => user.lastLogin === date).length
    );
    return { dates, loginCounts };
}

function processMonthlyData(users) {
    const monthlyData = users.reduce((acc, user) => {
        const month = new Date(user.lastLogin).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});
    return {
        months: Object.keys(monthlyData),
        counts: Object.values(monthlyData)
    };
}

// Update Functions
function updateCharts() {
    const tempData = processTemperatureData(users);
    const loginData = processLoginData(users);
    const monthlyData = processMonthlyData(users);

    // Update Temperature Chart
    charts.temperature.data.labels = tempData.dates;
    charts.temperature.data.datasets[0].data = tempData.tempData;
    charts.temperature.update();

    // Update Login Chart
    charts.login.data.labels = loginData.dates;
    charts.login.data.datasets[0].data = loginData.loginCounts;
    charts.login.update();

    // Update Monthly Chart
    charts.monthly.data.labels = monthlyData.months;
    charts.monthly.data.datasets[0].data = monthlyData.counts;
    charts.monthly.update();

    // Update metrics
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('avgTemp').textContent =
        `${calculateAverage(users.map(u => parseFloat(u.temperature))).toFixed(1)}°C`;
    document.getElementById('totalLogins').textContent =
        loginData.loginCounts.reduce((a, b) => a + b, 0);
}

// Table Functions
function updateTable(filteredUsers = users) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    filteredUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full" src="${user.image || 'https://via.placeholder.com/150'}" alt="">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${user.firstName} ${user.lastName}</div>
                    </div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.phone}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(user.lastLogin)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.temperature}°C</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <select onchange="updateUserRole(${index}, this.value)" 
                        class="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                    <option value="Manager" ${user.role === 'Manager' ? 'selected' : ''}>Manager</option>
                    <option value="Developer" ${user.role === 'Developer' ? 'selected' : ''}>Developer</option>
                    <option value="Designer" ${user.role === 'Designer' ? 'selected' : ''}>Designer</option>
                    <option value="Tester" ${user.role === 'Tester' ? 'selected' : ''}>Tester</option>
                </select>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredUsers = users.filter(user =>
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm)
        );
        updateTable(filteredUsers);
    });
}

// Role update function
function updateUserRole(index, newRole) {
    users[index].role = newRole;
    updateTable();
    updateCharts();

    // You might want to send this update to your backend
    console.log(`Updated role for ${users[index].firstName} ${users[index].lastName} to ${newRole}`);
}

// Data fetching and initialization
async function fetchAndProcessUserData() {
    try {
        const response = await fetch('names.csv');
        const csvText = await response.text();

        // Parse CSV data
        const results = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transform: (value, field) => {
                // Transform field names to camelCase and clean up data
                switch(field) {
                    case 'First Name':
                        return value.trim();
                    case 'Last Name':
                        return value.trim();
                    case 'Temperature':
                        return parseFloat(value) || 37.0;
                    default:
                        return value;
                }
            }
        });

        // Transform the data to match our expected format
        users = results.data.map(row => ({
            firstName: row['First Name'],
            lastName: row['Last Name'],
            email: row['Email'],
            phone: row['Phone'],
            role: row['Role'] || 'User',
            lastLogin: row['Last Login'],
            temperature: row['Temperature'],
            image: row['Image'] || 'https://via.placeholder.com/150'
        }));

        // Initialize everything
        updateTable();
        updateCharts();
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        // Show error message to user
        alert('Error loading user data. Please try again later.');
    }
}

// Error handling function
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    // You could implement more sophisticated error handling here
    const errorMessage = document.createElement('div');
    errorMessage.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
    errorMessage.role = 'alert';
    errorMessage.innerHTML = `
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> ${context}: ${error.message}</span>
    `;
    document.querySelector('main').prepend(errorMessage);
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initializeCharts();
        setupSearch();
        await fetchAndProcessUserData();
    } catch (error) {
        handleError(error, 'Initialization');
    }
});

// Window resize handler for chart responsiveness
window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => chart.resize());
});

// Optional: Add event listener for theme toggle if you implement dark mode
document.addEventListener('theme-change', () => {
    // Update chart themes
    Object.values(charts).forEach(chart => {
        chart.options.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'default';
        chart.update();
    });
});

// Optional: Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processTemperatureData,
        processLoginData,
        processMonthlyData,
        calculateAverage,
        formatDate
    };
}