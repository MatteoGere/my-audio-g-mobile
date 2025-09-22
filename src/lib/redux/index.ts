// Main store and hooks
export * from './store';
export { default as ReduxProvider } from './ReduxProvider';

// Slice exports with aliases to avoid conflicts
export * as authActions from './slices/authSlice';
export * as itinerariesActions from './slices/itinerariesSlice';
export * as audioActions from './slices/audioSlice';
export * as mapActions from './slices/mapSlice';
export * as userPreferencesActions from './slices/userPreferencesSlice';
export * as favoritesActions from './slices/favoritesSlice';
export * as storageActions from './slices/storageSlice';
export * as audioTrackActions from './slices/audioTrackSlice';

// Re-export types from slices
export type { AuthState, User, UserProfile } from './slices/authSlice';
export type {
  ItinerariesState,
  AudioItinerary,
  AudioTrack,
  SearchFilters,
} from './slices/itinerariesSlice';
export type { AudioState, PlaybackState, QueueItem } from './slices/audioSlice';
export type { MapState, LatLng, MapBounds, POI } from './slices/mapSlice';
export type { UserPreferencesState } from './slices/userPreferencesSlice';
export type { FavoritesState, FavoriteItem } from './slices/favoritesSlice';
export type { StorageState, StorageSignedUrlEntry } from './slices/storageSlice';
export type { AudioTrackState, SignedUrlEntry } from './slices/audioTrackSlice';

// API slice and hooks
export * from './api/apiSlice';

// Middleware utilities
export {
  hydrateSignedUrlCaches,
  setupPeriodicCleanup,
  cleanupExpiredUrls,
} from './middleware/signedUrlPersistenceMiddleware';
