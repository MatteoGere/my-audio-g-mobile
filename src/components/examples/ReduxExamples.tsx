/**
 * Redux Store Usage Examples
 *
 * This file demonstrates how to use the Redux store with RTK Query
 * for the Audio Guide PWA.
 */

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  useSignInMutation,
  useGetAudioItinerariesQuery,
  useGetNearbyItinerariesQuery,
  useAddFavouriteMutation,
} from '../../store/api/supabaseApi';
import { play, pause, setPlaylist, setVolume } from '../../store/slices/audioPlayerSlice';
import { startTracking, setNearbyRadius } from '../../store/slices/locationSlice';
import { useSignedAudioUrl } from '../../hooks/useSignedUrl';

export function ReduxExamples() {
  const dispatch = useAppDispatch();

  // Access state from different slices
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentTrack, isPlaying } = useAppSelector((state) => state.audioPlayer);
  const { currentPosition } = useAppSelector((state) => state.location);

  // RTK Query hooks for API calls
  const { data: itineraries, isLoading, error } = useGetAudioItinerariesQuery();

  // Conditional query - only fetch nearby when we have location
  const { data: nearbyItineraries } = useGetNearbyItinerariesQuery(
    {
      latitude: currentPosition?.latitude || 0,
      longitude: currentPosition?.longitude || 0,
      radiusMeters: 1000,
    },
    {
      skip: !currentPosition, // Skip query if no location
    },
  );

  // Mutations
  const [signIn, { isLoading: isSigningIn }] = useSignInMutation();
  const [addFavourite] = useAddFavouriteMutation();

  // Custom hook for signed URLs
  const { url: audioUrl, isLoading: isLoadingAudio } = useSignedAudioUrl(
    currentTrack?.audio_storage_key || '',
  );

  // Auth example
  const handleSignIn = async () => {
    try {
      await signIn({
        email: 'user@example.com',
        password: 'password',
      }).unwrap();

      // Success - user will be automatically set in auth slice
      console.log('Signed in successfully');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  // Audio player example
  const handlePlayItinerary = (itinerary: any, tracks: any[]) => {
    // Set playlist in Redux
    dispatch(setPlaylist({ tracks, itinerary }));

    // Start playing first track
    if (tracks.length > 0) {
      dispatch(play());
    }
  };

  // Location tracking example
  const handleStartLocationTracking = () => {
    dispatch(startTracking());
    dispatch(setNearbyRadius(2000)); // 2km radius
  };

  // Favorites example
  const handleAddToFavorites = async (itineraryId: string) => {
    if (!user) return;

    try {
      await addFavourite({
        userId: user.id,
        favouriteId: itineraryId,
        type: 'FAVOURITE-ITINERARY',
      }).unwrap();

      console.log('Added to favorites');
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    }
  };

  // Volume control example
  const handleVolumeChange = (volume: number) => {
    dispatch(setVolume(volume));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Redux Usage Examples</h2>

      {/* Auth State */}
      <div>
        <h3 className="font-semibold">Authentication</h3>
        {isAuthenticated ? (
          <p>Welcome, {user?.email}</p>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isSigningIn ? 'Signing in...' : 'Sign In'}
          </button>
        )}
      </div>

      {/* Audio Player State */}
      <div>
        <h3 className="font-semibold">Audio Player</h3>
        {currentTrack ? (
          <div>
            <p>Current: {currentTrack.name}</p>
            <button
              onClick={() => dispatch(isPlaying ? pause() : play())}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        ) : (
          <p>No track selected</p>
        )}
      </div>

      {/* Location State */}
      <div>
        <h3 className="font-semibold">Location</h3>
        {currentPosition ? (
          <p>
            Location: {currentPosition.latitude.toFixed(4)},{currentPosition.longitude.toFixed(4)}
          </p>
        ) : (
          <button
            onClick={handleStartLocationTracking}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Start Location Tracking
          </button>
        )}
      </div>

      {/* API Data */}
      <div>
        <h3 className="font-semibold">Itineraries</h3>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error loading itineraries</p>}
        {itineraries && (
          <div>
            <p>{itineraries.length} itineraries available</p>
            {itineraries.slice(0, 3).map((itinerary) => (
              <div key={itinerary.id} className="border p-2 m-1">
                <h4>{itinerary.name}</h4>
                <p>{itinerary.description}</p>
                <button
                  onClick={() => handleAddToFavorites(itinerary.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  Add to Favorites
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearby Itineraries */}
      {nearbyItineraries && nearbyItineraries.length > 0 && (
        <div>
          <h3 className="font-semibold">Nearby Itineraries</h3>
          <p>{nearbyItineraries.length} nearby tours found</p>
        </div>
      )}

      {/* Signed URL Example */}
      {currentTrack && (
        <div>
          <h3 className="font-semibold">Signed URL</h3>
          {isLoadingAudio && <p>Loading audio URL...</p>}
          {audioUrl && <p>Audio URL ready: {audioUrl.substring(0, 50)}...</p>}
        </div>
      )}
    </div>
  );
}

/**
 * Key Patterns Demonstrated:
 *
 * 1. useAppSelector - Access state from any slice
 * 2. useAppDispatch - Dispatch actions to update state
 * 3. RTK Query hooks - Automatic API calls with caching
 * 4. Conditional queries - Skip API calls based on conditions
 * 5. Mutations - Update server data and invalidate cache
 * 6. Custom hooks - Reusable logic for signed URLs
 * 7. Error handling - Handle API errors gracefully
 * 8. Loading states - Show appropriate UI feedback
 */
