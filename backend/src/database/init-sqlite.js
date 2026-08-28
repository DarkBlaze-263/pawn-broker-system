const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_URL || './pawn_broker.db';
const schemaPath = path.join(__dirname, 'schema-sqlite.sql');

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('SQLite database opened successfully');
    });

    // Read and execute schema
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    db.exec(schema, (err) => {
      if (err) {
        console.error('Error executing schema:', err);
        reject(err);
      } else {
        console.log('Database schema initialized successfully');
        resolve();
      }
      db.close();
    });
  });
};

// Run initialization if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database initialization complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
