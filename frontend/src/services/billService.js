import api, { cachedGet } from './api';

/**
 * Bill service for bill-related API calls
 */

/**
 * Get all bills with optional filters and pagination
 * @param {object} params - Query parameters (search, status, page, limit)
 * @returns {Promise} API response
 */
export const getAllBills = async (params = {}) => {
  const response = await api.get('/bills', { params });
  return response.data;
};

/**
 * Get all bills with caching (for read-heavy operations)
 * @param {object} params - Query parameters (search, status, page, limit)
 * @returns {Promise} API response
 */
export const getAllBillsCached = async (params = {}) => {
  return cachedGet('/bills', { params });
};

/**
 * Get bill by ID
 * @param {string} billId - Bill ID
 * @returns {Promise} API response
 */
export const getBillById = async (billId) => {
  const response = await api.get(`/bills/${billId}`);
  return response.data;
};

/**
 * Create a new bill
 * @param {object} billData - Bill data
 * @returns {Promise} API response
 */
export const createBill = async (billData) => {
  const response = await api.post('/bills/create', billData);
  return response.data;
};

/**
 * Update an existing bill
 * @param {string} billId - Bill ID
 * @param {object} billData - Updated bill data
 * @returns {Promise} API response
 */
export const updateBill = async (billId, billData) => {
  const response = await api.put(`/bills/${billId}/update`, billData);
  return response.data;
};

/**
 * Close a bill
 * @param {string} billId - Bill ID
 * @param {object} closeData - Closure data (interest_months, amount_paid, payment_method, etc.)
 * @returns {Promise} API response
 */
export const closeBill = async (billId, closeData) => {
  const response = await api.post(`/bills/${billId}/close`, closeData);
  return response.data;
};

/**
 * Delete a bill
 * @param {string} billId - Bill ID
 * @returns {Promise} API response
 */
export const deleteBill = async (billId) => {
  const response = await api.delete(`/bills/${billId}`);
  return response.data;
};

/**
 * Get bills by customer ID
 * @param {string} customerId - Customer ID
 * @returns {Promise} API response
 */
export const getBillsByCustomer = async (customerId) => {
  const response = await api.get(`/bills/customer/${customerId}`);
  return response.data;
};

/**
 * Search bills
 * @param {object} params - Search parameters (search, status, start_date, end_date)
 * @returns {Promise} API response
 */
export const searchBills = async (params) => {
  const response = await api.get('/bills/search', { params });
  return response.data;
};

export default {
  getAllBills,
  getAllBillsCached,
  getBillById,
  createBill,
  updateBill,
  closeBill,
  deleteBill,
  getBillsByCustomer,
  searchBills
};
