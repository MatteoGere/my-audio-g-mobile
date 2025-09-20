import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Database } from '../../types/supabase-types';

export type AudioTrack = Database['public']['Tables']['audio_track']['Row'];
export type AudioItinerary = Database['public']['Tables']['audio_itinerary']['Row'];

export interface PlaylistTrack extends AudioTrack {
  signedUrl?: string;
  signedUrlExpiry?: number;
  isDownloaded?: boolean;
  downloadUrl?: string;
}

export interface QueueTrack extends PlaylistTrack {
  queueId: string;
  addedAt: number;
  source: 'user' | 'auto' | 'radio';
}

export interface TrackHistory {
  track: PlaylistTrack;
  playedAt: number;
  duration: number;
  completionRate: number; // 0-1, how much of the track was played
  skipped: boolean;
}

export interface AudioEffectsState {
  enabled: boolean;
  equalizer: {
    enabled: boolean;
    bands: number[]; // 10-band EQ values (-12 to +12 dB)
    preset: string;
  };
  playbackRate: number;
  crossfade: {
    enabled: boolean;
    duration: number;
  };
}

export interface AudioPlayerState {
  // Current playback
  currentTrack: PlaylistTrack | null;
  currentItinerary: AudioItinerary | null;
  playlist: PlaylistTrack[];
  currentIndex: number;

  // Queue management
  queue: QueueTrack[];
  originalPlaylist: PlaylistTrack[]; // Original order before shuffle
  shuffleIndices: number[]; // Shuffled order indices

  // History and analytics
  history: TrackHistory[];
  maxHistorySize: number;

  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isSeeking: boolean;
  currentTime: number;
  duration: number;
  bufferedTime: number;
  volume: number;

  // Player modes
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  autoPlay: boolean;
  smartShuffle: boolean; // Intelligent shuffle considering history

  // Audio effects
  effects: AudioEffectsState;

  // Background playback and media session
  isBackground: boolean;
  mediaSessionEnabled: boolean;

  // Network and caching
  isOfflineMode: boolean;
  preloadNext: boolean;
  
  // Error handling
  error: string | null;
  lastErrorTime: number | null;
}

const initialState: AudioPlayerState = {
  // Current playback
  currentTrack: null,
  currentItinerary: null,
  playlist: [],
  currentIndex: -1,

  // Queue management
  queue: [],
  originalPlaylist: [],
  shuffleIndices: [],

  // History and analytics
  history: [],
  maxHistorySize: 100,

  // Playback state
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  isSeeking: false,
  currentTime: 0,
  duration: 0,
  bufferedTime: 0,
  volume: 1.0,

  // Player modes
  shuffle: false,
  repeat: 'none',
  autoPlay: true,
  smartShuffle: false,

  // Audio effects
  effects: {
    enabled: false,
    equalizer: {
      enabled: false,
      bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10-band EQ
      preset: 'flat',
    },
    playbackRate: 1.0,
    crossfade: {
      enabled: false,
      duration: 3,
    },
  },

  // Background playback and media session
  isBackground: false,
  mediaSessionEnabled: false,

  // Network and caching
  isOfflineMode: false,
  preloadNext: true,

  // Error handling
  error: null,
  lastErrorTime: null,
};

