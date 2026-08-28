import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Collapse
} from '@mui/material';
import {
  Dashboard,
  AddCircle,
  Edit,
  Close,
  Storage,
  Download,
  Settings,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard'
  },
  {
    text: 'New Bill',
    icon: <AddCircle />,
    path: '/bills/new'
  },
  {
    text: 'Update Bill',
    icon: <Edit />,
    path: '/bills/update'
  },
  {
    text: 'Close Bill',
    icon: <Close />,
    path: '/bills/close'
  },
  {
    text: 'Manage Database',
    icon: <Storage />,
    path: '/database'
  },
  {
    text: 'Download Bills',
    icon: <Download />,
    path: '/download-bills'
  },
  {
    text: 'Settings',
    icon: <Settings />,
    path: '/settings'
  }
];

const Sidebar = ({ open, onClose, mobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    if (mobile) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant={mobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: mobile ? 0 : '64px',
          height: mobile ? '100%' : 'calc(100% - 64px)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRight: '1px solid var(--glass-border)'
        }
      }}
      ModalProps={{
        keepMounted: true
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'inherit' : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
};

export default Sidebar;
export { drawerWidth };
