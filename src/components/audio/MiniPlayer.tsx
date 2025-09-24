'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { useSignedUrl } from '@/lib/hooks/useSignedUrls';
import { Button } from '@/components/ui';
import {
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineForward,
  HiOutlineBackward,
  HiOutlineChevronUp,
  HiOutlineXMark,
  HiOutlineSpeakerWave,
  HiOutlineSpeakerXMark,
} from 'react-icons/hi2';
import {
  play,
  pause,
  nextTrack,
  previousTrack,
  setCurrentTime,
  toggleMute,
  setPlayerView,
} from '@/lib/redux/slices/audioSlice';

export function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { currentTrack, playbackState, queue, playerView } = useAppSelector((state) => state.audio);
  
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const progress = useMemo(() => {
    if (!currentTrack?.duration || !playbackState.currentTime) return 0;
    return (playbackState.currentTime / currentTrack.duration) * 100;
  }, [currentTrack?.duration, playbackState.currentTime]);

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoize the image key to prevent unnecessary signed URL calls - only based on the storage key itself
  const currentTrackImageKey = useMemo(() => {
    return (currentTrack as any)?.image_file?.image_storage_key || '';
  }, [(currentTrack as any)?.image_file?.image_storage_key]);

  // Get signed URL for current track image (only when key actually changes)
  const { signedUrl: currentTrackImageUrl } = useSignedUrl(currentTrackImageKey, 'image-files');

  const handlePlayPause = useCallback(() => {
    if (playbackState.isPlaying) {
      dispatch(pause());
    } else {
      dispatch(play());
    }
  }, [playbackState.isPlaying, dispatch]);

  const handlePrevious = useCallback(() => {
    if (queue.length > 1) {
      dispatch(previousTrack());
    }
  }, [dispatch, queue.length]);

  const handleNext = useCallback(() => {
    if (queue.length > 1) {
      dispatch(nextTrack());
    }
  }, [dispatch, queue.length]);

  const handleSeek = useCallback((clientX: number) => {
    if (!progressBarRef.current || !currentTrack?.duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newTime = (percentage / 100) * currentTrack.duration;
    
    dispatch(setCurrentTime(newTime));
  }, [currentTrack?.duration, dispatch]);

  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleSeek(e.clientX);
  }, [handleSeek]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    handleSeek(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      handleSeek(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleSeek]);

  const handleOpenFullPlayer = useCallback(() => {
    if (currentTrack && queue.length > 0) {
      const itineraryId = (currentTrack as any).audio_itinerary_id;
      if (itineraryId) {
        router.push(`/itinerary/${itineraryId}/play`);
      }
    }
  }, [currentTrack, queue.length, router]);

  const handleCloseMiniPlayer = useCallback(() => {
    dispatch(setPlayerView('hidden'));
  }, [dispatch]);

  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleMute());
  }, [dispatch]);

  // Don't render if no track is loaded, player is hidden, or on play page
  if (!currentTrack || playerView === 'hidden' || pathname?.includes('/play')) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-700 shadow-[0_-2px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_20px_rgba(0,0,0,0.4)]">
      {/* Interactive Progress Bar */}
      <div 
        ref={progressBarRef}
        className="h-1 bg-stone-200 dark:bg-stone-700 cursor-pointer relative group hover:h-2 transition-all duration-200"
        onClick={handleProgressClick}
        onMouseDown={handleProgressMouseDown}
      >
        <div 
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 relative"
          style={{ width: `${progress}%` }}
        >
          {/* Progress thumb - visible on hover */}
          <div 
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary-600 rounded-full shadow-md transition-opacity duration-200 ${
              isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center px-4 py-3 space-x-3">
        {/* Track Image/Icon */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-sea-100 dark:from-primary-800 dark:to-sea-800 flex items-center justify-center flex-shrink-0">
          {currentTrack?.image_file_id && currentTrackImageUrl ? (
            <img
              key={currentTrackImageKey}
              src={currentTrackImageUrl}
              alt={currentTrack.name || 'Track'}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-lg">🎵</span>
          )}
        </div>

        {/* Track Info - Clickable to open full player */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleOpenFullPlayer}
        >
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
            {currentTrack.name || 'Audio Track'}
          </p>
          <div className="flex items-center space-x-2 text-xs text-stone-600 dark:text-stone-400">
            <span>{formatTime(playbackState.currentTime)}</span>
            <span>/</span>
            <span>{formatTime(currentTrack.duration || 0)}</span>
            {queue.length > 1 && (
              <>
                <span>•</span>
                <span>Track {(queue.findIndex(item => item.track.id === currentTrack.id) || 0) + 1} of {queue.length}</span>
              </>
            )}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-1">
          {/* Mute/Volume */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hidden sm:flex"
            onClick={handleMuteToggle}
            title={playbackState.isMuted ? 'Unmute' : 'Mute'}
          >
            {playbackState.isMuted ? (
              <HiOutlineSpeakerXMark className="w-4 h-4" />
            ) : (
              <HiOutlineSpeakerWave className="w-4 h-4" />
            )}
          </Button>

          {/* Previous Track */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={handlePrevious}
            disabled={queue.length <= 1}
            title="Previous track"
          >
            <HiOutlineBackward className="w-4 h-4" />
          </Button>

          {/* Play/Pause */}
          <Button 
            variant="primary" 
            size="sm" 
            className="w-10 h-10 rounded-full p-0 shadow-md hover:shadow-lg transition-shadow"
            onClick={handlePlayPause}
            title={playbackState.isPlaying ? 'Pause' : 'Play'}
          >
            {playbackState.isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : playbackState.isPlaying ? (
              <HiOutlinePause className="w-5 h-5" />
            ) : (
              <HiOutlinePlay className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          {/* Next Track */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={handleNext}
            disabled={queue.length <= 1}
            title="Next track"
          >
            <HiOutlineForward className="w-4 h-4" />
          </Button>

          {/* Expand to Full Player */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={handleOpenFullPlayer}
            title="Open full player"
          >
            <HiOutlineChevronUp className="w-4 h-4" />
          </Button>

          {/* Close Mini Player */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={handleCloseMiniPlayer}
            title="Close player"
          >
            <HiOutlineXMark className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
