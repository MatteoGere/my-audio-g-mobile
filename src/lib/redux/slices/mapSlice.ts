import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for map functionality
export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface POI {
  id: string;
  track_id: string;
  track_name?: string;
  latitude: number;
  longitude: number;
  description?: string;
  type: 'audio_track' | 'waypoint' | 'landmark';
}

export interface MapState {
  // View state
  center: LatLng;
  zoom: number;
  bounds: MapBounds | null;

  // User location
  userLocation: LatLng | null;
  isLocationEnabled: boolean;
  locationAccuracy: number | null;
  isTrackingLocation: boolean;
  locationError: string | null;

  // POIs and markers
  pois: POI[];
  visiblePois: POI[];
  selectedPoi: POI | null;
  highlightedTrackId: string | null;

  // Map interaction
  isUserInteracting: boolean;
  followUserLocation: boolean;
  showUserLocation: boolean;

  // Map layers and options
  mapStyle: 'default' | 'satellite' | 'terrain' | 'dark';
  showTraffic: boolean;
  showPOILabels: boolean;
  poiClusteringEnabled: boolean;

  // Route and navigation
  currentRoute: LatLng[] | null;
  isNavigating: boolean;
  navigationTarget: POI | null;
  routeDistance: number | null;
  routeDuration: number | null;

  // Loading states
  isLoadingPois: boolean;
  isCalculatingRoute: boolean;

  // Geofencing for location-based features
  nearbyRadius: number; // meters
  triggeredPois: string[]; // POI IDs that have been triggered by proximity
}

// Initial state
const initialState: MapState = {
  center: {
    latitude: 45.4642, // Default to Milan
    longitude: 9.19,
  },
  zoom: 13,
  bounds: null,
  userLocation: null,
  isLocationEnabled: false,
  locationAccuracy: null,
  isTrackingLocation: false,
  locationError: null,
  pois: [],
  visiblePois: [],
  selectedPoi: null,
  highlightedTrackId: null,
  isUserInteracting: false,
  followUserLocation: true,
  showUserLocation: true,
  mapStyle: 'default',
  showTraffic: false,
  showPOILabels: true,
  poiClusteringEnabled: true,
  currentRoute: null,
  isNavigating: false,
  navigationTarget: null,
  routeDistance: null,
  routeDuration: null,
  isLoadingPois: false,
  isCalculatingRoute: false,
  nearbyRadius: 100, // 100 meters
  triggeredPois: [],
};

