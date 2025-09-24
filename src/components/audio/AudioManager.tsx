'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { useSignedAudioUrls, useSignedUrl } from '@/lib/hooks/useSignedUrls';
import {
  play,
  pause,
  stop,
  setCurrentTime,
  setDuration,
  setLoadingTrack,
  setAudioError,
  nextTrack,
  previousTrack,
  setPlayerView,
} from '@/lib/redux/slices/audioSlice';

/**
 * Global Audio Manager Component
 *
 * This component manages the single audio element that's used across the entire app.
 * It handles:
 * - Audio element lifecycle
 * - Media Session API integration
 * - Background playback
 * - URL loading and caching
 * - Cross-component audio state synchronization
 */
export function AudioManager() {
  const dispatch = useAppDispatch();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrack, playbackState, queue, currentQueueIndex } = useAppSelector(
    (state) => state.audio,
  );

  // Get signed URLs for the current track
  const currentAudioPath = currentTrack?.audio_storage_key;
  const { signedUrls, isLoading: urlsLoading } = useSignedAudioUrls(
    currentAudioPath ? [currentAudioPath] : [],
    3600,
  );

  // Current audio URL
  const currentAudioUrl = currentAudioPath ? signedUrls[currentAudioPath] : null;

  // Memoize the image key to prevent unnecessary signed URL calls
  const currentTrackImageKey = useMemo(() => {
    return (currentTrack as any)?.image_file?.image_storage_key || '';
  }, [currentTrack?.id, (currentTrack as any)?.image_file?.image_storage_key]);

  // Get signed URL for current track image (only when key actually changes)
  const { signedUrl: currentTrackImageUrl } = useSignedUrl(currentTrackImageKey, 'image-files');

  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      dispatch(setCurrentTime(audioRef.current.currentTime));
    }
  }, [dispatch]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && currentTrack) {
      dispatch(setDuration(audioRef.current.duration));
      dispatch(setLoadingTrack(false));
    }
  }, [dispatch, currentTrack]);

  const handleCanPlay = useCallback(() => {
    dispatch(setLoadingTrack(false));
  }, [dispatch]);

  const handleLoadStart = useCallback(() => {
    dispatch(setLoadingTrack(true));
  }, [dispatch]);

  const handlePlay = useCallback(() => {
    dispatch(play());
  }, [dispatch]);

  const handlePause = useCallback(() => {
    dispatch(pause());
  }, [dispatch]);

  const handleEnded = useCallback(() => {
    // Handle track end based on repeat mode
    const { repeatMode } = useAppSelector((state) => state.audio);

    if (repeatMode === 'one') {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all' || currentQueueIndex < queue.length - 1) {
      // Go to next track
      dispatch(nextTrack());
    } else {
      // Stop playback
      dispatch(stop());
      dispatch(setPlayerView('hidden'));
    }
  }, [dispatch, currentQueueIndex, queue.length]);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      const audio = e.currentTarget;
      let errorMessage = 'Failed to load audio';

      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error occurred';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio format not supported';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio source not supported';
            break;
        }
      }

      dispatch(setAudioError(errorMessage));
      dispatch(setLoadingTrack(false));
    },
    [dispatch],
  );

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentAudioUrl && currentTrack) {
      // Set new audio source
      if (audio.src !== currentAudioUrl) {
        audio.src = currentAudioUrl;
        audio.load(); // Force reload
      }
    } else {
      // Clear audio source
      audio.src = '';
      audio.load();
    }
  }, [currentAudioUrl, currentTrack]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioUrl) return;

    if (playbackState.isPlaying && audio.paused) {
      audio.play().catch((error) => {
        console.error('Audio play error:', error);
        dispatch(setAudioError(error.message));
      });
    } else if (!playbackState.isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [playbackState.isPlaying, currentAudioUrl, dispatch]);

  // Handle volume and speed changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = playbackState.volume;
    audio.playbackRate = playbackState.playbackSpeed;
    audio.muted = playbackState.isMuted;
  }, [playbackState.volume, playbackState.playbackSpeed, playbackState.isMuted]);

  // Handle seeking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Only seek if the time difference is significant (more than 1 second)
    const timeDiff = Math.abs(audio.currentTime - playbackState.currentTime);
    if (timeDiff > 1) {
      audio.currentTime = playbackState.currentTime;
    }
  }, [playbackState.currentTime, currentTrack]);

  // Media Session API integration
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      const currentQueue = queue[currentQueueIndex];
      const itineraryName = currentQueue?.track ? 'Audio Guide' : 'Unknown';

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name || 'Audio Track',
        artist: itineraryName,
        album: itineraryName,
        artwork:
          currentTrack.image_file_id && currentTrackImageUrl
            ? [
                {
                  src: currentTrackImageUrl,
                  sizes: '512x512',
                  type: 'image/jpeg',
                },
              ]
            : undefined,
      });

      // Set action handlers
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        dispatch(previousTrack());
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        dispatch(nextTrack());
      });

      navigator.mediaSession.setActionHandler('seekbackward', (event) => {
        if (audioRef.current) {
          const seekTime = event.seekOffset || 10;
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seekTime);
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', (event) => {
        if (audioRef.current) {
          const seekTime = event.seekOffset || 10;
          audioRef.current.currentTime = Math.min(
            audioRef.current.duration || 0,
            audioRef.current.currentTime + seekTime,
          );
        }
      });

      // Update playback state
      navigator.mediaSession.playbackState = playbackState.isPlaying ? 'playing' : 'paused';
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      }
    };
  }, [
    currentTrack,
    currentTrackImageUrl,
    queue,
    currentQueueIndex,
    playbackState.isPlaying,
    dispatch,
  ]);

  return (
    <audio
      ref={audioRef}
      preload="none" // Lazy loading
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onCanPlay={handleCanPlay}
      onLoadStart={handleLoadStart}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
      onError={handleError}
      className="hidden" // Hidden from UI
    />
  );
}
