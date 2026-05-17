import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getFoodListingsByReceiverID, getOrCreateConversation, getUserByUID } from '../services/firebaseService';
import { toast } from 'react-toastify';
import type { FoodListing } from '../types';

/**
 * Receiver Claims History Page - View all claimed food items
 */
export const ReceiverClaimsHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const claimedListings = await getFoodListingsByReceiverID(currentUser.uid);
        setClaims(claimedListings);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch claims');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [currentUser]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const handleMessageDonor = async (listing: any) => {
    if (!currentUser || !listing.donorId) return;

    try {
      const donorData = await getUserByUID(listing.donorId);
      if (!donorData) {
        toast.error('Donor not found');
        return;
      }

      const conversation = await getOrCreateConversation(
        listing.donorId,
        donorData.organizationName,
        currentUser.uid,
        currentUser.organizationName,
        listing.id,
        listing.foodItemName
      );

      navigate(`/receiver/messages?conversation=${conversation.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        📋 My Claims History
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {claims.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary" sx={{ mb: 1 }}>
            You haven't claimed any food items yet.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visit the Food Feed to claim available items.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Food Item</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pickup Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Donor Organization</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Must Pickup By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Claimed On</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {claims.map((claim: any) => (
                <TableRow key={claim.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>{claim.foodItemName}</TableCell>
                  <TableCell align="center">{claim.quantity} units</TableCell>
                  <TableCell>{claim.pickupLocation}</TableCell>
                  <TableCell>{claim.donorOrganizationName || claim.donorId}</TableCell>
                  <TableCell>{formatDate(claim.expirationTime)}</TableCell>
                  <TableCell>{formatDate(claim.updatedAt)}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleMessageDonor(claim)}
                    >
                      Message Donor
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
