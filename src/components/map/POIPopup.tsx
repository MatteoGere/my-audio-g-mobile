'use client';

import React from 'react';
import { Popup } from 'react-leaflet';
import { POIMarkerData } from '@/types/app-types';
import { useSignedUrl } from '@/lib/hooks';
import { useAppDispatch, useAppSelector } from '@/lib/redux';
import { FaPlay, FaPause, FaMusic, FaClock, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Image from 'next/image';

interface POIPopupProps {
  poi: POIMarkerData;
  color: string;
  onPlayClick?: (poi: POIMarkerData) => void;
  onClose?: () => void;
}

export const POIPopup: React.FC<POIPopupProps> = ({
  poi,
  color,
  onPlayClick,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  
  // Get signed URL for track image if available
  const { signedUrl: imageUrl, isLoading: imageLoading } = useSignedUrl(
    poi.imageStorageKey || '',
    'image-files'
  );

  // Check if this track is currently playing
  const currentTrackId = useAppSelector((state) => state.audio.currentTrack?.id);
  const playbackState = useAppSelector((state) => state.audio.playbackState);
  const isPlaying = playbackState === 'playing';
  const isCurrentTrack = currentTrackId === poi.trackId;

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
    onPlayClick?.(poi);
  };

  return (
    <Popup
      closeButton={true}
      minWidth={280}
      maxWidth={320}
      className="poi-popup"
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Header Image */}
        {poi.imageStorageKey && (
          <div className="relative h-32 bg-gray-200">
            {imageLoading ? (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <FaMusic className="text-gray-400 text-2xl" />
              </div>
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt={poi.trackName}
                fill
                className="object-cover"
                sizes="320px"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <FaMusic className="text-gray-400 text-2xl" />
              </div>
            )}
            
            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button
                onClick={handlePlayClick}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full p-3 shadow-lg"
                variant="ghost"
              >
                {isCurrentTrack && isPlaying ? (
                  <FaPause className="text-lg" />
                ) : (
                  <FaPlay className="text-lg ml-1" />
                )}
              </Button>
            </div>

            {/* Currently playing indicator */}
            {isCurrentTrack && (
              <div className="absolute top-2 right-2">
                <Badge 
                  variant="default" 
                  className="bg-green-500 text-white animate-pulse"
                >
                  {isPlaying ? 'Playing' : 'Paused'}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Track Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
            {poi.trackName}
          </h3>

          {/* Itinerary Info */}
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-700 font-medium truncate">
              {poi.itineraryName}
            </span>
          </div>

          {/* Metadata */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaClock className="text-xs" />
              <span>{formatDuration(poi.duration)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaBuilding className="text-xs" />
              <span className="truncate">{poi.companyName}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaMapMarkerAlt className="text-xs" />
              <span className="text-xs">
                {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handlePlayClick}
              className="flex-1 flex items-center gap-2"
              style={{ backgroundColor: color }}
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
              variant="outline"
              className="px-3"
              onClick={() => {
                // TODO: Add to favorites functionality
                console.log('Add to favorites:', poi.trackId);
              }}
            >
              ♥
            </Button>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default POIPopup;