const winston = require('winston');

/**
 * Monitoring and Error Tracking Configuration
 * Integrates with Sentry for error tracking
 */

// Initialize Sentry if DSN is provided
let Sentry;
if (process.env.SENTRY_DSN) {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 1.0,
  });
}

/**
 * Enhanced logger with monitoring
 */
const monitoringLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
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

if (process.env.NODE_ENV !== 'production') {
  monitoringLogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

/**
 * Log error to both Winston and Sentry
 */
const logError = (error, context = {}) => {
  monitoringLogger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    ...context
  });

  if (Sentry) {
    Sentry.captureException(error, {
      extra: context
    });
  }
};

/**
 * Log performance metrics
 */
const logPerformance = (operation, duration, context = {}) => {
  monitoringLogger.info('Performance metric', {
    operation,
    duration_ms: duration,
    ...context
  });

  // Alert on slow operations
  if (duration > 1000) {
    monitoringLogger.warn('Slow operation detected', {
      operation,
      duration_ms: duration,
      ...context
    });
  }
};

/**
 * Track API response time middleware
 */
const trackResponseTime = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logPerformance('api_request', duration, {
      method: req.method,
      url: req.url,
      status: res.statusCode
    });
  });

  next();
};

/**
 * Health check endpoint
 */
const healthCheck = async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    res.status(200).json(health);
  } catch (error) {
    logError(error, { context: 'health_check' });
    res.status(503).json({ status: 'error', message: 'Service unavailable' });
  }
};

module.exports = {
  logError,
  logPerformance,
  trackResponseTime,
  healthCheck,
  monitoringLogger
};
