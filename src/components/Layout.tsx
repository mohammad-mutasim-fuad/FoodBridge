import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  IconButton,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main Layout Component with Navigation Bar
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      handleMenuClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getNavLinks = () => {
    if (!currentUser) {
      return (
        <>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button color="inherit" onClick={() => navigate('/register')}>
            Register
          </Button>
        </>
      );
    }

    const baseLinks = [
      currentUser.role === 'Donor' && { label: 'Dashboard', path: '/donor/dashboard' },
      currentUser.role === 'Donor' && { label: 'Create Listing', path: '/donor/create-listing' },
      currentUser.role === 'Receiver' && { label: 'Food Feed', path: '/receiver/dashboard' },
      currentUser.role === 'Receiver' && { label: 'Claims History', path: '/receiver/claims-history' },
      currentUser.role === 'Admin' && { label: 'Dashboard', path: '/admin/dashboard' },
      currentUser.role === 'Admin' && { label: 'Users', path: '/admin/users' },
      currentUser.role === 'Admin' && { label: 'Listings', path: '/admin/listings' },
    ].filter(Boolean);

    return (
      <>
        {baseLinks.map((link: any) => (
          <Button
            key={link.path}
            color="inherit"
            onClick={() => navigate(link.path)}
            sx={{ mx: 1 }}
          >
            {link.label}
          </Button>
        ))}
      </>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#2c3e50' }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            onClick={() => navigate('/')}
          >
            🍽️ FoodBridge
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getNavLinks()}

            {currentUser && (
              <>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ p: 0 }}
                >
                  <Avatar sx={{ bgcolor: '#3498db', cursor: 'pointer' }}>
                    {currentUser.organizationName.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem disabled>
                    <Typography variant="body2">{currentUser.email}</Typography>
                  </MenuItem>
                  <MenuItem disabled>
                    <Typography variant="caption" color="textSecondary">
                      Role: {currentUser.role}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: '#2c3e50',
          color: 'white',
          py: 4,
          textAlign: 'center',
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2">
            © 2026 FoodBridge. Minimizing food waste, one connection at a time.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            Connecting food donors with verified receiving organizations
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
