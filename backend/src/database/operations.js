const { pool, logger } = require('./connection');
const { hashPassword } = require('../utils/passwordHash');

/**
 * Database Operations Module
 * Provides CRUD operations for all database entities
 * Uses parameterized queries to prevent SQL injection
 * Includes comprehensive error handling and logging
 */

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.password - Plain text password (will be hashed)
 * @param {string} userData.full_name - Full name
 * @param {string} userData.phone - Phone number
 * @param {string} userData.created_by - User ID of creator
 * @returns {Promise<Object>} Created user data
 */
const createUser = async (userData) => {
  const { username, email, password, full_name, phone, created_by } = userData;

  try {
    // Validate input
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    const query = `
      INSERT INTO users (username, email, password_hash, full_name, phone, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, full_name, phone, is_active, created_at
    `;

    const values = [username, email, password_hash, full_name || null, phone || null, created_by || null];
    const result = await pool.query(query, values);

    logger.info('User created successfully', { userId: result.rows[0].id, username });
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create user', { username, error: error.message });
    throw error;
  }
};

/**
 * Get user by username
 * @param {string} username - Username to search
 * @returns {Promise<Object|null>} User data or null if not found
 */
const getUserByUsername = async (username) => {
  try {
    const query = `
      SELECT id, username, email, password_hash, full_name, phone, 
             theme_preference, is_active, created_at, updated_at
      FROM users
      WHERE username = $1
    `;

    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      logger.warn('User not found', { username });
      return null;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to get user by username', { username, error: error.message });
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<Object|null>} User data or null if not found
 */
const getUserById = async (userId) => {
  try {
    const query = `
      SELECT id, username, email, full_name, phone, 
             theme_preference, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      logger.warn('User not found', { userId });
      return null;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to get user by ID', { userId, error: error.message });
    throw error;
  }
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated user data
 */
const updateUser = async (userId, updateData) => {
  try {
    const { full_name, phone, email, theme_preference, is_active } = updateData;
    
    const query = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          theme_preference = COALESCE($4, theme_preference),
          is_active = COALESCE($5, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, username, email, full_name, phone, theme_preference, is_active, updated_at
    `;

    const values = [full_name, phone, email, theme_preference, is_active, userId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info('User updated successfully', { userId });
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to update user', { userId, error: error.message });
    throw error;
  }
};

// ============================================================================
// CUSTOMER OPERATIONS
// ============================================================================

/**
 * Create a new customer
 * @param {Object} customerData - Customer data
 * @param {string} customerData.name - Customer name
 * @param {string} customerData.address - Address
 * @param {string} customerData.phone - Phone number
 * @param {string} customerData.email - Email
 * @param {string} customerData.aadhar_number - Aadhar number
 * @param {string} customerData.pan_number - PAN number
 * @param {string} customerData.created_by - User ID of creator
 * @returns {Promise<Object>} Created customer data
 */
const createCustomer = async (customerData) => {
  const { name, address, phone, email, aadhar_number, pan_number, created_by } = customerData;

  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('Customer name is required');
    }

    const query = `
      INSERT INTO customers (name, address, phone, email, aadhar_number, pan_number, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, address, phone, email, aadhar_number, pan_number, created_at
    `;

    const values = [
      name.trim(),
      address || null,
      phone || null,
      email || null,
      aadhar_number || null,
      pan_number || null,
      created_by || null
    ];

    const result = await pool.query(query, values);

    logger.info('Customer created successfully', { customerId: result.rows[0].id, name });
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create customer', { name, error: error.message });
    throw error;
  }
};

/**
 * Get customers with pagination
 * @param {number} limit - Number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Promise<Array>} Array of customers
 */
const getCustomers = async (limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT id, name, address, phone, email, aadhar_number, pan_number, created_at
      FROM customers
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (error) {
    logger.error('Failed to get customers', { limit, offset, error: error.message });
    throw error;
  }
};

/**
 * Search customers by name or phone
 * @param {string} searchTerm - Search term (name or phone)
 * @returns {Promise<Array>} Array of matching customers
 */
