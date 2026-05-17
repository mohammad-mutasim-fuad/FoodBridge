import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Paper, Stack, Button, CircularProgress } from '@mui/material';
import type { FoodListing } from '../types';

interface RouteOptimizerProps {
  listings: FoodListing[];
  onOptimize?: (route: FoodListing[], distance: number, time: number) => void;
}

const createIcon = (type: 'pickup' | 'delivery' | 'start' | 'end') => {
  const colors = {
    pickup: '#667eea',
    delivery: '#2ecc71',
    start: '#f39c12',
    end: '#e74c3c',
  };
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${colors[type]};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">${type === 'pickup' ? 'P' : type === 'delivery' ? 'D' : type === 'start' ? 'S' : 'E'}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const optimizeRoute = (listings: FoodListing[]): FoodListing[] => {
  if (listings.length <= 1) return listings;
  
  const withLocations = listings.filter(l => l.pickupLat && l.pickupLng);
  if (withLocations.length === 0) return listings;
  
  const optimized: FoodListing[] = [];
  const remaining = [...withLocations];
  
  let currentLat = remaining[0].pickupLat!;
  let currentLng = remaining[0].pickupLng!;
  
  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateDistance(
        currentLat,
        currentLng,
        remaining[i].pickupLat!,
        remaining[i].pickupLng!
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    
    optimized.push(remaining[nearestIdx]);
    currentLat = remaining[nearestIdx].pickupLat!;
    currentLng = remaining[nearestIdx].pickupLng!;
    remaining.splice(nearestIdx, 1);
  }
  
  return optimized;
};

const MapBoundsUpdater: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  
  return null;
};

export const RouteOptimizer: React.FC<RouteOptimizerProps> = ({ listings, onOptimize }) => {
  const [optimizedRoute, setOptimizedRoute] = useState<FoodListing[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const listingsWithLocation = listings.filter(l => l.pickupLat && l.pickupLng);

  const handleOptimize = () => {
    setIsOptimizing(true);
    
    setTimeout(() => {
      const optimized = optimizeRoute(listingsWithLocation);
      setOptimizedRoute(optimized);
      
      let distance = 0;
      let prevLat = optimized[0]?.pickupLat || 0;
      let prevLng = optimized[0]?.pickupLng || 0;
      
      optimized.forEach(listing => {
        if (listing.pickupLat && listing.pickupLng) {
          distance += calculateDistance(prevLat, prevLng, listing.pickupLat, listing.pickupLng);
          prevLat = listing.pickupLat;
          prevLng = listing.pickupLng;
        }
      });
      
      const avgSpeed = 30;
      const time = (distance / avgSpeed) * 60;
      
      setTotalDistance(Math.round(distance * 10) / 10);
      setEstimatedTime(Math.round(time));
      
      if (onOptimize) {
        onOptimize(optimized, distance, time);
      }
      
      setIsOptimizing(false);
    }, 500);
  };

  const routePoints: [number, number][] = optimizedRoute.length > 0
    ? optimizedRoute
        .filter(l => l.pickupLat && l.pickupLng)
        .map(l => [l.pickupLat!, l.pickupLng!] as [number, number])
    : listingsWithLocation.map(l => [l.pickupLat!, l.pickupLng!] as [number, number]);

  const center: [number, number] = routePoints.length > 0
    ? [routePoints[0][0], routePoints[0][1]]
    : [40.7128, -74.006];

  if (listingsWithLocation.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No listings with location data found. Add GPS coordinates to your listings to enable route optimization.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleOptimize}
          disabled={isOptimizing || listingsWithLocation.length < 2}
        >
          {isOptimizing ? <CircularProgress size={24} /> : 'Optimize Route'}
        </Button>
        
        {totalDistance > 0 && (
          <Paper sx={{ p: 2, display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">Distance</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{totalDistance} km</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Est. Time</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{estimatedTime} min</Typography>
            </Box>
          </Paper>
        )}
      </Stack>

      <Paper sx={{ height: 400, overflow: 'hidden', borderRadius: 1 }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBoundsUpdater points={routePoints} />
          
          {(optimizedRoute.length > 0 ? optimizedRoute : listingsWithLocation).map((listing, index) => (
            <Marker
              key={listing.id}
              position={[listing.pickupLat!, listing.pickupLng!]}
              icon={createIcon(index === 0 ? 'start' : 'pickup')}
            >
              <Popup>
                <Typography variant="subtitle2">{listing.foodItemName}</Typography>
                <Typography variant="body2">{listing.pickupLocation}</Typography>
                <Typography variant="caption">
                  {optimizedRoute.length > 0 ? `Stop #${index + 1}` : 'Pickup'}
                </Typography>
              </Popup>
            </Marker>
          ))}
          
          {routePoints.length > 1 && (
            <Polyline
              positions={routePoints}
              color="#667eea"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </Paper>

      {optimizedRoute.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Optimized Route Order:
          </Typography>
          <Stack spacing={1}>
            {optimizedRoute.map((listing, index) => (
              <Paper key={listing.id} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: index === 0 ? '#f39c12' : '#667eea',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  {index + 1}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{listing.foodItemName}</Typography>
                  <Typography variant="caption" color="textSecondary">{listing.pickupLocation}</Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};