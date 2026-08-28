const { queryWithTiming } = require('../../config/database');

/**
 * Create a new customer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCustomer = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      name,
      address,
      phone,
      email
    } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    // Insert customer
    const query = `
      INSERT INTO customers (name, address, phone, email, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      name.trim(),
      address || null,
      phone || null,
      email || null,
      userId
    ];

    const result = await queryWithTiming(query, values);
    const customerId = result.lastID || result.insertId;

    // Get the created customer
    const customerResult = await queryWithTiming(
      'SELECT id, name, address, phone, email, created_at FROM customers WHERE id = ?',
      [customerId]
    );
    const customer = customerResult.rows[0];

    // Log audit entry
    await queryWithTiming(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES (?, ?, ?, ?, ?)',
      [userId, 'INSERT', 'customers', customer.id, JSON.stringify(customer)]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all customers with pagination and search
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, name, address, phone, email, created_at
      FROM customers
    `;

    const params = [];

    if (search) {
      query += ` WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await queryWithTiming(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM customers';
    if (search) {
      countQuery += ` WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?`;
    }
    const countResult = await queryWithTiming(countQuery, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        customers: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get customer by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id, name, address, phone, email, created_at
      FROM customers
      WHERE id = ?
    `;

    const result = await queryWithTiming(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById
};
