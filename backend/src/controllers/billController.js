const { queryWithTiming } = require('../../config/database');

/**
 * Convert number to words (Indian numbering system)
 * @param {number} amount - Amount to convert
 * @returns {string} Amount in words
 */
const numberToWords = (amount) => {
  if (amount === 0) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const convert = (n) => {
    if (n === 0) return '';
    
    let words = '';
    
    // Crores
    if (Math.floor(n / 10000000) > 0) {
      words += convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    
    // Lakhs
    if (Math.floor(n / 100000) > 0) {
      words += convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    
    // Thousands
    if (Math.floor(n / 1000) > 0) {
      words += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    
    // Hundreds
    if (n > 0) {
      words += convertLessThanThousand(n);
    }
    
    return words.trim();
  };

  const amountInRupees = Math.floor(amount);
  const paise = Math.round((amount - amountInRupees) * 100);

  let words = convert(amountInRupees);
  
  if (paise > 0) {
    words += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  
  return words + ' Only';
};

/**
 * Create a new bill with items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createBill = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      customer_id,
      principal_amount,
      interest_percentage,
      items
    } = req.body;

    // Validation
    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    if (!principal_amount || principal_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Principal amount must be a positive number'
      });
    }

    if (principal_amount > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Principal amount cannot exceed 1,000,000'
      });
    }

    if (!interest_percentage || interest_percentage < 0 || interest_percentage > 20) {
      return res.status(400).json({
        success: false,
        message: 'Interest percentage must be between 0 and 20'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.item_type) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: Item type is required`
        });
      }
      if (!item.item_description) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: Item description is required`
        });
      }
      if (!item.current_market_value || item.current_market_value <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: Market value must be a positive number`
        });
      }
      if (item.weight !== undefined && item.weight < 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: Weight cannot be negative`
        });
      }
    }

    // Check if customer exists
    const customerCheck = await queryWithTiming(
      'SELECT id FROM customers WHERE id = ?',
      [customer_id]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Calculate interest amount
    const interest_amount = (principal_amount * interest_percentage) / 100;
    const total_amount = principal_amount + interest_amount;
    const amount_in_words = numberToWords(total_amount);

    // Generate simple bill number (for SQLite)
    const bill_number = 'PB' + Date.now().toString().slice(-8);

    // Insert bill
    const billInsertQuery = `
      INSERT INTO bills (
        bill_number, customer_id, created_by, bill_date,
        principal_amount, interest_percentage, interest_amount,
        total_amount, amount_in_words, bill_status
      ) VALUES (?, ?, ?, date('now'), ?, ?, ?, ?, ?, 'active')
    `;

    const billValues = [
      bill_number,
      customer_id,
      userId,
      principal_amount,
      interest_percentage,
      interest_amount,
      total_amount,
      amount_in_words
    ];

    const billResult = await queryWithTiming(billInsertQuery, billValues);
    const billId = billResult.lastID || billResult.insertId;

    // Insert bill items
    const itemInsertQuery = `
      INSERT INTO bill_items (
        bill_id, item_description, item_type, weight,
        current_market_value, purity, specifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      const itemValues = [
        billId,
        item.item_description,
        item.item_type,
        item.weight || null,
        item.current_market_value,
        item.purity || null,
        item.specifications || null
      ];

      await queryWithTiming(itemInsertQuery, itemValues);
    }

    // Log audit entry
    const auditQuery = `
      INSERT INTO audit_log (user_id, action, table_name, record_id, changes)
      VALUES (?, 'INSERT', 'bills', ?, ?)
    `;

    const auditChanges = JSON.stringify({
      bill_number,
      customer_id,
      principal_amount,
      interest_percentage,
      total_amount,
      items_count: items.length
    });

    await queryWithTiming(auditQuery, [userId, billId, auditChanges]);

    // Get the created bill
    const createdBill = await queryWithTiming(
      'SELECT id, bill_number, created_at FROM bills WHERE id = ?',
      [billId]
    );

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: {
        bill_id: billId,
        bill_number: bill_number,
        principal_amount: parseFloat(principal_amount),
        interest_percentage: parseFloat(interest_percentage),
        interest_amount: parseFloat(interest_amount),
        total_amount: parseFloat(total_amount),
        amount_in_words,
        created_at: createdBill.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all bills with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllBills = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.id, b.bill_number, b.bill_date, b.principal_amount,
        b.interest_percentage, b.interest_amount, b.total_amount,
        b.bill_status, b.created_at,
        c.name AS customer_name, c.phone AS customer_phone,
        u.full_name AS created_by_name
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      JOIN users u ON b.created_by = u.id
    `;

    const params = [];
    const conditions = [];

    if (status) {
      conditions.push(`b.bill_status = ?`);
      params.push(status);
    }

    if (search) {
      conditions.push(`(b.bill_number LIKE ? OR c.name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await queryWithTiming(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM bills b JOIN customers c ON b.customer_id = c.id';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countParams = params.slice(0, conditions.length);
    const countResult = await queryWithTiming(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        bills: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get bill by ID with items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get bill details
    const billQuery = `
      SELECT 
        b.*,
        c.name AS customer_name, c.address AS customer_address,
        c.phone AS customer_phone, c.email AS customer_email,
        u.full_name AS created_by_name
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      JOIN users u ON b.created_by = u.id
      WHERE b.id = ?
    `;

    const billResult = await queryWithTiming(billQuery, [id]);

    if (billResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Get bill items
    const itemsQuery = `
      SELECT * FROM bill_items
      WHERE bill_id = ?
      ORDER BY created_at
    `;

    const itemsResult = await queryWithTiming(itemsQuery, [id]);

    res.status(200).json({
      success: true,
      data: {
        bill: billResult.rows[0],
        items: itemsResult.rows
      }
    });

  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update an existing bill with items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBill = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const {
      principal_amount,
      interest_percentage,
      items
    } = req.body;

    // Get existing bill
    const existingBillQuery = `
      SELECT * FROM bills WHERE id = ?
    `;
    const existingBillResult = await queryWithTiming(existingBillQuery, [id]);

    if (existingBillResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    const existingBill = existingBillResult.rows[0];

    // Check if bill can be edited (only active bills)
    if (existingBill.bill_status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit bill with status '${existingBill.bill_status}'. Only active bills can be edited.`
      });
    }

    // Validation
    if (!principal_amount || principal_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Principal amount must be a positive number'
      });
    }

    if (principal_amount > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Principal amount cannot exceed 1,000,000'
      });
    }

    if (!interest_percentage || interest_percentage < 0 || interest_percentage > 20) {
      return res.status(400).json({
        success: false,
        message: 'Interest percentage must be between 0 and 20'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.item_type) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: Item type is required`
        });
      }
      if (!item.item_description) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: Item description is required`
        });
      }
      if (!item.current_market_value || item.current_market_value <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: Market value must be a positive number`
        });
      }
      if (item.weight !== undefined && item.weight < 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1}: Weight cannot be negative`
        });
      }
    }

    // Calculate new amounts
    const interest_amount = (principal_amount * interest_percentage) / 100;
    const total_amount = principal_amount + interest_amount;
    const amount_in_words = numberToWords(total_amount);

    // Store old values for audit log
    const oldValues = {
      principal_amount: existingBill.principal_amount,
      interest_percentage: existingBill.interest_percentage,
      interest_amount: existingBill.interest_amount,
      total_amount: existingBill.total_amount
    };

    // Update bill
    const updateBillQuery = `
      UPDATE bills
      SET principal_amount = ?,
          interest_percentage = ?,
          interest_amount = ?,
          total_amount = ?,
          amount_in_words = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `;

    const updateBillValues = [
      principal_amount,
      interest_percentage,
      interest_amount,
      total_amount,
      amount_in_words,
      id
    ];

    await queryWithTiming(updateBillQuery, updateBillValues);

    // Delete existing items
    const deleteItemsQuery = 'DELETE FROM bill_items WHERE bill_id = ?';
    await queryWithTiming(deleteItemsQuery, [id]);

    // Insert new items
    const itemInsertQuery = `
      INSERT INTO bill_items (
        bill_id, item_description, item_type, weight,
        current_market_value, purity, specifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      const itemValues = [
        id,
        item.item_description,
        item.item_type,
        item.weight || null,
        item.current_market_value,
        item.purity || null,
        item.specifications || null
      ];

      await queryWithTiming(itemInsertQuery, itemValues);
    }

    // Log audit entry
    const auditQuery = `
      INSERT INTO audit_log (user_id, action, table_name, record_id, changes)
      VALUES (?, 'UPDATE', 'bills', ?, ?)
    `;

    const auditChanges = JSON.stringify({
      bill_number: existingBill.bill_number,
      old_values: oldValues,
      new_values: {
        principal_amount,
        interest_percentage,
        interest_amount,
        total_amount
      },
      items_count: items.length
    });

    await queryWithTiming(auditQuery, [userId, id, auditChanges]);

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: {
        bill_id: id,
        bill_number: existingBill.bill_number,
        principal_amount: parseFloat(principal_amount),
        interest_percentage: parseFloat(interest_percentage),
        interest_amount: parseFloat(interest_amount),
        total_amount: parseFloat(total_amount),
        amount_in_words,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Close a bill with settlement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const closeBill = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const {
      interest_months,
      amount_paid,
      payment_method,
      reference_number,
      notes
    } = req.body;

    // Validation
    if (!interest_months || interest_months <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Interest months must be a positive number'
      });
    }

    if (!amount_paid || amount_paid <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount paid must be a positive number'
      });
    }

    if (!payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    const validPaymentMethods = ['cash', 'card', 'upi', 'bank_transfer', 'cheque'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`
      });
    }

    // Get existing bill with customer info
    const billQuery = `
      SELECT b.*, c.name AS customer_name, c.phone AS customer_phone, 
             c.address AS customer_address, c.email AS customer_email
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.id = ?
    `;
    const billResult = await queryWithTiming(billQuery, [id]);

    if (billResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    const bill = billResult.rows[0];

    // Check if bill can be closed (only active bills)
    if (bill.bill_status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot close bill with status '${bill.bill_status}'. Only active bills can be closed.`
      });
    }

    // Calculate interest: (Principal × Rate × Months) / (100 × 12)
    const principal = parseFloat(bill.principal_amount);
    const interestRate = parseFloat(bill.interest_percentage);
    const months = parseInt(interest_months);
    const calculatedInterest = (principal * interestRate * months) / (100 * 12);
    const totalPayable = principal + calculatedInterest;

    // Validate payment
    const amountPaid = parseFloat(amount_paid);
    if (amountPaid < totalPayable) {
      return res.status(400).json({
        success: false,
        message: `Amount paid (₹${amountPaid.toFixed(2)}) is less than total payable (₹${totalPayable.toFixed(2)}). Please pay the full amount to close the bill.`
      });
    }

    // Create transaction record
    const transactionQuery = `
      INSERT INTO transactions (
        bill_id, transaction_type, amount_paid, interest_months,
        total_payable, payment_method, processed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const transactionValues = [
      id,
      'redemption',
      amountPaid,
      months,
      totalPayable,
      payment_method,
      userId
    ];

    const transactionResult = await queryWithTiming(transactionQuery, transactionValues);
    const transactionId = transactionResult.lastID || transactionResult.insertId;

    // Update bill status
    const updateBillQuery = `
      UPDATE bills
      SET bill_status = 'closed',
          closed_at = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ?
    `;

    await queryWithTiming(updateBillQuery, [id]);

    // Log audit entry
    const auditQuery = `
      INSERT INTO audit_log (user_id, action, table_name, record_id, changes)
      VALUES (?, 'UPDATE', 'bills', ?, ?)
    `;

    const auditChanges = JSON.stringify({
      bill_number: bill.bill_number,
      action: 'closure',
      principal_amount: principal,
      interest_months: months,
      calculated_interest: calculatedInterest,
      total_payable: totalPayable,
      amount_paid: amountPaid,
      payment_method: payment_method,
      reference_number: reference_number || null,
      notes: notes || null
    });

    await queryWithTiming(auditQuery, [userId, id, auditChanges]);

    // Get bill items for receipt
    const itemsQuery = `
      SELECT * FROM bill_items
      WHERE bill_id = ?
      ORDER BY created_at
    `;
    const itemsResult = await queryWithTiming(itemsQuery, [id]);

    res.status(200).json({
      success: true,
      message: 'Bill closed successfully',
      data: {
        bill_id: id,
        bill_number: bill.bill_number,
        principal_amount: principal,
        interest_percentage: interestRate,
        interest_months: months,
        calculated_interest: calculatedInterest,
        total_payable: totalPayable,
        amount_paid: amountPaid,
        payment_method: payment_method,
        reference_number: reference_number || null,
        closed_at: new Date().toISOString(),
        transaction_id: transactionId,
        receipt: {
          bill_number: bill.bill_number,
          customer_name: bill.customer_name,
          customer_phone: bill.customer_phone,
          customer_address: bill.customer_address,
          principal_amount: principal,
          interest_percentage: interestRate,
          interest_months: months,
          calculated_interest: calculatedInterest,
          total_payable: totalPayable,
          amount_paid: amountPaid,
          payment_method: payment_method,
          reference_number: reference_number || null,
          closed_at: new Date().toISOString(),
          items: itemsResult.rows
        }
      }
    });

  } catch (error) {
    console.error('Close bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing bill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  closeBill
};
