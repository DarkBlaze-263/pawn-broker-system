/**
 * Common validation utilities
 * Provides reusable validation functions for various data types
 */

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9+\-\s()]{10,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate Aadhar number (12 digits)
 * @param {string} aadhar - Aadhar number to validate
 * @returns {boolean} True if valid Aadhar
 */
const isValidAadhar = (aadhar) => {
  const aadharRegex = /^[0-9]{12}$/;
  return aadharRegex.test(aadhar);
};

/**
 * Validate PAN number (ABCDE1234F format)
 * @param {string} pan - PAN to validate
 * @returns {boolean} True if valid PAN
 */
const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

/**
 * Validate date string (ISO format)
 * @param {string} date - Date string to validate
 * @returns {boolean} True if valid date
 */
const isValidDate = (date) => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Validate positive number
 * @param {number} num - Number to validate
 * @returns {boolean} True if positive
 */
const isPositiveNumber = (num) => {
  return typeof num === 'number' && num > 0;
};

/**
 * Validate non-negative number
 * @param {number} num - Number to validate
 * @returns {boolean} True if non-negative
 */
const isNonNegativeNumber = (num) => {
  return typeof num === 'number' && num >= 0;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and errors
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least 1 special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate bill number format (PB-YYYY-0001)
 * @param {string} billNumber - Bill number to validate
 * @returns {boolean} True if valid format
 */
const isValidBillNumber = (billNumber) => {
  const billNumberRegex = /^PB-\d{4}-\d{4}$/;
  return billNumberRegex.test(billNumber);
};

/**
 * Validate item type
 * @param {string} itemType - Item type to validate
 * @returns {boolean} True if valid item type
 */
const isValidItemType = (itemType) => {
  const validTypes = ['gold', 'silver', 'platinum', 'copper', 'brass', 'bronze', 'electronics', 'jewelry', 'watches', 'other'];
  return validTypes.includes(itemType.toLowerCase());
};

/**
 * Validate payment method
 * @param {string} paymentMethod - Payment method to validate
 * @returns {boolean} True if valid payment method
 */
const isValidPaymentMethod = (paymentMethod) => {
  const validMethods = ['cash', 'card', 'upi', 'bank_transfer', 'cheque'];
  return validMethods.includes(paymentMethod.toLowerCase());
};

/**
 * Validate bill status
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid status
 */
const isValidBillStatus = (status) => {
  const validStatuses = ['active', 'closed', 'forfeited', 'redeemed'];
  return validStatuses.includes(status.toLowerCase());
};

/**
 * Validate transaction type
 * @param {string} transactionType - Transaction type to validate
 * @returns {boolean} True if valid transaction type
 */
const isValidTransactionType = (transactionType) => {
  const validTypes = ['payment', 'interest', 'redemption', 'forfeiture'];
  return validTypes.includes(transactionType.toLowerCase());
};

/**
 * Validate purity format (numeric with optional decimal)
 * @param {string} purity - Purity to validate
 * @returns {boolean} True if valid purity
 */
const isValidPurity = (purity) => {
  const purityRegex = /^[0-9]+(\.[0-9]+)?$/;
  return purityRegex.test(purity);
};

/**
 * Validate weight (non-negative number)
 * @param {number} weight - Weight to validate
 * @returns {boolean} True if valid weight
 */
const isValidWeight = (weight) => {
  return isNonNegativeNumber(weight);
};

/**
 * Validate amount (positive number with max 2 decimal places)
 * @param {number} amount - Amount to validate
 * @returns {boolean} True if valid amount
 */
const isValidAmount = (amount) => {
  if (!isPositiveNumber(amount)) return false;
  // Check if has more than 2 decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
};

/**
 * Validate pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Validated pagination params with defaults
 */
const validatePagination = (params) => {
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const offset = (page - 1) * limit;

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    offset: Math.max(0, offset)
  };
};

/**
 * Validate sort parameters
 * @param {Object} params - Sort parameters
 * @param {Array} allowedFields - Allowed sort fields
 * @returns {Object} Validated sort params
 */
const validateSort = (params, allowedFields = []) => {
  const sortBy = params.sortBy || 'created_at';
  const sortOrder = (params.sortOrder || 'desc').toLowerCase();

  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    return { sortBy: 'created_at', sortOrder: 'desc' };
  }

  return {
    sortBy,
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc'
  };
};

/**
 * Validate date range
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Validation result
 */
const validateDateRange = (startDate, endDate) => {
  const errors = [];

  if (startDate && !isValidDate(startDate)) {
    errors.push('Invalid start date format');
  }

  if (endDate && !isValidDate(endDate)) {
    errors.push('Invalid end date format');
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('Start date must be before end date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate search query
 * @param {string} search - Search query
 * @param {number} minLength - Minimum length (default: 2)
 * @returns {boolean} True if valid search query
 */
const isValidSearchQuery = (search, minLength = 2) => {
  return search && search.trim().length >= minLength;
};

module.exports = {
  isValidUUID,
  isValidEmail,
  isValidPhone,
  isValidAadhar,
  isValidPAN,
  isValidDate,
  isPositiveNumber,
  isNonNegativeNumber,
  validatePasswordStrength,
  sanitizeString,
  isValidBillNumber,
  isValidItemType,
  isValidPaymentMethod,
  isValidBillStatus,
  isValidTransactionType,
  isValidPurity,
  isValidWeight,
  isValidAmount,
  validatePagination,
  validateSort,
  validateDateRange,
  isValidSearchQuery
};
