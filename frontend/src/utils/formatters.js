/**
 * Utility functions for formatting data
 */

/**
 * Format currency to Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date-time string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return 'N/A';
  return phone;
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(2)}%`;
};

/**
 * Format weight in grams
 * @param {number} weight - Weight in grams
 * @returns {string} Formatted weight string
 */
export const formatWeight = (weight) => {
  if (weight === null || weight === undefined) return 'N/A';
  return `${weight.toFixed(2)}g`;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format bill status with color
 * @param {string} status - Bill status
 * @returns {object} Object with label and color
 */
export const formatBillStatus = (status) => {
  const statusMap = {
    active: { label: 'Active', color: 'success' },
    closed: { label: 'Closed', color: 'default' },
    forfeited: { label: 'Forfeited', color: 'error' },
    redeemed: { label: 'Redeemed', color: 'info' }
  };
  return statusMap[status] || { label: status, color: 'default' };
};

/**
 * Format item type
 * @param {string} itemType - Item type
 * @returns {string} Formatted item type
 */
export const formatItemType = (itemType) => {
  if (!itemType) return 'N/A';
  return capitalizeWords(itemType.replace(/_/g, ' '));
};

/**
 * Format payment method
 * @param {string} paymentMethod - Payment method
 * @returns {string} Formatted payment method
 */
export const formatPaymentMethod = (paymentMethod) => {
  if (!paymentMethod) return 'N/A';
  return capitalizeWords(paymentMethod.replace(/_/g, ' '));
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};
