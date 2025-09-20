'use client';

import { HiOutlinePlay, HiOutlineMapPin, HiOutlineHeart } from 'react-icons/hi2';
import { useGetSignedImageUrlQuery } from '../../store/api/supabaseApi';
import { Button, Badge } from '../ui';
import type { Database } from '../../types/supabase-types';

export interface TrackCardProps {
  track: Database['public']['Tables']['audio_track']['Row'] & {
    image_file?: Database['public']['Tables']['image_file']['Row'];
    audio_track_poi?: Database['public']['Tables']['audio_track_poi']['Row'];
  };
  index: number;
  onPlay: () => void;
  isPlaying?: boolean;
  showFavoriteToggle?: boolean;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
}

export function TrackCard({
  track,
  index,
  onPlay,
  isPlaying = false,
  showFavoriteToggle = false,
  onFavoriteToggle,
  isFavorite = false,
}: TrackCardProps) {
  const { data: trackImageUrl } = useGetSignedImageUrlQuery(
    track.image_file?.image_storage_key || '',
    {
      skip: !track.image_file?.image_storage_key,
    },
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-sand-50 dark:bg-gray-700/50 rounded-lg hover:bg-sand-100 dark:hover:bg-gray-700 transition-colors">
      {/* Track Number */}
      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
        <span className="text-xs font-medium text-primary">{index}</span>
      </div>

      {/* Track Image */}
      <div className="flex-shrink-0 w-12 h-12 bg-stone-200 dark:bg-gray-600 rounded-lg overflow-hidden">
        {trackImageUrl ? (
          <img
            src={trackImageUrl}
            alt={track.name || `Track ${index}`}
            width={48}
            height={48}
            className="object-cover w-full h-full"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlinePlay className="h-5 w-5 text-stone-400" />
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {track.name || `Track ${index}`}
        </h3>
        {track.description && (
          <p className="text-xs text-stone-600 dark:text-gray-400 truncate">{track.description}</p>
        )}
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant="outline" size="sm">
            {formatDuration(track.duration)}
          </Badge>
          {track.audio_track_poi && (
            <Badge variant="outline" size="sm">
              <HiOutlineMapPin className="h-3 w-3 mr-1" />
              POI
            </Badge>
          )}
          {isPlaying && (
            <Badge variant="primary" size="sm">
              Playing
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {showFavoriteToggle && onFavoriteToggle && (
          <Button variant="ghost" size="sm" onClick={onFavoriteToggle} className="!p-2">
            <HiOutlineHeart
              className={`h-4 w-4 ${
                isFavorite ? 'text-red-500 fill-current' : 'text-stone-600 dark:text-gray-400'
              }`}
            />
          </Button>
        )}

        <Button
          variant={isPlaying ? 'primary' : 'ghost'}
          size="sm"
          onClick={onPlay}
          className="!p-2"
        >
          <HiOutlinePlay className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
