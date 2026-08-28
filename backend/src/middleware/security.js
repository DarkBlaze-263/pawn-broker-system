const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');

/**
 * Security Middleware Configuration
 */

// Security headers using Helmet
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting for login endpoint
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Rate limiting for API endpoints
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for sensitive operations
const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: 'Too many attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// XSS protection middleware
const xssProtection = xss();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : [process.env.FRONTEND_URL || 'http://localhost:3000'];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// IP whitelist middleware (optional)
const ipWhitelist = (req, res, next) => {
  const allowedIPs = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];
  
  if (allowedIPs.length > 0) {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
  }
  
  next();
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request entity too large'
    });
  }
  
  next();
};

module.exports = {
  securityHeaders,
  loginRateLimiter,
  apiRateLimiter,
  sensitiveRateLimiter,
  xssProtection,
  corsOptions,
  ipWhitelist,
  requestSizeLimiter
};
