import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Tables } from '../../types/supabase-types'

export interface UserPreferencesState {
  // App settings
  language: 'en' | 'it' | 'es' | 'fr' | 'de'
  theme: 'light' | 'dark' | 'system'
  
  // Audio preferences
  defaultPlaybackRate: number
  defaultVolume: number
  autoPlay: boolean
  downloadQuality: 'low' | 'medium' | 'high'
  
  // Location & map preferences
  enableLocationServices: boolean
  showNearbyRadius: number // kilometers
  mapDefaultZoom: number
  enableGeofencing: boolean
  
  // Notification preferences
  enablePushNotifications: boolean
  enableLocationNotifications: boolean
  enableDownloadNotifications: boolean
  
  // Accessibility
  enableHighContrast: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  enableScreenReader: boolean
  
  // Data usage
  allowCellularDownloads: boolean
  autoDeleteListenedTracks: boolean
  maxStorageUsage: number // MB
  
  // Privacy
  enableAnalytics: boolean
  enableCrashReporting: boolean
  
  // User favorites and history
  favouriteItineraries: string[] // itinerary IDs
  favouriteTracks: string[] // track IDs
  recentlyPlayed: string[] // track IDs (ordered by recency)
  downloadedContent: string[] // itinerary IDs
  
  // Onboarding & tutorial
  hasCompletedOnboarding: boolean
  hasSeenTutorial: boolean
  tutorialStepsCompleted: string[]
  
  // Loading state
  isLoading: boolean
  error: string | null
}