const audioPlayerSlice = createSlice({
  name: 'audioPlayer',
  initialState,
  reducers: {
    // Playlist management
    setPlaylist: (
      state,
      action: PayloadAction<{ tracks: PlaylistTrack[]; itinerary: AudioItinerary; shuffle?: boolean }>,
    ) => {
      state.playlist = action.payload.tracks;
      state.originalPlaylist = [...action.payload.tracks];
      state.currentItinerary = action.payload.itinerary;
      state.currentIndex = -1;
      state.currentTrack = null;
      
      // Apply shuffle if requested
      if (action.payload.shuffle) {
        state.shuffle = true;
        state.shuffleIndices = generateShuffleIndices(action.payload.tracks.length, state.smartShuffle, state.history);
      } else {
        state.shuffleIndices = [];
      }
    },

    addToPlaylist: (state, action: PayloadAction<PlaylistTrack>) => {
      state.playlist.push(action.payload);
      state.originalPlaylist.push(action.payload);
      
      // Update shuffle indices if shuffle is enabled
      if (state.shuffle) {
        state.shuffleIndices = generateShuffleIndices(state.playlist.length, state.smartShuffle, state.history);
      }
    },

    removeFromPlaylist: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const removedTrack = state.playlist[index];
      
      state.playlist.splice(index, 1);
      
      // Remove from original playlist
      const originalIndex = state.originalPlaylist.findIndex(t => t.id === removedTrack.id);
      if (originalIndex !== -1) {
        state.originalPlaylist.splice(originalIndex, 1);
      }

      // Update shuffle indices
      if (state.shuffle) {
        state.shuffleIndices = generateShuffleIndices(state.playlist.length, state.smartShuffle, state.history);
      }

      // Adjust current index if necessary
      if (state.currentIndex > index) {
        state.currentIndex -= 1;
      } else if (state.currentIndex === index) {
        state.currentTrack = null;
        state.currentIndex = -1;
      }
    },

    // Queue management
    addToQueue: (state, action: PayloadAction<{ track: PlaylistTrack; source?: 'user' | 'auto' | 'radio' }>) => {
      const queueTrack: QueueTrack = {
        ...action.payload.track,
        queueId: `queue_${Date.now()}_${Math.random()}`,
        addedAt: Date.now(),
        source: action.payload.source || 'user',
      };
      state.queue.push(queueTrack);
    },

    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(track => track.queueId !== action.payload);
    },

    clearQueue: (state) => {
      state.queue = [];
    },

    reorderQueue: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const track = state.queue.splice(fromIndex, 1)[0];
      state.queue.splice(toIndex, 0, track);
    },

    // Shuffle and repeat
    setShuffle: (state, action: PayloadAction<boolean>) => {
      state.shuffle = action.payload;
      if (action.payload) {
        state.shuffleIndices = generateShuffleIndices(state.playlist.length, state.smartShuffle, state.history);
      } else {
        state.shuffleIndices = [];
      }
    },

    setSmartShuffle: (state, action: PayloadAction<boolean>) => {
      state.smartShuffle = action.payload;
      if (state.shuffle) {
        state.shuffleIndices = generateShuffleIndices(state.playlist.length, action.payload, state.history);
      }
    },

    setRepeat: (state, action: PayloadAction<'none' | 'one' | 'all'>) => {
      state.repeat = action.payload;
    },

    // Audio effects
    updateEqualizer: (state, action: PayloadAction<{ band: number; gain: number }>) => {
      const { band, gain } = action.payload;
      if (band >= 0 && band < state.effects.equalizer.bands.length) {
        state.effects.equalizer.bands[band] = gain;
      }
    },

    setEqualizerPreset: (state, action: PayloadAction<'rock' | 'pop' | 'jazz' | 'classical' | 'bass' | 'treble' | 'vocal' | 'custom'>) => {
      state.effects.equalizer.preset = action.payload;
      
      // Apply preset values
      const presets = {
        rock: [4, 3, -1, -2, 1, 2, 4, 5, 5, 4],
        pop: [2, 1, 0, -1, -2, -1, 0, 1, 2, 3],
        jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
        classical: [4, 3, 2, 1, -1, -2, -1, 2, 3, 4],
        bass: [6, 5, 4, 2, 0, -1, -2, -3, -3, -3],
        treble: [-3, -3, -2, -1, 0, 2, 4, 5, 6, 6],
        vocal: [-1, -2, -3, -1, 2, 3, 3, 2, 1, 0],
        custom: state.effects.equalizer.bands, // Keep current values
      };
      
      if (action.payload !== 'custom') {
        state.effects.equalizer.bands = presets[action.payload];
      }
    },

    setCrossfadeTime: (state, action: PayloadAction<number>) => {
      state.effects.crossfade.duration = Math.max(0, Math.min(10, action.payload)); // 0-10 seconds
    },

    setAudioEffects: (state, action: PayloadAction<Partial<AudioEffectsState>>) => {
      state.effects = { ...state.effects, ...action.payload };
    },

    // History management
    addToHistory: (state, action: PayloadAction<{ track: PlaylistTrack; duration: number; completionRate: number }>) => {
      const { track, duration, completionRate } = action.payload;
      const newEntry: TrackHistory = {
        track,
        playedAt: Date.now(),
        duration,
        completionRate,
        skipped: completionRate < 0.8, // Consider skipped if less than 80% played
      };
      
      const updatedHistory = [...state.history, newEntry];
      // Keep only last 100 entries
      state.history = updatedHistory.slice(-100);
    },

    clearHistory: (state) => {
      state.history = [];
    },

    // Existing actions (fix property names)
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    resetPlayer: (state) => {
      state.currentTrack = null;
      state.currentIndex = -1;
      state.isPlaying = false;
      state.isLoading = false;
      state.error = null;
      state.queue = [];
      state.history = [];
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
  },
});