const searchCustomer = async (searchTerm) => {
  try {
    const query = `
      SELECT id, name, address, phone, email, aadhar_number, pan_number, created_at
      FROM customers
      WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  } catch (error) {
    logger.error('Failed to search customers', { searchTerm, error: error.message });
    throw error;
  }
};

/**
 * Get customer by ID
 * @param {string} customerId - Customer ID (UUID)
 * @returns {Promise<Object|null>} Customer data or null if not found
 */
const getCustomerById = async (customerId) => {
  try {
    const query = `
      SELECT id, name, address, phone, email, aadhar_number, pan_number, created_at
      FROM customers
      WHERE id = $1
    `;

    const result = await pool.query(query, [customerId]);

    if (result.rows.length === 0) {
      logger.warn('Customer not found', { customerId });
      return null;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to get customer by ID', { customerId, error: error.message });
    throw error;
  }
};

/**
 * Update customer
 * @param {string} customerId - Customer ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated customer data
 */
const updateCustomer = async (customerId, updateData) => {
  try {
    const { name, address, phone, email, aadhar_number, pan_number } = updateData;
    
    const query = `
      UPDATE customers
      SET name = COALESCE($1, name),
          address = COALESCE($2, address),
          phone = COALESCE($3, phone),
          email = COALESCE($4, email),
          aadhar_number = COALESCE($5, aadhar_number),
          pan_number = COALESCE($6, pan_number)
      WHERE id = $7
      RETURNING id, name, address, phone, email, aadhar_number, pan_number
    `;

    const values = [name, address, phone, email, aadhar_number, pan_number, customerId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Customer not found');
    }

    logger.info('Customer updated successfully', { customerId });
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to update customer', { customerId, error: error.message });
    throw error;
  }
};

// ============================================================================
// BILL OPERATIONS
// ============================================================================

/**
 * Create a new bill
 * @param {Object} billData - Bill data
 * @param {string} billData.customer_id - Customer ID
 * @param {string} billData.created_by - User ID of creator
 * @param {number} billData.principal_amount - Principal amount
 * @param {number} billData.interest_percentage - Interest percentage
 * @param {number} billData.interest_amount - Interest amount
 * @param {number} billData.total_amount - Total amount
 * @param {string} billData.amount_in_words - Amount in words
 * @returns {Promise<Object>} Created bill data
 */
const createBill = async (billData) => {
  const {
    customer_id,
    created_by,
    principal_amount,
    interest_percentage,
    interest_amount,
    total_amount,
    amount_in_words
  } = billData;

  try {
    // Validate input
    if (!customer_id || !created_by) {
      throw new Error('Customer ID and created_by are required');
    }

    // Generate bill number using database function
    const billNumberResult = await pool.query('SELECT generate_bill_number() as bill_number');
    const bill_number = billNumberResult.rows[0].bill_number;

    const query = `
      INSERT INTO bills (
        bill_number, customer_id, created_by, bill_date,
        principal_amount, interest_percentage, interest_amount,
        total_amount, amount_in_words, bill_status
      ) VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, 'active')
      RETURNING id, bill_number, created_at
    `;

    const values = [
      bill_number,
      customer_id,
      created_by,
      principal_amount,
      interest_percentage,
      interest_amount,
      total_amount,
      amount_in_words
    ];

    const result = await pool.query(query, values);

    logger.info('Bill created successfully', { billId: result.rows[0].id, bill_number });
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create bill', { customer_id, error: error.message });
    throw error;
  }
};

/**
 * Get bill by ID with related data
 * @param {string} billId - Bill ID (UUID)
 * @returns {Promise<Object|null>} Complete bill data or null if not found
 */
const getBillById = async (billId) => {
  try {
    const billQuery = `
      SELECT 
        b.*,
        c.name AS customer_name, c.address AS customer_address,
        c.phone AS customer_phone, c.email AS customer_email,
        u.full_name AS created_by_name
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      JOIN users u ON b.created_by = u.id
      WHERE b.id = $1
    `;

    const billResult = await pool.query(billQuery, [billId]);

    if (billResult.rows.length === 0) {
      logger.warn('Bill not found', { billId });
      return null;
    }

    // Get bill items
    const itemsQuery = `
      SELECT * FROM bill_items
      WHERE bill_id = $1
      ORDER BY created_at
    `;

    const itemsResult = await pool.query(itemsQuery, [billId]);

    return {
      bill: billResult.rows[0],
      items: itemsResult.rows
    };
  } catch (error) {
    logger.error('Failed to get bill by ID', { billId, error: error.message });
    throw error;
  }
};

/**
 * Get bills by customer ID
 * @param {string} customerId - Customer ID (UUID)
 * @returns {Promise<Array>} Array of bills
 */
const getBillsByCustomer = async (customerId) => {
  try {
    const query = `
      SELECT 
        b.id, b.bill_number, b.bill_date, b.principal_amount,
        b.interest_percentage, b.interest_amount, b.total_amount,
        b.bill_status, b.created_at, b.closed_at
      FROM bills b
      WHERE b.customer_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query, [customerId]);
    return result.rows;
  } catch (error) {
    logger.error('Failed to get bills by customer', { customerId, error: error.message });
    throw error;
  }
};

