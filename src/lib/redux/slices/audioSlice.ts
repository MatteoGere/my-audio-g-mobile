import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioTrack } from './itinerariesSlice';
import {
  PlaybackState as AppPlaybackState,
  QueueItem as AppQueueItem,
} from '@/types/app-types';

// Legacy types for backward compatibility
export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  isMuted: boolean;
}

export interface QueueItem {
  track: AudioTrack;
  index: number;
}

// AudioState - keeping existing structure for compatibility
export interface AudioState {
  // Current playback
  currentTrack: AudioTrack | null;
  currentAudioUrl: string | null;
  playbackState: PlaybackState;

  // Queue management
  queue: QueueItem[];
  currentQueueIndex: number;
  shuffleMode: boolean;
  repeatMode: 'none' | 'one' | 'all';

  // Player UI state
  playerView: 'mini' | 'full' | 'hidden';
  showQueue: boolean;

  // History and progress
  playHistory: string[]; // track IDs
  trackProgress: Record<string, number>; // track_id -> seconds played
  lastPlayedTrackId: string | null;

  // Background play
  isBackgroundEnabled: boolean;
  mediaSessionActive: boolean;

  // Loading and errors
  isLoadingTrack: boolean;
  audioError: string | null;
}

// Initial state
const initialState: AudioState = {
  currentTrack: null,
  currentAudioUrl: null,
  playbackState: {
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 1.0,
    playbackSpeed: 1.0,
    isMuted: false,
  },
  queue: [],
  currentQueueIndex: -1,
  shuffleMode: false,
  repeatMode: 'none',
  playerView: 'hidden',
  showQueue: false,
  playHistory: [],
  trackProgress: {},
  lastPlayedTrackId: null,
  isBackgroundEnabled: true,
  mediaSessionActive: false,
  isLoadingTrack: false,
  audioError: null,
};

// Audio slice
export const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    // Track and URL management
    setCurrentTrack: (state, action: PayloadAction<{ track: AudioTrack; audioUrl?: string }>) => {
      const { track, audioUrl } = action.payload;
      state.currentTrack = track;
      state.currentAudioUrl = audioUrl || null;
      state.audioError = null;
      state.playerView = 'mini';

      // Add to history
      if (track.id && !state.playHistory.includes(track.id)) {
        state.playHistory.unshift(track.id);
        // Keep only last 50 tracks in history
        if (state.playHistory.length > 50) {
          state.playHistory = state.playHistory.slice(0, 50);
        }
      }
    },

    setCurrentAudioUrl: (state, action: PayloadAction<string | null>) => {
      state.currentAudioUrl = action.payload;
    },

    // Playback controls
    play: (state) => {
      state.playbackState.isPlaying = true;
      state.playbackState.isPaused = false;
      state.playbackState.isLoading = false;
    },
    
    pause: (state) => {
      state.playbackState.isPlaying = false;
      state.playbackState.isPaused = true;
    },
    
    stop: (state) => {
      state.playbackState.isPlaying = false;
      state.playbackState.isPaused = false;
      state.playbackState.currentTime = 0;
    },

    // Playback state updates
    updatePlaybackState: (state, action: PayloadAction<Partial<PlaybackState>>) => {
      state.playbackState = { ...state.playbackState, ...action.payload };
    },

    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.playbackState.currentTime = action.payload;
      
      // Update track progress
      if (state.currentTrack?.id) {
        state.trackProgress[state.currentTrack.id] = action.payload;
      }
    },

    setDuration: (state, action: PayloadAction<number>) => {
      state.playbackState.duration = action.payload;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.playbackState.volume = Math.max(0, Math.min(1, action.payload));
    },

    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackState.playbackSpeed = action.payload;
    },

    toggleMute: (state) => {
      state.playbackState.isMuted = !state.playbackState.isMuted;
    },

    // Queue management
    setQueue: (state, action: PayloadAction<QueueItem[]>) => {
      state.queue = action.payload;
    },

    addToQueue: (state, action: PayloadAction<{ track: AudioTrack; index?: number }>) => {
      const { track, index } = action.payload;
      const queueItem: QueueItem = {
        track,
        index: index ?? state.queue.length,
      };
      
      if (index !== undefined) {
        state.queue.splice(index, 0, queueItem);
      } else {
        state.queue.push(queueItem);
      }
    },

    removeFromQueue: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.queue.splice(index, 1);
      
      // Adjust current index if necessary
      if (state.currentQueueIndex > index) {
        state.currentQueueIndex--;
      } else if (state.currentQueueIndex === index) {
        state.currentQueueIndex = Math.min(state.currentQueueIndex, state.queue.length - 1);
      }
    },

    clearQueue: (state) => {
      state.queue = [];
      state.currentQueueIndex = -1;
    },

    setCurrentQueueIndex: (state, action: PayloadAction<number>) => {
      state.currentQueueIndex = action.payload;
    },

    // Navigation
    nextTrack: (state) => {
      if (state.queue.length === 0) return;
      
      let nextIndex;
      if (state.shuffleMode) {
        nextIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        nextIndex = state.currentQueueIndex < state.queue.length - 1 
          ? state.currentQueueIndex + 1 
          : (state.repeatMode === 'all' ? 0 : state.currentQueueIndex);
      }
      
      if (nextIndex !== state.currentQueueIndex) {
        state.currentQueueIndex = nextIndex;
        state.currentTrack = state.queue[nextIndex]?.track || null;
        state.playbackState.currentTime = 0;
        state.audioError = null;
      }
    },

    previousTrack: (state) => {
      if (state.queue.length === 0) return;
      
      let prevIndex;
      if (state.shuffleMode) {
        prevIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        prevIndex = state.currentQueueIndex > 0 
          ? state.currentQueueIndex - 1 
          : (state.repeatMode === 'all' ? state.queue.length - 1 : state.currentQueueIndex);
      }
      
      if (prevIndex !== state.currentQueueIndex) {
        state.currentQueueIndex = prevIndex;
        state.currentTrack = state.queue[prevIndex]?.track || null;
        state.playbackState.currentTime = 0;
        state.audioError = null;
      }
    },

    toggleShuffle: (state) => {
      state.shuffleMode = !state.shuffleMode;
    },

    setRepeatMode: (state, action: PayloadAction<'none' | 'one' | 'all'>) => {
      state.repeatMode = action.payload;
    },

    // UI state
    setPlayerView: (state, action: PayloadAction<'mini' | 'full' | 'hidden'>) => {
      state.playerView = action.payload;
    },

    toggleQueue: (state) => {
      state.showQueue = !state.showQueue;
    },

    setShowQueue: (state, action: PayloadAction<boolean>) => {
      state.showQueue = action.payload;
    },

    // Background and session
    setBackgroundEnabled: (state, action: PayloadAction<boolean>) => {
      state.isBackgroundEnabled = action.payload;
    },

    setMediaSessionActive: (state, action: PayloadAction<boolean>) => {
      state.mediaSessionActive = action.payload;
    },

    // Loading and error states
    setLoadingTrack: (state, action: PayloadAction<boolean>) => {
      state.isLoadingTrack = action.payload;
      state.playbackState.isLoading = action.payload;
      if (action.payload) {
        state.audioError = null;
      }
    },

    setAudioError: (state, action: PayloadAction<string | null>) => {
      state.audioError = action.payload;
      state.isLoadingTrack = false;
      state.playbackState.isLoading = false;
      if (action.payload) {
        state.playbackState.isPlaying = false;
      }
    },

    // Progress tracking
    updateTrackProgress: (state, action: PayloadAction<{ trackId: string; progress: number }>) => {
      const { trackId, progress } = action.payload;
      state.trackProgress[trackId] = progress;
    },

    setLastPlayedTrackId: (state, action: PayloadAction<string | null>) => {
      state.lastPlayedTrackId = action.payload;
    },

    // Reset
    resetAudio: () => initialState,
  },
});

