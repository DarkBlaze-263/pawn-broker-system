import React, { useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TablePagination
} from '@mui/material';
import { Visibility, Edit, Close as CloseIcon } from '@mui/icons-material';
import { formatCurrency, formatDate, formatBillStatus } from '../../utils/formatters';

const BillsTable = React.memo(({ bills, onView, onEdit, onClose }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleView = useCallback((bill) => {
    onView && onView(bill);
  }, [onView]);

  const handleEdit = useCallback((bill) => {
    onEdit && onEdit(bill);
  }, [onEdit]);

  const handleClose = useCallback((bill) => {
    onClose && onClose(bill);
  }, [onClose]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const billRows = useMemo(() => {
    if (!bills || bills.length === 0) return null;

    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedBills = bills.slice(start, end);

    return paginatedBills.map((bill) => {
      const statusInfo = formatBillStatus(bill.bill_status);
      return (
        <TableRow key={bill.id} hover>
          <TableCell sx={{ fontWeight: 'bold' }}>
            {bill.bill_number}
          </TableCell>
          <TableCell>{bill.customer_name || 'N/A'}</TableCell>
          <TableCell>{formatCurrency(bill.principal_amount)}</TableCell>
          <TableCell>{bill.interest_percentage}%</TableCell>
          <TableCell>
            <Chip
              label={statusInfo.label}
              color={statusInfo.color}
              size="small"
            />
          </TableCell>
          <TableCell>{formatDate(bill.bill_date)}</TableCell>
          <TableCell align="center">
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => handleView(bill)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {bill.bill_status === 'active' && (
              <>
                <Tooltip title="Edit Bill">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(bill)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Close Bill">
                  <IconButton
                    size="small"
                    onClick={() => handleClose(bill)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </TableCell>
        </TableRow>
      );
    });
  }, [bills, page, rowsPerPage, handleView, handleEdit, handleClose]);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bill Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Principal Amount</TableCell>
              <TableCell>Interest Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billRows || (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No bills found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={bills?.length || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
});

export default BillsTable;
