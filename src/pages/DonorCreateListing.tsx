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
  Stack,
  IconButton,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
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
  pickupLat: string;
  pickupLng: string;
}

/**
 * Donor Create Food Listing Page
 */
export const DonorCreateListing: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateListingFormData>();

  const pickupLat = watch('pickupLat');
  const pickupLng = watch('pickupLng');

  if (!currentUser) {
    return <Alert severity="error">You must be logged in as a Donor to create listings.</Alert>;
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('pickupLat', position.coords.latitude.toString());
        setValue('pickupLng', position.coords.longitude.toString());
        setLocationLoading(false);
        toast.success('Location captured successfully!');
      },
      () => {
        setLocationLoading(false);
        toast.error('Unable to get your location. Please enter coordinates manually.');
      }
    );
  };

  const onSubmit = async (data: CreateListingFormData) => {
    try {
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
        currentUser.organizationName,
        data.foodItemName,
        parseInt(data.quantity),
        new Date(data.expirationTime),
        data.pickupLocation,
        data.pickupLat ? parseFloat(data.pickupLat) : undefined,
        data.pickupLng ? parseFloat(data.pickupLng) : undefined
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

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              📍 Pickup Location Coordinates (Optional)
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Enter coordinates or use your current location for route optimization
            </Typography>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <TextField
                label="Latitude"
                placeholder="e.g., 40.7128"
                size="small"
                {...register('pickupLat')}
                sx={{ flex: 1 }}
                disabled={isLoading}
              />
              <TextField
                label="Longitude"
                placeholder="e.g., -74.0060"
                size="small"
                {...register('pickupLng')}
                sx={{ flex: 1 }}
                disabled={isLoading}
              />
              <IconButton
                onClick={getCurrentLocation}
                disabled={locationLoading}
                color="primary"
                sx={{ backgroundColor: '#f0f0f0' }}
              >
                {locationLoading ? <CircularProgress size={24} /> : <MyLocationIcon />}
              </IconButton>
            </Stack>

            {(pickupLat && pickupLng) && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Location set: {parseFloat(pickupLat).toFixed(6)}, {parseFloat(pickupLng).toFixed(6)}
              </Alert>
            )}

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