/**
 * Get bills by status
 * @param {string} status - Bill status (active, closed, forfeited, redeemed)
 * @returns {Promise<Array>} Array of bills
 */
const getBillsByStatus = async (status) => {
  try {
    const query = `
      SELECT 
        b.id, b.bill_number, b.bill_date, b.principal_amount,
        b.interest_percentage, b.interest_amount, b.total_amount,
        b.bill_status,b.created_at, b.closed_at,
        c.name AS customer_name, c.phone AS customer_phone
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.bill_status = $1
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query, [status]);
    return result.rows;
  } catch (error) {
    logger.error('Failed to get bills by status', { status, error: error.message });
    throw error;
  }
};

/**
 * Update bill
 * @param {string} billId - Bill ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated bill data
 */
const updateBill = async (billId, updateData) => {
  try {
    const {
      principal_amount,
      interest_percentage,
      interest_amount,
      total_amount,
      amount_in_words
    } = updateData;

    const query = `
      UPDATE bills
      SET principal_amount = COALESCE($1, principal_amount),
          interest_percentage = COALESCE($2, interest_percentage),
          interest_amount = COALESCE($3, interest_amount),
          total_amount = COALESCE($4, total_amount),
          amount_in_words = COALESCE($5, amount_in_words),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, bill_number, principal_amount, interest_percentage, 
                interest_amount, total_amount, amount_in_words, updated_at
    `;

    const values = [
      principal_amount,
      interest_percentage,
      interest_amount,
      total_amount,
      amount_in_words,
      billId
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Bill not found');
    }

    logger.info('Bill updated successfully', { billId });
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to update bill', { billId, error: error.message });
    throw error;
  }
};

/**
 * Close bill with transaction
 * @param {string} billId - Bill ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Success result
 */
const closeBill = async (billId, transactionData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      amount_paid,
      interest_months,
      total_payable,
      payment_method,
      processed_by
    } = transactionData;

    // Update bill status
    const updateBillQuery = `
      UPDATE bills
      SET bill_status = 'closed',
          closed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, bill_number
    `;

    const billResult = await client.query(updateBillQuery, [billId]);

    if (billResult.rows.length === 0) {
      throw new Error('Bill not found');
    }

    // Create transaction record
    const transactionQuery = `
      INSERT INTO transactions (
        bill_id, transaction_type, amount_paid, interest_months,
        total_payable, payment_method, processed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const transactionValues = [
      billId,
      'redemption',
      amount_paid,
      interest_months,
      total_payable,
      payment_method,
      processed_by
    ];

    await client.query(transactionQuery, transactionValues);

    await client.query('COMMIT');

    logger.info('Bill closed successfully', { billId, bill_number: billResult.rows[0].bill_number });
    return { success: true, bill_number: billResult.rows[0].bill_number };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to close bill', { billId, error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================================
// BILL ITEMS OPERATIONS
// ============================================================================

/**
 * Create bill items
 * @param {string} billId - Bill ID
 * @param {Array} items - Array of item objects
 * @returns {Promise<Array>} Created items
 */
const createBillItems = async (billId, items) => {
  try {
    const query = `
      INSERT INTO bill_items (
        bill_id, item_description, item_type, weight,
        current_market_value, purity, specifications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const createdItems = [];
    
    for (const item of items) {
      const values = [
        billId,
        item.item_description,
        item.item_type,
        item.weight || null,
        item.current_market_value,
        item.purity || null,
        item.specifications || null
      ];

      const result = await pool.query(query, values);
      createdItems.push({ ...item, id: result.rows[0].id });
    }

    logger.info('Bill items created successfully', { billId, count: createdItems.length });
    return createdItems;
  } catch (error) {
    logger.error('Failed to create bill items', { billId, error: error.message });
    throw error;
  }
};

/**
 * Delete bill items by bill ID
 * @param {string} billId - Bill ID
 * @returns {Promise<void>}
 */
const deleteBillItems = async (billId) => {
  try {
    const query = 'DELETE FROM bill_items WHERE bill_id = $1';
    await pool.query(query, [billId]);
    logger.info('Bill items deleted successfully', { billId });
  } catch (error) {
    logger.error('Failed to delete bill items', { billId, error: error.message });
    throw error;
  }
};

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

/**
 * Create transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Created transaction
 */
const createTransaction = async (transactionData) => {
  try {
    const {
      bill_id,
      transaction_type,
      amount_paid,
      interest_months,
      total_payable,
      payment_method,
      processed_by
    } = transactionData;

    const query = `
      INSERT INTO transactions (
        bill_id, transaction_type, amount_paid, interest_months,
        total_payable, payment_method, processed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, bill_id, transaction_type, amount_paid, payment_date
    `;

    const values = [
      bill_id,
      transaction_type,
      amount_paid,
      interest_months || null,
      total_payable,
      payment_method,
      processed_by
    ];

    const result = await pool.query(query, values);

    logger.info('Transaction created successfully', { transactionId: result.rows[0].id });
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create transaction', { transactionData, error: error.message });
    throw error;
  }
};

/**
 * Get transactions by bill ID
 * @param {string} billId - Bill ID
 * @returns {Promise<Array>} Array of transactions
 */
const getTransactionsByBill = async (billId) => {
  try {
    const query = `
      SELECT 
        t.*,
        u.full_name AS processed_by_name
      FROM transactions t
      JOIN users u ON t.processed_by = u.id
      WHERE t.bill_id = $1
      ORDER BY t.payment_date DESC
    `;

    const result = await pool.query(query, [billId]);
    return result.rows;
  } catch (error) {
    logger.error('Failed to get transactions by bill', { billId, error: error.message });
    throw error;
  }
};

// ============================================================================
// AUDIT LOGGING OPERATIONS
// ============================================================================

/**
 * Log audit entry
 * @param {Object} auditData - Audit data
 * @param {string} auditData.user_id - User ID
 * @param {string} auditData.action - Action (INSERT, UPDATE, DELETE)
 * @param {string} auditData.table_name - Table name
 * @param {string} auditData.record_id - Record ID
 * @param {Object} auditData.changes - Changes data (JSON)
 * @returns {Promise<Object>} Created audit log entry
 */
const logAudit = async (auditData) => {
  try {
    const { user_id, action, table_name, record_id, changes } = auditData;

    const query = `
      INSERT INTO audit_log (user_id, action, table_name, record_id, changes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, action, table_name, record_id, created_at
    `;

    const values = [
      user_id || null,
      action,
      table_name,
      record_id,
      JSON.stringify(changes)
    ];

    const result = await pool.query(query, values);

    logger.info('Audit log entry created', { 
      auditId: result.rows[0].id, 
      action, 
      table_name, 
      record_id 
    });

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to log audit entry', { auditData, error: error.message });
    throw error;
  }
};

/**
 * Get audit logs by user
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>} Array of audit log entries
 */
const getAuditLogsByUser = async (userId, limit = 50) => {
  try {
    const query = `
      SELECT 
        a.*,
        u.username AS user_name
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  } catch (error) {
    logger.error('Failed to get audit logs by user', { userId, error: error.message });
    throw error;
  }
};

/**
 * Get audit logs by table
 * @param {string} tableName - Table name
 * @param {string} recordId - Record ID (optional)
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>} Array of audit log entries
 */
const getAuditLogsByTable = async (tableName, recordId = null, limit = 50) => {
  try {
    let query = `
      SELECT 
        a.*,
        u.username AS user_name
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.table_name = $1
    `;
    
    const values = [tableName];
    let paramCount = 1;

    if (recordId) {
      paramCount++;
      query += ` AND a.record_id = $${paramCount}`;
      values.push(recordId);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1}`;
    values.push(limit);

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    logger.error('Failed to get audit logs by table', { tableName, recordId, error: error.message });
    throw error;
  }
};

module.exports = {
  // User operations
  createUser,
  getUserByUsername,
  getUserById,
  updateUser,

  // Customer operations
  createCustomer,
  getCustomers,
  searchCustomer,
  getCustomerById,
  updateCustomer,

  // Bill operations
  createBill,
  getBillById,
  getBillsByCustomer,
  getBillsByStatus,
  updateBill,
  closeBill,

  // Bill items operations
  createBillItems,
  deleteBillItems,

  // Transaction operations
  createTransaction,
  getTransactionsByBill,

  // Audit logging operations
  logAudit,
  getAuditLogsByUser,
  getAuditLogsByTable
};
