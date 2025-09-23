'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { Button, Progress } from '@/components/ui';
import {
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineForward,
  HiOutlineBackward,
  HiOutlineQueueList,
} from 'react-icons/hi2';
import {
  play,
  pause,
  nextTrack,
  previousTrack,
} from '@/lib/redux/slices/audioSlice';
import { useMemo } from 'react';

export function MiniPlayer() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentTrack, playbackState, queue, currentQueueIndex } = useAppSelector((state) => state.audio);

  const progress = useMemo(() => {
    if (!currentTrack?.duration || !playbackState.currentTime) return 0;
    return (playbackState.currentTime / currentTrack.duration) * 100;
  }, [currentTrack?.duration, playbackState.currentTime]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if no track is loaded
  if (!currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    if (playbackState.isPlaying) {
      dispatch(pause());
    } else {
      dispatch(play());
    }
  };

  const handlePrevious = () => {
    dispatch(previousTrack());
  };

  const handleNext = () => {
    dispatch(nextTrack());
  };

  const handleOpenFullPlayer = () => {
    // Navigate to the full player for the current itinerary
    if (currentTrack && queue.length > 0) {
      const itineraryId = (currentTrack as any).audio_itinerary_id;
      if (itineraryId) {
        router.push(`/itinerary/${itineraryId}/play`);
      }
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
      {/* Progress bar */}
      <div className="h-1 bg-stone-200 dark:bg-stone-700">
        <div 
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center p-3 space-x-3">
        {/* Track Info - Clickable to open full player */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleOpenFullPlayer}
        >
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
            {currentTrack.name || 'Audio Track'}
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
            {formatTime(playbackState.currentTime)} / {formatTime(currentTrack.duration || 0)}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={handlePrevious}
            disabled={queue.length <= 1}
          >
            <HiOutlineBackward className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={handlePlayPause}
          >
            {playbackState.isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600"></div>
            ) : playbackState.isPlaying ? (
              <HiOutlinePause className="w-5 h-5" />
            ) : (
              <HiOutlinePlay className="w-5 h-5" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={handleNext}
            disabled={queue.length <= 1}
          >
            <HiOutlineForward className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={handleOpenFullPlayer}
          >
            <HiOutlineQueueList className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
