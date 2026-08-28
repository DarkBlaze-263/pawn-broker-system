/**
 * Utility functions for validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9+\-\s()]{10,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate Aadhar number (12 digits)
 * @param {string} aadhar - Aadhar number to validate
 * @returns {boolean} True if valid
 */
export const isValidAadhar = (aadhar) => {
  const aadharRegex = /^[0-9]{12}$/;
  return aadharRegex.test(aadhar);
};

/**
 * Validate PAN number (ABCDE1234F format)
 * @param {string} pan - PAN to validate
 * @returns {boolean} True if valid
 */
export const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

/**
 * Validate positive number
 * @param {number} num - Number to validate
 * @returns {boolean} True if positive
 */
export const isPositiveNumber = (num) => {
  return typeof num === 'number' && num > 0;
};

/**
 * Validate non-negative number
 * @param {number} num - Number to validate
 * @returns {boolean} True if non-negative
 */
export const isNonNegativeNumber = (num) => {
  return typeof num === 'number' && num >= 0;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
export const validatePasswordStrength = (password) => {
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
 * Validate bill number format
 * @param {string} billNumber - Bill number to validate
 * @returns {boolean} True if valid
 */
export const isValidBillNumber = (billNumber) => {
  const billNumberRegex = /^PB-\d{4}-\d{4}$/;
  return billNumberRegex.test(billNumber);
};

/**
 * Validate item type
 * @param {string} itemType - Item type to validate
 * @returns {boolean} True if valid
 */
export const isValidItemType = (itemType) => {
  const validTypes = ['gold', 'silver', 'platinum', 'copper', 'brass', 'bronze', 'electronics', 'jewelry', 'watches', 'other'];
  return validTypes.includes(itemType?.toLowerCase());
};

/**
 * Validate payment method
 * @param {string} paymentMethod - Payment method to validate
 * @returns {boolean} True if valid
 */
export const isValidPaymentMethod = (paymentMethod) => {
  const validMethods = ['cash', 'card', 'upi', 'bank_transfer', 'cheque'];
  return validMethods.includes(paymentMethod?.toLowerCase());
};

/**
 * Validate bill status
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid
 */
export const isValidBillStatus = (status) => {
  const validStatuses = ['active', 'closed', 'forfeited', 'redeemed'];
  return validStatuses.includes(status?.toLowerCase());
};

/**
 * Validate purity format
 * @param {string} purity - Purity to validate
 * @returns {boolean} True if valid
 */
export const isValidPurity = (purity) => {
  const purityRegex = /^[0-9]+(\.[0-9]+)?$/;
  return purityRegex.test(purity);
};

/**
 * Validate amount (positive number with max 2 decimal places)
 * @param {number} amount - Amount to validate
 * @returns {boolean} True if valid
 */
export const isValidAmount = (amount) => {
  if (!isPositiveNumber(amount)) return false;
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
};

/**
 * Validate required fields
 * @param {object} data - Data object
 * @param {array} requiredFields - Array of required field names
 * @returns {object} Validation result
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate date range
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {object} Validation result
 */
export const validateDateRange = (startDate, endDate) => {
  const errors = [];

  if (startDate && isNaN(new Date(startDate).getTime())) {
    errors.push('Invalid start date');
  }

  if (endDate && isNaN(new Date(endDate).getTime())) {
    errors.push('Invalid end date');
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('Start date must be before end date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
