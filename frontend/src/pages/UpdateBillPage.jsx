import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import BillForm from '../components/Forms/BillForm';
import JewelryItemsForm from '../components/Forms/JewelryItemsForm';
import api from '../services/api';

/**
 * UpdateBillPage Component
 * Search for bills and update them with a streamlined workflow
 */
const UpdateBillPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successDialog, setSuccessDialog] = useState(false);
  const [updatedBill, setUpdatedBill] = useState(null);

  const [billDetails, setBillDetails] = useState({});
  const [billItems, setBillItems] = useState([]);
  const itemsFormRef = useRef(null);

  // Search for bills by bill number or customer name
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a bill number or customer name');
      return;
    }

    try {
      setSearching(true);
      setError('');

      // Search by bill number or customer name
      const response = await api.get(`/bills?search=${searchQuery}&limit=20`);

      if (response.data.success) {
        setSearchResults(response.data.data.bills);
        
        if (response.data.data.bills.length === 0) {
          setError('No bills found matching your search');
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search bills';
      setError(message);
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  // Load bill details for editing
  const handleSelectBill = async (billId) => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/bills/${billId}`);

      if (response.data.success) {
        const bill = response.data.data.bill;
        const items = response.data.data.items;

        // Check if bill can be edited
        if (bill.bill_status !== 'active') {
          setError(`Cannot edit bill with status '${bill.bill_status}'. Only active bills can be edited.`);
          return;
        }

        setSelectedBill(bill);
        
        // Pre-fill bill details
        setBillDetails({
          principal_amount: bill.principal_amount,
          interest_percentage: bill.interest_percentage,
          interest_amount: bill.interest_amount,
          total_amount: bill.total_amount,
          amount_in_words: bill.amount_in_words
        });

        // Pre-fill items
        setBillItems(items.map(item => ({
          item_type: item.item_type,
          item_description: item.item_description,
          weight: item.weight || '',
          current_market_value: item.current_market_value,
          purity: item.purity || '',
          specifications: item.specifications || ''
        })));
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load bill details';
      setError(message);
      console.error('Load bill error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBillDetailsChange = (details) => {
    setBillDetails(details);
  };

  const handleItemsChange = (items) => {
    setBillItems(items);
  };

  const handleUpdateBill = async () => {
    if (!selectedBill) {
      setError('No bill selected');
      return;
    }

    // Validate
    if (!billDetails.principal_amount || billDetails.principal_amount <= 0) {
      setError('Please fill in the bill details');
      return;
    }

    if (!billItems || billItems.length === 0) {
      setError('At least one item is required');
      return;
    }

    if (itemsFormRef.current) {
      const isValid = itemsFormRef.current.validateItems();
      if (!isValid) {
        setError('Please fix the errors in the items form');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        principal_amount: billDetails.principal_amount,
        interest_percentage: billDetails.interest_percentage,
        items: billItems.map(item => ({
          item_type: item.item_type,
          item_description: item.item_description,
          weight: item.weight ? parseFloat(item.weight) : null,
          current_market_value: parseFloat(item.current_market_value),
          purity: item.purity || null,
          specifications: item.specifications || null
        }))
      };

      const response = await api.put(`/bills/${selectedBill.id}/update`, payload);

      if (response.data.success) {
        setUpdatedBill(response.data.data);
        setSuccessDialog(true);
        setSelectedBill(null);
        setSearchResults([]);
        setSearchQuery('');
      } else {
        setError(response.data.message || 'Failed to update bill');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update bill';
      setError(message);
      console.error('Update bill error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialog(false);
    navigate('/bills');
  };

  const handleReset = () => {
    setSelectedBill(null);
    setBillDetails({});
    setBillItems([]);
    setError('');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Update Bill
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Search for a bill and update its details
      </Typography>

      {!selectedBill ? (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Search for Bill
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Bill Number or Customer Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., PB-2024-0001 or John Doe"
                disabled={searching}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={searching}
                startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{ height: 56 }}
              >
                Search
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {searchResults.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Search Results ({searchResults.length})
              </Typography>
              {searchResults.map((bill) => (
                <Paper
                  key={bill.id}
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.50' },
                    borderLeft: bill.bill_status === 'active' ? '4px solid green' : '4px solid grey'
                  }}
                  onClick={() => handleSelectBill(bill.id)}
                >
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {bill.bill_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bill.customer_name} - {bill.customer_phone || 'No phone'}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2" color="text.secondary">
                        ₹{bill.total_amount?.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color={bill.bill_status === 'active' ? 'success.main' : 'text.secondary'}>
                        {bill.bill_status.toUpperCase()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      ) : (
        <>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1 }} />
              <Typography variant="body2">
                Editing bill will log this action in the audit trail. Only active bills can be edited.
              </Typography>
            </Box>
          </Alert>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Editing: {selectedBill.bill_number}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleReset}
                size="small"
              >
                Cancel & Search Another
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <BillForm
                  onDataChange={handleBillDetailsChange}
                  initialData={billDetails}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <JewelryItemsForm
                  onDataChange={handleItemsChange}
                  initialItems={billItems}
                  ref={itemsFormRef}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateBill}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
              >
                Update Bill
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={handleSuccessDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
          <Typography variant="h5">Bill Updated Successfully!</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Bill Number: <strong>{updatedBill?.bill_number}</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              New Total Amount: <strong>₹{updatedBill?.total_amount?.toFixed(2)}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {updatedBill?.amount_in_words}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              This action has been logged in the audit trail
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={handleSuccessDialogClose} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UpdateBillPage;
