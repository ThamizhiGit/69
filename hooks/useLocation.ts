import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { LocationService } from '../services/locationService';
import { Location } from '../types';
import { useApp } from '../contexts/AppContext';

interface UseLocationReturn {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestLocation: () => Promise<void>;
  watchLocation: (callback: (location: Location) => void) => Promise<() => void>;
  clearError: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const { state, setLocation } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Check initial permission status
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const permission = await LocationService.requestLocationPermission();
      setHasPermission(permission);
    } catch (err) {
      console.error('Error checking location permission:', err);
      setHasPermission(false);
    }
  };

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First check/request permissions
      const permission = await LocationService.requestLocationPermission();
      setHasPermission(permission);

      if (!permission) {
        setError('Location permission denied');
        Alert.alert(
          'Location Permission Required',
          'Please enable location access in your device settings to use location-based features.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {/* Open settings if possible */} },
          ]
        );
        return;
      }

      // Get current location
      const location = await LocationService.getCurrentLocation();
      
      if (location) {
        setLocation(location);
        setError(null);
      } else {
        setError('Unable to get current location');
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please try again or check your GPS settings.'
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown location error';
      setError(errorMessage);
      console.error('Location request error:', err);
      
      Alert.alert(
        'Location Error',
        'Failed to get your location. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);

  const watchLocation = useCallback(async (callback: (location: Location) => void) => {
    try {
      const permission = await LocationService.requestLocationPermission();
      setHasPermission(permission);

      if (!permission) {
        throw new Error('Location permission denied');
      }

      const subscription = await LocationService.watchLocation(
        (location) => {
          setLocation(location);
          callback(location);
        },
        {
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        }
      );

      if (subscription) {
        return subscription.remove;
      } else {
        throw new Error('Failed to start location watching');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown location error';
      setError(errorMessage);
      console.error('Location watching error:', err);
      
      // Return empty cleanup function
      return () => {};
    }
  }, [setLocation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    location: state.currentLocation,
    isLoading,
    error,
    hasPermission,
    requestLocation,
    watchLocation,
    clearError,
  };
};