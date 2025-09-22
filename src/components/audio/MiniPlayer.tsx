'use client';

import { useAppSelector } from '@/lib/redux/store';
import { Button } from '@/components/ui';
import {
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineForward,
  HiOutlineBackward,
} from 'react-icons/hi2';

export function MiniPlayer() {
  const { currentTrack, playbackState, isLoadingTrack } = useAppSelector((state) => state.audio);

  // Don't render if no track is loaded
  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
      <div className="flex items-center p-3 space-x-3">
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
            {currentTrack.name || 'Audio Track'}
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
            {currentTrack.description || 'Now playing...'}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="p-2" disabled={isLoadingTrack}>
            <HiOutlineBackward className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" className="p-2" disabled={isLoadingTrack}>
            {playbackState.isPlaying ? (
              <HiOutlinePause className="h-5 w-5" />
            ) : (
              <HiOutlinePlay className="h-5 w-5" />
            )}
          </Button>

          <Button variant="ghost" size="sm" className="p-2" disabled={isLoadingTrack}>
            <HiOutlineForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-stone-200 dark:bg-stone-700">
        <div
          className="h-1 bg-primary-500 transition-all duration-300"
          style={{ width: '30%' }} // This would be dynamic based on current position
        />
      </div>
    </div>
  );
}
