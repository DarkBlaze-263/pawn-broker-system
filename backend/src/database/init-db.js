/**
 * Database Initialization Script
 * 
 * This script reads the schema.sql file and executes it against the database
 * to create all tables, indexes, views, and functions.
 * 
 * Usage: node src/database/init-db.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { pool } = require('../../config/database');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.exec(schema);

    console.log('✅ Database schema created successfully!');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - customers');
    console.log('  - bills');
    console.log('  - bill_items');
    console.log('  - transactions');
    console.log('  - audit_log');
    console.log('\nViews created:');
    console.log('  - active_bills_view');
    console.log('  - bill_transaction_summary');
    console.log('\nFunctions created:');
    console.log('  - generate_bill_number()');
    console.log('\nIndexes and triggers have been applied.');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the initialization
initializeDatabase();
