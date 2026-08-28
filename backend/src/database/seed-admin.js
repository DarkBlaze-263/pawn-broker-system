/**
 * Seed Admin User Script
 * 
 * This script creates a default admin user for testing purposes.
 * Default credentials: username: admin, password: admin123
 * 
 * Usage: node src/database/seed-admin.js
 */

const pool = require('../../config/database');
const { hashPassword } = require('../utils/passwordHash');

async function seedAdminUser() {
  try {
    console.log('Seeding admin user...');

    // Hash the default password
    const password = 'admin123';
    const passwordHash = await hashPassword(password);

    // Check if admin user already exists
    const checkQuery = 'SELECT id FROM users WHERE username = $1 OR email = $1';
    const checkResult = await pool.query(checkQuery, ['admin']);

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Admin user already exists. Skipping creation.');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      return;
    }

    // Insert admin user
    const insertQuery = `
      INSERT INTO users (username, email, password_hash, full_name, phone, theme_preference, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, email
    `;

    const values = [
      'admin',
      'admin@pawnbroker.com',
      passwordHash,
      'System Administrator',
      '9876543210',
      'light',
      true
    ];

    const result = await pool.query(insertQuery, values);
    const user = result.rows[0];

    console.log('✅ Admin user created successfully!');
    console.log('   User ID:', user.id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the seed script
seedAdminUser();
