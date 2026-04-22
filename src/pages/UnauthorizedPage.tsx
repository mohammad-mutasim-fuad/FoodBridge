import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';

/**
 * Unauthorized Access Page
 */
export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#e74c3c' }}>
          🚫 Access Denied
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          You do not have permission to access this resource.
        </Typography>
        <Typography variant="body1" paragraph>
          This page is restricted to a specific user role. If you believe this is an error, please contact the administrator.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Go to Home
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
