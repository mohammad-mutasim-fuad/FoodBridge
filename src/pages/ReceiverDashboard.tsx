import React, { useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  Stack,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useFirestoreListener } from '../hooks/useFirestoreListener';
import { updateFoodListingStatus, createClaim } from '../services/firebaseService';
import { toast } from 'react-toastify';
import { where } from 'firebase/firestore';
import { FoodListing } from '../types';

/**
 * Receiver Dashboard - Browse and claim available food
 */
export const ReceiverDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [claimConfirmOpen, setClaimConfirmOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available food listings
  const { data: listings, loading, error } = useFirestoreListener<FoodListing>(
    'FoodListings',
    [where('status', '==', 'Available')]
  );

  const filteredListings = listings.filter((listing: any) =>
    listing.foodItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClaimClick = (listing: FoodListing) => {
    setSelectedListing(listing);
    setClaimConfirmOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (!selectedListing || !currentUser) return;

    try {
      setIsClaiming(true);

      // Update food listing status
      await updateFoodListingStatus(selectedListing.id, 'Claimed', currentUser.uid);

      // Create claim record
      await createClaim(currentUser.uid, selectedListing.id);

      toast.success('Food claimed successfully! Go to Claims History to see the details.');
      setClaimConfirmOpen(false);
      setSelectedListing(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to claim food');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        🍽️ Available Food Feed
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        placeholder="Search by food name or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {filteredListings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary" paragraph>
            {searchTerm
              ? 'No food listings match your search.'
              : 'No food listings available at the moment.'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Check back soon for new food rescue opportunities!
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
                <TableCell sx={{ fontWeight: 'bold' }}>Expiration</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredListings.map((listing: any) => (
                <TableRow key={listing.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>{listing.foodItemName}</TableCell>
                  <TableCell align="center">{listing.quantity} units</TableCell>
                  <TableCell>{listing.pickupLocation}</TableCell>
                  <TableCell>{listing.donorId}</TableCell>
                  <TableCell>{formatDate(listing.expirationTime)}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleClaimClick(listing)}
                    >
                      Claim
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Claim Confirmation Dialog */}
      <Dialog open={claimConfirmOpen} onClose={() => setClaimConfirmOpen(false)}>
        <DialogTitle>Claim Food Item?</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography>
              <strong>Food:</strong> {selectedListing?.foodItemName}
            </Typography>
            <Typography>
              <strong>Quantity:</strong> {selectedListing?.quantity} units
            </Typography>
            <Typography>
              <strong>Pickup Location:</strong> {selectedListing?.pickupLocation}
            </Typography>
            <Typography>
              <strong>Must Pickup By:</strong> {formatDate(selectedListing?.expirationTime)}
            </Typography>
            <Alert severity="info">
              Once claimed, this item will be removed from the public feed and assigned to your organization.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmClaim}
            color="success"
            variant="contained"
            disabled={isClaiming}
          >
            {isClaiming ? <CircularProgress size={24} /> : 'Confirm Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
