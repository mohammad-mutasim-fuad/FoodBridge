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
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { isValidPassword } from '../utils/validators';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'Donor' | 'Receiver';
  organizationName: string;
  organizationType?: string;
}

/**
 * Register Page with Role Selection
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'Donor',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Validate password strength
      const passwordValidation = isValidPassword(data.password);
      if (!passwordValidation.valid) {
        toast.error(passwordValidation.message);
        return;
      }

      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      setIsLoading(true);
      await signup(
        data.email,
        data.password,
        data.role,
        data.organizationName,
        data.organizationType
      );
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Card sx={{ p: 4, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}>
            Create Account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <FormControl fullWidth margin="normal">
              <InputLabel>I am a...</InputLabel>
              <Controller
                name="role"
                control={control}
                rules={{ required: 'Please select your role' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="I am a..."
                    disabled={isLoading}
                  >
                    <MenuItem value="Donor">Food Donor (Restaurant, Bakery, etc.)</MenuItem>
                    <MenuItem value="Receiver">Receiving Organization (NGO, Shelter, etc.)</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />

            {/* Organization Name */}
            <TextField
              fullWidth
              label="Organization Name"
              margin="normal"
              {...register('organizationName', {
                required: 'Organization name is required',
                minLength: {
                  value: 2,
                  message: 'Organization name must be at least 2 characters',
                },
              })}
              error={!!errors.organizationName}
              helperText={errors.organizationName?.message}
              disabled={isLoading}
            />

            {/* Organization Type (optional) */}
            <TextField
              fullWidth
              label="Organization Type (optional)"
              margin="normal"
              placeholder="e.g., Restaurant, NGO, Shelter..."
              {...register('organizationType')}
              disabled={isLoading}
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...register('password', {
                required: 'Password is required',
              })}
              error={!!errors.password}
              helperText={errors.password?.message || 'Min 8 chars: 1 uppercase, 1 lowercase, 1 number, 1 special'}
              disabled={isLoading}
            />

            {/* Confirm Password */}
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isLoading}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ cursor: 'pointer', color: '#667eea' }}
            >
              Sign in here
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};
