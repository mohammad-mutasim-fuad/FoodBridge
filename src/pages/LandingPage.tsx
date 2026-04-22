import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

/**
 * Landing Page - Public page visible to all guests
 */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect logged-in users to their dashboard
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Donor') {
        navigate('/donor/dashboard');
      } else if (currentUser.role === 'Receiver') {
        navigate('/receiver/dashboard');
      } else if (currentUser.role === 'Admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [currentUser, navigate]);

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            🍽️ Welcome to FoodBridge
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
            Minimizing Food Waste, Maximizing Impact
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
            FoodBridge connects food donors with verified receiving organizations to rescue surplus food
            and redistribute it to those in need. Together, we're building a more sustainable food system.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ backgroundColor: 'white', color: '#667eea', fontWeight: 'bold' }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ borderColor: 'white', color: 'white' }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}>
          How FoodBridge Works
        </Typography>
        <Grid container spacing={4}>
          {/* For Donors */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#667eea' }}>
                  📋 For Donors
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  <strong>Restaurants, Bakeries & Event Organizers:</strong>
                </Typography>
                <ul>
                  <li>Post surplus food listings in minutes</li>
                  <li>Real-time tracking of claimed items</li>
                  <li>Manage your inventory with ease</li>
                  <li>Reduce waste and support your community</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>

          {/* For Receivers */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#764ba2' }}>
                  🤝 For Receivers
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  <strong>NGOs, Shelters & Community Organizations:</strong>
                </Typography>
                <ul>
                  <li>Browse available food in real-time</li>
                  <li>Instant claim mechanism for quick pickups</li>
                  <li>Track your claims and history</li>
                  <li>Easy access to resources for your community</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box sx={{ backgroundColor: '#f0f0f0', py: 6, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Join FoodBridge today and be part of the solution to food waste and food insecurity.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ backgroundColor: '#667eea' }}
          >
            Sign Up Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};
