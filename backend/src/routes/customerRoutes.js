const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createCustomer, getAllCustomers, getCustomerById } = require('../controllers/customerController');

/**
 * Validation schema for creating a customer
 */
const createCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),
  address: Joi.string().max(500).optional().allow(null, ''),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{10,20}$/).optional().allow(null, '').messages({
    'string.pattern.base': 'Invalid phone number format'
  }),
  email: Joi.string().email().optional().allow(null, '').messages({
    'string.email': 'Invalid email format'
  }),
  aadhar_number: Joi.string().pattern(/^[0-9]{12}$/).optional().allow(null, '').messages({
    'string.pattern.base': 'Aadhar number must be exactly 12 digits'
  }),
  pan_number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().allow(null, '').messages({
    'string.pattern.base': 'PAN number must be in format ABCDE1234F'
  })
});

/**
 * Validation middleware
 */
const validateCreateCustomer = (req, res, next) => {
  const { error } = createCustomerSchema.validate(req.body, { abortEarly: false });

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
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Private (requires authentication)
 * @body    {
 *   name: string,
 *   address?: string,
 *   phone?: string,
 *   email?: string,
 *   aadhar_number?: string,
 *   pan_number?: string
 * }
 */
router.post('/', authenticateToken, validateCreateCustomer, createCustomer);

/**
 * @route   GET /api/customers
 * @desc    Get all customers with pagination and search
 * @access  Private (requires authentication)
 * @query   page (default: 1), limit (default: 10), search
 */
router.get('/', authenticateToken, getAllCustomers);

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Private (requires authentication)
 * @param   id - Customer UUID
 */
router.get('/:id', authenticateToken, getCustomerById);

module.exports = router;
