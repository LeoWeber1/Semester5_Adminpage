import pg from 'pg';
const { Pool } = pg;

// Update credentials with yours
const pool = new Pool({
    user: 'leopoldweber',     // PostgreSQL username
    host: 'localhost',        // Host
    database: 'my_local_db',  // Database name
    password: 'my_password',  // PostgreSQL password
    port: 5432,               // Default PostgreSQL port
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;
