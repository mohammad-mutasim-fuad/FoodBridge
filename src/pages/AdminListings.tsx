import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { getAllFoodListings, deleteFoodListing } from '../services/firebaseService';
import { toast } from 'react-toastify';

/**
 * Admin Listings Management Page
 */
export const AdminListings: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const listingsData = await getAllFoodListings();
        setListings(listingsData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleDeleteClick = (listing: any) => {
    setSelectedListing(listing);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedListing) return;

    try {
      setIsDeleting(true);
      await deleteFoodListing(selectedListing.id);
      setListings(listings.filter((l) => l.id !== selectedListing.id));
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        📦 Listing Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {listings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No listings found.</Typography>
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
                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Expiration</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((listing: any) => (
                <TableRow key={listing.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>{listing.foodItemName}</TableCell>
                  <TableCell align="center">{listing.quantity}</TableCell>
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
                  <TableCell>{formatDate(listing.createdAt)}</TableCell>
                  <TableCell>{formatDate(listing.expirationTime)}</TableCell>
                  <TableCell align="center">
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
            Are you sure you want to delete the listing <strong>{selectedListing?.foodItemName}</strong>? This action cannot be undone.
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
