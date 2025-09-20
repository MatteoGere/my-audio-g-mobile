'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HiOutlineArrowLeft, HiOutlineShare, HiOutlineHeart } from 'react-icons/hi2';
import { useAppSelector } from '../../../../store/hooks';
import {
  useGetAudioItineraryQuery,
  useGetAudioTracksQuery,
  useAddFavouriteMutation,
  useRemoveFavouriteMutation,
  useGetUserFavouritesQuery,
  useGetSignedImageUrlQuery,
} from '../../../../store/api/supabaseApi';
import { Button, Spinner } from '../../../../components/ui';
import { TrackList, ItineraryHero } from '../../../../components';

interface ItineraryDetailPageProps {
  params: {
    id: string;
  };
}

export default function ItineraryDetailPage({ params }: ItineraryDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const userId = useAppSelector((state) => state.auth.user?.id);

  // Fetch itinerary data
  const {
    data: itinerary,
    isLoading: itineraryLoading,
    error: itineraryError,
  } = useGetAudioItineraryQuery(params.id);

  // Fetch tracks for this itinerary
  const {
    data: tracks,
    isLoading: tracksLoading,
    error: tracksError,
  } = useGetAudioTracksQuery(params.id);

  // Fetch user favorites if authenticated
  const { data: userFavorites } = useGetUserFavouritesQuery(userId ?? '', {
    skip: !isAuthenticated || !userId,
  });

  // Favorite mutations
  const [addFavorite] = useAddFavouriteMutation();
  const [removeFavorite] = useRemoveFavouriteMutation();

  // Fetch signed URL for itinerary image
  const { data: itineraryImageUrl } = useGetSignedImageUrlQuery(
    itinerary?.image_file?.image_storage_key || '',
    {
      skip: !itinerary?.image_file?.image_storage_key,
    },
  );

  const [showFullDescription, setShowFullDescription] = useState(false);

  const isItineraryFavorite = () => {
    return (
      userFavorites?.some(
        (f) => f.favourite_id === params.id && f.type === 'FAVOURITE-ITINERARY',
      ) || false
    );
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !userId) return;

    try {
      if (!isItineraryFavorite()) {
        await addFavorite({
          userId,
          favouriteId: params.id,
          type: 'FAVOURITE-ITINERARY',
        }).unwrap();
      } else {
        await removeFavorite({
          userId,
          favouriteId: params.id,
          type: 'FAVOURITE-ITINERARY',
        }).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && itinerary) {
      try {
        await navigator.share({
          title: itinerary.name,
          text: itinerary.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (itineraryLoading) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Spinner size="md" variant="primary" />
          <span className="text-stone-600 dark:text-gray-400">Loading itinerary...</span>
        </div>
      </div>
    );
  }

  if (itineraryError || !itinerary) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Itinerary Not Found
          </h1>
          <p className="text-stone-600 dark:text-gray-400 mb-4">
            The requested itinerary could not be found or loaded.
          </p>
          <Button variant="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-stone-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="!p-2">
            <HiOutlineArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleShare} className="!p-2">
              <HiOutlineShare className="h-5 w-5" />
            </Button>

            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={handleFavoriteToggle} className="!p-2">
                <HiOutlineHeart
                  className={`h-5 w-5 ${
                    isItineraryFavorite()
                      ? 'text-red-500 fill-current'
                      : 'text-stone-600 dark:text-gray-400'
                  }`}
                />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <ItineraryHero
        itinerary={itinerary}
        imageUrl={itineraryImageUrl}
        tracksCount={tracks?.length || 0}
        isFavorite={isItineraryFavorite()}
        showFavoriteToggle={isAuthenticated}
        onFavoriteToggle={handleFavoriteToggle}
        onShare={handleShare}
        onStartTour={() => {
          // Navigate to player with first track
          if (tracks && tracks.length > 0) {
            // TODO: Implement navigation to audio player
            console.log('Starting playbook with tracks:', tracks);
          }
        }}
        canStartTour={tracks ? tracks.length > 0 : false}
      />

      {/* Content */}
      <div className="px-4 pt-20 pb-6 space-y-6">
        {/* Description */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            About this tour
          </h2>
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <p className="text-stone-600 dark:text-gray-400 leading-relaxed">
              {showFullDescription
                ? itinerary.description
                : `${itinerary.description.slice(0, 200)}${
                    itinerary.description.length > 200 ? '...' : ''
                  }`}
            </p>
            {itinerary.description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-primary hover:text-primary/80 font-medium mt-2"
              >
                {showFullDescription ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </section>

        {/* Tracks Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audio Tracks</h2>

          <TrackList
            tracks={tracks}
            isLoading={tracksLoading}
            error={tracksError}
            onTrackPlay={(track) => {
              // TODO: Implement track playback
              console.log('Playing track:', track);
            }}
            emptyStateMessage="No audio tracks available for this itinerary."
          />
        </section>
      </div>
    </div>
  );
}
