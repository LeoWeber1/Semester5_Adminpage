// server.js
import express from 'express';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import pool from './db.js';
import cors from 'cors';
import bcrypt from 'bcrypt'; // For password hashing

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve static files (e.g., login.html)

// --- Optional: Auto-load SQL file to initialize the database ---
// Only run this if you really need to (set INIT_DB=true in your .env file)
if (process.env.INIT_DB === 'true') {
    const initializeDB = () => {
        const dbFile = './db.sql';
        const command = `psql -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -f ${dbFile}`;

        exec(
            command,
            {
                env: {
                    ...process.env,
                    PGPASSWORD: process.env.DB_PASSWORD, // Pass the password to psql
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
}

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

        // Check if the username already exists.
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            console.log('Attempt to register existing username:', username);
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the users table.
        // IMPORTANT: Ensure the DB user (process.env.DB_USER) has INSERT privileges on the "users" table.
        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0],
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Server error registering user' });
    }
});

// ========== Login Existing User ==========
// ========== Login Existing User (Simplified) ==========
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        console.log('Stored hash:', user.password); // Add this line

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Password comparison failed'); // Add this line
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ id: user.id, username: user.username });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
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
        const { first_name, last_name, id_number, email, personal_number, temperature } = req.body;
        if (!first_name || !last_name || !id_number || !email || !personal_number) {
            return res.status(400).json({
                error: 'First name, last name, id number, email, and personal number are required'
            });
        }
        const query = `
            INSERT INTO employees (first_name, last_name, id_number, email, personal_number, temperature)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`;
        const values = [first_name, last_name, id_number, email, personal_number, temperature || null];
        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Employee added successfully', employee: result.rows[0] });
    } catch (error) {
        console.error('Error adding employee:', error.message);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'ID number or email already exists' });
        }
        res.status(500).json({ error: 'Server error adding employee' });
    }
});

// ========== Update Employee ==========
app.put('/api/employees/:id', async (req, res) => {
    try {
        const { first_name, last_name, email, personal_number } = req.body;
        const { id } = req.params;
        const query = `
            UPDATE employees
            SET first_name = $1, last_name = $2, email = $3, personal_number = $4
            WHERE id = $5
            RETURNING *`;
        const values = [first_name, last_name, email, personal_number, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee updated successfully', employee: result.rows[0] });
    } catch (error) {
        console.error('Error updating employee:', error.message);
        res.status(500).json({ error: 'Server error updating employee' });
    }
});

// ========== Delete Employee ==========
app.delete('/api/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error.message);
        res.status(500).json({ error: 'Server error deleting employee' });
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
