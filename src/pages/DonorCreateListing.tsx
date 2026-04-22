import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { createFoodListing } from '../services/firebaseService';
import { isValidFoodItemName, isValidQuantity, isValidPickupLocation, isValidExpirationDate } from '../utils/validators';

interface CreateListingFormData {
  foodItemName: string;
  quantity: string;
  expirationTime: string;
  pickupLocation: string;
}

/**
 * Donor Create Food Listing Page
 */
export const DonorCreateListing: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateListingFormData>();

  if (!currentUser) {
    return <Alert severity="error">You must be logged in as a Donor to create listings.</Alert>;
  }

  const onSubmit = async (data: CreateListingFormData) => {
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
      await createFoodListing(
        currentUser.uid,
        data.foodItemName,
        parseInt(data.quantity),
        new Date(data.expirationTime),
        data.pickupLocation
      );

      toast.success('Food listing created successfully!');
      navigate('/donor/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        <Card sx={{ p: 4, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            📝 Create Food Listing
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Food Item Name"
              margin="normal"
              placeholder="e.g., Fresh Sandwiches, Pastries, Pizza..."
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
              placeholder="e.g., 123 Main St, Downtown Coffee Shop..."
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
              InputLabelProps={{ shrink: true }}
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
                {isLoading ? <CircularProgress size={24} /> : 'Create Listing'}
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
