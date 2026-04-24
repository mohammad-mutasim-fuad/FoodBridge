import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getAllUsers, getAllFoodListings } from '../services/firebaseService';

/**
 * Admin Dashboard - Platform overview and statistics
 */
export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        const listingsData = await getAllFoodListings();
        setUsers(usersData);
        setListings(listingsData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = {
    totalUsers: users.length,
    donors: users.filter((u) => u.role === 'Donor').length,
    receivers: users.filter((u) => u.role === 'Receiver').length,
    totalListings: listings.length,
    availableListings: listings.filter((l) => l.status === 'Available').length,
    claimedListings: listings.filter((l) => l.status === 'Claimed').length,
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
        📊 Admin Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {/* Total Users */}
        <Box>
          <Card sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Donors */}
        <Box>
          <Card sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Food Donors
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2ecc71' }}>
                {stats.donors}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Receivers */}
        <Box>
          <Card sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Receiving Organizations
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f39c12' }}>
                {stats.receivers}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Total Listings */}
        <Box>
          <Card sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Food Listings
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>
                {stats.totalListings}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Available */}
        <Box>
          <Card sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available Items
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                {stats.availableListings}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Claimed */}
        <Box>
          <Card sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Claimed Items
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8e44ad' }}>
                {stats.claimedListings}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Grid>

      <Card sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            📈 Platform Status
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            The FoodBridge platform is operational with active food donors and receiving organizations. Navigate to the "Users" or "Listings" section to manage platform content.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Use admin tools to remove inappropriate listings or manage user accounts.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
