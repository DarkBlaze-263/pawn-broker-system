import axios from 'axios';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and caching
api.interceptors.response.use(
  (response) => {
    // Cache GET requests
    if (response.config.method === 'get' && response.config.cache !== false) {
      const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Cached GET request function
export const cachedGet = async (url, config = {}) => {
  const cacheKey = url + JSON.stringify(config.params || {});
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { data: cached.data, cached: true };
  }

  const response = await api.get(url, config);
  return { data: response.data, cached: false };
};

// Clear cache
export const clearCache = () => cache.clear();

// Clear specific cache entry
export const clearCacheEntry = (url, params = {}) => {
  const cacheKey = url + JSON.stringify(params);
  cache.delete(cacheKey);
};

export default api;
