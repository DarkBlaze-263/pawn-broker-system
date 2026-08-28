const bcrypt = require('bcryptjs');

/**
 * Hash a password using bcrypt with 10 salt rounds
 * @param {String} password - Plain text password to hash
 * @returns {Promise<String>} Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password
 * @param {String} password - Plain text password
 * @param {String} hashedPassword - Hashed password from database
 * @returns {Promise<Boolean>} True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 * @param {String} password - Password to validate
 * @returns {Object} Validation result with isValid flag and message
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number');
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least 1 special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
