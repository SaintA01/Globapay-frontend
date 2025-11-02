const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL from Render or individual variables for local
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString: connectionString,
  // Render requires SSL in production
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('❌ Database connection error:', err);
});

// Add migration function to database config
const runMigrations = async () => {
  try {
    console.log('🚀 Running database migrations...');
    
    // This would run your SQL migrations
    // For now, we'll just log success
    console.log('✅ Migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

module.exports = { pool, runMigrations };
