import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person,
  AccountBalance,
  Category,
  Description,
  CheckCircle
} from '@mui/icons-material';
import CustomerForm from '../components/Forms/CustomerForm';
import BillForm from '../components/Forms/BillForm';
import JewelryItemsForm from '../components/Forms/JewelryItemsForm';
import BillPreview from '../components/BillPreview';
import api from '../services/api';

/**
 * NewBillPage Component
 * Main page for creating new pawn bills with multi-step workflow
 */
const NewBillPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successDialog, setSuccessDialog] = useState(false);
  const [createdBill, setCreatedBill] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billDetails, setBillDetails] = useState({
    principal_amount: 0,
    interest_percentage: 2,
    interest_amount: 0,
    total_amount: 0,
    amount_in_words: ''
  });
  const [billItems, setBillItems] = useState([]);
  const itemsFormRef = useRef(null);

  const steps = [
    { label: 'Customer', icon: Person },
    { label: 'Bill Details', icon: AccountBalance },
    { label: 'Items', icon: Category },
    { label: 'Preview', icon: Description }
  ];

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setActiveStep(1);
  };

  const handleBillDetailsChange = (details) => {
    setBillDetails(details);
  };

  const handleItemsChange = (items) => {
    setBillItems(items);
  };

  const handleNext = () => {
    // Step 1: Customer selection - already handled by button being disabled
    if (activeStep === 0) {
      if (!selectedCustomer) {
        setError('Please select or create a customer first');
        return;
      }
    }

    // Step 2: Bill details - simplified validation
    if (activeStep === 1) {
      const principal = parseFloat(billDetails.principal_amount);
      const interest = parseFloat(billDetails.interest_percentage);
      
      // Allow 0 as valid for testing, just check if it's a number
      if (isNaN(principal)) {
        setError('Please enter a valid principal amount');
        return;
      }
      if (isNaN(interest)) {
        setError('Please enter a valid interest percentage');
        return;
      }
    }

    // Step 3: Items validation
    if (activeStep === 2) {
      if (!billItems || !Array.isArray(billItems) || billItems.length === 0) {
        setError('Please add at least one item');
        return;
      }
      
      if (itemsFormRef.current) {
        const isValid = itemsFormRef.current.validateItems();
        if (!isValid) {
          setError('Please fix the errors in the items form');
          return;
        }
      }
    }

    setError('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleCreateBill = async (signatureData) => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        customer_id: selectedCustomer.id,
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

      const response = await api.post('/bills/create', payload);

      if (response.data.success) {
        const billData = response.data.data;
        
        // Update bill with signature (if signature upload endpoint exists)
        // For now, we'll just store it locally or send it in a separate call
        setCreatedBill({
          ...billData,
          signature_image: signatureData
        });
        
        setBillDetails(prev => ({
          ...prev,
          bill_number: billData.bill_number,
          bill_date: billData.bill_date
        }));
        
        setSuccessDialog(true);
      } else {
        setError(response.data.message || 'Failed to create bill');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create bill';
      setError(message);
      console.error('Create bill error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialog(false);
    navigate('/bills');
  };

  const handlePrintBill = () => {
    setSuccessDialog(false);
    setTimeout(() => {
      window.print();
      setSuccessDialog(true);
    }, 500);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <CustomerForm onCustomerSelect={handleCustomerSelect} />;
      case 1:
        return <BillForm onDataChange={handleBillDetailsChange} />;
      case 2:
        return <JewelryItemsForm onDataChange={handleItemsChange} ref={itemsFormRef} />;
      case 3:
        return (
          <BillPreview
            billData={billDetails}
            customerData={selectedCustomer}
            itemsData={billItems}
            onCreate={handleCreateBill}
            onPrint={handlePrintBill}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Bill
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Follow the steps to create a new pawn bill
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel icon={<step.icon />}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          getStepContent(activeStep)
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 0 && !selectedCustomer}
          >
            {activeStep === 0 ? 'Continue' : 'Next'}
          </Button>
        ) : null}
      </Box>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={handleSuccessDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
          <Typography variant="h5">Bill Created Successfully!</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Bill Number: <strong>{createdBill?.bill_number}</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Total Amount: <strong>₹{createdBill?.total_amount?.toFixed(2)}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {createdBill?.amount_in_words}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={handlePrintBill} variant="outlined" sx={{ mr: 1 }}>
            Print Bill
          </Button>
          <Button onClick={handleSuccessDialogClose} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NewBillPage;
