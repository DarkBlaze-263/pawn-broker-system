const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

/**
 * Database connection configuration with optimized pooling
 * Supports both PostgreSQL and SQLite
 */

let pool = null;
let sqliteDb = null;
let isPostgres = false;

// Check if using PostgreSQL
const dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
  isPostgres = true;
  pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('connect', () => {
    console.log('New PostgreSQL client connected');
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
} else {
  console.log('Using SQLite database:', dbUrl || './pawn_broker.db');
}

/**
 * Initialize SQLite database
 */
const initSqlite = async () => {
  if (sqliteDb) return sqliteDb;
  
  sqliteDb = await open({
    filename: process.env.DATABASE_URL || './pawn_broker.db',
    driver: sqlite3.Database
  });
  
  console.log('SQLite database initialized');
  return sqliteDb;
};

/**
 * Execute query with timing
 */
const queryWithTiming = async (text, params = []) => {
  const start = Date.now();
  
  try {
    let result;
    
    if (isPostgres) {
      result = await pool.query(text, params);
      // Convert PostgreSQL result to standard format
      result = {
        rows: result.rows,
        rowCount: result.rowCount
      };
    } else {
      const db = await initSqlite();
      // Convert PostgreSQL-style queries to SQLite
      const sql = text
        .replace(/\$1/g, '?')
        .replace(/\$2/g, '?')
        .replace(/\$3/g, '?')
        .replace(/\$4/g, '?')
        .replace(/\$5/g, '?')
        .replace(/RETURNING \*/i, '');
      
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        result = await db.all(sql, params);
        result = { rows: result, rowCount: result.length };
      } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
        await db.run(sql, params);
        result = { rows: [], rowCount: 1 };
      } else if (sql.trim().toUpperCase().startsWith('UPDATE') || sql.trim().toUpperCase().startsWith('DELETE')) {
        await db.run(sql, params);
        result = { rows: [], rowCount: 1 };
      }
    }
    
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`Slow query detected (${duration}ms):`, text.substring(0, 100));
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`Query failed (${duration}ms):`, error.message);
    throw error;
  }
};

/**
 * Get pool statistics
 */
const getPoolStats = () => {
  if (isPostgres) {
    return {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };
  }
  return { type: 'sqlite' };
};

/**
 * Close database connection
 */
const closeConnection = async () => {
  if (isPostgres && pool) {
    await pool.end();
  } else if (sqliteDb) {
    await sqliteDb.close();
  }
};

module.exports = {
  pool,
  queryWithTiming,
  getPoolStats,
  closeConnection,
  isPostgres
};
