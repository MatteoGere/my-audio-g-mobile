'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapComponent } from '@/components/map';
import { useMapPOIs, useLocation } from '@/lib/hooks';
import { useAppDispatch, useAppSelector } from '@/lib/redux';
import { selectPoi, setHighlightedTrackId, setMapStyle, setMapView } from '@/lib/redux/slices/mapSlice';
import { POIMarkerData } from '@/types/app-types';
import { FaExpand, FaCompress, FaLocationArrow, FaFilter, FaSearch } from 'react-icons/fa';
import { HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi2';
import Button from '@/components/ui/Button';
import { FaGlobe, FaSatellite, FaTree, FaMoon } from 'react-icons/fa';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui';

export default function MapPage() {
  const dispatch = useAppDispatch();
  const { userLocation, requestLocation, startTracking, stopTracking, getCurrentPosition } =
    useLocation();
  const mapStyle = useAppSelector((state) => state.map.mapStyle);

  // State
  // fullscreen removed: map is always shown in standard mode
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
    return pois.filter(
      (poi) =>
        poi.trackName.toLowerCase().includes(lowercaseSearch) ||
        poi.itineraryName.toLowerCase().includes(lowercaseSearch) ||
        poi.companyName.toLowerCase().includes(lowercaseSearch),
    );
  }, [pois, searchTerm]);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (poi: POIMarkerData) => {
      setSelectedPoiId(poi.trackId);
      dispatch(
        selectPoi({
          id: poi.trackId,
          type: 'track',
          latitude: poi.latitude,
          longitude: poi.longitude,
          title: poi.trackName,
          description: poi.itineraryName,
          trackId: poi.trackId,
          itineraryId: poi.itineraryId,
        }),
      );
      dispatch(setHighlightedTrackId(poi.trackId));
    },
    [dispatch],
  );

  // Handle play button click
  const handlePlayClick = useCallback((poi: POIMarkerData) => {
    // TODO: Integrate with audio player
    console.log('Play audio for track:', poi.trackId);
    // dispatch(playTrack(poi.trackId));
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      // Clear selection when clicking empty map area
      setSelectedPoiId(null);
      dispatch(selectPoi(null));
      dispatch(setHighlightedTrackId(null));
    },
    [dispatch],
  );

  // Center on user location
  const centerOnUser = useCallback(async () => {
    try {
      // Use getCurrentPosition which returns the resolved coordinates immediately.
      const loc = await getCurrentPosition();
      if (loc) {
        dispatch(
          setMapView({
            center: { latitude: loc.latitude, longitude: loc.longitude },
            zoom: mapZoom,
          }),
        );
      }
    } catch (e) {
      // If getCurrentPosition fails, fall back to requesting permission which will update store
      if (!isLocationEnabled) {
        await requestLocation();
      }
      if (userLocation) {
        dispatch(setMapView({ center: userLocation, zoom: mapZoom }));
      }
    }
  }, [getCurrentPosition, requestLocation, isLocationEnabled, userLocation, dispatch, mapZoom]);

  // Calculate available height between header and bottom navigation
  const [mapHeightStyle, setMapHeightStyle] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function updateHeight() {
      try {
        const header = document.querySelector('header');
        const bottomNav = document.querySelector('nav[role="navigation"], nav.fixed, .fixed');

        const headerHeight = header ? (header as HTMLElement).getBoundingClientRect().height : 0;
        const bottomHeight = bottomNav
          ? (bottomNav as HTMLElement).getBoundingClientRect().height
          : 0;

        const viewportHeight = window.innerHeight;

        // Use container top offset so we account for any page padding/margins above the map
        // Small extra gap so map doesn't touch bottom nav and a little breathing room
        const extraGap = 32; // pixels (reduced per request)

        // Compute available viewport space between header and bottom navigation.
        // Note: do NOT subtract the container's top offset here — that often double-counts
        // spacing and produces a smaller height than available. Using header/bottom heights
        // is more reliable across layouts.
        const available = Math.max(0, viewportHeight - headerHeight - bottomHeight - extraGap);

        // Ensure a sensible minimum height
        const minH = 200;
        const newHeight = `${Math.max(minH, Math.floor(available))}px`;
        setMapHeightStyle(newHeight);
        // Wait a frame so React applies the inline style to the DOM, then dispatch
        // a resize event so Leaflet can recalculate tile layout. A tiny timeout
        // after rAF ensures mobile browsers finished layout.
        try {
          requestAnimationFrame(() => {
            window.setTimeout(() => {
              try {
                window.dispatchEvent(new Event('map-resize'));
              } catch (e) {
                /* ignore */
              }
            }, 50);
          });
        } catch (e) {
          // ignore in environments without window/requestAnimationFrame
        }
      } catch (e) {
        setMapHeightStyle(undefined);
      }
    }

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div className="relative w-full h-full bg-background scale-105">
      {/* Search bar moved to bottom (replaces stats banner) - top search removed */}

      {/* Map Controls */}
      <div className={`absolute top-4 right-4 z-10 flex flex-col gap-3 pointer-events-auto`}>
        {/* Center on User */}
        <div className="">
          <Button
            onClick={centerOnUser}
            className="min-w-[44px] min-h-[44px] p-0"
            disabled={!isLocationEnabled && !userLocation}
            aria-label="Center on user"
          >
            <FaLocationArrow className="h-5 w-5" />
          </Button>
        </div>

        {/* Custom Zoom Controls (icon-only, no background) */}
        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={() => dispatch(setMapView({ center: mapCenter, zoom: mapZoom + 1 }))}
            className="min-w-[44px] min-h-[44px] p-0"
            aria-label="Zoom in"
          >
            <HiOutlinePlus className="h-5 w-5" />
          </Button>
          <Button
            onClick={() =>
              dispatch(setMapView({ center: mapCenter, zoom: Math.max(1, mapZoom - 1) }))
            }
            className="min-w-[44px] min-h-[44px] p-0"
            aria-label="Zoom out"
          >
            <HiOutlineMinus className="h-5 w-5" />
          </Button>
              
                    <Button
                      className="min-w-[44px] min-h-[44px] p-0"
                      aria-label="Cambia mappa"
                      onClick={() => {
                        const order: Array<'default' | 'satellite' | 'terrain' | 'dark'> = [
                          'default',
                          'satellite',
                          'terrain',
                          'dark',
                        ];
                        const current = mapStyle ?? 'default';
                        const idx = order.indexOf(current);
                        const next = order[(idx + 1) % order.length];
                        dispatch(setMapStyle(next));
                      }}
                    >
                      {
                        (() => {
                          switch (mapStyle) {
                            case 'satellite':
                              return <FaSatellite className="h-5 w-5" />;
                            case 'terrain':
                              return <FaTree className="h-5 w-5" />;
                            case 'dark':
                              return <FaMoon className="h-5 w-5" />;
                            default:
                              return <FaGlobe className="h-5 w-5" />;
                          }
                        })()
                      }
                    </Button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className="w-full"
        style={mapHeightStyle ? { height: mapHeightStyle } : undefined}
      >
        <MapComponent
          className="w-full h-full"
          pois={filteredPois}
          showUserLocation={true}
          interactive={true}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          selectedPoiId={selectedPoiId || undefined}
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-surface/75 flex items-center justify-center z-20">
          <Card padding="lg" className="bg-surface rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted">Loading map data...</span>
          </Card>
        </div>
      )}

      {/* Search and Filter Bar (moved to bottom) */}
      <div className={`absolute bottom-4 left-4 right-4 z-10 rounded-lg shadow-lg`}>
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted text-sm" />
            <Input
              type="text"
              placeholder="Search tracks, itineraries, or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-4 py-2 w-full bg-surface"
            />
          </div>
          <Button size="sm" onClick={() => setShowFilters(!showFilters)} className="px-3">
            <FaFilter />
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <Card padding="sm" className="mt-3 bg-surface">
            <div className="text-sm text-muted">
              Showing {filteredPois.length} of {pois.length} locations
            </div>
            {/* TODO: Add more filter options */}
          </Card>
        )}
      </div>
    </div>
  );
}
