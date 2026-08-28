const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/authMiddleware');
const { login, logout, validateToken, getProfile } = require('../controllers/authController');

/**
 * Rate limiter for login endpoint
 * Limits to 5 requests per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful login attempts
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 * @body    { username: string, password: string }
 */
router.post('/login', login); // Temporarily disabled rate limiter for testing

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify if current token is valid
 * @access  Private
 */
router.post('/verify-token', authenticateToken, validateToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
