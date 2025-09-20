'use client';

import { HiOutlinePlay, HiOutlinePause, HiOutlineForward, HiOutlineBackward } from 'react-icons/hi2';
import { useAudioPlayerWithMediaSession } from '../../hooks/useAudioPlayerWithMediaSession';
import { Button } from '../ui';

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    playAudio,
    pauseAudio,
    playNext,
    playPrevious,
    audioRef,
  } = useAudioPlayerWithMediaSession();

  // Don't render if no track is selected
  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
      
      {/* Mini Player UI */}
      <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border-t border-stone-200 dark:border-gray-700 p-3 z-40">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-stone-200 dark:bg-gray-600">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentTrack.name || 'Unknown Track'}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-stone-600 dark:text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={playPrevious}
              className="!p-1"
              disabled={isLoading}
            >
              <HiOutlineBackward className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={isPlaying ? pauseAudio : playAudio}
              className="!p-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-primary" />
              ) : isPlaying ? (
                <HiOutlinePause className="h-5 w-5" />
              ) : (
                <HiOutlinePlay className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={playNext}
              className="!p-1"
              disabled={isLoading}
            >
              <HiOutlineForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}