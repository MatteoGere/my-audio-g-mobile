'use client';

import { useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { Badge, Button, Card } from '@/components/ui';
import {
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineTrash,
  HiOutlineBars3,
  HiOutlineClock,
  HiOutlineMusicalNote,
  HiOutlineXMark,
} from 'react-icons/hi2';
import {
  setCurrentTrack,
  setCurrentQueueIndex,
  removeFromQueue,
  clearQueue,
  play,
  pause,
} from '@/lib/redux/slices/audioSlice';
import { cn } from '@/lib/utils';

interface QueueManagerProps {
  onClose?: () => void;
  isVisible?: boolean;
}

export function QueueManager({ onClose, isVisible = true }: QueueManagerProps) {
  const dispatch = useAppDispatch();
  const { queue, currentQueueIndex, playbackState } = useAppSelector((state) => state.audio);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const totalDuration = queue.reduce((total, item) => total + (item.track.duration || 0), 0);
  const remainingDuration = queue
    .slice(currentQueueIndex + 1)
    .reduce((total, item) => total + (item.track.duration || 0), 0);

  const handlePlayTrack = useCallback(
    (index: number) => {
      const queueItem = queue[index];
      if (queueItem) {
        dispatch(setCurrentTrack({ track: queueItem.track }));
        dispatch(setCurrentQueueIndex(index));
        if (!playbackState.isPlaying) {
          dispatch(play());
        }
      }
    },
    [queue, dispatch, playbackState.isPlaying],
  );

  const handleRemoveTrack = useCallback(
    (index: number) => {
      if (queue.length > 1) {
        dispatch(removeFromQueue(index));
      }
    },
    [queue.length, dispatch],
  );

  const handleClearQueue = useCallback(() => {
    if (queue.length > 0) {
      dispatch(clearQueue());
    }
  }, [queue.length, dispatch]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      // Note: For now, we'll keep track reordering simple
      // In a full implementation, you'd want to add a reorderQueue action
      console.log(`Would move track from ${draggedIndex} to ${dropIndex}`);

      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  if (!isVisible || queue.length === 0) {
    return null;
  }

  return (
    <Card
      padding="lg"
      variant="glass"
      className="space-y-4 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary shadow-soft backdrop-blur-sm">
            <HiOutlineMusicalNote className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full" />
              <h3 className="text-base font-bold text-foreground">Queue</h3>
              <Badge
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-primary/20 to-primary/10"
              >
                {queue.length}
              </Badge>
            </div>
            <p className="text-xs text-muted flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-secondary" />
                {formatTime(totalDuration)} total
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-accent" />
                {formatTime(remainingDuration)} remaining
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearQueue}
              className="h-11 w-11 rounded-full bg-error/10 text-error hover:bg-error/20 transition-all"
              title="Clear queue"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-11 w-11 rounded-full bg-marble-100 hover:bg-marble-200 transition-all"
              title="Close queue"
            >
              <HiOutlineXMark className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {queue.map((queueItem, index) => {
          const isCurrentTrack = index === currentQueueIndex;
          const isPastTrack = index < currentQueueIndex;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={`${queueItem.track.id}-${index}`}
              className={cn(
                'group relative flex items-center gap-3 rounded-2xl border p-4 shadow-soft transition-all duration-200 hover:scale-[1.01]',
                isCurrentTrack
                  ? 'border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 shadow-medium'
                  : 'border-marble-200/40 bg-surface/60',
                isPastTrack && 'opacity-60',
                isDragOver && 'border-primary bg-primary/20',
                draggedIndex === index && 'opacity-50',
              )}
              draggable={!isCurrentTrack}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {!isCurrentTrack && (
                <div className="mr-1 hidden cursor-move text-muted sm:flex">
                  <HiOutlineBars3 className="h-5 w-5" />
                </div>
              )}

              <div
                className={cn(
                  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-soft',
                  isCurrentTrack
                    ? 'bg-gradient-to-br from-primary to-accent text-white'
                    : 'bg-marble-100 text-muted',
                )}
              >
                {isCurrentTrack && playbackState.isPlaying ? (
                  <div className="flex items-center gap-0.5">
                    <span className="h-3 w-0.5 animate-pulse rounded-full bg-white" />
                    <span
                      className="h-3 w-0.5 animate-pulse rounded-full bg-white"
                      style={{ animationDelay: '0.12s' }}
                    />
                    <span
                      className="h-3 w-0.5 animate-pulse rounded-full bg-white"
                      style={{ animationDelay: '0.24s' }}
                    />
                  </div>
                ) : (
                  <span className={cn('text-base', isCurrentTrack && 'text-white')}>
                    {index + 1}
                  </span>
                )}
              </div>

              <div
                className="flex min-w-0 flex-1 flex-col gap-1.5 cursor-pointer"
                onClick={() => handlePlayTrack(index)}
              >
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'truncate text-sm font-semibold',
                      isCurrentTrack ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {queueItem.track.name || `Track ${index + 1}`}
                  </p>
                  {isCurrentTrack && (
                    <Badge
                      variant="primary"
                      size="sm"
                      className="bg-gradient-to-r from-primary/90 to-accent/90"
                    >
                      Playing
                    </Badge>
                  )}
                  {isPastTrack && (
                    <Badge
                      variant="outline"
                      size="sm"
                      className="bg-marble-100/50 border-marble-200/50"
                    >
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center',
                      isCurrentTrack ? 'bg-secondary/20' : 'bg-marble-100',
                    )}
                  >
                    <HiOutlineClock
                      className={cn('h-3 w-3', isCurrentTrack ? 'text-secondary' : 'text-muted')}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isCurrentTrack ? 'text-secondary' : 'text-muted',
                    )}
                  >
                    {formatTime(queueItem.track.duration || 0)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isCurrentTrack ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all"
                    onClick={() => (playbackState.isPlaying ? dispatch(pause()) : dispatch(play()))}
                    title={playbackState.isPlaying ? 'Pause track' : 'Play track'}
                  >
                    {playbackState.isPlaying ? (
                      <HiOutlinePause className="h-4 w-4" />
                    ) : (
                      <HiOutlinePlay className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent transition-all"
                    onClick={() => handlePlayTrack(index)}
                    title="Play this track"
                  >
                    <HiOutlinePlay className="h-4 w-4" />
                  </Button>
                )}

                {queue.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-xl bg-error/10 hover:bg-error/20 text-error transition-all"
                    onClick={() => handleRemoveTrack(index)}
                    title="Remove from queue"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {queue.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 to-secondary/5 px-4 py-3 text-xs backdrop-blur-sm">
          <span className="text-muted flex items-center gap-1.5">
            <span className="text-accent">✨</span>
            Drag and drop to reorder tracks
          </span>
          <Badge
            variant="accent"
            size="sm"
            className="bg-gradient-to-r from-accent/20 to-accent/10"
          >
            {queue.length - currentQueueIndex - 1} remaining
          </Badge>
        </div>
      )}
    </Card>
  );
}
