'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HiOutlineHeart, HiHeart, HiOutlineClock, HiOutlineMapPin } from 'react-icons/hi2';
import { Database } from '../../types/supabase-types';
import { useGetSignedImageUrlQuery } from '../../store/api/supabaseApi';
import { Spinner } from '../ui';

type AudioItinerary = Database['public']['Tables']['audio_itinerary']['Row'] & {
  image_file?: Database['public']['Tables']['image_file']['Row'];
};

interface ItineraryCardProps {
  itinerary: AudioItinerary;
  onFavoriteToggle?: (itineraryId: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  showLocation?: boolean;
  distance?: number; // in meters
  className?: string;
}

export function ItineraryCard({
  itinerary,
  onFavoriteToggle,
  isFavorite = false,
  showLocation = false,
  distance,
  className = '',
}: ItineraryCardProps) {
  const [imageError, setImageError] = useState(false);

  // Get signed URL for image if available
  const {
    data: imageUrl,
    isLoading: imageLoading,
    error: imageUrlError,
  } = useGetSignedImageUrlQuery(itinerary.image_file?.image_storage_key || '', {
    skip: !itinerary.image_file?.image_storage_key,
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(itinerary.id, !isFavorite);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Link href={`/itinerary/${itinerary.id}`} className={`block ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 hover:shadow-medium dark:hover:border-gray-600 transition-all duration-200 overflow-hidden">
        {/* Image Section */}
        <div className="relative h-48 bg-stone-100 dark:bg-gray-700">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="md" variant="primary" />
            </div>
          )}

          {imageUrl && !imageError && !imageLoading && (
            <Image
              src={imageUrl}
              alt={itinerary.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {(!imageUrl || imageError || imageUrlError) && !imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-stone-400 dark:text-gray-500 text-center">
                <div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-stone-200 dark:bg-gray-600 flex items-center justify-center">
                  <HiOutlineMapPin className="h-6 w-6" />
                </div>
                <span className="text-sm">No image</span>
              </div>
            </div>
          )}

          {/* Favorite Button */}
          {onFavoriteToggle && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? (
                <HiHeart className="h-5 w-5 text-red-500" />
              ) : (
                <HiOutlineHeart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}

          {/* Distance Badge */}
          {showLocation && distance !== undefined && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-primary/90 text-white text-sm font-medium backdrop-blur-sm">
              {formatDistance(distance)}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3
            className="font-semibold text-gray-900 dark:text-white mb-2 overflow-hidden text-ellipsis"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {itinerary.name}
          </h3>

          <p
            className="text-sm text-stone-600 dark:text-gray-400 mb-3 overflow-hidden text-ellipsis"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {itinerary.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <HiOutlineClock className="h-4 w-4" />
                <span>{formatDuration(itinerary.total_duration)}</span>
              </div>
              {showLocation && (
                <div className="flex items-center space-x-1">
                  <HiOutlineMapPin className="h-4 w-4" />
                  <span>Nearby</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
