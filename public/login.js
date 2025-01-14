document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const messageBox = document.getElementById('loginMessage');

    // ----- LOGIN -----
    loginForm?.addEventListener('submit', async function handleLogin(event) {
        event.preventDefault();
        messageBox.classList.add('hidden');

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            messageBox.textContent = 'Username and password are required.';
            messageBox.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                messageBox.textContent = error.error || 'Login failed';
                messageBox.classList.remove('hidden');
                return;
            }

            // On success, parse the response,
            // store user info in localStorage,
            // then redirect.
            const userData = await response.json();
            localStorage.setItem('loggedInUser', JSON.stringify(userData));
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Login error:', error);
            messageBox.textContent = 'Something went wrong!';
            messageBox.classList.remove('hidden');
        }
    });


    // ----- REGISTER -----
    registerBtn?.addEventListener('click', async function handleRegister(event) {
        event.preventDefault();
        messageBox.classList.add('hidden');

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            messageBox.textContent = 'Username and password are required.';
            messageBox.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                messageBox.textContent = error.error || 'Registration failed';
                messageBox.classList.remove('hidden');
                return;
            }

            // If you want to log in immediately after registering:
            // 1) Parse the newly created user from the server.
            // 2) Store in localStorage.
            // 3) Redirect to your dashboard.

            const newUser = await response.json();
            localStorage.setItem('loggedInUser', JSON.stringify(newUser.user));
            window.location.href = 'index.html';

            // Or, if you'd rather show a success message and *not* auto-log them in:
            // messageBox.textContent = 'Registration successful! You can now log in.';
            // messageBox.classList.remove('hidden', 'text-red-500');
            // messageBox.classList.add('text-green-500');
        } catch (error) {
            console.error('Registration error:', error);
            messageBox.textContent = 'Something went wrong during registration!';
            messageBox.classList.remove('hidden');
        }
    });

});
