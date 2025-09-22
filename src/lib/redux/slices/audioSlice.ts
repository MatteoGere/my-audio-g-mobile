import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioTrack } from './itinerariesSlice';

// Types for audio player
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
  audioUrl?: string;
  index: number;
}

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

  // Audio context and effects
  audioEffects: {
    equalizer: {
      enabled: boolean;
      preset: 'flat' | 'bass' | 'treble' | 'voice' | 'custom';
      bands: number[]; // EQ band values
    };
    skipSilence: boolean;
  };
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
  audioEffects: {
    equalizer: {
      enabled: false,
      preset: 'flat',
      bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10 band EQ
    },
    skipSilence: false,
  },
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
      // Update progress tracking
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
      state.playbackState.playbackSpeed = Math.max(0.25, Math.min(3.0, action.payload));
    },
    toggleMute: (state) => {
      state.playbackState.isMuted = !state.playbackState.isMuted;
    },

    // Queue management
    setQueue: (state, action: PayloadAction<{ tracks: AudioTrack[]; startIndex?: number }>) => {
      const { tracks, startIndex = 0 } = action.payload;
      state.queue = tracks.map((track, index) => ({
        track,
        index,
      }));
      state.currentQueueIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
    },
    addToQueue: (state, action: PayloadAction<AudioTrack[]>) => {
      const newItems = action.payload.map((track, index) => ({
        track,
        index: state.queue.length + index,
      }));
      state.queue.push(...newItems);
    },
    removeFromQueue: (state, action: PayloadAction<number>) => {
      const indexToRemove = action.payload;
      state.queue.splice(indexToRemove, 1);
      // Adjust current index if needed
      if (state.currentQueueIndex > indexToRemove) {
        state.currentQueueIndex--;
      } else if (
        state.currentQueueIndex === indexToRemove &&
        state.currentQueueIndex >= state.queue.length
      ) {
        state.currentQueueIndex = Math.max(0, state.queue.length - 1);
      }
      // Reindex remaining items
      state.queue.forEach((item, index) => {
        item.index = index;
      });
    },
    clearQueue: (state) => {
      state.queue = [];
      state.currentQueueIndex = -1;
    },
    setCurrentQueueIndex: (state, action: PayloadAction<number>) => {
      state.currentQueueIndex = Math.max(0, Math.min(action.payload, state.queue.length - 1));
    },

    // Navigation
    nextTrack: (state) => {
      if (state.queue.length === 0) return;

      if (state.repeatMode === 'one') {
        // Stay on current track
        return;
      }

      if (state.shuffleMode) {
        // Random next track
        const availableIndices = state.queue
          .map((_, i) => i)
          .filter((i) => i !== state.currentQueueIndex);
        if (availableIndices.length > 0) {
          const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          state.currentQueueIndex = randomIndex;
        }
      } else {
        // Sequential next
        if (state.currentQueueIndex < state.queue.length - 1) {
          state.currentQueueIndex++;
        } else if (state.repeatMode === 'all') {
          state.currentQueueIndex = 0;
        }
      }
    },
    previousTrack: (state) => {
      if (state.queue.length === 0) return;

      if (state.shuffleMode) {
        // Go to last played track from history
        if (state.playHistory.length > 1) {
          const previousTrackId = state.playHistory[1];
          const queueIndex = state.queue.findIndex((item) => item.track.id === previousTrackId);
          if (queueIndex !== -1) {
            state.currentQueueIndex = queueIndex;
          }
        }
      } else {
        // Sequential previous
        if (state.currentQueueIndex > 0) {
          state.currentQueueIndex--;
        } else if (state.repeatMode === 'all') {
          state.currentQueueIndex = state.queue.length - 1;
        }
      }
    },

    // Playback modes
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

    // Background and media session
    setBackgroundEnabled: (state, action: PayloadAction<boolean>) => {
      state.isBackgroundEnabled = action.payload;
    },
    setMediaSessionActive: (state, action: PayloadAction<boolean>) => {
      state.mediaSessionActive = action.payload;
    },

    // Loading and errors
    setLoadingTrack: (state, action: PayloadAction<boolean>) => {
      state.isLoadingTrack = action.payload;
    },
    setAudioError: (state, action: PayloadAction<string | null>) => {
      state.audioError = action.payload;
    },

    // Progress tracking
    updateTrackProgress: (state, action: PayloadAction<{ trackId: string; progress: number }>) => {
      state.trackProgress[action.payload.trackId] = action.payload.progress;
    },
    setLastPlayedTrackId: (state, action: PayloadAction<string | null>) => {
      state.lastPlayedTrackId = action.payload;
    },

    // Audio effects
    updateEqualizer: (
      state,
      action: PayloadAction<Partial<AudioState['audioEffects']['equalizer']>>,
    ) => {
      state.audioEffects.equalizer = { ...state.audioEffects.equalizer, ...action.payload };
    },
    setSkipSilence: (state, action: PayloadAction<boolean>) => {
      state.audioEffects.skipSilence = action.payload;
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
  updateEqualizer,
  setSkipSilence,
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
export const selectIsPlaying = (state: { audio: AudioState }) =>
  state.audio.playbackState.isPlaying;
export const selectAudioError = (state: { audio: AudioState }) => state.audio.audioError;

export default audioSlice.reducer;
