// Function to fetch and parse the CSV file
async function fetchCSVData(filePath) {
    try {
        const response = await fetch(filePath);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n');
        const headers = rows[0].split(',');  // First row is headers
        const dataRows = rows.slice(1).map(row => row.split(','));  // Remaining rows are data

        // Extract temperature data and count employees with temp < 39 and >= 39
        let countBelow39 = 0;
        let countAbove39 = 0;

        dataRows.forEach(row => {
            const temperature = parseFloat(row[5]); // Assuming temperature is at index 5
            if (temperature < 39) {
                countBelow39++;
            } else {
                countAbove39++;
            }
        });
        return { countBelow39, countAbove39 };
    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
    }
}


// Function to create a pie chart showing how many employees have temperatures below and above 39°C
function createPieChart(chartId, countBelow39, countAbove39) {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
        console.error(`Element with id ${chartId} not found.`);
        return;
    }
    const ctx = chartElement.getContext('2d');
    const data = [Math.round(countBelow39), Math.round(countAbove39)];

    new Chart(ctx, {
        type: 'pie', // Chart type
        data: {
            labels: ['Below 39°C', '39°C and Above'], // Labels for the categories
            datasets: [{
                label: 'Number of Employees',
                data: data, // Data for below and above 39°C
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',  // Color for below 39°C
                    'rgba(255, 99, 132, 0.6)'   // Color for 39°C and above
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.raw;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Function to initialize charts with CSV data
async function initializeCharts(csvPath) {
    const { countBelow39, countAbove39 } = await fetchCSVData(csvPath);
    if (countBelow39 !== undefined && countAbove39 !== undefined) {
        createPieChart('chartOne', countBelow39, countAbove39);  // Pie chart showing below/above 39°C
    }
}

// Expose the function to be used in HTML
export { initializeCharts };

// Function to fetch and parse the CSV file for the table
async function fetchNamesData(filePath) {
    try {
        const response = await fetch(filePath);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n');
        const headers = rows[0].split(',');  // First row is headers
        const dataRows = rows.slice(1).map(row => row.split(','));  // Remaining rows are data
        return { headers, dataRows };
    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
    }
}

// Function to create the table dynamically
function createTable(headers, dataRows) {
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '';  // Clear existing table data

    dataRows.forEach((row, index) => {
        const rowElement = document.createElement('tr');
        if (index % 2 !== 0) {
            rowElement.classList.add('bg-gray-200');  // Add alternate row coloring
        }

        row.forEach((cell, cellIndex) => {
            const cellElement = document.createElement('td');
            cellElement.classList.add('text-left', 'py-3', 'px-4');

            if (cellIndex === 2) {  // Phone number column
                const phoneLink = document.createElement('a');
                phoneLink.classList.add('hover:text-blue-500');
                phoneLink.href = `tel:${cell}`;
                phoneLink.textContent = cell;
                cellElement.appendChild(phoneLink);
            } else if (cellIndex === 3) {  // Email column
                const emailLink = document.createElement('a');
                emailLink.classList.add('hover:text-blue-500');
                emailLink.href = `mailto:${cell}`;
                emailLink.textContent = cell;
                cellElement.appendChild(emailLink);
            } else {
                cellElement.textContent = cell;
            }

            rowElement.appendChild(cellElement);
        });

        tableBody.appendChild(rowElement);
    });
}

// Function to initialize the table with CSV data
async function initializeTable(csvPath) {
    const { headers, dataRows } = await fetchNamesData(csvPath);
    if (headers && dataRows) {
        createTable(headers, dataRows);
    }
}

// Call initializeTable function and pass the CSV file path
initializeTable('names.csv');
