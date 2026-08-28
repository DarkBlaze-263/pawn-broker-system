const Joi = require('joi');

/**
 * Validation schemas for common data types
 */
const commonSchemas = {
  uuid: Joi.string().uuid().messages({
    'string.guid': 'Invalid UUID format'
  }),
  
  email: Joi.string().email().messages({
    'string.email': 'Invalid email format'
  }),
  
  phone: Joi.string().pattern(/^[0-9+\-\s()]{10,20}$/).messages({
    'string.pattern.base': 'Invalid phone number format'
  }),
  
  aadhar: Joi.string().pattern(/^[0-9]{12}$/).messages({
    'string.pattern.base': 'Aadhar number must be exactly 12 digits'
  }),
  
  pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).messages({
    'string.pattern.base': 'PAN must be in format ABCDE1234F'
  }),
  
  date: Joi.date().iso().messages({
    'date.format': 'Invalid date format (use ISO format)'
  }),
  
  positiveNumber: Joi.number().positive().messages({
    'number.positive': 'Must be a positive number'
  }),
  
  nonNegativeNumber: Joi.number().min(0).messages({
    'number.min': 'Cannot be negative'
  })
};

/**
 * Validation schemas for entities
 */
const schemas = {
  // User schemas
  user: {
    create: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
      email: commonSchemas.email.required().messages({
        'any.required': 'Email is required'
      }),
      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required'
      }),
      full_name: Joi.string().min(2).max(100).optional(),
      phone: commonSchemas.phone.optional()
    }),
    
    update: Joi.object({
      full_name: Joi.string().min(2).max(100).optional(),
      phone: commonSchemas.phone.optional(),
      email: commonSchemas.email.optional(),
      theme_preference: Joi.string().valid('light', 'dark').optional()
    }),
    
    changePassword: Joi.object({
      current_password: Joi.string().required().messages({
        'any.required': 'Current password is required'
      }),
      new_password: Joi.string().min(8).required().messages({
        'string.min': 'New password must be at least 8 characters',
        'any.required': 'New password is required'
      })
    })
  },

  // Customer schemas
  customer: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Customer name is required'
      }),
      address: Joi.string().max(500).optional().allow(null, ''),
      phone: commonSchemas.phone.optional().allow(null, ''),
      email: commonSchemas.email.optional().allow(null, ''),
      aadhar_number: commonSchemas.aadhar.optional().allow(null, ''),
      pan_number: commonSchemas.pan.optional().allow(null, '')
    }),
    
    update: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      address: Joi.string().max(500).optional(),
      phone: commonSchemas.phone.optional(),
      email: commonSchemas.email.optional(),
      aadhar_number: commonSchemas.aadhar.optional(),
      pan_number: commonSchemas.pan.optional()
    }),

    search: Joi.object({
      search: Joi.string().min(2).required().messages({
        'string.min': 'Search term must be at least 2 characters',
        'any.required': 'Search term is required'
      })
    })
  },

  // Bill schemas
  bill: {
    create: Joi.object({
      customer_id: commonSchemas.uuid.required().messages({
        'any.required': 'Customer ID is required'
      }),
      principal_amount: commonSchemas.positiveNumber.max(1000000).required().messages({
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
          weight: commonSchemas.nonNegativeNumber.optional().allow(null),
          current_market_value: commonSchemas.positiveNumber.required().messages({
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
    }),
    
    update: Joi.object({
      principal_amount: commonSchemas.positiveNumber.max(1000000).required().messages({
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
          weight: commonSchemas.nonNegativeNumber.optional().allow(null),
          current_market_value: commonSchemas.positiveNumber.required().messages({
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
    }),
    
    close: Joi.object({
      interest_months: Joi.number().integer().positive().required().messages({
        'number.positive': 'Interest months must be positive',
        'number.integer': 'Interest months must be a whole number',
        'any.required': 'Interest months is required'
      }),
      amount_paid: commonSchemas.positiveNumber.required().messages({
        'any.required': 'Amount paid is required'
      }),
      payment_method: Joi.string().valid('cash', 'card', 'upi', 'bank_transfer', 'cheque').required().messages({
        'any.only': 'Invalid payment method',
        'any.required': 'Payment method is required'
      }),
      reference_number: Joi.string().optional().allow(null, ''),
      notes: Joi.string().optional().allow(null, '')
    }),

    search: Joi.object({
      search: Joi.string().min(2).optional(),
      status: Joi.string().valid('active', 'closed', 'forfeited', 'redeemed').optional(),
      start_date: commonSchemas.date.optional(),
      end_date: commonSchemas.date.optional()
    })
  },

  // Report schemas
  report: {
    generate: Joi.object({
      report_type: Joi.string().valid('bills', 'customers', 'transactions', 'financial').required().messages({
        'any.required': 'Report type is required',
        'any.only': 'Invalid report type'
      }),
      start_date: commonSchemas.date.optional(),
      end_date: commonSchemas.date.optional(),
      format: Joi.string().valid('json', 'csv', 'pdf').optional()
    }),

    range: Joi.object({
      start_date: commonSchemas.date.required().messages({
        'any.required': 'Start date is required'
      }),
      end_date: commonSchemas.date.required().messages({
        'any.required': 'End date is required'
      }),
      status: Joi.string().valid('active', 'closed', 'forfeited', 'redeemed').optional()
    })
  }
};

/**
 * Validation middleware factory
 * Creates validation middleware from a schema
 * @param {Object} schema - Joi validation schema
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validate = (schema, options = {}) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      ...options
    });

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
};

/**
 * Query parameter validation middleware
 * @param {Object} schema - Joi validation schema for query params
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        errors
      });
    }

    next();
  };
};

module.exports = {
  schemas,
  commonSchemas,
  validate,
  validateQuery
};
