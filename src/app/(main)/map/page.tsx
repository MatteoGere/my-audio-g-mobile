'use client';

import React, { useState, useCallback } from 'react';
import { MapComponent } from '@/components/map';
import { useMapPOIs, useLocation } from '@/lib/hooks';
import { useAppDispatch, useAppSelector } from '@/lib/redux';
import { selectPoi, setHighlightedTrackId } from '@/lib/redux/slices/mapSlice';
import { POIMarkerData } from '@/types/app-types';
import { FaExpand, FaCompress, FaLocationArrow, FaFilter, FaSearch } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function MapPage() {
  const dispatch = useAppDispatch();
  const { userLocation, requestLocation, startTracking, stopTracking } = useLocation();
  
  // State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Redux state
  const mapCenter = useAppSelector((state) => state.map.center);
  const mapZoom = useAppSelector((state) => state.map.zoom);
  const isLocationEnabled = useAppSelector((state) => state.map.isLocationEnabled);

  // Fetch POIs for the map
  const { pois, isLoading, itineraryColors, refreshPOIs } = useMapPOIs({
    enableCaching: true,
  });

  // Filter POIs based on search
  const filteredPois = React.useMemo(() => {
    if (!searchTerm) return pois;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return pois.filter(poi => 
      poi.trackName.toLowerCase().includes(lowercaseSearch) ||
      poi.itineraryName.toLowerCase().includes(lowercaseSearch) ||
      poi.companyName.toLowerCase().includes(lowercaseSearch)
    );
  }, [pois, searchTerm]);

  // Handle marker click
  const handleMarkerClick = useCallback((poi: POIMarkerData) => {
    setSelectedPoiId(poi.trackId);
    dispatch(selectPoi({
      id: poi.trackId,
      type: 'audio_track',
      position: { lat: poi.latitude, lng: poi.longitude },
      title: poi.trackName,
      description: poi.itineraryName,
      audio_track: {} as any, // This would be populated with full track data
    }));
    dispatch(setHighlightedTrackId(poi.trackId));
  }, [dispatch]);

  // Handle play button click
  const handlePlayClick = useCallback((poi: POIMarkerData) => {
    // TODO: Integrate with audio player
    console.log('Play audio for track:', poi.trackId);
    // dispatch(playTrack(poi.trackId));
  }, []);

  // Handle map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    // Clear selection when clicking empty map area
    setSelectedPoiId(null);
    dispatch(selectPoi(null));
    dispatch(setHighlightedTrackId(null));
  }, [dispatch]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Center on user location
  const centerOnUser = useCallback(async () => {
    if (!isLocationEnabled) {
      await requestLocation();
    }
    if (userLocation) {
      // The map will auto-center when location is updated
    }
  }, [isLocationEnabled, requestLocation, userLocation]);

  return (
    <div className="relative w-full h-full bg-gray-50">
      {/* Search and Filter Bar */}
      {!isFullscreen && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <Input
                type="text"
                placeholder="Search tracks, itineraries, or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="px-3"
            >
              <FaFilter />
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredPois.length} of {pois.length} locations
              </div>
              {/* TODO: Add more filter options */}
            </div>
          )}
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Fullscreen Toggle */}
        <Button
          onClick={toggleFullscreen}
          className="bg-white text-gray-700 hover:bg-gray-50 shadow-lg p-3"
          variant="outline"
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </Button>

        {/* Center on User */}
        <Button
          onClick={centerOnUser}
          className="bg-white text-gray-700 hover:bg-gray-50 shadow-lg p-3"
          variant="outline"
          disabled={!isLocationEnabled && !userLocation}
        >
          <FaLocationArrow />
        </Button>
      </div>

      {/* Map Container */}
      <div className={`w-full ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-6rem)]'}`}>
        <MapComponent
          className="w-full h-full"
          pois={filteredPois}
          showUserLocation={true}
          fullscreen={isFullscreen}
          interactive={true}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          selectedPoiId={selectedPoiId}
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading map data...</span>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {!isFullscreen && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              {filteredPois.length} locations • {new Set(filteredPois.map(p => p.itineraryId)).size} itineraries
            </div>
            <div>
              {userLocation && (
                <span className="text-green-600">Location enabled</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
