import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Download, FilterList } from '@mui/icons-material';
import { getBillsByRange, generateReport } from '../services/reportService';
import { formatDate, formatCurrency, formatBillStatus } from '../utils/formatters';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { REPORT_TYPES, REPORT_FORMATS } from '../utils/constants';

const DownloadBillsPage = () => {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: 'all'
  });
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportConfig, setReportConfig] = useState({
    report_type: 'bills',
    format: 'json'
  });

  const handleFilter = async () => {
    if (!filters.start_date || !filters.end_date) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getBillsByRange(filters);
      console.log('API Response:', response);
      if (response && response.data) {
        setBills(Array.isArray(response.data) ? response.data : []);
      } else {
        setBills([]);
      }
    } catch (error) {
      setError('Failed to fetch bills');
      console.error('Filter error:', error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (bills.length === 0) {
      setError('Please filter and fetch bills first before generating a report.');
      return;
    }

    try {
      setLoading(true);
      
      const fileName = `bills_report_${filters.start_date}_to_${filters.end_date}`;

      if (reportConfig.format === 'csv') {
        handleDownloadCSV();
      } else if (reportConfig.format === 'json') {
        const jsonContent = JSON.stringify(bills, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (reportConfig.format === 'pdf') {
        // Dynamically import jsPDF and autoTable to keep initial bundle size small
        const { default: jsPDF } = await import('jspdf');
        await import('jspdf-autotable');
        
        const doc = new jsPDF();
        doc.text('Bills Report', 14, 15);
        doc.setFontSize(10);
        doc.text(`From: ${filters.start_date} To: ${filters.end_date}`, 14, 22);

        const tableColumn = ["Bill Number", "Customer", "Amount (Rs)", "Status", "Date"];
        const tableRows = [];

        bills.forEach(bill => {
          const statusInfo = formatBillStatus(bill.bill_status);
          const billData = [
            bill.bill_number,
            bill.customer_name || 'N/A',
            bill.principal_amount || 0,
            statusInfo.label,
            formatDate(bill.bill_date)
          ];
          tableRows.push(billData);
        });

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 28,
        });

        doc.save(`${fileName}.pdf`);
      }
      
      alert('Report downloaded successfully.');
    } catch (error) {
      setError('Failed to generate report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (bills.length === 0) {
      setError('No bills to download');
      return;
    }

    try {
      const headers = ['Bill Number', 'Customer', 'Amount', 'Status', 'Date'];
      const csvContent = [
        headers.join(','),
        ...bills.map(bill => {
          const statusInfo = formatBillStatus(bill.bill_status);
          return [
            `"${bill.bill_number}"`,
            `"${bill.customer_name || 'N/A'}"`,
            bill.principal_amount || 0,
            `"${statusInfo.label}"`,
            `"${formatDate(bill.bill_date)}"`
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bills_${filters.start_date}_to_${filters.end_date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download CSV');
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Download Bills
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Export and download bills data
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter Bills
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="forfeited">Forfeited</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleFilter}
              startIcon={<FilterList />}
              disabled={loading}
            >
              Apply Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate Report
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportConfig.report_type}
                label="Report Type"
                onChange={(e) => setReportConfig({ ...reportConfig, report_type: e.target.value })}
              >
                {REPORT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={reportConfig.format}
                label="Format"
                onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
              >
                {REPORT_FORMATS.map((format) => (
                  <MenuItem key={format.value} value={format.value}>
                    {format.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              startIcon={<Download />}
              disabled={loading || !filters.start_date || !filters.end_date}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {bills.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Results ({bills.length} bills)
            </Typography>
            <Button
              variant="outlined"
              onClick={handleDownloadCSV}
              startIcon={<Download />}
            >
              Download CSV
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill Number</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.map((bill) => {
                  const statusInfo = formatBillStatus(bill.bill_status);
                  return (
                    <TableRow key={bill.id}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{bill.bill_number}</TableCell>
                      <TableCell>{bill.customer_name || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(bill.principal_amount)}</TableCell>
                      <TableCell>
                        <span style={{ color: statusInfo.color === 'success' ? 'green' : 'inherit' }}>
                          {statusInfo.label}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(bill.bill_date)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {loading && <LoadingSpinner />}
    </Container>
  );
};

export default DownloadBillsPage;
