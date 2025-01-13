import express from 'express';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import pool from './db.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

// Auto-load SQL file to initialize the database (if not already initialized)
const initializeDB = () => {
    const dbFile = './db.sql';
    const command = `psql -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -f ${dbFile}`;

    exec(
        command,
        {
            env: {
                ...process.env,
                PGPASSWORD: process.env.DB_PASSWORD, // Set PGPASSWORD explicitly
            },
        },
        (err, stdout, stderr) => {
            if (err) {
                console.error(`Error initializing database: ${stderr}`);
            } else {
                console.log('Database initialized successfully');
            }
        }
    );
};

initializeDB();

app.use(cors());
app.use(express.static('public')); // Serve static files (login.html, etc.)

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

        // Insert new user into users table
        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
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
        console.log('Fetched employees:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching employees:', error.message);
        res.status(500).json({ error: 'Server error fetching employees' });
    }
});

// ========== Add New Employee ==========
app.post('/api/employees', async (req, res) => {
    try {
        const { first_name, last_name, id_number, email, personal_number } = req.body;

        if (!first_name || !last_name || !id_number || !email || !personal_number) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const query = `
            INSERT INTO employees (first_name, last_name, id_number, email, personal_number)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;
        const values = [first_name, last_name, id_number, email, personal_number];

        const result = await pool.query(query, values);
        console.log('Added employee:', result.rows[0]);
        res.status(201).json({ message: 'Employee added successfully', employee: result.rows[0] });
    } catch (error) {
        console.error('Error adding employee:', error.message);
        res.status(500).json({ error: 'Server error adding employee' });
    }
});

// ========== Default Page ==========
app.get('/', (req, res) => {
    res.sendFile('login.html', { root: './public' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