export const {
  setPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  addToQueue,
  removeFromQueue,
  clearQueue,
  reorderQueue,
  playTrack,
  play,
  pause,
  stop,
  nextTrack,
  previousTrack,
  setCurrentTime,
  setDuration,
  setVolume,
  setShuffle,
  setSmartShuffle,
  setRepeat,
  updateEqualizer,
  setEqualizerPreset,
  setCrossfadeTime,
  setAudioEffects,
  addToHistory,
  clearHistory,
  setLoading,
  setError,
  clearError,
  resetPlayer,
} = audioPlayerSlice.actions;

// Utility functions
const generateShuffleIndices = (
  playlistLength: number, 
  smartShuffle: boolean, 
  history: TrackHistory[]
): number[] => {
  if (playlistLength === 0) return [];
  
  const indices = Array.from({ length: playlistLength }, (_, i) => i);
  
  if (!smartShuffle) {
    // Simple random shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }
  
  // Smart shuffle: avoid recently played tracks
  const recentlyPlayed = new Set(
    history
      .slice(-Math.min(10, Math.floor(playlistLength * 0.3))) // Last 30% or 10 tracks
      .map(h => h.track.id)
  );
  
  const availableIndices = indices.filter((_, index) => !recentlyPlayed.has(index.toString()));
  const recentIndices = indices.filter((_, index) => recentlyPlayed.has(index.toString()));
  
  // Shuffle available tracks first
  for (let i = availableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
  }
  
  // Add recent tracks at the end
  return [...availableIndices, ...recentIndices];
};

const addTrackToHistory = (
  history: TrackHistory[], 
  track: PlaylistTrack, 
  duration: number, 
  completionRate: number
): TrackHistory[] => {
  const newEntry: TrackHistory = {
    track,
    playedAt: Date.now(),
    duration,
    completionRate,
    skipped: completionRate < 0.8, // Consider skipped if less than 80% played
  };
  
  const updatedHistory = [...history, newEntry];
  
  // Keep only last 100 entries
  return updatedHistory.slice(-100);
};

// Selector functions (will need RootState import from store)
export const selectIsPlaying = (state: any) => state.audioPlayer.playing;
export const selectCurrentTrack = (state: any) => state.audioPlayer.currentTrack;
export const selectCurrentPlaylist = (state: any) => state.audioPlayer.playlist;
export const selectCurrentQueue = (state: any) => state.audioPlayer.queue;
export const selectCurrentIndex = (state: any) => state.audioPlayer.currentIndex;
export const selectRepeatMode = (state: any) => state.audioPlayer.repeat;
export const selectShuffleMode = (state: any) => state.audioPlayer.shuffle;
export const selectAudioEffects = (state: any) => state.audioPlayer.effects;
export const selectPlaybackHistory = (state: any) => state.audioPlayer.history;

export default audioPlayerSlice.reducer;
