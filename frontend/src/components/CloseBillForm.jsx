import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import {
  AccountBalance,
  Calculate,
  Payment,
  Warning,
  CheckCircle
} from '@mui/icons-material';

/**
 * CloseBillForm Component
 * Handles bill closure with interest calculation and payment details
 */
const CloseBillForm = ({ billData, onCloseBill, loading }) => {
  const [interestMonths, setInterestMonths] = React.useState(1);
  const [amountPaid, setAmountPaid] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('cash');
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');

  const principal = parseFloat(billData?.principal_amount) || 0;
  const interestRate = parseFloat(billData?.interest_percentage) || 0;
  const months = parseInt(interestMonths) || 0;

  // Calculate interest: (Principal × Rate × Months) / (100 × 12)
  const calculatedInterest = months > 0 ? (principal * interestRate * months) / (100 * 12) : 0;
  const totalPayable = principal + calculatedInterest;
  const amountPaidValue = parseFloat(amountPaid) || 0;
  const remainingAmount = totalPayable - amountPaidValue;
  const isPaymentSufficient = amountPaidValue >= totalPayable;

  React.useEffect(() => {
    // Set initial amount paid to total payable
    if (billData && !amountPaid) {
      setAmountPaid(totalPayable.toFixed(2));
    }
  }, [billData, totalPayable]);

  const handleCloseBill = () => {
    setError('');

    // Validation
    if (!interestMonths || interestMonths <= 0) {
      setError('Interest months must be a positive number');
      return;
    }

    if (!amountPaid || amountPaid <= 0) {
      setError('Amount paid must be a positive number');
      return;
    }

    if (!isPaymentSufficient) {
      setError(`Amount paid (₹${amountPaidValue.toFixed(2)}) is less than total payable (₹${totalPayable.toFixed(2)}). Please pay the full amount to close the bill.`);
      return;
    }

    if (onCloseBill) {
      onCloseBill({
        interest_months: interestMonths,
        amount_paid: amountPaidValue,
        payment_method: paymentMethod,
        reference_number: referenceNumber || null,
        notes: notes || null
      });
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' }
  ];

  const needsReferenceNumber = ['bank_transfer', 'cheque'].includes(paymentMethod);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AccountBalance sx={{ mr: 1 }} />
        Bill Closure Details
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Interest Calculation Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Calculate sx={{ mr: 1 }} />
            Interest Calculation
          </Typography>
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Principal Amount (₹)"
                  value={principal.toFixed(2)}
                  disabled
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Interest Rate (%)"
                  value={interestRate.toFixed(2)}
                  disabled
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Interest Months *"
                  type="number"
                  value={interestMonths}
                  onChange={(e) => setInterestMonths(e.target.value)}
                  inputProps={{ min: 1 }}
                  helperText="Number of months to calculate interest"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Calculation Breakdown */}
        <Grid item xs={12}>
          <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 1, border: '1px solid primary.200' }}>
            <Typography variant="subtitle2" gutterBottom>
              Calculation Breakdown:
            </Typography>
            <Typography variant="body2">
              Interest = (₹{principal.toFixed(2)} × {interestRate}% × {months} months) / (100 × 12) = ₹{calculatedInterest.toFixed(2)}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total Payable: ₹{totalPayable.toFixed(2)}
            </Typography>
          </Box>
        </Grid>

        {/* Payment Details Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Payment sx={{ mr: 1 }} />
            Payment Details
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Amount Paid (₹) *"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            error={!isPaymentSufficient && amountPaidValue > 0}
            helperText={!isPaymentSufficient && amountPaidValue > 0 ? `Insufficient amount. Need ₹${totalPayable.toFixed(2)}` : ''}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Payment Method *</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method *"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {needsReferenceNumber && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reference Number *"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Enter transaction/cheque number"
              helperText={paymentMethod === 'cheque' ? 'Cheque number' : 'Transaction reference number'}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about this payment"
          />
        </Grid>

        {/* Payment Status */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            {isPaymentSufficient ? (
              <Chip
                icon={<CheckCircle />}
                label="Payment Sufficient"
                color="success"
                variant="outlined"
              />
            ) : (
              <Chip
                icon={<Warning />}
                label={`Insufficient Payment (Short by ₹${Math.abs(remainingAmount).toFixed(2)})`}
                color="error"
                variant="outlined"
              />
            )}
          </Box>
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleCloseBill}
            disabled={loading || !isPaymentSufficient}
            sx={{ mt: 2 }}
          >
            {loading ? 'Processing...' : 'Close Bill'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CloseBillForm;
