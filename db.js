import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER || 'leopoldweber',     // PostgreSQL username
    host: process.env.DB_HOST || 'localhost',       // Host
    database: process.env.DB_NAME || 'my_local_db', // Database name
    password: process.env.DB_PASSWORD || 'my_password', // PostgreSQL password
    port: parseInt(process.env.DB_PORT, 10) || 5432,    // PostgreSQL port
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;
