const { queryWithTiming } = require('../config/database');

/**
 * Get dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total bills
    const totalBillsResult = await queryWithTiming('SELECT COUNT(*) as count FROM bills');
    const totalBills = parseInt(totalBillsResult.rows[0].count);

    // Get active bills
    const activeBillsResult = await queryWithTiming("SELECT COUNT(*) as count FROM bills WHERE bill_status = 'active'");
    const activeBills = parseInt(activeBillsResult.rows[0].count);

    // Get closed bills
    const closedBillsResult = await queryWithTiming("SELECT COUNT(*) as count FROM bills WHERE bill_status = 'closed'");
    const closedBills = parseInt(closedBillsResult.rows[0].count);

    // Get total customers
    const totalCustomersResult = await queryWithTiming('SELECT COUNT(*) as count FROM customers');
    const totalCustomers = parseInt(totalCustomersResult.rows[0].count);

    // Get total principal amount
    const totalPrincipalResult = await queryWithTiming("SELECT COALESCE(SUM(principal_amount), 0) as total FROM bills WHERE bill_status = 'active'");
    const totalPrincipal = parseFloat(totalPrincipalResult.rows[0].total);

    // Get total interest collected
    const totalInterestResult = await queryWithTiming("SELECT COALESCE(SUM(amount_paid), 0) as total FROM transactions WHERE transaction_type = 'redemption'");
    const totalInterest = parseFloat(totalInterestResult.rows[0].total);

    // Get bills created this month (SQLite compatible)
    const thisMonthBillsResult = await queryWithTiming(`
      SELECT COUNT(*) as count 
      FROM bills 
      WHERE strftime('%m', created_at) = strftime('%m', 'now')
      AND strftime('%Y', created_at) = strftime('%Y', 'now')
    `);
    const thisMonthBills = parseInt(thisMonthBillsResult.rows[0].count);

    // Get bills closed this month (SQLite compatible)
    const thisMonthClosedResult = await queryWithTiming(`
      SELECT COUNT(*) as count 
      FROM bills 
      WHERE bill_status = 'closed'
      AND strftime('%m', closed_at) = strftime('%m', 'now')
      AND strftime('%Y', closed_at) = strftime('%Y', 'now')
    `);
    const thisMonthClosed = parseInt(thisMonthClosedResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        total_bills: totalBills,
        active_bills: activeBills,
        closed_bills: closedBills,
        total_customers: totalCustomers,
        total_principal_amount: totalPrincipal,
        total_interest_collected: totalInterest,
        bills_this_month: thisMonthBills,
        bills_closed_this_month: thisMonthClosed
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching dashboard statistics'
    });
  }
};

/**
 * Get bills by date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBillsByRange = async (req, res) => {
  try {
    const { start_date, end_date, status } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    let query = `
      SELECT 
        b.id, b.bill_number, b.bill_date, b.principal_amount,
        b.interest_percentage, b.interest_amount, b.total_amount,
        b.bill_status, b.created_at, b.closed_at,
        c.name AS customer_name, c.phone AS customer_phone
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.bill_date BETWEEN ? AND ?
    `;

    const params = [start_date, end_date];

    if (status && status !== 'all') {
      query += ` AND b.bill_status = ?`;
      params.push(status);
    }

    query += ' ORDER BY b.bill_date DESC';

    const result = await queryWithTiming(query, params);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get bills by range error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching bills by date range'
    });
  }
};

/**
 * Generate report (placeholder for PDF/CSV export)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateReport = async (req, res) => {
  try {
    const { report_type, start_date, end_date, format } = req.body;

    if (!report_type) {
      return res.status(400).json({
        success: false,
        error: 'Report type is required'
      });
    }

    // This is a placeholder for report generation
    // In a real implementation, you would use libraries like:
    // - pdfkit or puppeteer for PDF generation
    // - csv-writer for CSV export
    
    res.status(200).json({
      success: true,
      message: 'Report generation initiated',
      data: {
        report_type,
        format: format || 'json',
        status: 'pending',
        // In real implementation, return report URL or file
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating report'
    });
  }
};

/**
 * Get customer report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCustomerReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id, c.name, c.phone, c.email,
        COUNT(b.id) as total_bills,
        COALESCE(SUM(CASE WHEN b.bill_status = 'active' THEN b.principal_amount ELSE 0 END), 0) as active_principal,
        COALESCE(SUM(CASE WHEN b.bill_status = 'active' THEN b.total_amount ELSE 0 END), 0) as active_total
      FROM customers c
      LEFT JOIN bills b ON c.id = b.customer_id
      GROUP BY c.id, c.name, c.phone, c.email
      ORDER BY c.name
    `;

    const result = await queryWithTiming(query);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get customer report error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching customer report'
    });
  }
};

/**
 * Get transaction report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTransactionReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        t.id, t.transaction_type, t.amount_paid, t.payment_date,
        t.payment_method,
        b.bill_number,
        c.name AS customer_name,
        u.full_name AS processed_by_name
      FROM transactions t
      JOIN bills b ON t.bill_id = b.id
      JOIN customers c ON b.customer_id = c.id
      JOIN users u ON t.processed_by = u.id
    `;

    const params = [];

    if (start_date && end_date) {
      query += ` WHERE t.payment_date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }

    query += ' ORDER BY t.payment_date DESC';

    const result = await queryWithTiming(query, params);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get transaction report error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching transaction report'
    });
  }
};

module.exports = {
  getDashboardStats,
  getBillsByRange,
  generateReport,
  getCustomerReport,
  getTransactionReport
};
