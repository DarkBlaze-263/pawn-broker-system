import api from './api';

/**
 * Report service for report-related API calls
 */

/**
 * Get dashboard statistics
 * @returns {Promise} API response
 */
export const getDashboardStats = async () => {
  const response = await api.get('/reports/dashboard-stats');
  return response.data;
};

/**
 * Get bills by date range
 * @param {object} params - Query parameters (start_date, end_date, status)
 * @returns {Promise} API response
 */
export const getBillsByRange = async (params) => {
  const response = await api.get('/reports/bills/range', { params });
  return response.data;
};

/**
 * Generate report
 * @param {object} reportData - Report data (report_type, start_date, end_date, format)
 * @returns {Promise} API response
 */
export const generateReport = async (reportData) => {
  const response = await api.post('/reports/generate', reportData);
  return response.data;
};

/**
 * Get customer report
 * @returns {Promise} API response
 */
export const getCustomerReport = async () => {
  const response = await api.get('/reports/customers');
  return response.data;
};

/**
 * Get transaction report
 * @param {object} params - Query parameters (start_date, end_date)
 * @returns {Promise} API response
 */
export const getTransactionReport = async (params = {}) => {
  const response = await api.get('/reports/transactions', { params });
  return response.data;
};

export default {
  getDashboardStats,
  getBillsByRange,
  generateReport,
  getCustomerReport,
  getTransactionReport
};
