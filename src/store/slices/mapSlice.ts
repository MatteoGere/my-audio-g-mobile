import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Tables } from '../../types/supabase-types'

export interface Location {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: number
}

export interface MapMarker {
  id: string
  position: Location
  type: 'track' | 'poi' | 'user'
  title?: string
  description?: string
  trackId?: string
}

export interface MapState {
  // User location
  userLocation: Location | null
  isLocationEnabled: boolean
  isTrackingLocation: boolean
  locationError: string | null
  
  // Map view
  center: Location
  zoom: number
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  
  // Markers and POIs
  markers: MapMarker[]
  trackPOIs: Tables<'audio_track_poi'>[]
  visiblePOIs: string[] // POI IDs currently visible
  
  // Geofencing
  isNearPOI: boolean
  nearestPOI: Tables<'audio_track_poi'> | null
  geofenceRadius: number // meters
  
  // Navigation
  isNavigating: boolean
  targetPOI: Tables<'audio_track_poi'> | null
  route: Location[]
  
  // Loading states
  isLoadingLocation: boolean
  isLoadingPOIs: boolean
  
  // Error handling
  error: string | null
}

// Default location (Rome, Italy)
const DEFAULT_LOCATION: Location = {
  latitude: 41.9028,
  longitude: 12.4964,
}

const initialState: MapState = {
  userLocation: null,
  isLocationEnabled: false,
  isTrackingLocation: false,
  locationError: null,
  center: DEFAULT_LOCATION,
  zoom: 10,
  mapType: 'roadmap',
  markers: [],
  trackPOIs: [],
  visiblePOIs: [],
  isNearPOI: false,
  nearestPOI: null,
  geofenceRadius: 50, // 50 meters default
  isNavigating: false,
  targetPOI: null,
  route: [],
  isLoadingLocation: false,
  isLoadingPOIs: false,
  error: null,
}

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    // Location management
    setUserLocation: (state, action: PayloadAction<Location>) => {
      state.userLocation = action.payload
      state.locationError = null
    },
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLocationEnabled = action.payload
    },
    setTrackingLocation: (state, action: PayloadAction<boolean>) => {
      state.isTrackingLocation = action.payload
    },
    setLocationError: (state, action: PayloadAction<string | null>) => {
      state.locationError = action.payload
    },
    
    // Map view
    setCenter: (state, action: PayloadAction<Location>) => {
      state.center = action.payload
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload
    },
    setMapType: (state, action: PayloadAction<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>) => {
      state.mapType = action.payload
    },
    
    // Markers and POIs
    setMarkers: (state, action: PayloadAction<MapMarker[]>) => {
      state.markers = action.payload
    },
    addMarker: (state, action: PayloadAction<MapMarker>) => {
      state.markers.push(action.payload)
    },
    removeMarker: (state, action: PayloadAction<string>) => {
      state.markers = state.markers.filter(marker => marker.id !== action.payload)
    },
    setTrackPOIs: (state, action: PayloadAction<Tables<'audio_track_poi'>[]>) => {
      state.trackPOIs = action.payload
    },
    setVisiblePOIs: (state, action: PayloadAction<string[]>) => {
      state.visiblePOIs = action.payload
    },
    
    // Geofencing
    setNearPOI: (state, action: PayloadAction<{ isNear: boolean; poi?: Tables<'audio_track_poi'> }>) => {
      state.isNearPOI = action.payload.isNear
      state.nearestPOI = action.payload.poi || null
    },
    setGeofenceRadius: (state, action: PayloadAction<number>) => {
      state.geofenceRadius = action.payload
    },
    
    // Navigation
    startNavigation: (state, action: PayloadAction<Tables<'audio_track_poi'>>) => {
      state.isNavigating = true
      state.targetPOI = action.payload
      state.route = []
    },
    stopNavigation: (state) => {
      state.isNavigating = false
      state.targetPOI = null
      state.route = []
    },
    setRoute: (state, action: PayloadAction<Location[]>) => {
      state.route = action.payload
    },
    
    // Loading states
    setLoadingLocation: (state, action: PayloadAction<boolean>) => {
      state.isLoadingLocation = action.payload
    },
    setLoadingPOIs: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPOIs = action.payload
    },
    
    // Utility actions
    centerOnUser: (state) => {
      if (state.userLocation) {
        state.center = state.userLocation
        state.zoom = 15
      }
    },
    centerOnPOI: (state, action: PayloadAction<Tables<'audio_track_poi'>>) => {
      state.center = {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      }
      state.zoom = 16
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    
    // Reset
    reset: (state) => {
      return {
        ...initialState,
        userLocation: state.userLocation,
        isLocationEnabled: state.isLocationEnabled,
      }
    },
  },
})

export const {
  setUserLocation,
  setLocationEnabled,
  setTrackingLocation,
  setLocationError,
  setCenter,
  setZoom,
  setMapType,
  setMarkers,
  addMarker,
  removeMarker,
  setTrackPOIs,
  setVisiblePOIs,
  setNearPOI,
  setGeofenceRadius,
  startNavigation,
  stopNavigation,
  setRoute,
  setLoadingLocation,
  setLoadingPOIs,
  centerOnUser,
  centerOnPOI,
  setError,
  clearError,
  reset,
} = mapSlice.actions

export default mapSlice.reducer