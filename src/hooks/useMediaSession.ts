'use client';

import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

export interface MediaSessionMetadata {
  title: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[];
}

export function useMediaSession() {
  const audioState = useAppSelector((state) => state.audioPlayer);

  // Set up Media Session API
  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      console.warn('Media Session API not supported');
      return;
    }

    const mediaSession = navigator.mediaSession;

    // Update metadata when current track changes
    if (audioState.currentTrack) {
      const metadata: MediaSessionMetadata = {
        title: audioState.currentTrack.name || 'Unknown Track',
        artist: audioState.currentItinerary?.name || 'Audio Guide',
        album: audioState.currentItinerary?.name || 'Audio Tour',
        artwork: [
          {
            src: '/icons/myaudiog-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/myaudiog-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      };

      mediaSession.metadata = new MediaMetadata(metadata);
    } else {
      mediaSession.metadata = null;
    }
  }, [audioState.currentTrack, audioState.currentItinerary]);

  // Update playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const mediaSession = navigator.mediaSession;

    if (audioState.isPlaying) {
      mediaSession.playbackState = 'playing';
    } else if (audioState.isPaused) {
      mediaSession.playbackState = 'paused';
    } else {
      mediaSession.playbackState = 'none';
    }
  }, [audioState.isPlaying, audioState.isPaused]);

  // Set up position state for seek bar in notifications
  useEffect(() => {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) {
      return;
    }

    const mediaSession = navigator.mediaSession;

    if (audioState.duration > 0) {
      mediaSession.setPositionState({
        duration: audioState.duration,
        position: audioState.currentTime,
        playbackRate: 1.0,
      });
    }
  }, [audioState.currentTime, audioState.duration]);

  return {
    isSupported: 'mediaSession' in navigator,
  };
}

export function setupMediaSessionActionHandlers(
  onPlay: () => void,
  onPause: () => void,
  onStop: () => void,
  onSeekBackward: () => void,
  onSeekForward: () => void,
  onPreviousTrack: () => void,
  onNextTrack: () => void,
  onSeekTo: (time: number) => void,
) {
  if (!('mediaSession' in navigator)) {
    return () => {}; // Return cleanup function
  }

  const mediaSession = navigator.mediaSession;

  // Basic playback actions
  mediaSession.setActionHandler('play', onPlay);
  mediaSession.setActionHandler('pause', onPause);
  mediaSession.setActionHandler('stop', onStop);

  // Navigation actions
  mediaSession.setActionHandler('previoustrack', onPreviousTrack);
  mediaSession.setActionHandler('nexttrack', onNextTrack);

  // Seeking actions
  mediaSession.setActionHandler('seekbackward', (details) => {
    const seekTime = details.seekOffset || 10; // Default 10 seconds
    onSeekBackward();
    // You might want to implement actual time-based seeking here
  });

  mediaSession.setActionHandler('seekforward', (details) => {
    const seekTime = details.seekOffset || 10; // Default 10 seconds
    onSeekForward();
    // You might want to implement actual time-based seeking here
  });

  // Seek to specific position
  mediaSession.setActionHandler('seekto', (details) => {
    if (details.seekTime !== undefined) {
      onSeekTo(details.seekTime);
    }
  });

  // Cleanup function
  return () => {
    try {
      mediaSession.setActionHandler('play', null);
      mediaSession.setActionHandler('pause', null);
      mediaSession.setActionHandler('stop', null);
      mediaSession.setActionHandler('previoustrack', null);
      mediaSession.setActionHandler('nexttrack', null);
      mediaSession.setActionHandler('seekbackward', null);
      mediaSession.setActionHandler('seekforward', null);
      mediaSession.setActionHandler('seekto', null);
    } catch (error) {
      console.warn('Error cleaning up media session handlers:', error);
    }
  };
}