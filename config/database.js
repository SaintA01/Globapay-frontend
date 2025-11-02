const { Pool } = require('pg');
require('dotenv').config();

// For Render: Use DATABASE_URL environment variable
// For local: Use individual environment variables
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString: connectionString,
  // Render PostgreSQL requires SSL
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Event listeners
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Connected to PostgreSQL database');
  }
});

pool.on('error', (err, client) => {
  console.error('❌ Database connection error:', err);
  if (process.env.NODE_ENV === 'production') {
    // In production, you might want to restart the process or alert
    process.exit(-1);
  }
});

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { connected: true, timestamp: result.rows[0].now };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

module.exports = { pool, testConnection };
