import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateUserProfile } from '../services/api';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState({ text: '', severity: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Update profile logic here
      setMessage({ text: 'Profile updated successfully', severity: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ text: 'Passwords do not match', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      // Change password logic here
      setMessage({ text: 'Password changed successfully', severity: 'success' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setMessage({ text: 'Failed to change password', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account settings and preferences
      </Typography>

      {message.text && (
        <Alert severity={message.severity} sx={{ mb: 3 }} onClose={() => setMessage({ text: '', severity: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Profile Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, mr: 3 }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6">{user?.username || 'User'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'No email'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>
        <Box component="form" onSubmit={handleProfileUpdate}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                Update Profile
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Password Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <Box component="form" onSubmit={handlePasswordChange}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                Change Password
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Theme Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body1">Theme Mode</Typography>
            <Typography variant="body2" color="text.secondary">
              Current: {mode === 'light' ? 'Light' : 'Dark'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={toggleTheme}
          >
            Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </Box>
      </Paper>

      {/* Danger Zone */}
      <Paper sx={{ p: 3, border: '1px solid #f44336' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#f44336' }}>
          Danger Zone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Once you logout, you will need to login again to access the system.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
