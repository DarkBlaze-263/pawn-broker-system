const { verifyToken } = require('../utils/tokenGenerator');

/**
 * Middleware to authenticate JWT tokens
 * Verifies the token from Authorization header and attaches user info to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    const decoded = verifyToken(token);
    
    // Attach decoded user info to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Authentication failed. Token may be invalid or expired.',
      error: error.message
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't require it
 * Useful for routes that work both with and without authentication
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = verifyToken(token);
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
        };
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user info
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
