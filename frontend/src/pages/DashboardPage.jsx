import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  People,
  Description,
  AddCircle,
  Edit,
  Close,
  Storage,
  Download
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/reportService';
import { formatCurrency, formatDate, formatBillStatus } from '../utils/formatters';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const StatCard = React.memo(({ title, value, icon, color, onClick }) => (
  <Card
    className="neumorphic-panel animate-fade-in-up"
    sx={{
      height: '100%',
      p: 1,
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? { transform: 'translateY(-4px)', transition: 'transform 0.2s' } : {}
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ fontWeight: 'medium' }}>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: `${color}20`,
            color
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
));

const QuickActionCard = React.memo(({ title, description, icon, onClick, color }) => (
  <Card
    className="neumorphic-panel animate-fade-in-up"
    sx={{
      height: '100%',
      p: 1,
      cursor: 'pointer',
      '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: `${color}20`,
            color
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
));

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formattedPrincipal = useMemo(() => 
    formatCurrency(stats?.total_principal_amount || 0), 
    [stats?.total_principal_amount]
  );

  const formattedInterest = useMemo(() => 
    formatCurrency(stats?.total_interest_collected || 0), 
    [stats?.total_interest_collected]
  );

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Overview of your pawn broker business
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bills"
            value={stats?.total_bills || 0}
            icon={<Description />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Bills"
            value={stats?.active_bills || 0}
            icon={<TrendingUp />}
            color="#4caf50"
            onClick={() => navigate('/bills/update')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={stats?.total_customers || 0}
            icon={<People />}
            color="#ff9800"
            onClick={() => navigate('/database')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Principal"
            value={formattedPrincipal}
            icon={<AttachMoney />}
            color="#dc004e"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="New Bill"
            description="Create a new pawn bill"
            icon={<AddCircle />}
            onClick={() => navigate('/bills/new')}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Update Bill"
            description="Edit existing bills"
            icon={<Edit />}
            onClick={() => navigate('/bills/update')}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Close Bill"
            description="Close and settle bills"
            icon={<Close />}
            onClick={() => navigate('/bills/close')}
            color="#dc004e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Download Bills"
            description="Export bills data"
            icon={<Download />}
            onClick={() => navigate('/download-bills')}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Monthly Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper className="neumorphic-panel animate-fade-in-up" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              This Month's Activity
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Bills Created
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {stats?.bills_this_month || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Bills Closed
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                  {stats?.bills_closed_this_month || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className="neumorphic-panel animate-fade-in-up" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Interest Collected
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 4, color: 'success.main' }}>
              {formattedInterest}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Total interest from all closed bills
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Bills */}
      <Paper className="neumorphic-panel animate-fade-in-up" sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Recent Bills
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/bills/update')}
          >
            View All
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Bill Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    Recent bills will appear here
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default DashboardPage;
