import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth functions to the app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Set token temporarily so the request works if interceptor doesn't catch it early
        setToken(storedToken);
        
        // Call the backend to validate the token and get the profile
        const response = await api.get('/auth/profile');
        
        if (response.data.success) {
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } else {
          // Token invalid or expired
          localStorage.removeItem('token');
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth validation failed:', error);
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   * @param {string} username - Username or email
   * @param {string} password - User password
   * @returns {Object} Response with success status and message
   */
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);

        return {
          success: true,
          message: 'Login successful'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return {
        success: false,
        message
      };
    }
  };

  /**
   * Logout function
   * Clears token and user data from state and localStorage
   */
  const logout = async () => {
    try {
      // Call logout endpoint (for server-side logging)
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout error:', error);
    }

    // Clear client-side auth state
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Update user data in state
   * Useful after profile updates
   * @param {Object} userData - Updated user data
   */
  const updateUser = (userData) => {
    setUser(userData);
  };

  /**
   * Refresh user data from server
   * Fetches fresh user data from the server
   */
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.data.success) {
        setUser(response.data.data.user);
        return response.data.data.user;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use Auth Context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
