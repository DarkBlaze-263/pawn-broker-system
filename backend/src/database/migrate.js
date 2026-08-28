const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Database Migration Script
 * Runs schema.sql on the production database
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const runMigration = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Read schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Migration completed successfully');

    // Verify tables were created
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const result = await pool.query(tablesQuery);
    
    console.log('📊 Tables created:', result.rows.map(row => row.table_name).join(', '));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
