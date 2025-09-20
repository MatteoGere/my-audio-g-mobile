import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SignedUrl {
  url: string;
  expiresAt: number;
  storageKey: string;
  type: 'audio' | 'image';
}

export interface SignedUrlCacheState {
  urls: Record<string, SignedUrl>;
  loading: Record<string, boolean>;
  error: string | null;
}

const initialState: SignedUrlCacheState = {
  urls: {},
  loading: {},
  error: null,
};

// Cache signed URLs for 50 minutes (3000 seconds) for 60-minute URLs
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes in milliseconds

const signedUrlCacheSlice = createSlice({
  name: 'signedUrlCache',
  initialState,
  reducers: {
    setSignedUrl: (
      state,
      action: PayloadAction<{
        storageKey: string;
        url: string;
        type: 'audio' | 'image';
      }>,
    ) => {
      const { storageKey, url, type } = action.payload;
      state.urls[storageKey] = {
        url,
        type,
        storageKey,
        expiresAt: Date.now() + CACHE_DURATION,
      };
      state.loading[storageKey] = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<{ storageKey: string; loading: boolean }>) => {
      const { storageKey, loading } = action.payload;
      state.loading[storageKey] = loading;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      // Clear all loading states on error
      state.loading = {};
    },
    removeExpiredUrls: (state) => {
      const now = Date.now();
      Object.keys(state.urls).forEach((key) => {
        if (state.urls[key].expiresAt <= now) {
          delete state.urls[key];
          delete state.loading[key];
        }
      });
    },
    invalidateUrl: (state, action: PayloadAction<string>) => {
      const storageKey = action.payload;
      delete state.urls[storageKey];
      delete state.loading[storageKey];
    },
    clearCache: (state) => {
      state.urls = {};
      state.loading = {};
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSignedUrl,
  setLoading,
  setError,
  removeExpiredUrls,
  invalidateUrl,
  clearCache,
  clearError,
} = signedUrlCacheSlice.actions;

// Selectors
export const selectSignedUrl = (
  state: { signedUrlCache: SignedUrlCacheState },
  storageKey: string,
) => {
  const cached = state.signedUrlCache.urls[storageKey];
  if (!cached) return null;

  // Check if expired
  if (cached.expiresAt <= Date.now()) {
    return null;
  }

  return cached.url;
};

export const selectIsUrlLoading = (
  state: { signedUrlCache: SignedUrlCacheState },
  storageKey: string,
) => {
  return state.signedUrlCache.loading[storageKey] || false;
};

export default signedUrlCacheSlice.reducer;
