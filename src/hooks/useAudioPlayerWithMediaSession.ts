'use client';

import { useEffect } from 'react';
import { useAudioPlayer } from './useAudioPlayer';
import { useMediaSession, setupMediaSessionActionHandlers } from './useMediaSession';

export function useAudioPlayerWithMediaSession() {
  const audioPlayer = useAudioPlayer();
  const mediaSession = useMediaSession();

  // Set up Media Session action handlers
  useEffect(() => {
    if (!mediaSession.isSupported) {
      return;
    }

    const cleanup = setupMediaSessionActionHandlers(
      audioPlayer.playAudio,
      audioPlayer.pauseAudio,
      audioPlayer.stopAudio,
      () => {
        // Seek backward 10 seconds
        const newTime = Math.max(0, audioPlayer.currentTime - 10);
        audioPlayer.seekTo(newTime);
      },
      () => {
        // Seek forward 10 seconds
        const newTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
        audioPlayer.seekTo(newTime);
      },
      audioPlayer.playPrevious,
      audioPlayer.playNext,
      audioPlayer.seekTo,
    );

    return cleanup;
  }, [
    mediaSession.isSupported,
    audioPlayer.playAudio,
    audioPlayer.pauseAudio,
    audioPlayer.stopAudio,
    audioPlayer.playPrevious,
    audioPlayer.playNext,
    audioPlayer.seekTo,
    audioPlayer.currentTime,
    audioPlayer.duration,
  ]);

  return {
    ...audioPlayer,
    mediaSession,
  };
}