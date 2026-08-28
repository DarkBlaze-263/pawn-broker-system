const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// SQLite connection
const dbPath = process.env.DATABASE_URL || './pawn_broker.db';
const db = new sqlite3.Database(path.resolve(__dirname, '../', dbPath), (err) => {
  if (err) {
    console.error('Error connecting to SQLite database', err);
    process.exit(-1);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Wrapper for timing and async
const queryWithTiming = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const isSelect = query.trim().toUpperCase().startsWith('SELECT');
    
    if (isSelect) {
      db.all(query, params, function(err, rows) {
        const duration = Date.now() - start;
        console.log('Executed query', { text: query, duration, rows: rows ? rows.length : 0 });
        if (err) reject(err);
        else resolve({ rows: rows || [] });
      });
    } else {
      db.run(query, params, function(err) {
        const duration = Date.now() - start;
        console.log('Executed query', { text: query, duration, changes: this.changes });
        if (err) reject(err);
        else resolve({ rows: [], lastID: this.lastID, changes: this.changes });
      });
    }
  });
};

const pool = {
  query: (text, params) => queryWithTiming(text, params),
  exec: (text) => new Promise((resolve, reject) => db.exec(text, (err) => err ? reject(err) : resolve())),
  end: () => new Promise(resolve => db.close(resolve))
};

module.exports = {
  pool,
  queryWithTiming
};
