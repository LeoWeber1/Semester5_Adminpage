// login.js
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const messageBox = document.getElementById('loginMessage');

    async function sendRequest(url, method, data) {
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Request failed');
            return result;
        } catch (error) {
            console.error(`${method} error:`, error);
            throw error;
        }
    }

    function showMessage(message, isError = true) {
        messageBox.textContent = message;
        messageBox.classList.remove('hidden');
        messageBox.classList.toggle('text-red-500', isError);
        messageBox.classList.toggle('text-green-500', !isError);
    }

    // ----- LOGIN -----
    // ----- LOGIN -----
    loginForm?.addEventListener('submit', async function (event) {
        event.preventDefault();
        messageBox.classList.add('hidden');

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showMessage('Username and password are required.');
            return;
        }

        try {
            const userData = await sendRequest('http://localhost:3001/api/login', 'POST', {
                username,
                password
            });

            // Store only basic user info
            localStorage.setItem('loggedInUser', JSON.stringify({
                id: userData.id,
                username: userData.username
            }));

            window.location.href = 'index.html';
        } catch (error) {
            showMessage(error.message);
        }
    });

    // ----- REGISTER -----
    registerBtn?.addEventListener('click', async function (event) {
        event.preventDefault();
        messageBox.classList.add('hidden');

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (!username || !password) {
            showMessage('Username and password are required.');
            return;
        }

        try {
            const newUser = await sendRequest('http://localhost:3001/api/register', 'POST', { username, password });
            showMessage('Registration successful! You can now log in.', false);
        } catch (error) {
            showMessage(error.message);
        }
    });
});
