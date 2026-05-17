import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getFoodListingsByDonorID, getUsersByIds } from '../services/firebaseService';
import { RouteOptimizer } from '../components/RouteOptimizer';
import type { FoodListing } from '../types';

/**
 * Route Optimization Page - For donors to plan delivery routes
 */
export const RoutePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [receiverNames, setReceiverNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedClaimed, setSelectedClaimed] = useState<string>('all');

  useEffect(() => {
    const fetchListings = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const allListings = await getFoodListingsByDonorID(currentUser.uid);
        setListings(allListings);

        const claimedListings = allListings.filter((l: FoodListing) => l.status === 'Claimed' && l.claimedBy);
        const receiverIds = [...new Set(claimedListings.map((l: FoodListing) => l.claimedBy).filter(Boolean))];
        
        if (receiverIds.length > 0) {
          const names = await getUsersByIds(receiverIds as string[]);
          setReceiverNames(names);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentUser]);

  const claimedListings = listings.filter(l => l.status === 'Claimed' && l.claimedBy);
  const availableListings = listings.filter(l => l.status === 'Available');

  const filteredListings = selectedClaimed === 'all'
    ? claimedListings
    : claimedListings.filter(l => l.claimedBy === selectedClaimed);

  const uniqueReceivers = claimedListings.reduce((acc, listing) => {
    if (listing.claimedBy && !acc.find(r => r.id === listing.claimedBy)) {
      acc.push({ 
        id: listing.claimedBy, 
        name: receiverNames[listing.claimedBy] || listing.claimedBy?.substring(0, 8) + '...' 
      });
    }
    return acc;
  }, [] as { id: string; name: string }[]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!currentUser || currentUser.role !== 'Donor') {
    return (
      <Alert severity="error">
        This page is only available for donors.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        🗺️ Route Optimization
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {claimedListings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No claimed food listings yet. When receivers claim your listings, they will appear here for route planning.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={(_, v) => setSelectedTab(v)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`My Routes (${claimedListings.length})`} />
              <Tab label={`Available (${availableListings.length})`} />
            </Tabs>
          </Paper>

          {selectedTab === 0 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Receiver</InputLabel>
                  <Select
                    value={selectedClaimed}
                    label="Filter by Receiver"
                    onChange={(e) => setSelectedClaimed(e.target.value)}
                  >
                    <MenuItem value="all">All Receivers</MenuItem>
                    {uniqueReceivers.map(receiver => (
                      <MenuItem key={receiver.id} value={receiver.id}>
                        {receiver.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                Showing {filteredListings.length} claimed listings with location data. 
                Add GPS coordinates to your listings for route optimization.
              </Alert>

              <RouteOptimizer
                listings={filteredListings}
                onOptimize={(route, distance, time) => {
                  console.log('Route optimized:', route.length, 'stops', distance, 'km', time, 'min');
                }}
              />
            </Box>
          )}

          {selectedTab === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Available listings that haven't been claimed yet.
              </Alert>
              <RouteOptimizer listings={availableListings} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};