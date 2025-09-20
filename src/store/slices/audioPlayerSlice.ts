import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Database } from '../../types/supabase-types';

export type AudioTrack = Database['public']['Tables']['audio_track']['Row'];
export type AudioItinerary = Database['public']['Tables']['audio_itinerary']['Row'];

export interface PlaylistTrack extends AudioTrack {
  signedUrl?: string;
}

export interface AudioPlayerState {
  // Current playback
  currentTrack: PlaylistTrack | null;
  currentItinerary: AudioItinerary | null;
  playlist: PlaylistTrack[];
  currentIndex: number;

  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;

  // Player modes
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';

  // Background playback
  isBackground: boolean;

  // Error handling
  error: string | null;
}

const initialState: AudioPlayerState = {
  // Current playback
  currentTrack: null,
  currentItinerary: null,
  playlist: [],
  currentIndex: -1,

  // Playback state
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: 1.0,

  // Player modes
  shuffle: false,
  repeat: 'none',

  // Background playback
  isBackground: false,

  // Error handling
  error: null,
};

const audioPlayerSlice = createSlice({
  name: 'audioPlayer',
  initialState,
  reducers: {
    // Playlist management
    setPlaylist: (
      state,
      action: PayloadAction<{ tracks: PlaylistTrack[]; itinerary: AudioItinerary }>,
    ) => {
      state.playlist = action.payload.tracks;
      state.currentItinerary = action.payload.itinerary;
      state.currentIndex = -1;
      state.currentTrack = null;
    },

    addToPlaylist: (state, action: PayloadAction<PlaylistTrack>) => {
      state.playlist.push(action.payload);
    },

    removeFromPlaylist: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.playlist.splice(index, 1);

      // Adjust current index if necessary
      if (state.currentIndex > index) {
        state.currentIndex -= 1;
      } else if (state.currentIndex === index) {
        state.currentTrack = null;
        state.currentIndex = -1;
      }
    },

    // Track playback
    playTrack: (state, action: PayloadAction<{ index: number; track: PlaylistTrack }>) => {
      state.currentIndex = action.payload.index;
      state.currentTrack = action.payload.track;
      state.isPlaying = true;
      state.isPaused = false;
      state.error = null;
    },

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
    },

    // Navigation
    nextTrack: (state) => {
      if (state.playlist.length === 0) return;

      let nextIndex = state.currentIndex + 1;

      if (nextIndex >= state.playlist.length) {
        if (state.repeat === 'all') {
          nextIndex = 0;
        } else {
          return; // End of playlist
        }
      }

      state.currentIndex = nextIndex;
      state.currentTrack = state.playlist[nextIndex];
    },

    previousTrack: (state) => {
      if (state.playlist.length === 0) return;

      let prevIndex = state.currentIndex - 1;

      if (prevIndex < 0) {
        if (state.repeat === 'all') {
          prevIndex = state.playlist.length - 1;
        } else {
          return; // Beginning of playlist
        }
      }

      state.currentIndex = prevIndex;
      state.currentTrack = state.playlist[prevIndex];
    },

    // Playback state
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },

    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Player modes
    setShuffle: (state, action: PayloadAction<boolean>) => {
      state.shuffle = action.payload;
    },

    setRepeat: (state, action: PayloadAction<'none' | 'one' | 'all'>) => {
      state.repeat = action.payload;
    },

    // Background playback
    setBackground: (state, action: PayloadAction<boolean>) => {
      state.isBackground = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Reset player
    resetPlayer: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  playTrack,
  play,
  pause,
  stop,
  nextTrack,
  previousTrack,
  setCurrentTime,
  setDuration,
  setVolume,
  setLoading,
  setShuffle,
  setRepeat,
  setBackground,
  setError,
  clearError,
  resetPlayer,
} = audioPlayerSlice.actions;

export default audioPlayerSlice.reducer;
