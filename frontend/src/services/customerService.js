import api from './api';

/**
 * Customer service for customer-related API calls
 */

/**
 * Get all customers with pagination
 * @param {object} params - Query parameters (limit, offset)
 * @returns {Promise} API response
 */
export const getAllCustomers = async (params = {}) => {
  const response = await api.get('/customers', { params });
  return response.data;
};

/**
 * Get customer by ID
 * @param {string} customerId - Customer ID
 * @returns {Promise} API response
 */
export const getCustomerById = async (customerId) => {
  const response = await api.get(`/customers/${customerId}`);
  return response.data;
};

/**
 * Create a new customer
 * @param {object} customerData - Customer data
 * @returns {Promise} API response
 */
export const createCustomer = async (customerData) => {
  const response = await api.post('/customers', customerData);
  return response.data;
};

/**
 * Update an existing customer
 * @param {string} customerId - Customer ID
 * @param {object} customerData - Updated customer data
 * @returns {Promise} API response
 */
export const updateCustomer = async (customerId, customerData) => {
  const response = await api.put(`/customers/${customerId}`, customerData);
  return response.data;
};

/**
 * Delete a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise} API response
 */
export const deleteCustomer = async (customerId) => {
  const response = await api.delete(`/customers/${customerId}`);
  return response.data;
};

/**
 * Search customers by name or phone
 * @param {string} searchTerm - Search term
 * @returns {Promise} API response
 */
export const searchCustomers = async (searchTerm) => {
  const response = await api.post('/customers/search', { search: searchTerm });
  return response.data;
};

export default {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers
};
