import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useFirestoreListener } from '../hooks/useFirestoreListener';
import { deleteFoodListing, updateFoodListingStatus } from '../services/firebaseService';
import { toast } from 'react-toastify';
import { where } from 'firebase/firestore';
import { FoodListing } from '../types';

/**
 * Donor Dashboard - View and manage food listings
 */
export const DonorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch donor's food listings
  const { data: listings, loading, error } = useFirestoreListener<FoodListing>(
    'FoodListings',
    currentUser ? [where('donorId', '==', currentUser.uid)] : []
  );

  const handleDeleteClick = (listing: FoodListing) => {
    setSelectedListing(listing);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedListing) return;

    try {
      setIsDeleting(true);
      await deleteFoodListing(selectedListing.id);
      toast.success('Listing deleted successfully');
      setDeleteConfirmOpen(false);
      setSelectedListing(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete listing');
    } finally {
      setIsDeleting(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          📋 My Food Listings
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate('/donor/create-listing')}
        >
          + Create New Listing
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {listings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary" paragraph>
            You haven't created any food listings yet.
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate('/donor/create-listing')}
          >
            Create Your First Listing
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Food Item</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pickup Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Expiration</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((listing: any) => (
                <TableRow key={listing.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>{listing.foodItemName}</TableCell>
                  <TableCell align="center">{listing.quantity} units</TableCell>
                  <TableCell>{listing.pickupLocation}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        backgroundColor: listing.status === 'Available' ? '#d4edda' : '#f8d7da',
                        color: listing.status === 'Available' ? '#155724' : '#721c24',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {listing.status}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(listing.expirationTime)}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/donor/edit-listing/${listing.id}`)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteClick(listing)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Listing?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedListing?.foodItemName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
