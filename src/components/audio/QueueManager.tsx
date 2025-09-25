'use client';

import { useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { Button, Card } from '@/components/ui';
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
  const { queue, currentQueueIndex, currentTrack, playbackState } = useAppSelector(
    (state) => state.audio,
  );

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
      className="w-full max-w-md mx-auto bg-surface/95 backdrop-blur-md border border-muted"
      padding="md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-muted">
        <div className="flex items-center space-x-3">
          <HiOutlineMusicalNote className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Queue ({queue.length} tracks)</h3>
            <p className="text-xs text-muted">
              {formatTime(totalDuration)} total • {formatTime(remainingDuration)} remaining
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {queue.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearQueue}
              className="text-error hover:text-error hover:bg-error/10"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <HiOutlineXMark className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Queue List */}
      <div className="max-h-96 overflow-y-auto">
        {queue.map((queueItem, index) => {
          const isCurrentTrack = index === currentQueueIndex;
          const isPastTrack = index < currentQueueIndex;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={`${queueItem.track.id}-${index}`}
              className={cn(
                'relative flex items-center p-3 border-b border-muted transition-all duration-200',
                isCurrentTrack
                  ? 'bg-primary/20 border-l-4 border-l-primary'
                  : isPastTrack
                    ? 'opacity-60'
                    : 'hover:bg-background',
                isDragOver && 'bg-primary/20',
                draggedIndex === index && 'opacity-50',
              )}
              draggable={!isCurrentTrack}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Drag Handle */}
              {!isCurrentTrack && (
                <div className="cursor-move mr-2 text-muted">
                  <HiOutlineBars3 className="w-4 h-4" />
                </div>
              )}

              {/* Track Number/Status */}
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center mr-3 flex-shrink-0">
                {isCurrentTrack && playbackState.isPlaying ? (
                  <div className="flex space-x-0.5">
                    <div className="w-0.5 h-3 bg-primary animate-pulse"></div>
                    <div
                      className="w-0.5 h-3 bg-primary animate-pulse"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-0.5 h-3 bg-primary animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                ) : (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isCurrentTrack ? 'text-primary' : 'text-muted',
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePlayTrack(index)}>
                <p
                  className={cn(
                    'text-sm font-medium truncate',
                    isCurrentTrack ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {queueItem.track.name || `Track ${index + 1}`}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted">
                  <HiOutlineClock className="w-3 h-3" />
                  <span>{formatTime(queueItem.track.duration || 0)}</span>
                  {isCurrentTrack && (
                    <span className="text-primary font-medium">• Now Playing</span>
                  )}
                  {isPastTrack && <span className="text-muted">• Played</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 ml-2">
                {isCurrentTrack ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => (playbackState.isPlaying ? dispatch(pause()) : dispatch(play()))}
                  >
                    {playbackState.isPlaying ? (
                      <HiOutlinePause className="w-4 h-4" />
                    ) : (
                      <HiOutlinePlay className="w-4 h-4" />
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handlePlayTrack(index)}
                  >
                    <HiOutlinePlay className="w-4 h-4" />
                  </Button>
                )}

                {queue.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-error hover:text-error hover:bg-error/10"
                    onClick={() => handleRemoveTrack(index)}
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Queue Actions */}
      {queue.length > 0 && (
        <div className="border-t border-muted bg-surface/50">
          <Card padding="md" className="bg-surface/50 border-none shadow-none">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Drag to reorder tracks</span>
              <span>{queue.length - currentQueueIndex - 1} tracks remaining</span>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
