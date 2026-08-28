const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword, getActivityLog } = require('../controllers/userController');

/**
 * Validation schema for profile update
 */
const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{10,20}$/).optional(),
  email: Joi.string().email().optional(),
  theme_preference: Joi.string().valid('light', 'dark').optional()
});

/**
 * Validation schema for password change
 */
const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  new_password: Joi.string().min(8).required().messages({
    'any.required': 'New password is required',
    'string.min': 'New password must be at least 8 characters'
  })
});

/**
 * Validation middleware
 */
const validateUpdateProfile = (req, res, next) => {
  const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });

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

const validateChangePassword = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });

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
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private (requires authentication)
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private (requires authentication)
 */
router.put('/profile', authenticateToken, validateUpdateProfile, updateProfile);

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private (requires authentication)
 */
router.put('/password', authenticateToken, validateChangePassword, changePassword);

/**
 * @route   GET /api/users/activity-log
 * @desc    Get user activity log
 * @access  Private (requires authentication)
 * @query   limit (default: 50)
 */
router.get('/activity-log', authenticateToken, getActivityLog);

module.exports = router;
