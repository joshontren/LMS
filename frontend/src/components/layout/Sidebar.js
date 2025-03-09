import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
  useTheme,
  Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import AuthContext from '../../contexts/AuthContext';

// Drawer width
const drawerWidth = 240;

const Sidebar = ({ open, onClose, variant = 'persistent' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Menu items based on user role
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['student', 'instructor', 'admin']
    },
    {
      text: 'My Courses',
      icon: <SchoolIcon />,
      path: '/courses',
      roles: ['student', 'instructor', 'admin']
    },
    {
      text: 'My Assignments',
      icon: <AssignmentIcon />,
      path: '/assignments',
      roles: ['student']
    },
    {
      text: 'Create Course',
      icon: <MenuBookIcon />,
      path: '/courses/create',
      roles: ['instructor', 'admin']
    },
    {
      text: 'Manage Users',
      icon: <GroupIcon />,
      path: '/users',
      roles: ['admin']
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/profile',
      roles: ['student', 'instructor', 'admin']
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: ['student', 'instructor', 'admin']
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      roles: ['student', 'instructor', 'admin']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleMenuClick = (path) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          boxShadow: variant === 'temporary' ? theme.shadows[6] : 'none',
          borderRight: variant === 'temporary' ? 'none' : `1px solid ${theme.palette.divider}`
        },
      }}
    >
      <Toolbar /> {/* This adds space at the top to account for the AppBar */}
      
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <Box sx={{ px: 3, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {user?.role?.toUpperCase()}
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {user?.name}
          </Typography>
        </Box>
        
        <Divider />
        
        <List>
          {filteredMenuItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              onClick={() => handleMenuClick(item.path)}
              sx={{
                backgroundColor: isActive(item.path) ? theme.palette.action.selected : 'transparent',
                borderLeft: isActive(item.path) ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                pl: 2
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.primary
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;