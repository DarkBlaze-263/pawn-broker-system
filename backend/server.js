require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');

// Import middleware
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');
const { requestLogger } = require('./src/utils/logger');
const { trackResponseTime } = require('./src/utils/monitoring');
const { cacheMiddleware } = require('./src/middleware/cache');

// Initialize Express app
const app = express();

// Middleware
app.use(compression()); // Enable gzip compression
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance tracking
app.use(trackResponseTime);

// Request logging middleware
app.use(requestLogger);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pawn Broker Management System API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const billRoutes = require('./src/routes/billRoutes');
const userRoutes = require('./src/routes/userRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

// Use routes with caching for read-heavy endpoints
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', cacheMiddleware(60), reportRoutes); // Cache reports for 1 minute

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server...');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forcing server shutdown...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
