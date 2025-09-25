import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux';
import {
  setUserLocation,
  setLocationEnabled,
  setLocationAccuracy,
  setTrackingLocation,
  setLocationError,
  selectUserLocation,
  selectIsLocationEnabled,
  selectLocationError,
} from '@/lib/redux/slices/mapSlice';

interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseLocationReturn {
  userLocation: { latitude: number; longitude: number } | null;
  isLocationEnabled: boolean;
  isTracking: boolean;
  locationError: string | null;
  requestLocation: () => Promise<void>;
  startTracking: (options?: LocationOptions) => void;
  stopTracking: () => void;
  getCurrentPosition: (options?: LocationOptions) => Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  }>;
}

export const useLocation = (): UseLocationReturn => {
  const dispatch = useAppDispatch();
  const userLocation = useAppSelector(selectUserLocation);
  const isLocationEnabled = useAppSelector(selectIsLocationEnabled);
  const locationError = useAppSelector(selectLocationError);
  const isTracking = useAppSelector((state) => state.map.isTrackingLocation);

  const watchIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if geolocation is supported
  const isGeolocationSupported = 'geolocation' in navigator;

  // Request location permission
  const requestLocation = useCallback(async (): Promise<void> => {
    if (!isGeolocationSupported) {
      dispatch(setLocationError('Geolocation is not supported by this browser'));
      return;
    }

    try {
      // Check current permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });

        if (permission.state === 'denied') {
          dispatch(
            setLocationError(
              'Location access denied. Please enable location in your browser settings.',
            ),
          );
          return;
        }
      }

      // Try to get current position to trigger permission request
      await getCurrentPosition();
    } catch (error: any) {
      console.error('Location request failed:', error);
      handleLocationError(error);
    }
  }, [dispatch, isGeolocationSupported]);

  // Get current position once
  const getCurrentPosition = useCallback(
    (
      options: LocationOptions = {},
    ): Promise<{
      latitude: number;
      longitude: number;
      accuracy: number;
    }> => {
      return new Promise((resolve, reject) => {
        if (!isGeolocationSupported) {
          reject(new Error('Geolocation is not supported'));
          return;
        }

        const defaultOptions: PositionOptions = {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 15000,
          maximumAge: options.maximumAge ?? 60000, // 1 minute
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            };

            dispatch(
              setUserLocation({
                latitude: location.latitude,
                longitude: location.longitude,
              }),
            );
            dispatch(setLocationAccuracy(location.accuracy));
            dispatch(setLocationEnabled(true));
            dispatch(setLocationError(null));

            resolve(location);
          },
          (error) => {
            handleLocationError(error);
            reject(error);
          },
          defaultOptions,
        );
      });
    },
    [dispatch, isGeolocationSupported],
  );

  // Handle location errors
  const handleLocationError = useCallback(
    (error: GeolocationPositionError) => {
      let errorMessage: string;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage = 'An unknown error occurred while retrieving location.';
          break;
      }

      dispatch(setLocationError(errorMessage));
      dispatch(setLocationEnabled(false));
    },
    [dispatch],
  );

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    dispatch(setTrackingLocation(false));
  }, [dispatch]);

  // Start continuous tracking
  const startTracking = useCallback(
    (options: LocationOptions = {}) => {
      if (!isGeolocationSupported) {
        dispatch(setLocationError('Geolocation is not supported by this browser'));
        return;
      }

      // Stop any existing tracking
      stopTracking();

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 15000,
        maximumAge: options.maximumAge ?? 30000, // 30 seconds for tracking
      };

      dispatch(setTrackingLocation(true));
      dispatch(setLocationError(null));

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          dispatch(setUserLocation(location));
          dispatch(setLocationAccuracy(position.coords.accuracy));
          dispatch(setLocationEnabled(true));
          dispatch(setLocationError(null));
        },
        handleLocationError,
        defaultOptions,
      );
    },
    [dispatch, isGeolocationSupported, handleLocationError, stopTracking],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Auto-request location on mount if not already enabled
  useEffect(() => {
    if (!isLocationEnabled && !locationError && isGeolocationSupported) {
      // Delay the automatic request to avoid overwhelming the user
      timeoutRef.current = setTimeout(() => {
        requestLocation();
      }, 1000);
    }
  }, [isLocationEnabled, locationError, isGeolocationSupported, requestLocation]);

  return {
    userLocation,
    isLocationEnabled,
    isTracking,
    locationError,
    requestLocation,
    startTracking,
    stopTracking,
    getCurrentPosition,
  };
};

export default useLocation;
