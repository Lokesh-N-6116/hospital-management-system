/**
 * Database Configuration & Connection Pool
 * Uses mysql2/promise for clean async/await parameterized queries.
 * Connection pooling ensures efficient reuse of database connections
 * without opening and closing a TCP socket on every single HTTP request.
 */
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_db',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection on startup
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`[Database] Successfully connected to MySQL database: ${process.env.DB_NAME}`);
        connection.release();
    } catch (error) {
        console.error('[Database] ERROR connecting to MySQL:', error.message);
        console.error('Make sure your MySQL service is running and credentials in .env are correct.');
    }
}

testConnection();

module.exports = pool;
