'use client';

import { HiOutlinePlay } from 'react-icons/hi2';
import { TrackCard } from './TrackCard';
import { Spinner } from '../ui';
import type { Database } from '../../types/supabase-types';

export interface TrackListProps {
  tracks?: (Database['public']['Tables']['audio_track']['Row'] & {
    image_file?: Database['public']['Tables']['image_file']['Row'];
    audio_track_poi?: Database['public']['Tables']['audio_track_poi']['Row'];
  })[];
  isLoading?: boolean;
  error?: any;
  onTrackPlay?: (track: any) => void;
  showFavoriteToggle?: boolean;
  onTrackFavoriteToggle?: (track: any) => void;
  getUserTrackFavoriteStatus?: (trackId: string) => boolean;
  currentlyPlayingTrackId?: string;
  emptyStateMessage?: string;
}

export function TrackList({
  tracks,
  isLoading = false,
  error,
  onTrackPlay,
  showFavoriteToggle = false,
  onTrackFavoriteToggle,
  getUserTrackFavoriteStatus,
  currentlyPlayingTrackId,
  emptyStateMessage = 'No audio tracks available.',
}: TrackListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" variant="primary" />
        <span className="ml-2 text-stone-600 dark:text-gray-400">Loading tracks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load tracks. Please try again.
        </p>
      </div>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="h-12 w-12 bg-stone-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
          <HiOutlinePlay className="h-6 w-6 text-stone-400" />
        </div>
        <p className="text-stone-600 dark:text-gray-400 text-sm">{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tracks.map((track, index) => (
        <TrackCard
          key={track.id}
          track={track}
          index={index + 1}
          onPlay={() => onTrackPlay?.(track)}
          isPlaying={currentlyPlayingTrackId === track.id}
          showFavoriteToggle={showFavoriteToggle}
          onFavoriteToggle={() => onTrackFavoriteToggle?.(track)}
          isFavorite={getUserTrackFavoriteStatus?.(track.id) || false}
        />
      ))}
    </div>
  );
}
