import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Delete, Edit, Add, Search } from '@mui/icons-material';
import { getAllCustomers, searchCustomers, deleteCustomer } from '../services/customerService';
import { getAllBills, deleteBill } from '../services/billService';
import { formatDate, formatCurrency, formatBillStatus } from '../utils/formatters';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ManageDatabasePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: null });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAllCustomers();
      if (response.success) {
        setCustomers(response.data.customers || []);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await getAllBills();
      if (response.success) {
        setBills(response.data.bills || []);
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (tabValue === 0) {
      if (searchTerm) {
        try {
          setLoading(true);
          const response = await searchCustomers(searchTerm);
          if (response.success) {
            setCustomers(response.data || []);
          }
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setLoading(false);
        }
      } else {
        fetchCustomers();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;

    try {
      if (deleteDialog.type === 'customer') {
        await deleteCustomer(deleteDialog.item.id);
        setCustomers(customers.filter(c => c.id !== deleteDialog.item.id));
      } else if (deleteDialog.type === 'bill') {
        await deleteBill(deleteDialog.item.id);
        setBills(bills.filter(b => b.id !== deleteDialog.item.id));
      }
      setDeleteDialog({ open: false, item: null, type: null });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  React.useEffect(() => {
    if (tabValue === 0) {
      fetchCustomers();
    } else {
      fetchBills();
    }
  }, [tabValue]);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Manage Database
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        View and manage customers and bills
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Customers" />
          <Tab label="Bills" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search customers by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<Search />}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={fetchCustomers}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <TableRow key={customer.id} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>{customer.name}</TableCell>
                        <TableCell>{customer.phone || 'N/A'}</TableCell>
                        <TableCell>{customer.email || 'N/A'}</TableCell>
                        <TableCell>{customer.address || 'N/A'}</TableCell>
                        <TableCell>{formatDate(customer.created_at)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, item: customer, type: 'customer' })}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        No customers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={fetchBills}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bill Number</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bills.length > 0 ? (
                    bills.map((bill) => {
                      const statusInfo = formatBillStatus(bill.bill_status);
                      return (
                        <TableRow key={bill.id} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>{bill.bill_number}</TableCell>
                          <TableCell>{bill.customer_name || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(bill.principal_amount)}</TableCell>
                          <TableCell>
                            <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                          </TableCell>
                          <TableCell>{formatDate(bill.bill_date)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, item: bill, type: 'bill' })}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        No bills found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null, type: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete this {deleteDialog.type}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null, type: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageDatabasePage;
