/**
 * Authentication Helper Functions
 * Utility functions for managing authentication tokens and user data
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set authentication token in localStorage
 * @param {string} token - JWT token to store
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Clear authentication token from localStorage
 */
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get user data from localStorage
 * @returns {Object|null} User data object or null if not found
 */
export const getUserData = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Set user data in localStorage
 * @param {Object} userData - User data to store
 */
export const setUserData = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

/**
 * Clear user data from localStorage
 */
export const clearUserData = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists, false otherwise
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

/**
 * Clear all authentication data from localStorage
 * Removes both token and user data
 */
export const clearAuthData = () => {
  clearToken();
  clearUserData();
};

/**
 * Get authorization header value for API requests
 * @returns {Object} Authorization header object
 */
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Decode JWT token (without verification - for client-side use only)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get time until token expiration in seconds
 * @param {string} token - JWT token to check
 * @returns {number|null} Seconds until expiration or null if invalid
 */
export const getTokenExpirationTime = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp - currentTime;
};

/**
 * Format expiration time for display
 * @param {number} seconds - Seconds until expiration
 * @returns {string} Formatted time string
 */
export const formatExpirationTime = (seconds) => {
  if (seconds === null || seconds < 0) {
    return 'Expired';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return 'Less than a minute';
  }
};

export default {
  getToken,
  setToken,
  clearToken,
  getUserData,
  setUserData,
  clearUserData,
  isAuthenticated,
  clearAuthData,
  getAuthHeader,
  decodeToken,
  isTokenExpired,
  getTokenExpirationTime,
  formatExpirationTime
};