// Map slice
export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    // View state
    setCenter: (state, action: PayloadAction<LatLng>) => {
      state.center = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(1, Math.min(20, action.payload));
    },
    setBounds: (state, action: PayloadAction<MapBounds | null>) => {
      state.bounds = action.payload;
    },
    setMapView: (state, action: PayloadAction<{ center: LatLng; zoom: number }>) => {
      state.center = action.payload.center;
      state.zoom = action.payload.zoom;
    },

    // User location
    setUserLocation: (state, action: PayloadAction<LatLng | null>) => {
      state.userLocation = action.payload;
      state.locationError = null;

      // Auto-center map on first location fix if following user
      if (action.payload && state.followUserLocation && !state.isUserInteracting) {
        state.center = action.payload;
      }
    },
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLocationEnabled = action.payload;
      if (!action.payload) {
        state.userLocation = null;
        state.isTrackingLocation = false;
        state.locationError = null;
      }
    },
    setLocationAccuracy: (state, action: PayloadAction<number | null>) => {
      state.locationAccuracy = action.payload;
    },
    setTrackingLocation: (state, action: PayloadAction<boolean>) => {
      state.isTrackingLocation = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string | null>) => {
      state.locationError = action.payload;
    },

    // POIs and markers
    setPois: (state, action: PayloadAction<POI[]>) => {
      state.pois = action.payload;
      state.isLoadingPois = false;
    },
    addPois: (state, action: PayloadAction<POI[]>) => {
      const existingIds = new Set(state.pois.map((p) => p.id));
      const newPois = action.payload.filter((p) => !existingIds.has(p.id));
      state.pois.push(...newPois);
    },
    setVisiblePois: (state, action: PayloadAction<POI[]>) => {
      state.visiblePois = action.payload;
    },
    selectPoi: (state, action: PayloadAction<POI | null>) => {
      state.selectedPoi = action.payload;
    },
    setHighlightedTrackId: (state, action: PayloadAction<string | null>) => {
      state.highlightedTrackId = action.payload;
    },

    // Map interaction
    setUserInteracting: (state, action: PayloadAction<boolean>) => {
      state.isUserInteracting = action.payload;
    },
    setFollowUserLocation: (state, action: PayloadAction<boolean>) => {
      state.followUserLocation = action.payload;
    },
    setShowUserLocation: (state, action: PayloadAction<boolean>) => {
      state.showUserLocation = action.payload;
    },

    // Map display options
    setMapStyle: (state, action: PayloadAction<'default' | 'satellite' | 'terrain' | 'dark'>) => {
      state.mapStyle = action.payload;
    },
    setShowTraffic: (state, action: PayloadAction<boolean>) => {
      state.showTraffic = action.payload;
    },
    setShowPOILabels: (state, action: PayloadAction<boolean>) => {
      state.showPOILabels = action.payload;
    },
    setPOIClusteringEnabled: (state, action: PayloadAction<boolean>) => {
      state.poiClusteringEnabled = action.payload;
    },

    // Navigation and routing
    setCurrentRoute: (state, action: PayloadAction<LatLng[] | null>) => {
      state.currentRoute = action.payload;
      state.isCalculatingRoute = false;
    },
    setNavigating: (state, action: PayloadAction<boolean>) => {
      state.isNavigating = action.payload;
      if (!action.payload) {
        state.navigationTarget = null;
        state.currentRoute = null;
        state.routeDistance = null;
        state.routeDuration = null;
      }
    },
    setNavigationTarget: (state, action: PayloadAction<POI | null>) => {
      state.navigationTarget = action.payload;
    },
    setRouteInfo: (state, action: PayloadAction<{ distance: number; duration: number } | null>) => {
      if (action.payload) {
        state.routeDistance = action.payload.distance;
        state.routeDuration = action.payload.duration;
      } else {
        state.routeDistance = null;
        state.routeDuration = null;
      }
    },

    // Loading states
    setLoadingPois: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPois = action.payload;
    },
    setCalculatingRoute: (state, action: PayloadAction<boolean>) => {
      state.isCalculatingRoute = action.payload;
    },

    // Geofencing
    setNearbyRadius: (state, action: PayloadAction<number>) => {
      state.nearbyRadius = Math.max(10, Math.min(1000, action.payload));
    },
    addTriggeredPoi: (state, action: PayloadAction<string>) => {
      if (!state.triggeredPois.includes(action.payload)) {
        state.triggeredPois.push(action.payload);
      }
    },
    removeTriggeredPoi: (state, action: PayloadAction<string>) => {
      state.triggeredPois = state.triggeredPois.filter((id) => id !== action.payload);
    },
    clearTriggeredPois: (state) => {
      state.triggeredPois = [];
    },

    // Utility actions
    centerOnPoi: (state, action: PayloadAction<POI>) => {
      state.center = {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      };
      state.selectedPoi = action.payload;
      // Set appropriate zoom for POI viewing
      if (state.zoom < 15) {
        state.zoom = 15;
      }
    },
    centerOnUserLocation: (state) => {
      if (state.userLocation) {
        state.center = state.userLocation;
        state.followUserLocation = true;
      }
    },
    fitToPois: (state, action: PayloadAction<POI[]>) => {
      if (action.payload.length === 0) return;

      const lats = action.payload.map((p) => p.latitude);
      const lngs = action.payload.map((p) => p.longitude);

      const bounds: MapBounds = {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
      };

      state.bounds = bounds;

      // Calculate center
      state.center = {
        latitude: (bounds.north + bounds.south) / 2,
        longitude: (bounds.east + bounds.west) / 2,
      };
    },

    // Reset
    resetMap: () => initialState,
  },
});

// Export actions
export const {
  setCenter,
  setZoom,
  setBounds,
  setMapView,
  setUserLocation,
  setLocationEnabled,
  setLocationAccuracy,
  setTrackingLocation,
  setLocationError,
  setPois,
  addPois,
  setVisiblePois,
  selectPoi,
  setHighlightedTrackId,
  setUserInteracting,
  setFollowUserLocation,
  setShowUserLocation,
  setMapStyle,
  setShowTraffic,
  setShowPOILabels,
  setPOIClusteringEnabled,
  setCurrentRoute,
  setNavigating,
  setNavigationTarget,
  setRouteInfo,
  setLoadingPois,
  setCalculatingRoute,
  setNearbyRadius,
  addTriggeredPoi,
  removeTriggeredPoi,
  clearTriggeredPois,
  centerOnPoi,
  centerOnUserLocation,
  fitToPois,
  resetMap,
} = mapSlice.actions;

// Selectors
export const selectMapCenter = (state: { map: MapState }) => state.map.center;
export const selectMapZoom = (state: { map: MapState }) => state.map.zoom;
export const selectUserLocation = (state: { map: MapState }) => state.map.userLocation;
export const selectIsLocationEnabled = (state: { map: MapState }) => state.map.isLocationEnabled;
export const selectPois = (state: { map: MapState }) => state.map.pois;
export const selectVisiblePois = (state: { map: MapState }) => state.map.visiblePois;
export const selectSelectedPoi = (state: { map: MapState }) => state.map.selectedPoi;
export const selectHighlightedTrackId = (state: { map: MapState }) => state.map.highlightedTrackId;
export const selectMapStyle = (state: { map: MapState }) => state.map.mapStyle;
export const selectCurrentRoute = (state: { map: MapState }) => state.map.currentRoute;
export const selectIsNavigating = (state: { map: MapState }) => state.map.isNavigating;
export const selectNavigationTarget = (state: { map: MapState }) => state.map.navigationTarget;
export const selectLocationError = (state: { map: MapState }) => state.map.locationError;

export default mapSlice.reducer;
