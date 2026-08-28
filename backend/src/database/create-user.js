const sqlite3 = require('sqlite3').verbose();
const { hashPassword } = require('../utils/passwordHash');

// Simple UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const dbPath = process.env.DATABASE_URL || './pawn_broker.db';

const createDefaultUser = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
    });

    // Check if users exist
    db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
      if (err) {
        console.error('Error checking users:', err);
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log(`Found ${row.count} user(s) in database`);
        // List existing users
        db.all('SELECT id, username, email, full_name, is_active FROM users', (err, users) => {
          if (err) {
            console.error('Error fetching users:', err);
          } else {
            console.log('Existing users:');
            users.forEach(user => {
              console.log(`- ${user.username} (${user.email}) - Active: ${user.is_active}`);
            });
          }
          db.close();
          resolve();
        });
        return;
      }

      // Create default user
      try {
        const passwordHash = await hashPassword('admin123');
        const userId = generateUUID();
        
        const user = {
          id: userId,
          username: 'admin',
          email: 'admin@pawnbroker.com',
          password_hash: passwordHash,
          full_name: 'System Administrator',
          phone: '9876543210',
          theme_preference: 'light',
          is_active: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        db.run(
          `INSERT INTO users (id, username, email, password_hash, full_name, phone, theme_preference, is_active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.id, user.username, user.email, user.password_hash, user.full_name, user.phone, user.theme_preference, user.is_active, user.created_at, user.updated_at],
          (err) => {
            if (err) {
              console.error('Error creating user:', err);
              reject(err);
            } else {
              console.log('Default user created successfully:');
              console.log('Username: admin');
              console.log('Password: admin123');
              console.log('Email: admin@pawnbroker.com');
            }
            db.close();
            resolve();
          }
        );
      } catch (error) {
        console.error('Error hashing password:', error);
        reject(error);
        db.close();
      }
    });
  });
};

createDefaultUser()
  .then(() => {
    console.log('User creation process complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('User creation failed:', err);
    process.exit(1);
  });
