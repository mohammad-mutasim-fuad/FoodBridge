import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { DonorCreateListing } from './pages/DonorCreateListing';
import { DonorEditListing } from './pages/DonorEditListing';
import { ReceiverDashboard } from './pages/ReceiverDashboard';
import { ReceiverClaimsHistory } from './pages/ReceiverClaimsHistory';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminListings } from './pages/AdminListings';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    success: {
      main: '#2ecc71',
    },
    error: {
      main: '#e74c3c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

/**
 * Main App Component with Routing
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <LandingPage />
          </Layout>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Donor Routes */}
      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Donor']}>
            <Layout>
              <DonorDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/create-listing"
        element={
          <ProtectedRoute allowedRoles={['Donor']}>
            <Layout>
              <DonorCreateListing />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/edit-listing/:listingId"
        element={
          <ProtectedRoute allowedRoles={['Donor']}>
            <Layout>
              <DonorEditListing />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Receiver Routes */}
      <Route
        path="/receiver/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Receiver']}>
            <Layout>
              <ReceiverDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receiver/claims-history"
        element={
          <ProtectedRoute allowedRoles={['Receiver']}>
            <Layout>
              <ReceiverClaimsHistory />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <AdminUsers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/listings"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <AdminListings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Root App Component
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
