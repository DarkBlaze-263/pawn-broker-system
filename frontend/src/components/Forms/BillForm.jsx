import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Paper,
  Alert
} from '@mui/material';
import { AccountBalance, Percent } from '@mui/icons-material';

/**
 * Convert number to words (Indian numbering system)
 * @param {number} amount - Amount to convert
 * @returns {string} Amount in words
 */
const numberToWords = (amount) => {
  if (amount === 0) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const convert = (n) => {
    if (n === 0) return '';
    
    let words = '';
    
    // Lakhs
    if (Math.floor(n / 100000) > 0) {
      words += convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    
    // Thousands
    if (Math.floor(n / 1000) > 0) {
      words += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    
    // Hundreds
    if (n > 0) {
      words += convertLessThanThousand(n);
    }
    
    return words.trim();
  };

  const amountInRupees = Math.floor(amount);
  const paise = Math.round((amount - amountInRupees) * 100);

  let words = convert(amountInRupees);
  
  if (paise > 0) {
    words += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  
  return words + ' Only';
};

/**
 * BillForm Component
 * Handles bill details with auto-calculation of interest and total amounts
 */
const BillForm = ({ onDataChange, initialData = {} }) => {
  const { control, watch, formState: { errors } } = useForm({
    defaultValues: {
      principal_amount: initialData.principal_amount || '',
      interest_percentage: initialData.interest_percentage || 2,
    },
    mode: 'onChange'
  });

  const principalAmount = watch('principal_amount');
  const interestPercentage = watch('interest_percentage');

  // Calculate values
  const principal = parseFloat(principalAmount) || 0;
  const interestRate = parseFloat(interestPercentage) || 0;
  const interestAmount = (principal * interestRate) / 100;
  const totalAmount = principal + interestAmount;
  const amountInWords = numberToWords(totalAmount);

  // Notify parent of changes
  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({
        principal_amount: principal,
        interest_percentage: interestRate,
        interest_amount: interestAmount,
        total_amount: totalAmount,
        amount_in_words: amountInWords
      });
    }
  }, [principal, interestRate, interestAmount, totalAmount, amountInWords, onDataChange]);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AccountBalance sx={{ mr: 1 }} />
        Bill Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="principal_amount"
            control={control}
            rules={{
              required: 'Principal amount is required',
              validate: (value) => {
                const num = parseFloat(value);
                if (isNaN(num) || num <= 0) {
                  return 'Principal amount must be positive';
                }
                if (num > 1000000) {
                  return 'Principal amount cannot exceed 1,000,000';
                }
                return true;
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Principal Amount (₹) *"
                type="number"
                error={!!errors.principal_amount}
                helperText={errors.principal_amount?.message}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="interest_percentage"
            control={control}
            rules={{
              required: 'Interest percentage is required',
              validate: (value) => {
                const num = parseFloat(value);
                if (isNaN(num) || num < 0 || num > 20) {
                  return 'Interest percentage must be between 0 and 20';
                }
                return true;
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Interest Percentage (%) *"
                type="number"
                step="0.01"
                error={!!errors.interest_percentage}
                helperText={errors.interest_percentage?.message}
                InputProps={{
                  endAdornment: <Percent sx={{ ml: 1 }} />
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Interest Amount (₹)"
            value={interestAmount.toFixed(2)}
            disabled
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
            }}
            helperText="Auto-calculated"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Total Amount (₹)"
            value={totalAmount.toFixed(2)}
            disabled
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
            }}
            helperText="Principal + Interest"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Amount in Words"
            value={amountInWords}
            multiline
            rows={2}
            disabled
            helperText="For documentation purposes"
          />
        </Grid>
      </Grid>

      {totalAmount > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Total payable amount: <strong>₹{totalAmount.toFixed(2)}</strong> ({amountInWords})
        </Alert>
      )}
    </Paper>
  );
};

export default BillForm;
