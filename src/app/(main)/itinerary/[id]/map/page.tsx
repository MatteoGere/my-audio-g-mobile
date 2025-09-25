'use client';

import React, { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapComponent } from '@/components/map';
import { useMapPOIs } from '@/lib/hooks';
import { useGetAudioItineraryQuery } from '@/lib/redux/api/apiSlice';
import { useAppDispatch } from '@/lib/redux';
import { selectPoi, setHighlightedTrackId } from '@/lib/redux/slices/mapSlice';
import { POIMarkerData } from '@/types/app-types';
import { FaArrowLeft, FaPlay, FaRoute } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ItineraryMapPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const itineraryId = params.id as string;

  // State
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(true);

  // Fetch itinerary data
  const { data: itinerary, isLoading: itineraryLoading } = useGetAudioItineraryQuery(itineraryId);

  // Fetch POIs for this specific itinerary
  const { pois, isLoading: poisLoading, itineraryColors } = useMapPOIs({
    itineraryId,
    enableCaching: true,
  });

  const isLoading = itineraryLoading || poisLoading;

  // Handle marker click
  const handleMarkerClick = useCallback((poi: POIMarkerData) => {
    setSelectedPoiId(poi.trackId);
    dispatch(selectPoi({
      id: poi.trackId,
      type: 'track',
      latitude: poi.latitude,
      longitude: poi.longitude,
      title: poi.trackName,
      description: poi.itineraryName,
      trackId: poi.trackId,
      itineraryId: poi.itineraryId,
    }));
    dispatch(setHighlightedTrackId(poi.trackId));
  }, [dispatch]);

  // Handle play itinerary
  const handlePlayItinerary = useCallback(() => {
    // TODO: Start playing the itinerary from the first track
    console.log('Play itinerary:', itineraryId);
    // dispatch(playItinerary(itineraryId));
  }, [itineraryId]);

  // Handle track play
  const handlePlayTrack = useCallback((poi: POIMarkerData) => {
    // TODO: Play specific track
    console.log('Play track:', poi.trackId);
    // dispatch(playTrack(poi.trackId));
  }, []);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-700">Loading itinerary map...</span>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Itinerary not found</h1>
          <p className="text-gray-600 mb-4">The requested itinerary could not be loaded.</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-50">
      {/* Header */}
      (
        <div className="absolute top-4 left-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="px-3"
            >
              <FaArrowLeft />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">{itinerary.name}</h1>
              <p className="text-sm text-gray-600">
                {pois.length} locations • Total: {formatDuration(itinerary.total_duration || 0)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePlayItinerary}
              className="flex-1 flex items-center gap-2"
              style={{ backgroundColor: itineraryColors[itineraryId] || '#3B82F6' }}
            >
              <FaPlay />
              <span>Play Itinerary</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRoute(!showRoute)}
              className="px-3"
            >
              <FaRoute />
            </Button>
            {/* fullscreen removed */}
          </div>
        </div>
      )

      {/* Map Container */}
      <div className="w-full h-[calc(100vh-8rem)] mt-32">
        <MapComponent
          className="w-full h-full"
          pois={pois}
          showUserLocation={true}
          interactive={true}
          onMarkerClick={handleMarkerClick}
          selectedPoiId={selectedPoiId || undefined}
          itineraryFilter={itineraryId}
          showRoute={showRoute}
          animatedRoute={false}
        />
      </div>

      {/* Track List Sidebar */}
      {pois.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="max-h-32 overflow-y-auto">
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 mb-2">Tracks in this itinerary</h3>
              <div className="space-y-1">
                {pois.map((poi, index) => (
                  <div
                    key={poi.trackId}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                      selectedPoiId === poi.trackId 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleMarkerClick(poi)}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: itineraryColors[poi.itineraryId] || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {index + 1}. {poi.trackName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDuration(poi.duration)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(poi);
                      }}
                      className="flex-shrink-0 p-1"
                    >
                      <FaPlay className="text-xs" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}