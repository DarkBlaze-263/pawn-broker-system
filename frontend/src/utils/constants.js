/**
 * Application constants
 */

// Item types
export const ITEM_TYPES = [
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'copper', label: 'Copper' },
  { value: 'brass', label: 'Brass' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'watches', label: 'Watches' },
  { value: 'other', label: 'Other' }
];

// Bill statuses
export const BILL_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'closed', label: 'Closed', color: 'default' },
  { value: 'forfeited', label: 'Forfeited', color: 'error' },
  { value: 'redeemed', label: 'Redeemed', color: 'info' }
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' }
];

// Transaction types
export const TRANSACTION_TYPES = [
  { value: 'payment', label: 'Payment' },
  { value: 'interest', label: 'Interest' },
  { value: 'redemption', label: 'Redemption' },
  { value: 'forfeiture', label: 'Forfeiture' }
];

// Report types
export const REPORT_TYPES = [
  { value: 'bills', label: 'Bills Report' },
  { value: 'customers', label: 'Customers Report' },
  { value: 'transactions', label: 'Transactions Report' },
  { value: 'financial', label: 'Financial Report' }
];

// Report formats
export const REPORT_FORMATS = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' }
];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Validation limits
export const VALIDATION_LIMITS = {
  PRINCIAL_AMOUNT_MAX: 1000000,
  INTEREST_PERCENTAGE_MAX: 20,
  INTEREST_PERCENTAGE_MIN: 0,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 20,
  AADHAR_LENGTH: 12,
  PAN_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 8
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY_TOKEN: '/api/auth/verify-token',
    PROFILE: '/api/auth/profile'
  },
  CUSTOMERS: {
    LIST: '/api/customers',
    GET: '/api/customers/:id',
    CREATE: '/api/customers',
    UPDATE: '/api/customers/:id',
    DELETE: '/api/customers/:id',
    SEARCH: '/api/customers/search'
  },
  BILLS: {
    LIST: '/api/bills',
    GET: '/api/bills/:id',
    CREATE: '/api/bills/create',
    UPDATE: '/api/bills/:id/update',
    CLOSE: '/api/bills/:id/close',
    DELETE: '/api/bills/:id',
    SEARCH: '/api/bills/search',
    BY_CUSTOMER: '/api/bills/customer/:customerId'
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/password',
    ACTIVITY_LOG: '/api/users/activity-log'
  },
  REPORTS: {
    DASHBOARD_STATS: '/api/reports/dashboard-stats',
    BILLS_RANGE: '/api/reports/bills/range',
    GENERATE: '/api/reports/generate',
    CUSTOMERS: '/api/reports/customers',
    TRANSACTIONS: '/api/reports/transactions'
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'theme-mode',
  SIDEBAR_STATE: 'sidebar_open'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'This record already exists.',
  GENERIC: 'An error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Record created successfully.',
  UPDATED: 'Record updated successfully.',
  DELETED: 'Record deleted successfully.',
  SAVED: 'Changes saved successfully.',
  LOGGED_IN: 'Login successful.',
  LOGGED_OUT: 'Logout successful.',
  PASSWORD_CHANGED: 'Password changed successfully.'
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  ISO_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss'
};

// Theme colors
export const THEME_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3'
};
