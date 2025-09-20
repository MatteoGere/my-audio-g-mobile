'use client';

import { useState, useEffect } from 'react';
import { HiOutlineMapPin, HiOutlineFire, HiOutlineSparkles } from 'react-icons/hi2';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
  useGetFeaturedItinerariesQuery,
  useGetNearbyItinerariesQuery,
  useAddFavouriteMutation,
  useRemoveFavouriteMutation,
  useGetUserFavouritesQuery,
} from '../../../store/api/supabaseApi';
import {
  requestLocationPermission,
  startLocationTracking,
  stopLocationTracking,
} from '../../../store/slices/locationSlice';
import { SearchBar } from '../../../components/search/SearchBar';
import { ItineraryCard } from '../../../components/itinerary/ItineraryCard';
import { LocationPermissionPrompt } from '../../../components/location/LocationPermissionPrompt';
import { Spinner } from '../../../components/ui';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    currentPosition,
    locationPermission,
    isTrackingLocation,
    loading: locationLoading,
  } = useAppSelector((state) => state.location);

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(1000); // 1km default

  // Fetch featured itineraries
  const {
    data: featuredItineraries,
    isLoading: featuredLoading,
    error: featuredError,
  } = useGetFeaturedItinerariesQuery({ limit: 6 });

  // Fetch nearby itineraries if location is available
  const {
    data: nearbyItineraries,
    isLoading: nearbyLoading,
    error: nearbyError,
  } = useGetNearbyItinerariesQuery(
    {
      latitude: currentPosition?.latitude || 0,
      longitude: currentPosition?.longitude || 0,
      radiusMeters: nearbyRadius,
    },
    {
      skip: !currentPosition,
    },
  );

  // Fetch user favorites if authenticated
  const userId = useAppSelector((state) => state.auth.user?.id);
  const { data: userFavorites } = useGetUserFavouritesQuery(userId ?? '', {
    skip: !isAuthenticated || !userId,
  });

  // Favorite mutations
  const [addFavorite] = useAddFavouriteMutation();
  const [removeFavorite] = useRemoveFavouriteMutation();

  // Check if location prompt should be shown
  useEffect(() => {
    const shouldShowPrompt =
      locationPermission === 'unknown' || (locationPermission === 'prompt' && !currentPosition);

    setShowLocationPrompt(shouldShowPrompt);
  }, [locationPermission, currentPosition]);

  const handleLocationRequest = async () => {
    try {
      await dispatch(requestLocationPermission()).unwrap();
      if (locationPermission === 'granted') {
        dispatch(startLocationTracking());
      }
      setShowLocationPrompt(false);
    } catch (error) {
      console.error('Failed to request location permission:', error);
    }
  };

  const handleLocationDismiss = () => {
    setShowLocationPrompt(false);
    // Optionally save this preference to not show again
  };

  const handleFavoriteToggle = async (itineraryId: string, isFavorite: boolean) => {
    if (!isAuthenticated || !userId) {
      // Optionally redirect to login or show login prompt
      return;
    }

    try {
      if (!isFavorite) {
        // Add favorite
        await addFavorite({
          userId,
          favouriteId: itineraryId,
          type: 'FAVOURITE-ITINERARY',
        }).unwrap();
      } else {
        // Remove favorite
        const favorite = userFavorites?.find(
          (f) => f.favourite_id === itineraryId && f.type === 'FAVOURITE-ITINERARY',
        );
        if (favorite) {
          await removeFavorite({
            userId,
            favouriteId: itineraryId,
            type: 'FAVOURITE-ITINERARY',
          }).unwrap();
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const isItineraryFavorite = (itineraryId: string) => {
    return (
      userFavorites?.some(
        (f) => f.favourite_id === itineraryId && f.type === 'FAVOURITE-ITINERARY',
      ) || false
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-stone-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MyAudioG</h1>
            <p className="text-sm text-stone-600 dark:text-gray-400">
              Discover amazing audio tours
            </p>
          </div>
          {currentPosition && (
            <div className="flex items-center space-x-1 text-xs text-primary">
              <HiOutlineMapPin className="h-4 w-4" />
              <span>Location enabled</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Search Bar */}
        <SearchBar placeholder="Search audio tours..." />

        {/* Location Permission Prompt */}
        {showLocationPrompt && (
          <LocationPermissionPrompt
            onRequestPermission={handleLocationRequest}
            onDismiss={handleLocationDismiss}
            isLoading={locationLoading}
          />
        )}

        {/* Nearby Tours Section */}
        {currentPosition && (
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <HiOutlineMapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nearby Tours</h2>
            </div>

            {nearbyLoading && (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" variant="primary" />
                <span className="ml-2 text-stone-600 dark:text-gray-400">
                  Finding tours near you...
                </span>
              </div>
            )}

            {nearbyError && (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Failed to load nearby tours. Please try again.
                </p>
              </div>
            )}

            {nearbyItineraries && nearbyItineraries.length > 0 && (
              <div className="grid gap-4">
                {nearbyItineraries.slice(0, 3).map((item: any) => (
                  <ItineraryCard
                    key={item.id}
                    itinerary={item}
                    onFavoriteToggle={isAuthenticated ? handleFavoriteToggle : undefined}
                    isFavorite={isItineraryFavorite(item.id)}
                    showLocation={true}
                    distance={item.distance}
                  />
                ))}
              </div>
            )}

            {nearbyItineraries && nearbyItineraries.length === 0 && (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-stone-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <HiOutlineMapPin className="h-6 w-6 text-stone-400" />
                </div>
                <p className="text-stone-600 dark:text-gray-400 text-sm">
                  No tours found nearby. Try expanding your search area.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Featured Tours Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <HiOutlineFire className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Tours</h2>
          </div>

          {featuredLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" variant="primary" />
              <span className="ml-2 text-stone-600 dark:text-gray-400">
                Loading featured tours...
              </span>
            </div>
          )}

          {featuredError && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 text-sm">
                Failed to load featured tours. Please try again.
              </p>
            </div>
          )}

          {featuredItineraries && (
            <div className="grid gap-4">
              {featuredItineraries.map((itinerary) => (
                <ItineraryCard
                  key={itinerary.id}
                  itinerary={itinerary}
                  onFavoriteToggle={isAuthenticated ? handleFavoriteToggle : undefined}
                  isFavorite={isItineraryFavorite(itinerary.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="pb-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                // Navigate to QR scanner
              }}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all"
            >
              <div className="h-8 w-8 mb-2">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-full h-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm0 10h2a1 1 0 001-1v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zM19 4h2a1 1 0 011 1v3a1 1 0 01-1 1h-2a1 1 0 01-1-1V5a1 1 0 011-1z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">Scan QR</span>
            </button>

            <button
              onClick={() => {
                // Navigate to browse all
              }}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-accent to-accent/80 text-white rounded-xl hover:from-accent/90 hover:to-accent/70 transition-all"
            >
              <HiOutlineSparkles className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Browse All</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
