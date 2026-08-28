import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle,
  Receipt as ReceiptIcon,
  Warning
} from '@mui/icons-material';
import CloseBillForm from '../components/CloseBillForm';
import api from '../services/api';

/**
 * CloseBillPage Component
 * Search for bills and close them with settlement
 */
const CloseBillPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successDialog, setSuccessDialog] = useState(false);
  const [closedBill, setClosedBill] = useState(null);

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

  // Load bill details for closing
  const handleSelectBill = async (billId) => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/bills/${billId}`);

      if (response.data.success) {
        const bill = response.data.data.bill;

        // Check if bill can be closed (only active bills)
        if (bill.bill_status !== 'active') {
          setError(`Cannot close bill with status '${bill.bill_status}'. Only active bills can be closed.`);
          return;
        }

        setSelectedBill(bill);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load bill details';
      setError(message);
      console.error('Load bill error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseBill = async (paymentData) => {
    if (!selectedBill) {
      setError('No bill selected');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post(`/bills/${selectedBill.id}/close`, paymentData);

      if (response.data.success) {
        setClosedBill(response.data.data);
        setSuccessDialog(true);
        setSelectedBill(null);
        setSearchResults([]);
        setSearchQuery('');
      } else {
        setError(response.data.message || 'Failed to close bill');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to close bill';
      setError(message);
      console.error('Close bill error:', error);
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
    setError('');
  };

  const handlePrintReceipt = () => {
    // For now, just print the page
    // In future, integrate with receiptGenerator.js
    window.print();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Close Bill
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Search for a bill and close it with payment settlement
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
                        ₹{bill.principal_amount?.toFixed(2)}
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
                Closing a bill will update its status to 'closed' and log this action in the audit trail. This action cannot be undone.
              </Typography>
            </Box>
          </Alert>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Closing: {selectedBill.bill_number}
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

            {/* Bill Summary */}
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bill Summary:
              </Typography>
              <Typography variant="body2">
                <strong>Customer:</strong> {selectedBill.customer_name}
              </Typography>
              <Typography variant="body2">
                <strong>Principal Amount:</strong> ₹{selectedBill.principal_amount?.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <strong>Interest Rate:</strong> {selectedBill.interest_percentage}%
              </Typography>
              <Typography variant="body2">
                <strong>Bill Date:</strong> {new Date(selectedBill.bill_date).toLocaleDateString()}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <CloseBillForm
              billData={selectedBill}
              onCloseBill={handleCloseBill}
              loading={loading}
            />
          </Paper>
        </>
      )}

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={handleSuccessDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
          <Typography variant="h5">Bill Closed Successfully!</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Bill Number: <strong>{closedBill?.bill_number}</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Total Paid: <strong>₹{closedBill?.amount_paid?.toFixed(2)}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interest for {closedBill?.interest_months} month(s): ₹{closedBill?.calculated_interest?.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Payment Method: {closedBill?.payment_method?.toUpperCase()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              This action has been logged in the audit trail
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handlePrintReceipt}
            variant="outlined"
            startIcon={<ReceiptIcon />}
            sx={{ mr: 1 }}
          >
            Print Receipt
          </Button>
          <Button onClick={handleSuccessDialogClose} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CloseBillPage;
