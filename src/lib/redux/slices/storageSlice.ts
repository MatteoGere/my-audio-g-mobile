import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for storage signed URLs
export interface StorageSignedUrlEntry {
  url: string;
  expiresAt: number; // millisecond timestamp
  bucket: 'audio-files' | 'image-files';
}

export interface StorageState {
  signedUrls: Record<string, StorageSignedUrlEntry>; // key: ${bucket}:${path}
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: StorageState = {
  signedUrls: {},
  isLoading: false,
  error: null,
};

// Storage slice for signed URL management
export const storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    // Set signed URL
    setSignedUrl: (
      state,
      action: PayloadAction<{
        path: string;
        bucket: 'audio-files' | 'image-files';
        url: string;
        expiresIn: number; // seconds
      }>,
    ) => {
      const { path, bucket, url, expiresIn } = action.payload;
      const key = `${bucket}:${path}`;
      const expiresAt = Date.now() + expiresIn * 1000;

      state.signedUrls[key] = {
        url,
        expiresAt,
        bucket,
      };
      state.error = null;
    },

    // Set multiple signed URLs
    setSignedUrls: (
      state,
      action: PayloadAction<
        Array<{
          path: string;
          bucket: 'audio-files' | 'image-files';
          url: string;
          expiresIn: number;
        }>
      >,
    ) => {
      action.payload.forEach(({ path, bucket, url, expiresIn }) => {
        const key = `${bucket}:${path}`;
        const expiresAt = Date.now() + expiresIn * 1000;

        state.signedUrls[key] = {
          url,
          expiresAt,
          bucket,
        };
      });
      state.error = null;
    },

    // Remove signed URL
    removeSignedUrl: (
      state,
      action: PayloadAction<{
        path: string;
        bucket: 'audio-files' | 'image-files';
      }>,
    ) => {
      const { path, bucket } = action.payload;
      const key = `${bucket}:${path}`;
      delete state.signedUrls[key];
    },

    // Clear expired URLs
    clearExpiredUrls: (state) => {
      const now = Date.now();
      const validUrls: Record<string, StorageSignedUrlEntry> = {};

      Object.entries(state.signedUrls).forEach(([key, entry]) => {
        if (entry.expiresAt > now) {
          validUrls[key] = entry;
        }
      });

      state.signedUrls = validUrls;
    },

    // Clear URLs for specific bucket
    clearBucketUrls: (state, action: PayloadAction<'audio-files' | 'image-files'>) => {
      const bucket = action.payload;
      Object.keys(state.signedUrls).forEach((key) => {
        if (key.startsWith(`${bucket}:`)) {
          delete state.signedUrls[key];
        }
      });
    },

    // Clear all URLs
    clearAllUrls: (state) => {
      state.signedUrls = {};
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Hydration from localStorage
    hydrateFromStorage: (state, action: PayloadAction<Record<string, StorageSignedUrlEntry>>) => {
      // Only restore non-expired URLs
      const now = Date.now();
      const validUrls: Record<string, StorageSignedUrlEntry> = {};

      Object.entries(action.payload).forEach(([key, entry]) => {
        if (entry.expiresAt > now) {
          validUrls[key] = entry;
        }
      });

      state.signedUrls = validUrls;
    },

    // Reset state
    resetStorage: () => initialState,
  },
});

// Export actions
export const {
  setSignedUrl,
  setSignedUrls,
  removeSignedUrl,
  clearExpiredUrls,
  clearBucketUrls,
  clearAllUrls,
  setLoading,
  setError,
  clearError,
  hydrateFromStorage,
  resetStorage,
} = storageSlice.actions;

// Selectors
export const selectSignedUrl = (
  state: { storage: StorageState },
  path: string,
  bucket: 'audio-files' | 'image-files',
) => {
  const key = `${bucket}:${path}`;
  const entry = state.storage.signedUrls[key];

  // Return null if expired or doesn't exist
  if (!entry || entry.expiresAt <= Date.now()) {
    return null;
  }

  return entry.url;
};

export const selectSignedUrlEntry = (
  state: { storage: StorageState },
  path: string,
  bucket: 'audio-files' | 'image-files',
) => {
  const key = `${bucket}:${path}`;
  return state.storage.signedUrls[key] || null;
};

export const selectIsUrlExpired = (
  state: { storage: StorageState },
  path: string,
  bucket: 'audio-files' | 'image-files',
) => {
  const key = `${bucket}:${path}`;
  const entry = state.storage.signedUrls[key];

  if (!entry) return true;
  return entry.expiresAt <= Date.now();
};

export const selectIsUrlNearExpiry = (
  state: { storage: StorageState },
  path: string,
  bucket: 'audio-files' | 'image-files',
  thresholdMinutes: number = 5,
) => {
  const key = `${bucket}:${path}`;
  const entry = state.storage.signedUrls[key];

  if (!entry) return true;

  const threshold = Date.now() + thresholdMinutes * 60 * 1000;
  return entry.expiresAt <= threshold;
};

export const selectStorageLoading = (state: { storage: StorageState }) => state.storage.isLoading;
export const selectStorageError = (state: { storage: StorageState }) => state.storage.error;
export const selectAllStorageUrls = (state: { storage: StorageState }) => state.storage.signedUrls;

// Utility selector to get URLs for a specific bucket
export const selectUrlsForBucket = (
  state: { storage: StorageState },
  bucket: 'audio-files' | 'image-files',
) => {
  const bucketUrls: Record<string, StorageSignedUrlEntry> = {};

  Object.entries(state.storage.signedUrls).forEach(([key, entry]) => {
    if (key.startsWith(`${bucket}:`)) {
      const path = key.replace(`${bucket}:`, '');
      bucketUrls[path] = entry;
    }
  });

  return bucketUrls;
};

export default storageSlice.reducer;
