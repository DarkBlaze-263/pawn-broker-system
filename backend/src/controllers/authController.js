const { queryWithTiming } = require('../../config/database');
const { comparePassword } = require('../utils/passwordHash');
const { generateToken, verifyToken } = require('../utils/tokenGenerator');

/**
 * User login controller
 * Validates username/password and generates JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Static authentication as requested
    if (username !== 'admin' || password !== 'admin123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Static user object
    const user = {
      id: 1,
      username: 'admin',
      email: 'admin@pawnbroker.com',
      full_name: 'Admin User',
      phone: '1234567890',
      theme_preference: 'dark'
    };

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username
    };

    const token = generateToken(tokenPayload);

    // Return success response with token and user info
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          themePreference: user.theme_preference
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * User logout controller
 * Since JWT is stateless, actual logout is handled client-side by removing token
 * This endpoint can be used for logging or future token blacklisting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // This endpoint can be used for:
    // 1. Logging the logout event
    // 2. Future token blacklisting implementation
    // 3. Session cleanup if using refresh tokens

    // Log logout event (optional - can be added to audit log)
    // const { userId } = req.user;
    // await logAuditEvent(userId, 'LOGOUT', 'users', userId, {});

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify token controller
 * Checks if the current token is valid and returns user info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateToken = async (req, res) => {
  try {
    // Token is already verified by middleware
    const { userId } = req.user;

    // Static user validation
    if (userId !== 1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@pawnbroker.com',
          fullName: 'Admin User',
          phone: '1234567890',
          themePreference: 'dark'
        }
      }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current user profile
 * Returns detailed user information for authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    if (userId !== 1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@pawnbroker.com',
          fullName: 'Admin User',
          phone: '1234567890',
          themePreference: 'dark',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  login,
  logout,
  validateToken,
  getProfile
};
