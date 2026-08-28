import React, { useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Print as PrintIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import ReactSignatureCanvas from 'react-signature-canvas';

/**
 * BillPreview Component
 * Displays bill preview with signature capture and打印 functionality
 */
const BillPreview = ({ billData, customerData, itemsData, onPrint, onCreate }) => {
  const signatureRef = useRef();
  const [signatureData, setSignatureData] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [error, setError] = useState('');

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData(null);
    }
  };

  const handleSaveSignature = () => {
    if (signatureRef.current) {
      const dataURL = signatureRef.current.toDataURL();
      setSignatureData(dataURL);
      setShowSignatureDialog(false);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(signatureData);
    } else {
      window.print();
    }
  };

  const handleCreate = () => {
    // Make signature optional for testing
    if (onCreate) {
      onCreate(signatureData || null);
    }
  };

  const totalMarketValue = itemsData.reduce((sum, item) => {
    return sum + (parseFloat(item.current_market_value) || 0);
  }, 0);

  // Safety check for data
  if (!itemsData || !Array.isArray(itemsData) || itemsData.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Alert severity="error">
          No items data available for preview. Please go back and add items.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} className="printable-area" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon sx={{ mr: 1 }} />
          Bill Preview
        </Typography>
        <Box className="no-print">
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!signatureData}
          >
            Create Bill
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Bill Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Pawn Broker Management System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bill No: <strong>{billData.bill_number || 'PB-2024-0001'}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Date: <strong>{new Date().toLocaleDateString()}</strong>
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Customer Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customer Information
        </Typography>
        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
          <Typography><strong>Name:</strong> {customerData?.name || 'N/A'}</Typography>
          <Typography><strong>Phone:</strong> {customerData?.phone || 'N/A'}</Typography>
          <Typography><strong>Email:</strong> {customerData?.email || 'N/A'}</Typography>
          <Typography><strong>Address:</strong> {customerData?.address || 'N/A'}</Typography>
        </Box>
      </Box>

      {/* Bill Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Bill Details
        </Typography>
        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
          <Typography><strong>Principal Amount:</strong> ₹{billData.principal_amount?.toFixed(2) || '0.00'}</Typography>
          <Typography><strong>Interest Rate:</strong> {billData.interest_percentage || 0}%</Typography>
          <Typography><strong>Interest Amount:</strong> ₹{billData.interest_amount?.toFixed(2) || '0.00'}</Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            <strong>Total Amount:</strong> ₹{billData.total_amount?.toFixed(2) || '0.00'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            ({billData.amount_in_words || 'Zero Rupees Only'})
          </Typography>
        </Box>
      </Box>

      {/* Items Table */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pledged Items
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Weight (g)</TableCell>
                <TableCell>Purity</TableCell>
                <TableCell align="right">Market Value (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemsData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.item_type}</TableCell>
                  <TableCell>{item.item_description}</TableCell>
                  <TableCell>{item.weight || '-'}</TableCell>
                  <TableCell>{item.purity || '-'}</TableCell>
                  <TableCell align="right">
                    ₹{(parseFloat(item.current_market_value) || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
                  Total Market Value:
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ₹{totalMarketValue.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Signature Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Signature
        </Typography>
        
        {!signatureData ? (
          <Box>
            <Button
              variant="outlined"
              onClick={() => setShowSignatureDialog(true)}
              sx={{ mb: 2 }}
            >
              Add Signature
            </Button>
            <Typography variant="body2" color="text.secondary">
              Signature is required before creating the bill
            </Typography>
          </Box>
        ) : (
          <Box>
            <img 
              src={signatureData} 
              alt="Signature" 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                height: '100px',
                width: 'auto',
                display: 'block'
              }} 
            />
            <Button
              variant="text"
              onClick={() => setShowSignatureDialog(true)}
              sx={{ mt: 1 }}
            >
              Resign
            </Button>
          </Box>
        )}
      </Box>

      {/* Terms and Conditions */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Terms and Conditions:
        </Typography>
        <Typography variant="body2" component="div">
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Items pledged will be returned upon full payment of principal and interest.</li>
            <li>Interest is calculated monthly on the principal amount.</li>
            <li>Items not redeemed within 12 months may be forfeited.</li>
            <li>This bill is valid for 12 months from the date of issue.</li>
          </ol>
        </Typography>
      </Box>

      {/* Signature Dialog */}
      <Dialog
        open={showSignatureDialog}
        onClose={() => setShowSignatureDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Signature</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please sign in the box below
          </Typography>
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 1,
              bgcolor: 'white'
            }}
          >
            <ReactSignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearSignature}>Clear</Button>
          <Button onClick={() => setShowSignatureDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSignature}>
            Save Signature
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
            margin: 0 !important;
            z-index: 99999 !important;
            background-color: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Paper>
  );
};

export default BillPreview;