// Export actions
export const {
  setCurrentTrack,
  setCurrentAudioUrl,
  play,
  pause,
  stop,
  updatePlaybackState,
  setCurrentTime,
  setDuration,
  setVolume,
  setPlaybackSpeed,
  toggleMute,
  setQueue,
  addToQueue,
  removeFromQueue,
  clearQueue,
  setCurrentQueueIndex,
  nextTrack,
  previousTrack,
  toggleShuffle,
  setRepeatMode,
  setPlayerView,
  toggleQueue,
  setShowQueue,
  setBackgroundEnabled,
  setMediaSessionActive,
  setLoadingTrack,
  setAudioError,
  updateTrackProgress,
  setLastPlayedTrackId,
  resetAudio,
} = audioSlice.actions;

// Selectors
export const selectCurrentTrack = (state: { audio: AudioState }) => state.audio.currentTrack;
export const selectCurrentAudioUrl = (state: { audio: AudioState }) => state.audio.currentAudioUrl;
export const selectPlaybackState = (state: { audio: AudioState }) => state.audio.playbackState;
export const selectQueue = (state: { audio: AudioState }) => state.audio.queue;
export const selectCurrentQueueIndex = (state: { audio: AudioState }) =>
  state.audio.currentQueueIndex;
export const selectCurrentQueueItem = (state: { audio: AudioState }) => {
  const { queue, currentQueueIndex } = state.audio;
  return queue[currentQueueIndex] || null;
};
export const selectPlayerView = (state: { audio: AudioState }) => state.audio.playerView;
export const selectShuffleMode = (state: { audio: AudioState }) => state.audio.shuffleMode;
export const selectRepeatMode = (state: { audio: AudioState }) => state.audio.repeatMode;
export const selectTrackProgress = (state: { audio: AudioState }, trackId: string) =>
  state.audio.trackProgress[trackId] || 0;

export default audioSlice.reducer;
