'use client';

import {
  HiOutlinePlay,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineHeart,
  HiOutlineShare,
} from 'react-icons/hi2';
import { Button, Badge } from '../ui';
import type { Database } from '../../types/supabase-types';

export interface ItineraryHeroProps {
  itinerary: Database['public']['Tables']['audio_itinerary']['Row'] & {
    image_file?: Database['public']['Tables']['image_file']['Row'];
  };
  imageUrl?: string;
  tracksCount?: number;
  isFavorite?: boolean;
  showFavoriteToggle?: boolean;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
  onStartTour?: () => void;
  canStartTour?: boolean;
}

export function ItineraryHero({
  itinerary,
  imageUrl,
  tracksCount = 0,
  isFavorite = false,
  showFavoriteToggle = false,
  onFavoriteToggle,
  onShare,
  onStartTour,
  canStartTour = true,
}: ItineraryHeroProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <section className="relative">
      {/* Hero Image */}
      {imageUrl ? (
        <div className="relative h-64 bg-stone-200 dark:bg-gray-700">
          <img
            src={imageUrl}
            alt={itinerary.name}
            className="object-cover w-full h-full absolute inset-0"
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <HiOutlineMapPin className="h-16 w-16 text-primary/50" />
        </div>
      )}

      {/* Action Buttons Overlay */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="!p-2 bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30"
          >
            <HiOutlineShare className="h-5 w-5 text-white" />
          </Button>
        )}

        {showFavoriteToggle && onFavoriteToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFavoriteToggle}
            className="!p-2 bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30"
          >
            <HiOutlineHeart
              className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`}
            />
          </Button>
        )}
      </div>

      {/* Floating Info Card */}
      <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
        <div className="mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {itinerary.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-stone-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <HiOutlineClock className="h-4 w-4" />
                    <span>{formatDuration(itinerary.total_duration)}</span>
                  </div>
                  {tracksCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <HiOutlinePlay className="h-4 w-4" />
                      <span>{tracksCount} tracks</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Start Tour Button */}
            {onStartTour && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={onStartTour}
                disabled={!canStartTour}
              >
                <HiOutlinePlay className="h-5 w-5 mr-2" />
                Start Tour
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
