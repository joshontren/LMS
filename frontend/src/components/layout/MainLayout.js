import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import AuthContext from '../../contexts/AuthContext';

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { isAuthenticated } = useContext(AuthContext);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar on mobile when clicking outside
  const handleContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {isAuthenticated && (
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          variant={isMobile ? 'temporary' : 'persistent'}
        />
      )}
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
        onClick={handleContentClick}
      >
        <Header onSidebarToggle={handleSidebarToggle} />
        
        <Box 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2, md: 3 },
            pt: { xs: 10, sm: 12 }, // Account for fixed header
            maxWidth: '1600px',
            mx: 'auto',
            width: '100%'
          }}
        >
          <Outlet />
        </Box>
        
        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;