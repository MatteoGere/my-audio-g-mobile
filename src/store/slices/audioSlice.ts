import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Tables } from '../../types/supabase-types';

export interface AudioState {
  // Current playback
  currentTrack: Tables<'audio_track'> | null;
  currentItineraryId: string | null;
  playlist: Tables<'audio_track'>[];
  currentTrackIndex: number;

  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isBuffering: boolean;

  // Progress and timing
  currentTime: number;
  duration: number;
  progress: number; // 0-100

  // Audio settings
  volume: number; // 0-1
  playbackRate: number; // 0.5-2.0
  isMuted: boolean;

  // Queue management
  repeatMode: 'off' | 'one' | 'all';
  shuffleMode: boolean;

  // Download and offline
  downloadedTracks: string[]; // track IDs
  isDownloading: string[]; // track IDs currently downloading

  // Error handling
  error: string | null;
}

const initialState: AudioState = {
  currentTrack: null,
  currentItineraryId: null,
  playlist: [],
  currentTrackIndex: 0,
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  isBuffering: false,
  currentTime: 0,
  duration: 0,
  progress: 0,
  volume: 1,
  playbackRate: 1,
  isMuted: false,
  repeatMode: 'off',
  shuffleMode: false,
  downloadedTracks: [],
  isDownloading: [],
  error: null,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    // Playback control
    play: (state) => {
      state.isPlaying = true;
      state.isPaused = false;
    },
    pause: (state) => {
      state.isPlaying = false;
      state.isPaused = true;
    },
    stop: (state) => {
      state.isPlaying = false;
      state.isPaused = false;
      state.currentTime = 0;
      state.progress = 0;
    },

    // Track management
    setCurrentTrack: (state, action: PayloadAction<Tables<'audio_track'> | null>) => {
      state.currentTrack = action.payload;
      state.currentTime = 0;
      state.progress = 0;
    },
    setPlaylist: (
      state,
      action: PayloadAction<{ tracks: Tables<'audio_track'>[]; itineraryId: string }>,
    ) => {
      state.playlist = action.payload.tracks;
      state.currentItineraryId = action.payload.itineraryId;
      state.currentTrackIndex = 0;
    },
    setCurrentTrackIndex: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.playlist.length) {
        state.currentTrackIndex = action.payload;
        state.currentTrack = state.playlist[action.payload];
        state.currentTime = 0;
        state.progress = 0;
      }
    },

    // Navigation
    nextTrack: (state) => {
      if (state.shuffleMode) {
        // Random next track
        const randomIndex = Math.floor(Math.random() * state.playlist.length);
        state.currentTrackIndex = randomIndex;
      } else {
        // Sequential next
        if (state.currentTrackIndex < state.playlist.length - 1) {
          state.currentTrackIndex += 1;
        } else if (state.repeatMode === 'all') {
          state.currentTrackIndex = 0;
        }
      }

      if (state.playlist[state.currentTrackIndex]) {
        state.currentTrack = state.playlist[state.currentTrackIndex];
        state.currentTime = 0;
        state.progress = 0;
      }
    },
    previousTrack: (state) => {
      if (state.currentTrackIndex > 0) {
        state.currentTrackIndex -= 1;
        state.currentTrack = state.playlist[state.currentTrackIndex];
        state.currentTime = 0;
        state.progress = 0;
      } else if (state.repeatMode === 'all') {
        state.currentTrackIndex = state.playlist.length - 1;
        state.currentTrack = state.playlist[state.currentTrackIndex];
        state.currentTime = 0;
        state.progress = 0;
      }
    },

    // Progress and timing
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
      if (state.duration > 0) {
        state.progress = (action.payload / state.duration) * 100;
      }
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    seek: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
      if (state.duration > 0) {
        state.progress = (action.payload / state.duration) * 100;
      }
    },

    // Audio settings
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = Math.max(0.5, Math.min(2, action.payload));
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },

    // Playback modes
    setRepeatMode: (state, action: PayloadAction<'off' | 'one' | 'all'>) => {
      state.repeatMode = action.payload;
    },
    toggleShuffle: (state) => {
      state.shuffleMode = !state.shuffleMode;
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setBuffering: (state, action: PayloadAction<boolean>) => {
      state.isBuffering = action.payload;
    },

    // Download management
    addDownloadedTrack: (state, action: PayloadAction<string>) => {
      if (!state.downloadedTracks.includes(action.payload)) {
        state.downloadedTracks.push(action.payload);
      }
    },
    removeDownloadedTrack: (state, action: PayloadAction<string>) => {
      state.downloadedTracks = state.downloadedTracks.filter((id) => id !== action.payload);
    },
    addDownloading: (state, action: PayloadAction<string>) => {
      if (!state.isDownloading.includes(action.payload)) {
        state.isDownloading.push(action.payload);
      }
    },
    removeDownloading: (state, action: PayloadAction<string>) => {
      state.isDownloading = state.isDownloading.filter((id) => id !== action.payload);
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Reset
    reset: () => {
      return initialState;
    },
  },
});

export const {
  play,
  pause,
  stop,
  setCurrentTrack,
  setPlaylist,
  setCurrentTrackIndex,
  nextTrack,
  previousTrack,
  setCurrentTime,
  setDuration,
  seek,
  setVolume,
  setPlaybackRate,
  toggleMute,
  setRepeatMode,
  toggleShuffle,
  setLoading,
  setBuffering,
  addDownloadedTrack,
  removeDownloadedTrack,
  addDownloading,
  removeDownloading,
  setError,
  clearError,
  reset,
} = audioSlice.actions;

export default audioSlice.reducer;