const initialState: UserPreferencesState = {
  // App settings
  language: 'en',
  theme: 'system',
  
  // Audio preferences
  defaultPlaybackRate: 1.0,
  defaultVolume: 0.8,
  autoPlay: true,
  downloadQuality: 'medium',
  
  // Location & map preferences
  enableLocationServices: false,
  showNearbyRadius: 10,
  mapDefaultZoom: 12,
  enableGeofencing: true,
  
  // Notification preferences
  enablePushNotifications: true,
  enableLocationNotifications: true,
  enableDownloadNotifications: true,
  
  // Accessibility
  enableHighContrast: false,
  fontSize: 'medium',
  enableScreenReader: false,
  
  // Data usage
  allowCellularDownloads: false,
  autoDeleteListenedTracks: false,
  maxStorageUsage: 1000, // 1GB
  
  // Privacy
  enableAnalytics: true,
  enableCrashReporting: true,
  
  // User favorites and history
  favouriteItineraries: [],
  favouriteTracks: [],
  recentlyPlayed: [],
  downloadedContent: [],
  
  // Onboarding & tutorial
  hasCompletedOnboarding: false,
  hasSeenTutorial: false,
  tutorialStepsCompleted: [],
  
  // Loading state
  isLoading: false,
  error: null,
}

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    // App settings
    setLanguage: (state, action: PayloadAction<'en' | 'it' | 'es' | 'fr' | 'de'>) => {
      state.language = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    
    // Audio preferences
    setDefaultPlaybackRate: (state, action: PayloadAction<number>) => {
      state.defaultPlaybackRate = Math.max(0.5, Math.min(2.0, action.payload))
    },
    setDefaultVolume: (state, action: PayloadAction<number>) => {
      state.defaultVolume = Math.max(0, Math.min(1, action.payload))
    },
    setAutoPlay: (state, action: PayloadAction<boolean>) => {
      state.autoPlay = action.payload
    },
    setDownloadQuality: (state, action: PayloadAction<'low' | 'medium' | 'high'>) => {
      state.downloadQuality = action.payload
    },
    
    // Location & map preferences
    setEnableLocationServices: (state, action: PayloadAction<boolean>) => {
      state.enableLocationServices = action.payload
    },
    setShowNearbyRadius: (state, action: PayloadAction<number>) => {
      state.showNearbyRadius = Math.max(1, Math.min(100, action.payload))
    },
    setMapDefaultZoom: (state, action: PayloadAction<number>) => {
      state.mapDefaultZoom = Math.max(1, Math.min(20, action.payload))
    },
    setEnableGeofencing: (state, action: PayloadAction<boolean>) => {
      state.enableGeofencing = action.payload
    },
    
    // Notification preferences
    setEnablePushNotifications: (state, action: PayloadAction<boolean>) => {
      state.enablePushNotifications = action.payload
    },
    setEnableLocationNotifications: (state, action: PayloadAction<boolean>) => {
      state.enableLocationNotifications = action.payload
    },
    setEnableDownloadNotifications: (state, action: PayloadAction<boolean>) => {
      state.enableDownloadNotifications = action.payload
    },
    
    // Accessibility
    setEnableHighContrast: (state, action: PayloadAction<boolean>) => {
      state.enableHighContrast = action.payload
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large' | 'extra-large'>) => {
      state.fontSize = action.payload
    },
    setEnableScreenReader: (state, action: PayloadAction<boolean>) => {
      state.enableScreenReader = action.payload
    },
    
    // Data usage
    setAllowCellularDownloads: (state, action: PayloadAction<boolean>) => {
      state.allowCellularDownloads = action.payload
    },
    setAutoDeleteListenedTracks: (state, action: PayloadAction<boolean>) => {
      state.autoDeleteListenedTracks = action.payload
    },
    setMaxStorageUsage: (state, action: PayloadAction<number>) => {
      state.maxStorageUsage = Math.max(100, action.payload)
    },
    
    // Privacy
    setEnableAnalytics: (state, action: PayloadAction<boolean>) => {
      state.enableAnalytics = action.payload
    },
    setEnableCrashReporting: (state, action: PayloadAction<boolean>) => {
      state.enableCrashReporting = action.payload
    },
    
    // Favorites management
    addFavouriteItinerary: (state, action: PayloadAction<string>) => {
      if (!state.favouriteItineraries.includes(action.payload)) {
        state.favouriteItineraries.push(action.payload)
      }
    },
    removeFavouriteItinerary: (state, action: PayloadAction<string>) => {
      state.favouriteItineraries = state.favouriteItineraries.filter(id => id !== action.payload)
    },
    addFavouriteTrack: (state, action: PayloadAction<string>) => {
      if (!state.favouriteTracks.includes(action.payload)) {
        state.favouriteTracks.push(action.payload)
      }
    },
    removeFavouriteTrack: (state, action: PayloadAction<string>) => {
      state.favouriteTracks = state.favouriteTracks.filter(id => id !== action.payload)
    },
    
    // Recently played management
    addRecentlyPlayed: (state, action: PayloadAction<string>) => {
      // Remove if already exists
      state.recentlyPlayed = state.recentlyPlayed.filter(id => id !== action.payload)
      // Add to beginning
      state.recentlyPlayed.unshift(action.payload)
      // Keep only last 50 items
      state.recentlyPlayed = state.recentlyPlayed.slice(0, 50)
    },
    clearRecentlyPlayed: (state) => {
      state.recentlyPlayed = []
    },
    
    // Downloaded content management
    addDownloadedContent: (state, action: PayloadAction<string>) => {
      if (!state.downloadedContent.includes(action.payload)) {
        state.downloadedContent.push(action.payload)
      }
    },
    removeDownloadedContent: (state, action: PayloadAction<string>) => {
      state.downloadedContent = state.downloadedContent.filter(id => id !== action.payload)
    },
    
    // Onboarding & tutorial
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true
    },
    completeTutorial: (state) => {
      state.hasSeenTutorial = true
    },
    completeTutorialStep: (state, action: PayloadAction<string>) => {
      if (!state.tutorialStepsCompleted.includes(action.payload)) {
        state.tutorialStepsCompleted.push(action.payload)
      }
    },
    resetOnboarding: (state) => {
      state.hasCompletedOnboarding = false
      state.hasSeenTutorial = false
      state.tutorialStepsCompleted = []
    },
    
    // Bulk updates
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferencesState>>) => {
      return { ...state, ...action.payload }
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    
    // Reset
    resetToDefaults: () => {
      return initialState
    },
  },
})

export const {
  setLanguage,
  setTheme,
  setDefaultPlaybackRate,
  setDefaultVolume,
  setAutoPlay,
  setDownloadQuality,
  setEnableLocationServices,
  setShowNearbyRadius,
  setMapDefaultZoom,
  setEnableGeofencing,
  setEnablePushNotifications,
  setEnableLocationNotifications,
  setEnableDownloadNotifications,
  setEnableHighContrast,
  setFontSize,
  setEnableScreenReader,
  setAllowCellularDownloads,
  setAutoDeleteListenedTracks,
  setMaxStorageUsage,
  setEnableAnalytics,
  setEnableCrashReporting,
  addFavouriteItinerary,
  removeFavouriteItinerary,
  addFavouriteTrack,
  removeFavouriteTrack,
  addRecentlyPlayed,
  clearRecentlyPlayed,
  addDownloadedContent,
  removeDownloadedContent,
  completeOnboarding,
  completeTutorial,
  completeTutorialStep,
  resetOnboarding,
  updatePreferences,
  setLoading,
  setError,
  clearError,
  resetToDefaults,
} = userPreferencesSlice.actions

export default userPreferencesSlice.reducer