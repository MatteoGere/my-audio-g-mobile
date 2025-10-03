// Authentication hooks
export { useAuth, useUserProfile, useUserRole } from './useAuth';

// Signed URL hooks
export {
  useSignedAudioUrl,
  useSignedAudioUrls,
  useSignedUrl,
  useSignedUrls,
  usePreloadSignedUrls,
  useSignedUrlCacheHealth,
} from './useSignedUrls';

// Location hooks
export { useLocation } from './useLocation';

// Map hooks
export { useMapPOIs } from './useMapPOIs';

// Favorites hooks
export { useFavorites } from './useFavorites';

// PWA hooks
export { usePWAInstallPrompt } from './usePWAInstallPrompt';
