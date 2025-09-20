'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useSignedAudioUrl } from './useSignedUrl';
import {
  play,
  pause,
  stop,
  nextTrack,
  previousTrack,
  setCurrentTime,
  setDuration,
  setVolume,
  setLoading,
  setError,
  clearError,
  setBackground,
  type PlaylistTrack,
} from '../store/slices/audioPlayerSlice';

export interface AudioPlayerHookReturn {
  // Audio element ref
  audioRef: React.RefObject<HTMLAudioElement | null>;
  
  // State
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrack: PlaylistTrack | null;
  playlist: PlaylistTrack[];
  currentIndex: number;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
  isBackground: boolean;
  error: string | null;
  
  // Controls
  playTrack: () => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  seekTo: (time: number) => void;
  setVolumeLevel: (volume: number) => void;
  
  // Playlist controls
  playTrackById: (trackId: string) => void;
  addToPlaylist: (track: PlaylistTrack) => void;
  removeFromPlaylist: (trackId: string) => void;
  clearPlaylist: () => void;
}

export function useAudioPlayer(): AudioPlayerHookReturn {
  const dispatch = useAppDispatch();
  const audioState = useAppSelector((state) => state.audioPlayer);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get signed URL for current track's audio
  const { 
    url: signedAudioUrl, 
    isLoading: urlLoading,
    error: urlError 
  } = useSignedAudioUrl(audioState.currentTrack?.audio_storage_key || '');

  // Handle signed URL errors
  useEffect(() => {
    if (urlError) {
      dispatch(setError('Failed to load audio file'));
    } else if (!urlError && audioState.error === 'Failed to load audio file') {
      dispatch(clearError());
    }
  }, [urlError, dispatch, audioState.error]);

  // Handle audio loading and URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !signedAudioUrl) return;

    dispatch(setLoading(true));
    dispatch(clearError());

    // Set new audio source
    audio.src = signedAudioUrl;
    audio.load();

    const handleLoadedMetadata = () => {
      dispatch(setDuration(audio.duration));
      dispatch(setLoading(false));
    };

    const handleLoadedData = () => {
      dispatch(setLoading(false));
    };

    const handleError = () => {
      dispatch(setError('Failed to load audio track'));
      dispatch(setLoading(false));
    };

    const handleCanPlay = () => {
      dispatch(setLoading(false));
      if (audioState.isPlaying) {
        audio.play().catch(() => {
          dispatch(setError('Failed to play audio track'));
        });
      }
    };

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audio.currentTime));
    };

    const handleEnded = () => {
      dispatch(pause());
      
      // Handle repeat and auto-advance
      if (audioState.repeat === 'one') {
        audio.currentTime = 0;
        dispatch(play());
      } else if (audioState.repeat === 'all' || audioState.currentIndex < audioState.playlist.length - 1) {
        dispatch(nextTrack());
      }
    };

    const handleVolumeChange = () => {
      dispatch(setVolume(audio.volume));
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      // Remove event listeners
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [signedAudioUrl, audioState.isPlaying, audioState.repeat, audioState.currentIndex, audioState.playlist.length, dispatch]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || urlLoading) return;

    if (audioState.isPlaying && audio.paused) {
      audio.play().catch(() => {
        dispatch(setError('Failed to play audio track'));
      });
    } else if (!audioState.isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [audioState.isPlaying, urlLoading, dispatch]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = audioState.volume;
  }, [audioState.volume]);

  // Handle background detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      dispatch(setBackground(document.hidden));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

  // Start progress tracking when playing
  useEffect(() => {
    if (audioState.isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio) {
          dispatch(setCurrentTime(audio.currentTime));
        }
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [audioState.isPlaying, dispatch]);

  // Control functions
  const playTrack = useCallback(() => {
    if (audioState.currentTrack && signedAudioUrl) {
      dispatch(play());
    }
  }, [audioState.currentTrack, signedAudioUrl, dispatch]);

  const pauseTrack = useCallback(() => {
    dispatch(pause());
  }, [dispatch]);

  const stopTrack = useCallback(() => {
    dispatch(stop());
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
    }
  }, [dispatch]);

  const skipToNext = useCallback(() => {
    dispatch(nextTrack());
  }, [dispatch]);

  const skipToPrevious = useCallback(() => {
    dispatch(previousTrack());
  }, [dispatch]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      dispatch(setCurrentTime(time));
    }
  }, [dispatch]);

  const setVolumeLevel = useCallback((volume: number) => {
    dispatch(setVolume(Math.max(0, Math.min(1, volume))));
  }, [dispatch]);

  const playTrackById = useCallback((trackId: string) => {
    const trackIndex = audioState.playlist.findIndex(track => track.id === trackId);
    if (trackIndex !== -1) {
      // This would need to be implemented in the slice
      // For now, we can dispatch a custom action or find another way
      console.log('Playing track by ID:', trackId, 'at index:', trackIndex);
    }
  }, [audioState.playlist]);

  const addToPlaylist = useCallback((track: PlaylistTrack) => {
    // This would need to be implemented in the slice
    console.log('Adding track to playlist:', track);
  }, []);

  const removeFromPlaylist = useCallback((trackId: string) => {
    // This would need to be implemented in the slice
    console.log('Removing track from playlist:', trackId);
  }, []);

  const clearPlaylist = useCallback(() => {
    // This would need to be implemented in the slice
    console.log('Clearing playlist');
  }, []);

  return {
    audioRef,
    isPlaying: audioState.isPlaying,
    isLoading: audioState.isLoading || urlLoading,
    currentTime: audioState.currentTime,
    duration: audioState.duration,
    volume: audioState.volume,
    currentTrack: audioState.currentTrack,
    playlist: audioState.playlist,
    currentIndex: audioState.currentIndex,
    repeat: audioState.repeat,
    shuffle: audioState.shuffle,
    isBackground: audioState.isBackground,
    error: audioState.error,
    playTrack,
    pauseTrack,
    stopTrack,
    skipToNext,
    skipToPrevious,
    seekTo,
    setVolumeLevel,
    playTrackById,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
  };
}