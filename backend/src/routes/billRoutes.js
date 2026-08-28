const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createBill, getAllBills, getBillById, updateBill, closeBill } = require('../controllers/billController');

/**
 * Validation schema for creating a bill
 */
const createBillSchema = Joi.object({
  customer_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Customer ID must be a valid number',
    'any.required': 'Customer ID is required'
  }),
  principal_amount: Joi.number().positive().max(1000000).required().messages({
    'number.positive': 'Principal amount must be positive',
    'number.max': 'Principal amount cannot exceed 1,000,000',
    'any.required': 'Principal amount is required'
  }),
  interest_percentage: Joi.number().min(0).max(20).precision(2).required().messages({
    'number.min': 'Interest percentage cannot be negative',
    'number.max': 'Interest percentage cannot exceed 20',
    'any.required': 'Interest percentage is required'
  }),
  items: Joi.array().min(1).items(
    Joi.object({
      item_description: Joi.string().required().messages({
        'any.required': 'Item description is required'
      }),
      item_type: Joi.string().valid('gold', 'silver', 'platinum', 'copper', 'brass', 'bronze', 'electronics', 'jewelry', 'watches', 'other').required().messages({
        'any.only': 'Invalid item type',
        'any.required': 'Item type is required'
      }),
      weight: Joi.number().min(0).optional().allow(null),
      current_market_value: Joi.number().positive().required().messages({
        'number.positive': 'Market value must be positive',
        'any.required': 'Market value is required'
      }),
      purity: Joi.string().pattern(/^[0-9]+(\.[0-9]+)?$/).optional().allow(null).messages({
        'string.pattern.base': 'Purity must be a valid number'
      }),
      specifications: Joi.string().optional().allow(null)
    })
  ).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Items array is required'
  })
});

/**
 * Validation schema for updating a bill (no customer_id needed)
 */
const updateBillSchema = Joi.object({
  principal_amount: Joi.number().positive().max(1000000).required().messages({
    'number.positive': 'Principal amount must be positive',
    'number.max': 'Principal amount cannot exceed 1,000,000',
    'any.required': 'Principal amount is required'
  }),
  interest_percentage: Joi.number().min(0).max(20).precision(2).required().messages({
    'number.min': 'Interest percentage cannot be negative',
    'number.max': 'Interest percentage cannot exceed 20',
    'any.required': 'Interest percentage is required'
  }),
  items: Joi.array().min(1).items(
    Joi.object({
      item_description: Joi.string().required().messages({
        'any.required': 'Item description is required'
      }),
      item_type: Joi.string().valid('gold', 'silver', 'platinum', 'copper', 'brass', 'bronze', 'electronics', 'jewelry', 'watches', 'other').required().messages({
        'any.only': 'Invalid item type',
        'any.required': 'Item type is required'
      }),
      weight: Joi.number().min(0).optional().allow(null),
      current_market_value: Joi.number().positive().required().messages({
        'number.positive': 'Market value must be positive',
        'any.required': 'Market value is required'
      }),
      purity: Joi.string().pattern(/^[0-9]+(\.[0-9]+)?$/).optional().allow(null).messages({
        'string.pattern.base': 'Purity must be a valid number'
      }),
      specifications: Joi.string().optional().allow(null)
    })
  ).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Items array is required'
  })
});

/**
 * Validation schema for closing a bill
 */
const closeBillSchema = Joi.object({
  interest_months: Joi.number().integer().positive().required().messages({
    'number.positive': 'Interest months must be positive',
    'number.integer': 'Interest months must be a whole number',
    'any.required': 'Interest months is required'
  }),
  amount_paid: Joi.number().positive().required().messages({
    'number.positive': 'Amount paid must be positive',
    'any.required': 'Amount paid is required'
  }),
  payment_method: Joi.string().valid('cash', 'card', 'upi', 'bank_transfer', 'cheque').required().messages({
    'any.only': 'Invalid payment method',
    'any.required': 'Payment method is required'
  }),
  reference_number: Joi.string().optional().allow(null, ''),
  notes: Joi.string().optional().allow(null, '')
});

/**
 * Validation middleware
 */
const validateCreateBill = (req, res, next) => {
  const { error } = createBillSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    console.error('Validation failed for createBill:', JSON.stringify(errors, null, 2));
    console.error('Payload:', JSON.stringify(req.body, null, 2));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for update
 */
const validateUpdateBill = (req, res, next) => {
  const { error } = updateBillSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for close
 */
const validateCloseBill = (req, res, next) => {
  const { error } = closeBillSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * @route   POST /api/bills/create
 * @desc    Create a new bill with items
 * @access  Private (requires authentication)
 * @body    {
 *   customer_id: string (UUID),
 *   principal_amount: number,
 *   interest_percentage: number,
 *   items: Array<{
 *     item_description: string,
 *     item_type: string,
 *     weight?: number,
 *     current_market_value: number,
 *     purity?: string,
 *     specifications?: string
 *   }>
 * }
 */
router.post('/create', authenticateToken, validateCreateBill, createBill);

/**
 * @route   GET /api/bills
 * @desc    Get all bills with pagination
 * @access  Private (requires authentication)
 * @query   page (default: 1), limit (default: 10), status
 */
router.get('/', authenticateToken, getAllBills);

/**
 * @route   GET /api/bills/:id
 * @desc    Get bill by ID with items
 * @access  Private (requires authentication)
 * @param   id - Bill UUID
 */
router.get('/:id', authenticateToken, getBillById);

/**
 * @route   PUT /api/bills/:id/update
 * @desc    Update an existing bill
 * @access  Private (requires authentication)
 * @param   id - Bill UUID
 * @body    {
 *   principal_amount: number,
 *   interest_percentage: number,
 *   items: Array<{
 *     item_description: string,
 *     item_type: string,
 *     weight?: number,
 *     current_market_value: number,
 *     purity?: string,
 *     specifications?: string
 *   }>
 * }
 */
router.put('/:id/update', authenticateToken, validateUpdateBill, updateBill);

/**
 * @route   POST /api/bills/:id/close
 * @desc    Close a bill with settlement
 * @access  Private (requires authentication)
 * @param   id - Bill UUID
 * @body    {
 *   interest_months: number,
 *   amount_paid: number,
 *   payment_method: string,
 *   reference_number?: string,
 *   notes?: string
 * }
 */
router.post('/:id/close', authenticateToken, validateCloseBill, closeBill);

module.exports = router;
