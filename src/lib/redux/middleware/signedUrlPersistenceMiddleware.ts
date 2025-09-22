import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// localStorage keys for persistence
const STORAGE_URLS_KEY = 'app:signedUrls:storage';
const AUDIO_URLS_KEY = 'app:signedUrls:audio';

// Debounce utility
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Helper function to save to localStorage safely
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

// Helper function to filter expired entries
const filterExpiredEntries = (urls: Record<string, any>) => {
  const now = Date.now();
  const validUrls: Record<string, any> = {};

  Object.entries(urls).forEach(([key, entry]) => {
    if (entry.expiresAt > now) {
      validUrls[key] = entry;
    }
  });

  return validUrls;
};

// Middleware for persisting signed URLs
export const signedUrlPersistenceMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action: unknown) => {
    const typedAction = action as AnyAction;

    // Debounced save functions to batch multiple updates
    const debouncedSaveStorage = debounce((state: RootState) => {
      const validUrls = filterExpiredEntries(state.storage.signedUrls);
      saveToLocalStorage(STORAGE_URLS_KEY, validUrls);
    }, 250);

    const debouncedSaveAudio = debounce((state: RootState) => {
      const validUrls = filterExpiredEntries(state.audioTrack.signedUrls);
      saveToLocalStorage(AUDIO_URLS_KEY, validUrls);
    }, 250);

    const result = next(action);
    const state = store.getState();

    // Handle storage slice actions
    if (typedAction.type?.startsWith('storage/')) {
      switch (typedAction.type) {
        case 'storage/setSignedUrl':
        case 'storage/setSignedUrls':
        case 'storage/removeSignedUrl':
        case 'storage/clearExpiredUrls':
        case 'storage/clearBucketUrls':
          debouncedSaveStorage(state);
          break;
        case 'storage/clearAllUrls':
        case 'storage/resetStorage':
          try {
            localStorage.removeItem(STORAGE_URLS_KEY);
          } catch (error) {
            console.warn('Failed to clear storage URLs from localStorage:', error);
          }
          break;
      }
    }

    // Handle audioTrack slice actions
    if (typedAction.type?.startsWith('audioTrack/')) {
      switch (typedAction.type) {
        case 'audioTrack/setSignedAudioUrl':
        case 'audioTrack/setSignedAudioUrls':
        case 'audioTrack/removeSignedAudioUrl':
        case 'audioTrack/clearExpiredAudioUrls':
        case 'audioTrack/batchUpdateAudioUrls':
          debouncedSaveAudio(state);
          break;
        case 'audioTrack/clearAllAudioUrls':
        case 'audioTrack/resetAudioUrls':
          try {
            localStorage.removeItem(AUDIO_URLS_KEY);
          } catch (error) {
            console.warn('Failed to clear audio URLs from localStorage:', error);
          }
          break;
      }
    }

    // Handle auth logout - clear all cached URLs
    if (typedAction.type === 'auth/logout') {
      try {
        localStorage.removeItem(STORAGE_URLS_KEY);
        localStorage.removeItem(AUDIO_URLS_KEY);
      } catch (error) {
        console.warn('Failed to clear signed URLs from localStorage on logout:', error);
      }
    }

    return result;
  };

// Hydration functions to restore cache from localStorage
export const hydrateSignedUrlCaches = (store: any) => {
  // Skip hydration during SSR
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Hydrate storage URLs
    const storageUrls = localStorage.getItem(STORAGE_URLS_KEY);
    if (storageUrls) {
      const parsedStorageUrls = JSON.parse(storageUrls);
      const validStorageUrls = filterExpiredEntries(parsedStorageUrls);

      if (Object.keys(validStorageUrls).length > 0) {
        store.dispatch({
          type: 'storage/hydrateFromStorage',
          payload: validStorageUrls,
        });
      }
    }

    // Hydrate audio URLs
    const audioUrls = localStorage.getItem(AUDIO_URLS_KEY);
    if (audioUrls) {
      const parsedAudioUrls = JSON.parse(audioUrls);
      const validAudioUrls = filterExpiredEntries(parsedAudioUrls);

      if (Object.keys(validAudioUrls).length > 0) {
        store.dispatch({
          type: 'audioTrack/hydrateAudioUrlsFromStorage',
          payload: validAudioUrls,
        });
      }
    }
  } catch (error) {
    console.warn('Failed to hydrate signed URL caches from localStorage:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_URLS_KEY);
      localStorage.removeItem(AUDIO_URLS_KEY);
    } catch (clearError) {
      console.warn('Failed to clear corrupted localStorage data:', clearError);
    }
  }
};

// Cleanup function to manually clear expired URLs from localStorage
export const cleanupExpiredUrls = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Clean storage URLs
    const storageUrls = localStorage.getItem(STORAGE_URLS_KEY);
    if (storageUrls) {
      const parsedStorageUrls = JSON.parse(storageUrls);
      const validStorageUrls = filterExpiredEntries(parsedStorageUrls);

      if (Object.keys(validStorageUrls).length !== Object.keys(parsedStorageUrls).length) {
        saveToLocalStorage(STORAGE_URLS_KEY, validStorageUrls);
      }
    }

    // Clean audio URLs
    const audioUrls = localStorage.getItem(AUDIO_URLS_KEY);
    if (audioUrls) {
      const parsedAudioUrls = JSON.parse(audioUrls);
      const validAudioUrls = filterExpiredEntries(parsedAudioUrls);

      if (Object.keys(validAudioUrls).length !== Object.keys(parsedAudioUrls).length) {
        saveToLocalStorage(AUDIO_URLS_KEY, validAudioUrls);
      }
    }
  } catch (error) {
    console.warn('Failed to cleanup expired URLs from localStorage:', error);
  }
};

// Set up periodic cleanup (every 5 minutes)
export const setupPeriodicCleanup = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const interval = setInterval(cleanupExpiredUrls, 5 * 60 * 1000); // 5 minutes

  // Return cleanup function
  return () => clearInterval(interval);
};

export default signedUrlPersistenceMiddleware;
