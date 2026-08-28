const { Pool } = require('pg');
const winston = require('winston');

/**
 * PostgreSQL Connection Pool Configuration
 * Manages database connections with connection pooling
 */

// Create Winston logger for database operations
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/database-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/database.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

/**
 * Test database connection
 */
pool.on('connect', () => {
  logger.info('New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Test connection function
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
};

/**
 * Execute a query with error handling
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query execution failed', { text, params, error: error.message });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} PostgreSQL client
 */
const getClient = async () => {
  try {
    const client = await pool.connect();
    logger.debug('Client acquired from pool');
    return client;
  } catch (error) {
    logger.error('Failed to acquire client from pool', { error: error.message });
    throw error;
  }
};

/**
 * Close the connection pool
 * Call this when shutting down the application
 */
const closePool = async () => {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing connection pool', { error: error.message });
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing database connections...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing database connections...');
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  closePool,
  logger
};
