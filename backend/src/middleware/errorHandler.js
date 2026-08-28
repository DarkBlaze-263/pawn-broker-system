const winston = require('winston');

/**
 * Winston logger configuration
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

/**
 * Error handler middleware
 * Catches all errors and returns consistent error response
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (err.code === '23505') {
    // PostgreSQL unique violation
    statusCode = 409;
    message = 'Duplicate entry';
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Invalid reference';
  }

  if (err.code === '23502') {
    // PostgreSQL not null violation
    statusCode = 400;
    message = 'Required field missing';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    errors = null;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ApiError,
  logger
};
