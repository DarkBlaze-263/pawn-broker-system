import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Person, Phone, Email, LocationOn } from '@mui/icons-material';
import api from '../../services/api';

/**
 * CustomerForm Component
 * Allows selecting an existing customer or creating a new one
 */
const CustomerForm = ({ onCustomerSelect }) => {
  const [mode, setMode] = useState('select'); // 'select' or 'create'
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers?limit=100');
      
      if (response.data.success) {
        setCustomers(response.data.data.customers);
      }
    } catch (error) {
      setError('Failed to load customers');
      console.error('Fetch customers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setFormErrors({});
    if (newMode === 'select') {
      setSelectedCustomerId('');
    } else {
      setNewCustomer({
        name: '',
        address: '',
        phone: '',
        email: ''
      });
    }
  };

  const handleSelectCustomer = () => {
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (customer) {
      onCustomerSelect(customer);
    }
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateNewCustomer = () => {
    const errors = {};

    if (!newCustomer.name.trim()) {
      errors.name = 'Customer name is required';
    }

    if (newCustomer.phone && !/^[0-9+\-\s()]{10,20}$/.test(newCustomer.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (newCustomer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
      errors.email = 'Invalid email format';
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCustomer = async () => {
    if (!validateNewCustomer()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/customers', newCustomer);

      if (response.data.success) {
        const createdCustomer = response.data.data;
        onCustomerSelect(createdCustomer);
        
        // Refresh customer list
        await fetchCustomers();
      } else {
        setError(response.data.message || 'Failed to create customer');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create customer';
      setError(message);
      console.error('Create customer error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customer Information
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant={mode === 'select' ? 'contained' : 'outlined'}
          onClick={() => handleModeChange('select')}
          sx={{ mr: 1 }}
        >
          Select Existing
        </Button>
        <Button
          variant={mode === 'create' ? 'contained' : 'outlined'}
          onClick={() => handleModeChange('create')}
        >
          Create New
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {mode === 'select' ? (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Customer</InputLabel>
                <Select
                  value={selectedCustomerId}
                  label="Select Customer"
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone || 'No phone'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSelectCustomer}
                disabled={!selectedCustomerId}
              >
                Continue with Selected Customer
              </Button>
            </>
          )}
        </Box>
      ) : (
        <Box>
          <TextField
            fullWidth
            label="Customer Name *"
            name="name"
            value={newCustomer.name}
            onChange={handleNewCustomerChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            InputProps={{
              startAdornment: (
                <Person sx={{ mr: 1, color: 'action.active' }} />
              )
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={newCustomer.phone}
            onChange={handleNewCustomerChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
            InputProps={{
              startAdornment: (
                <Phone sx={{ mr: 1, color: 'action.active' }} />
              )
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={newCustomer.email}
            onChange={handleNewCustomerChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            InputProps={{
              startAdornment: (
                <Email sx={{ mr: 1, color: 'action.active' }} />
              )
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Address"
            name="address"
            value={newCustomer.address}
            onChange={handleNewCustomerChange}
            multiline
            rows={2}
            InputProps={{
              startAdornment: (
                <LocationOn sx={{ mr: 1, color: 'action.active', mt: 0. }} />
              )
            }}
            sx={{ mb: 2 }}
          />


          <Button
            variant="contained"
            fullWidth
            onClick={handleCreateCustomer}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Customer & Continue'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CustomerForm;
