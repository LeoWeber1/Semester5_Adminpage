async function fetchLoginData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();

        const result = Papa.parse(csvText, {
            header: true, // Parse CSV with headers
            skipEmptyLines: true
        });

        return result.data; // Returns array of { username, password }
    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
        return [];
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageBox = document.getElementById('loginMessage');

    const users = await fetchLoginData('login.csv');

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        messageBox.classList.add('hidden');
        localStorage.setItem('loggedInUser', JSON.stringify(user)); // Store user data locally
        window.location.href = 'tables.html'; // Redirect to the dashboard
    } else {
        messageBox.textContent = 'Invalid username or password!';
        messageBox.classList.remove('hidden');
    }
}

document.getElementById('loginForm').addEventListener('submit', handleLogin);
