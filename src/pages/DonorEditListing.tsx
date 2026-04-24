import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { updateFoodListing, getFoodListingsByDonorID } from '../services/firebaseService';
import { isValidFoodItemName, isValidQuantity, isValidPickupLocation, isValidExpirationDate } from '../utils/validators';
import type { FoodListing } from '../types';

interface EditListingFormData {
  foodItemName: string;
  quantity: string;
  expirationTime: string;
  pickupLocation: string;
}

/**
 * Donor Edit Food Listing Page
 */
export const DonorEditListing: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { listingId } = useParams<{ listingId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EditListingFormData>();

  // Fetch the listing
  useEffect(() => {
    const fetchListing = async () => {
      if (!currentUser || !listingId) return;

      try {
        const listings = await getFoodListingsByDonorID(currentUser.uid);
        const foundListing = listings.find((l: any) => l.id === listingId);

        if (!foundListing) {
          setFetchError('Listing not found or you do not have permission to edit it.');
          return;
        }

        if (foundListing.status === 'Claimed') {
          setFetchError('Cannot edit a claimed listing.');
          navigate('/donor/dashboard');
          return;
        }

        setListing(foundListing);

        // Set form values
        const expirationDate = foundListing.expirationTime.toDate
          ? foundListing.expirationTime.toDate()
          : new Date(foundListing.expirationTime);

        reset({
          foodItemName: foundListing.foodItemName,
          quantity: foundListing.quantity.toString(),
          pickupLocation: foundListing.pickupLocation,
          expirationTime: expirationDate.toISOString().slice(0, 16),
        });
      } catch (err: any) {
        setFetchError(err.message || 'Failed to fetch listing');
      }
    };

    fetchListing();
  }, [currentUser, listingId, reset, navigate]);

  if (!listing && !fetchError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return <Alert severity="error">{fetchError}</Alert>;
  }

  const onSubmit = async (data: EditListingFormData) => {
    if (!listing) return;

    try {
      // Validate inputs
      const foodNameValidation = isValidFoodItemName(data.foodItemName);
      if (!foodNameValidation.valid) {
        toast.error(foodNameValidation.message);
        return;
      }

      const quantityValidation = isValidQuantity(data.quantity);
      if (!quantityValidation.valid) {
        toast.error(quantityValidation.message);
        return;
      }

      const locationValidation = isValidPickupLocation(data.pickupLocation);
      if (!locationValidation.valid) {
        toast.error(locationValidation.message);
        return;
      }

      const dateValidation = isValidExpirationDate(data.expirationTime);
      if (!dateValidation.valid) {
        toast.error(dateValidation.message);
        return;
      }

      setIsLoading(true);
      await updateFoodListing(
        listing.id,
        data.foodItemName,
        parseInt(data.quantity),
        new Date(data.expirationTime),
        data.pickupLocation
      );

      toast.success('Food listing updated successfully!');
      navigate('/donor/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        <Card sx={{ p: 4, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            ✏️ Edit Food Listing
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Food Item Name"
              margin="normal"
              {...register('foodItemName', {
                required: 'Food item name is required',
              })}
              error={!!errors.foodItemName}
              helperText={errors.foodItemName?.message}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Quantity (units)"
              type="number"
              margin="normal"
              {...register('quantity', {
                required: 'Quantity is required',
              })}
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Pickup Location"
              margin="normal"
              {...register('pickupLocation', {
                required: 'Pickup location is required',
              })}
              error={!!errors.pickupLocation}
              helperText={errors.pickupLocation?.message}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Expiration Date & Time"
              type="datetime-local"
              margin="normal"
              slotProps={{ inputLabel: { shrink: true } }}
              {...register('expirationTime', {
                required: 'Expiration date and time is required',
              })}
              error={!!errors.expirationTime}
              helperText={errors.expirationTime?.message}
              disabled={isLoading}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Update Listing'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/donor/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Card>
      </Container>
    </Box>
  );
};
