const NodeCache = require('node-cache');

/**
 * Response caching middleware
 * Uses in-memory cache with TTL
 */

const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Performance optimization
});

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = (data) => {
      cache.set(key, data, ttl);
      return originalJson(data);
    };

    next();
  };
};

/**
 * Clear cache for a specific key
 * @param {string} key - Cache key to clear
 */
const clearCache = (key) => {
  cache.del(key);
};

/**
 * Clear all cache
 */
const clearAllCache = () => {
  cache.flushAll();
};

/**
 * Get cache statistics
 */
const getCacheStats = () => ({
  keys: cache.keys().length,
  stats: cache.getStats()
});

/**
 * Clear cache by pattern (prefix)
 * @param {string} pattern - Cache key pattern
 */
const clearCacheByPattern = (pattern) => {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.startsWith(pattern)) {
      cache.del(key);
    }
  });
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache,
  getCacheStats,
  clearCacheByPattern
};
