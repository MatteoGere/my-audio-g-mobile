'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { useSignedUrl } from '@/lib/hooks/useSignedUrls';
import { Avatar, Button, Card } from '@/components/ui';
import {
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineForward,
  HiOutlineBackward,
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
  const currentTrackImageKey = (currentTrack as any)?.image_file?.image_storage_key || '';

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

  const handleSeek = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current || !currentTrack?.duration) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newTime = (percentage / 100) * currentTrack.duration;

      dispatch(setCurrentTime(newTime));
    },
    [currentTrack?.duration, dispatch],
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleSeek(e.clientX);
    },
    [handleSeek],
  );

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [handleSeek],
  );

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

  const handleMuteToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(toggleMute());
    },
    [dispatch],
  );

  // Don't render if no track is loaded, player is hidden, or on play page
  if (!currentTrack || playerView === 'hidden' || pathname?.includes('/play')) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 px-3 sm:px-5">
      <div className="mx-auto max-w-lg">
        {/* Main Player Card */}
        <Card
          padding="none"
          className="rounded-2xl border border-primary/20 bg-gradient-to-r from-surface/95 to-primary/5 backdrop-blur-xl shadow-strong overflow-hidden"
        >
          {/* Progress Bar - Integrated at top */}
          <div
            ref={progressBarRef}
            className="group relative h-1.5 w-full cursor-pointer overflow-hidden bg-gradient-to-r from-marble-100/40 to-primary/10 transition-[height] duration-200 hover:h-2"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-300"
              style={{ width: `${progress}%` }}
            >
              <span
                className={`absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-primary to-accent shadow-medium transition-opacity duration-200 ${
                  isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </div>
          </div>

          {/* Player Content */}
          <div className="px-4 py-3">
            {/* Track Info and Controls */}
            <div className="flex items-center gap-3">
            {/* Track Image */}
            <div className="flex-shrink-0 cursor-pointer" onClick={handleOpenFullPlayer}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-sm" />
                <Avatar
                  size="lg"
                  src={
                    currentTrack?.image_file_id && currentTrackImageUrl ? currentTrackImageUrl : ''
                  }
                  alt={currentTrack?.name || 'Track'}
                  fallback={currentTrack?.name || 'Track'}
                  className="relative h-12 w-12 ring-2 ring-primary/30"
                >
                  🎵
                </Avatar>
              </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={handleOpenFullPlayer}>
              <p className="truncate text-sm font-semibold text-foreground leading-tight">
                {currentTrack.name || 'Audio Track'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                <span className="font-medium text-secondary">
                  {formatTime(playbackState.currentTime)}
                </span>
                <span className="text-muted/60">/</span>
                <span>{formatTime(currentTrack.duration || 0)}</span>
                {queue.length > 1 && (
                  <>
                    <span className="text-muted/60">•</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
                      {(queue.findIndex((item) => item.track.id === currentTrack.id) || 0) + 1}/
                      {queue.length}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Essential Controls - Primary Actions */}
            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-xl p-0 shrink-0 bg-secondary/10 hover:bg-secondary/20 text-secondary transition-all"
                onClick={handlePrevious}
                disabled={queue.length <= 1}
                title="Previous track"
              >
                <HiOutlineBackward className="h-4 w-4" />
              </Button>

              {/* Play/Pause Button */}
              <Button
                variant="primary"
                size="sm"
                className="h-11 w-11 rounded-xl p-0 shadow-medium shrink-0 bg-gradient-to-br from-primary via-accent to-secondary hover:scale-105 transition-all"
                onClick={handlePlayPause}
                title={playbackState.isPlaying ? 'Pause' : 'Play'}
              >
                {playbackState.isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : playbackState.isPlaying ? (
                  <HiOutlinePause className="h-4 w-4" />
                ) : (
                  <HiOutlinePlay className="h-4 w-4 translate-x-[1px]" />
                )}
              </Button>

              {/* Next Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-xl p-0 shrink-0 bg-accent/10 hover:bg-accent/20 text-accent transition-all"
                onClick={handleNext}
                disabled={queue.length <= 1}
                title="Next track"
              >
                <HiOutlineForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Secondary Controls - Mute and Close */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Mute Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg p-0 bg-marble-100/50 hover:bg-marble-200/50 transition-all"
                onClick={handleMuteToggle}
                title={playbackState.isMuted ? 'Unmute' : 'Mute'}
              >
                {playbackState.isMuted ? (
                  <HiOutlineSpeakerXMark className="h-3.5 w-3.5 text-error" />
                ) : (
                  <HiOutlineSpeakerWave className="h-3.5 w-3.5" />
                )}
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg p-0 bg-error/10 hover:bg-error/20 text-error transition-all"
                onClick={handleCloseMiniPlayer}
                title="Close player"
              >
                <HiOutlineXMark className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
