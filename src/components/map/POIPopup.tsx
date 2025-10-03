'use client';

import React from 'react';
import { Popup } from 'react-leaflet';
import { POIMarkerData } from '@/types/app-types';
import { useSignedUrl, useFavorites } from '@/lib/hooks';
import { useAppDispatch, useAppSelector } from '@/lib/redux';
import { FaPlay, FaPause, FaMusic, FaClock, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import tokens from '@/design/tokens';

interface POIPopupProps {
  poi: POIMarkerData;
  color: string;
  onPlayClick?: (poi: POIMarkerData) => void;
  onClose?: () => void;
}

export const POIPopup: React.FC<POIPopupProps> = ({ poi, color, onPlayClick, onClose }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Get signed URL for track image if available
  const { signedUrl: imageUrl, isLoading: imageLoading } = useSignedUrl(
    poi.imageStorageKey || '',
    'image-files',
    3600,
  );

  // Check if this track is currently playing
  const currentTrackId = useAppSelector((state) => state.audio.currentTrack?.id);
  const playbackState = useAppSelector((state) => state.audio.playbackState);
  const isPlaying = playbackState.isPlaying;
  const isCurrentTrack = currentTrackId === poi.trackId;

  const { favoriteTrackIds, toggleFavorite, isAddingFavorite, isRemovingFavorite } = useFavorites();
  const isFavorite = favoriteTrackIds.includes(poi.trackId);
  const favoritesBusy = isAddingFavorite || isRemovingFavorite;

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to the itinerary play page for this POI
    // If there is no dedicated play page, adjust to `/itinerary/${poi.itineraryId}`
    router.push(`/itinerary/${poi.itineraryId}/play`);
  };

  return (
    <Popup
      closeButton={true}
      minWidth={280}
      maxWidth={320}
      className="poi-popup"
      autoPan={false}
      autoPanPadding={[0, 0]}
    >
      <div className="flex flex-col bg-surface text-foreground rounded-xl  max-w-full overflow-hidden">
        {/* Header */}
        {poi.imageStorageKey && (
          <div className="relative h-32 bg-muted/20 flex-shrink-0">
            {imageLoading ? (
              <div className="absolute inset-0 bg-muted/20 animate-pulse flex items-center justify-center">
                <FaMusic className="text-muted text-2xl" />
              </div>
            ) : imageUrl ? (
              <img
                key={imageUrl}
                src={imageUrl}
                alt={poi.trackName}
                className="w-full h-full object-cover"
                sizes="320px"
              />
            ) : (
              <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                <FaMusic className="text-muted text-2xl" />
              </div>
            )}

            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button
                onClick={handlePlayClick}
                className="text-foreground rounded-full"
                variant="ghost"
              >
                {isCurrentTrack && isPlaying ? (
                  <FaPause className="text-lg" />
                ) : (
                  <FaPlay className="text-lg ml-1" />
                )}
              </Button>
            </div>

            {isCurrentTrack && (
              <div className="absolute top-2 right-2">
                <Badge variant="success" className="animate-pulse">
                  {isPlaying ? 'Playing' : 'Paused'}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-4 flex flex-col gap-3">
          <h3 className="font-bold text-lg text-foreground mb-0 line-clamp-2">{poi.trackName}</h3>

          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-muted font-medium truncate">{poi.itineraryName}</span>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted">
            <div className="flex items-center gap-2">
              <FaClock className="text-xs" />
              <span>{formatDuration(poi.duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <FaBuilding className="text-xs" />
              <span className="truncate">{poi.companyName}</span>
            </div>

            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-xs" />
              <span className="text-xs">
                {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handlePlayClick}
              className="flex-1 flex items-center gap-2"
              variant="primary"
              style={{ '--tw-bg-opacity': 1 } as any}
            >
              {isCurrentTrack && isPlaying ? (
                <>
                  <FaPause />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <FaPlay />
                  <span>Play</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              className="px-3"
              loading={favoritesBusy}
              aria-label={isFavorite ? 'Remove track from favourites' : 'Add track to favourites'}
              onClick={(event) => {
                event.stopPropagation();
                void toggleFavorite({ favouriteId: poi.trackId, type: 'FAVOURITE-TRACK' });
              }}
            >
              {isFavorite ? (
                <HiHeart
                  className="h-5 w-5"
                  aria-hidden="true"
                  style={{ color: tokens.colors.error, opacity: 0.95 }}
                />
              ) : (
                <HiOutlineHeart className="h-5 w-5" aria-hidden="true" style={{ opacity: 0.65 }} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default POIPopup;
