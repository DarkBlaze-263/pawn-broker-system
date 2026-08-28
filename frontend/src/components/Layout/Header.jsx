import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  AccountCircle,
  Logout,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/settings');
  };

  return (
    <AppBar 
      position="fixed" 
      color="transparent"
      className="neumorphic-panel"
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderTopLeftRadius: '0 !important',
        borderTopRightRadius: '0 !important',
        borderBottomLeftRadius: '0 !important',
        borderBottomRightRadius: '0 !important'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Pawn Broker System
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button 
            color="inherit" 
            onClick={toggleTheme}
            startIcon={mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            sx={{ fontWeight: 'bold' }}
          >
            {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>

          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2" color="text.secondary">
                Signed in as
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body1" fontWeight="bold">
                {user?.username || 'User'}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
