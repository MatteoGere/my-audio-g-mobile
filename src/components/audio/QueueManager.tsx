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
      className='space-y-4'
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <HiOutlineMusicalNote className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Queue • {queue.length} tracks
            </h3>
            <p className="text-xs text-muted">
              {formatTime(totalDuration)} total · {formatTime(remainingDuration)} remaining
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearQueue}
              className="h-11 w-11 rounded-full text-error hover:bg-error/10 hover:text-error"
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
              className="h-11 w-11 rounded-full"
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
                'group relative flex items-center gap-3 rounded-2xl border border-muted/40 bg-background/60 p-4 shadow-sm transition-all duration-200',
                isCurrentTrack &&
                  'border-primary/60 bg-primary/10 shadow-md ring-1 ring-primary/40',
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

              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-surface text-xs font-semibold text-muted shadow-inner">
                {isCurrentTrack && playbackState.isPlaying ? (
                  <div className="flex items-center gap-0.5">
                    <span className="h-3 w-0.5 animate-pulse rounded-full bg-primary" />
                    <span
                      className="h-3 w-0.5 animate-pulse rounded-full bg-primary"
                      style={{ animationDelay: '0.12s' }}
                    />
                    <span
                      className="h-3 w-0.5 animate-pulse rounded-full bg-primary"
                      style={{ animationDelay: '0.24s' }}
                    />
                  </div>
                ) : (
                  <span className={cn('text-sm', isCurrentTrack ? 'text-primary' : undefined)}>
                    {index + 1}
                  </span>
                )}
              </div>

              <div
                className="flex min-w-0 flex-1 flex-col gap-1"
                onClick={() => handlePlayTrack(index)}
              >
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'truncate text-sm font-semibold text-foreground',
                      isCurrentTrack && 'text-primary',
                    )}
                  >
                    {queueItem.track.name || `Track ${index + 1}`}
                  </p>
                  {isCurrentTrack && (
                    <Badge variant="primary" size="sm">
                      Now Playing
                    </Badge>
                  )}
                  {isPastTrack && (
                    <Badge variant="outline" size="sm">
                      Played
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <HiOutlineClock className="h-3 w-3" />
                  <span>{formatTime(queueItem.track.duration || 0)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isCurrentTrack ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 rounded-full"
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
                    className="h-11 w-11 rounded-full"
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
                    className="h-11 w-11 rounded-full text-error hover:bg-error/10 hover:text-error"
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
        <div className="flex items-center justify-between rounded-2xl border border-muted/40 bg-background/60 px-4 py-3 text-xs text-muted">
          <span>Drag and drop to reorder tracks</span>
          <span>{queue.length - currentQueueIndex - 1} tracks remaining</span>
        </div>
      )}
    </Card>
  );
}
