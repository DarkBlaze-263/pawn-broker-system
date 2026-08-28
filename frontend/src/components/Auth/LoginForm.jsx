import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

/**
 * LoginForm Component
 * Provides a login form with username/password fields, validation,
 * loading states, and error handling using Material-UI components
 */
const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    severity: 'success',
    message: ''
  });

  /**
   * Handle input field changes
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Toggle password visibility
   */
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Validate form fields
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert({ show: false, severity: 'success', message: '' });

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        setAlert({
          show: true,
          severity: 'success',
          message: 'Login successful! Redirecting to dashboard...'
        });

        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setAlert({
          show: true,
          severity: 'error',
          message: result.message
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={0}
          className="neumorphic-panel animate-fade-in-up"
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 4
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Pawn Broker System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your account
            </Typography>
          </Box>

          {alert.show && (
            <Alert
              severity={alert.severity}
              sx={{ mb: 3 }}
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username or Email"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Default credentials: admin / admin123
            </Typography>
          </Box>
        </Paper>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3 }}
        >
          © {new Date().getFullYear()} Pawn Broker Management System
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginForm;
