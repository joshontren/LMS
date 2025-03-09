import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        py: 3,
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              LearningHub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Empowering learners with interactive courses and personalized learning experiences.
            </Typography>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Platform
            </Typography>
            <Box>
              <Link component={RouterLink} to="/courses" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Courses
              </Link>
              <Link component={RouterLink} to="/about" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                About Us
              </Link>
              <Link component={RouterLink} to="/blog" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Blog
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Box>
              <Link component={RouterLink} to="/faq" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                FAQ
              </Link>
              <Link component={RouterLink} to="/help" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Help Center
              </Link>
              <Link component={RouterLink} to="/contact" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Contact Us
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Box>
              <Link component={RouterLink} to="/terms" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Terms of Service
              </Link>
              <Link component={RouterLink} to="/privacy" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Privacy Policy
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} LearningHub. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;