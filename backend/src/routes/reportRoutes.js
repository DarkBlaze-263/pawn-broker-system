const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getBillsByRange,
  generateReport,
  getCustomerReport,
  getTransactionReport
} = require('../controllers/reportController');

/**
 * Validation schema for report generation
 */
const generateReportSchema = Joi.object({
  report_type: Joi.string().valid('bills', 'customers', 'transactions', 'financial').required().messages({
    'any.required': 'Report type is required',
    'any.only': 'Invalid report type'
  }),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  format: Joi.string().valid('json', 'csv', 'pdf').optional()
});

/**
 * Validation middleware
 */
const validateGenerateReport = (req, res, next) => {
  const { error } = generateReportSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * @route   GET /api/reports/dashboard-stats
 * @desc    Get dashboard statistics
 * @access  Private (requires authentication)
 */
router.get('/dashboard-stats', authenticateToken, getDashboardStats);

/**
 * @route   GET /api/reports/bills/range
 * @desc    Get bills by date range
 * @access  Private (requires authentication)
 * @query   start_date, end_date, status
 */
router.get('/bills/range', authenticateToken, getBillsByRange);

/**
 * @route   POST /api/reports/generate
 * @desc    Generate report (PDF/CSV export)
 * @access  Private (requires authentication)
 */
router.post('/generate', authenticateToken, validateGenerateReport, generateReport);

/**
 * @route   GET /api/reports/customers
 * @desc    Get customer report
 * @access  Private (requires authentication)
 */
router.get('/customers', authenticateToken, getCustomerReport);

/**
 * @route   GET /api/reports/transactions
 * @desc    Get transaction report
 * @access  Private (requires authentication)
 * @query   start_date, end_date
 */
router.get('/transactions', authenticateToken, getTransactionReport);

module.exports = router;
