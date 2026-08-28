import React, { useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { formatDate } from '../../utils/formatters';

const CustomersTable = React.memo(({ customers, onView, onEdit, onDelete }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleView = useCallback((customer) => {
    onView && onView(customer);
  }, [onView]);

  const handleEdit = useCallback((customer) => {
    onEdit && onEdit(customer);
  }, [onEdit]);

  const handleDelete = useCallback((customer) => {
    onDelete && onDelete(customer);
  }, [onDelete]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const customerRows = useMemo(() => {
    if (!customers || customers.length === 0) return null;

    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedCustomers = customers.slice(start, end);

    return paginatedCustomers.map((customer) => (
      <TableRow key={customer.id} hover>
        <TableCell sx={{ fontWeight: 'bold' }}>
          {customer.name}
        </TableCell>
        <TableCell>{customer.phone || 'N/A'}</TableCell>
        <TableCell>{customer.email || 'N/A'}</TableCell>
        <TableCell>{customer.address || 'N/A'}</TableCell>
        <TableCell>{customer.total_bills || 0}</TableCell>
        <TableCell>{formatDate(customer.created_at)}</TableCell>
        <TableCell align="center">
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleView(customer)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Customer">
            <IconButton
              size="small"
              onClick={() => handleEdit(customer)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Customer">
            <IconButton
              size="small"
              onClick={() => handleDelete(customer)}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    ));
  }, [customers, page, rowsPerPage, handleView, handleEdit, handleDelete]);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Total Bills</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customerRows || (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={customers?.length || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
});

export default CustomersTable;
