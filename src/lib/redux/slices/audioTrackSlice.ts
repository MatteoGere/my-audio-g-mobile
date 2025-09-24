import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for audio track signed URLs
export interface SignedUrlEntry {
  url: string;
  expiresAt: number; // millisecond timestamp
}

export interface AudioTrackState {
  signedUrls: Record<string, SignedUrlEntry>; // key: path
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AudioTrackState = {
  signedUrls: {},
  isLoading: false,
  error: null,
};

// Audio track slice for signed URL management
export const audioTrackSlice = createSlice({
  name: 'audioTrack',
  initialState,
  reducers: {
    // Set signed URL for audio track
    setSignedAudioUrl: (
      state,
      action: PayloadAction<{
        path: string;
        url: string;
        expiresIn: number; // seconds
      }>,
    ) => {
      const { path, url, expiresIn } = action.payload;
      const expiresAt = Date.now() + expiresIn * 1000;

      state.signedUrls[path] = {
        url,
        expiresAt,
      };
      state.error = null;
    },

    // Set multiple signed URLs for audio tracks
    setSignedAudioUrls: (
      state,
      action: PayloadAction<
        Array<{
          path: string;
          url: string;
          expiresIn: number;
        }>
      >,
    ) => {
      action.payload.forEach(({ path, url, expiresIn }) => {
        const expiresAt = Date.now() + expiresIn * 1000;

        state.signedUrls[path] = {
          url,
          expiresAt,
        };
      });
      state.error = null;
    },

    // Remove signed URL for audio track
    removeSignedAudioUrl: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      delete state.signedUrls[path];
    },

    // Clear expired audio URLs
    clearExpiredAudioUrls: (state) => {
      const now = Date.now();
      const validUrls: Record<string, SignedUrlEntry> = {};

      Object.entries(state.signedUrls).forEach(([path, entry]) => {
        if (entry.expiresAt > now) {
          validUrls[path] = entry;
        }
      });

      state.signedUrls = validUrls;
    },

    // Clear all audio URLs
    clearAllAudioUrls: (state) => {
      state.signedUrls = {};
    },

    // Batch update for multiple URLs (for performance)
    batchUpdateAudioUrls: (
      state,
      action: PayloadAction<{
        add?: Array<{ path: string; url: string; expiresIn: number }>;
        remove?: string[];
        clearExpired?: boolean;
      }>,
    ) => {
      const { add, remove, clearExpired } = action.payload;

      // Clear expired first if requested
      if (clearExpired) {
        const now = Date.now();
        Object.keys(state.signedUrls).forEach((path) => {
          if (state.signedUrls[path].expiresAt <= now) {
            delete state.signedUrls[path];
          }
        });
      }

      // Remove specified URLs
      if (remove) {
        remove.forEach((path) => {
          delete state.signedUrls[path];
        });
      }

      // Add new URLs
      if (add) {
        add.forEach(({ path, url, expiresIn }) => {
          const expiresAt = Date.now() + expiresIn * 1000;
          state.signedUrls[path] = { url, expiresAt };
        });
      }

      state.error = null;
    },

    // Loading states
    setAudioUrlsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Error handling
    setAudioUrlsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAudioUrlsError: (state) => {
      state.error = null;
    },

    // Hydration from localStorage
    hydrateAudioUrlsFromStorage: (state, action: PayloadAction<Record<string, SignedUrlEntry>>) => {
      // Only restore non-expired URLs
      const now = Date.now();
      const validUrls: Record<string, SignedUrlEntry> = {};

      Object.entries(action.payload).forEach(([path, entry]) => {
        if (entry.expiresAt > now) {
          validUrls[path] = entry;
        }
      });

      state.signedUrls = validUrls;
    },

    // Reset state
    resetAudioUrls: () => initialState,
  },
});

// Export actions
export const {
  setSignedAudioUrl,
  setSignedAudioUrls,
  removeSignedAudioUrl,
  clearExpiredAudioUrls,
  clearAllAudioUrls,
  batchUpdateAudioUrls,
  setAudioUrlsLoading,
  setAudioUrlsError,
  clearAudioUrlsError,
  hydrateAudioUrlsFromStorage,
  resetAudioUrls,
} = audioTrackSlice.actions;

// Selectors
export const selectSignedAudioUrl = (state: { audioTrack: AudioTrackState }, path: string) => {
  const entry = state.audioTrack.signedUrls[path];

  // Return null if expired or doesn't exist
  if (!entry || entry.expiresAt <= Date.now()) {
    return null;
  }

  return entry.url;
};

export const selectSignedAudioUrlEntry = (state: { audioTrack: AudioTrackState }, path: string) => {
  return state.audioTrack.signedUrls[path] || null;
};

export const selectIsAudioUrlExpired = (state: { audioTrack: AudioTrackState }, path: string) => {
  const entry = state.audioTrack.signedUrls[path];

  if (!entry) return true;
  return entry.expiresAt <= Date.now();
};

export const selectIsAudioUrlNearExpiry = (
  state: { audioTrack: AudioTrackState },
  path: string,
  thresholdMinutes: number = 5,
) => {
  const entry = state.audioTrack.signedUrls[path];

  if (!entry) return true;

  const threshold = Date.now() + thresholdMinutes * 60 * 1000;
  return entry.expiresAt <= threshold;
};

export const selectAudioUrlsLoading = (state: { audioTrack: AudioTrackState }) =>
  state.audioTrack.isLoading;
export const selectAudioUrlsError = (state: { audioTrack: AudioTrackState }) =>
  state.audioTrack.error;
export const selectAllAudioUrls = (state: { audioTrack: AudioTrackState }) =>
  state.audioTrack.signedUrls;

// Utility selectors
export const selectValidAudioUrls = (state: { audioTrack: AudioTrackState }) => {
  const now = Date.now();
  const validUrls: Record<string, SignedUrlEntry> = {};

  Object.entries(state.audioTrack.signedUrls).forEach(([path, entry]) => {
    if (entry.expiresAt > now) {
      validUrls[path] = entry;
    }
  });

  return validUrls;
};

export const selectExpiredAudioUrls = (state: { audioTrack: AudioTrackState }) => {
  const now = Date.now();
  const expiredPaths: string[] = [];

  Object.entries(state.audioTrack.signedUrls).forEach(([path, entry]) => {
    if (entry.expiresAt <= now) {
      expiredPaths.push(path);
    }
  });

  return expiredPaths;
};

export const selectAudioUrlsNearExpiry = (
  state: { audioTrack: AudioTrackState },
  thresholdMinutes: number = 5,
) => {
  const threshold = Date.now() + thresholdMinutes * 60 * 1000;
  const nearExpiryPaths: string[] = [];

  Object.entries(state.audioTrack.signedUrls).forEach(([path, entry]) => {
    if (entry.expiresAt <= threshold) {
      nearExpiryPaths.push(path);
    }
  });

  return nearExpiryPaths;
};

export default audioTrackSlice.reducer;
