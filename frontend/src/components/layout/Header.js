import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import AuthContext from '../../contexts/AuthContext';

const Header = ({ onSidebarToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifications = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    handleClose();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Toolbar>
        {isAuthenticated && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onSidebarToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: { xs: '1.2rem', md: '1.5rem' },
            color: 'primary.main',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          LearningHub
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Button component={RouterLink} to="/courses" color="inherit" sx={{ mx: 1 }}>
              Courses
            </Button>
            {isAuthenticated && (
              <Button component={RouterLink} to="/dashboard" color="inherit" sx={{ mx: 1 }}>
                Dashboard
              </Button>
            )}
          </Box>
        )}

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                onClick={handleNotifications}
                size="large"
              >
                <Badge badgeContent={3} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={notificationsAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
            >
              <MenuItem onClick={handleNotificationsClose}>
                New assignment in "JavaScript Basics"
              </MenuItem>
              <MenuItem onClick={handleNotificationsClose}>
                Your assignment was graded
              </MenuItem>
              <MenuItem onClick={handleNotificationsClose}>
                New course recommendation
              </MenuItem>
            </Menu>

            <Tooltip title={user?.name || 'User'}>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                size="large"
                sx={{ ml: 1 }}
              >
                {user?.profilePicture ? (
                  <Avatar 
                    alt={user.name} 
                    src={user.profilePicture} 
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <AccountCircle sx={{ mr: 1 }} fontSize="small" />
                Profile
              </MenuItem>
              <MenuItem onClick={handleDashboard}>
                <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              sx={{ mr: 1 }}
            >
              Login
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              component={RouterLink} 
              to="/register"
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;