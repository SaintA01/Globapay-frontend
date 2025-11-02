const { pool } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

const runMigrations = async () => {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Read the init.sql file
    const initSQL = await fs.readFile(
      path.join(__dirname, '../migrations/init.sql'), 
      'utf8'
    );
    
    // Split into individual statements
    const statements = initSQL
      .split(';')
      .filter(stmt => stmt.trim().length > 0);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
        successCount++;
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        if (error.code === '42P07') { // table already exists
          console.log(`ℹ️  Table already exists: ${error.table}`);
          successCount++;
        } else {
          console.error(`❌ Error executing: ${statement.substring(0, 50)}...`);
          console.error(`   Error: ${error.message}`);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
