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
    <div className="fixed inset-x-0 bottom-20 z-40 px-5">
      <div className="mx-auto max-w-lg space-y-3">
        <div
          ref={progressBarRef}
          className="group relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-muted/40 shadow-sm transition-[height] duration-200 hover:h-2"
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          >
            <span
              className={`absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-foreground shadow-md transition-opacity duration-200 ${
                isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            />
          </div>
        </div>

        <Card
          padding="md"
          className="flex items-center gap-4 rounded-2xl border border-muted/60 bg-surface/95 backdrop-blur-xl shadow-lg"
        >
          <div className="flex-shrink-0" onClick={handleOpenFullPlayer}>
            <Avatar
              size="lg"
              src={currentTrack?.image_file_id && currentTrackImageUrl ? currentTrackImageUrl : ''}
              alt={currentTrack?.name || 'Track'}
              fallback={currentTrack?.name || 'Track'}
              className="ring-4 ring-surface/80"
            >
              🎵
            </Avatar>
          </div>

          <div className="flex-1 min-w-0" onClick={handleOpenFullPlayer}>
            <p className="truncate text-sm font-semibold text-foreground">
              {currentTrack.name || 'Audio Track'}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{formatTime(playbackState.currentTime)}</span>
              <span className="text-muted/60">/</span>
              <span>{formatTime(currentTrack.duration || 0)}</span>
              {queue.length > 1 && (
                <>
                  <span className="text-muted/60">•</span>
                  <span>
                    {(queue.findIndex((item) => item.track.id === currentTrack.id) || 0) + 1}-{queue.length}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="hidden h-11 w-11 rounded-full sm:flex"
              onClick={handleMuteToggle}
              title={playbackState.isMuted ? 'Unmute' : 'Mute'}
            >
              {playbackState.isMuted ? (
                <HiOutlineSpeakerXMark className="h-4 w-4" />
              ) : (
                <HiOutlineSpeakerWave className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full"
              onClick={handlePrevious}
              disabled={queue.length <= 1}
              title="Previous track"
            >
              <HiOutlineBackward className="h-4 w-4" />
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="h-12 w-12 rounded-full p-0 shadow-lg"
              onClick={handlePlayPause}
              title={playbackState.isPlaying ? 'Pause' : 'Play'}
            >
              {playbackState.isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : playbackState.isPlaying ? (
                <HiOutlinePause className="h-5 w-5" />
              ) : (
                <HiOutlinePlay className="h-5 w-5 translate-x-[1px]" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full"
              onClick={handleNext}
              disabled={queue.length <= 1}
              title="Next track"
            >
              <HiOutlineForward className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full"
              onClick={handleOpenFullPlayer}
              title="Open full player"
            >
              <HiOutlineChevronUp className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full"
              onClick={handleCloseMiniPlayer}
              title="Close player"
            >
              <HiOutlineXMark className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
