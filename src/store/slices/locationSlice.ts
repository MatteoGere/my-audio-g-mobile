import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface LocationState {
  // Current position
  currentPosition: Coordinates | null;
  lastKnownPosition: Coordinates | null;

  // Location tracking
  isTrackingLocation: boolean;
  locationPermission: 'granted' | 'denied' | 'prompt' | 'unknown';

  // Nearby discovery
  nearbyRadius: number; // in meters
  discoveryEnabled: boolean;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Location history for geofencing
  locationHistory: Array<{
    coordinates: Coordinates;
    timestamp: number;
  }>;

  // Settings
  highAccuracy: boolean;
  updateFrequency: number; // in milliseconds
}

const initialState: LocationState = {
  // Current position
  currentPosition: null,
  lastKnownPosition: null,

  // Location tracking
  isTrackingLocation: false,
  locationPermission: 'unknown',

  // Nearby discovery
  nearbyRadius: 1000, // 1km default
  discoveryEnabled: true,

  // Loading and error states
  loading: false,
  error: null,

  // Location history
  locationHistory: [],

  // Settings
  highAccuracy: true,
  updateFrequency: 30000, // 30 seconds
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    // Position updates
    setCurrentPosition: (state, action: PayloadAction<Coordinates>) => {
      state.currentPosition = action.payload;
      state.lastKnownPosition = action.payload;
      state.loading = false;
      state.error = null;

      // Add to history
      state.locationHistory.push({
        coordinates: action.payload,
        timestamp: Date.now(),
      });

      // Keep only last 50 positions to prevent memory issues
      if (state.locationHistory.length > 50) {
        state.locationHistory = state.locationHistory.slice(-50);
      }
    },

    setLastKnownPosition: (state, action: PayloadAction<Coordinates>) => {
      state.lastKnownPosition = action.payload;
    },

    // Location tracking
    startTracking: (state) => {
      state.isTrackingLocation = true;
      state.loading = true;
      state.error = null;
    },

    stopTracking: (state) => {
      state.isTrackingLocation = false;
      state.loading = false;
    },

    setLocationPermission: (
      state,
      action: PayloadAction<'granted' | 'denied' | 'prompt' | 'unknown'>,
    ) => {
      state.locationPermission = action.payload;

      if (action.payload === 'denied') {
        state.isTrackingLocation = false;
        state.loading = false;
      }
    },

    // Discovery settings
    setNearbyRadius: (state, action: PayloadAction<number>) => {
      state.nearbyRadius = Math.max(100, Math.min(10000, action.payload)); // 100m to 10km
    },

    setDiscoveryEnabled: (state, action: PayloadAction<boolean>) => {
      state.discoveryEnabled = action.payload;
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Settings
    setHighAccuracy: (state, action: PayloadAction<boolean>) => {
      state.highAccuracy = action.payload;
    },

    setUpdateFrequency: (state, action: PayloadAction<number>) => {
      state.updateFrequency = Math.max(5000, action.payload); // Minimum 5 seconds
    },

    // History management
    clearLocationHistory: (state) => {
      state.locationHistory = [];
    },

    // Reset location state
    resetLocation: (state) => {
      return {
        ...initialState,
        lastKnownPosition: state.lastKnownPosition,
        locationPermission: state.locationPermission,
      };
    },
  },
});

export const {
  setCurrentPosition,
  setLastKnownPosition,
  startTracking,
  stopTracking,
  setLocationPermission,
  setNearbyRadius,
  setDiscoveryEnabled,
  setLoading,
  setError,
  clearError,
  setHighAccuracy,
  setUpdateFrequency,
  clearLocationHistory,
  resetLocation,
} = locationSlice.actions;

// Selectors
export const selectCurrentPosition = (state: { location: LocationState }) =>
  state.location.currentPosition;
export const selectLastKnownPosition = (state: { location: LocationState }) =>
  state.location.lastKnownPosition;
export const selectLocationPermission = (state: { location: LocationState }) =>
  state.location.locationPermission;
export const selectIsTrackingLocation = (state: { location: LocationState }) =>
  state.location.isTrackingLocation;

export default locationSlice.reducer;
