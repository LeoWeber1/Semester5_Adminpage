import express from 'express';
import cors from 'cors';
import pool from './db.js'; // PostgreSQL connection

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files (login.html, index.html, etc.)

// ========== Test DB Connection ==========
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ now: result.rows[0].now });
    } catch (err) {
        console.error('Database connection error:', err.message);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// ========== Register New User ==========
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if the username already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            console.log('Attempt to register existing username:', username);
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, password]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0],
        });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: 'Server error registering user' });
    }
});

// ========== Login Existing User ==========
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            console.log('User not found:', username);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check password
        const dbPassword = userResult.rows[0].password;
        if (dbPassword !== password) {
            console.log('Password mismatch for user:', username);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Successful login
        res.json({
            id: userResult.rows[0].id,
            username: userResult.rows[0].username,
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Server error logging in' });
    }
});

// ========== Get All Employees ==========
app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employees');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching employees:', error.message);
        res.status(500).json({ error: 'Server error fetching employees' });
    }
});

// ========== Default Page ==========
app.get('/', (req, res) => {
    // By default, send the login page or dashboard
    res.sendFile('login.html', { root: './public' });
});

// ========== Start Server ==========
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
