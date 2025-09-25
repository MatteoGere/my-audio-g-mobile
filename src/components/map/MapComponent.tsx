'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
import { useAppSelector, useAppDispatch } from '@/lib/redux';
import { setCenter, setZoom, setBounds, setUserInteracting } from '@/lib/redux/slices/mapSlice';
import { useLocation } from '@/lib/hooks';
import { POIMarkerData } from '@/types/app-types';
import { POIMarker } from './POIMarker';
import { UserLocationMarker } from './UserLocationMarker';
import { MapEventHandler } from './MapEventHandler';
import { RouteVisualization } from './RouteVisualization';
import tokens from '@/design/tokens';
import 'leaflet/dist/leaflet.css';
import './map.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MapComponentProps {
  className?: string;
  pois?: POIMarkerData[];
  showUserLocation?: boolean;
  interactive?: boolean;
  onMarkerClick?: (poi: POIMarkerData) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPoiId?: string;
  itineraryFilter?: string; // Show only POIs from this itinerary
  showRoute?: boolean; // Show route between POIs
  animatedRoute?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  className = '',
  pois = [],
  showUserLocation = true,
  interactive = true,
  onMarkerClick,
  onMapClick,
  selectedPoiId,
  itineraryFilter,
  showRoute = false,
  animatedRoute = false,
}) => {
  const dispatch = useAppDispatch();
  const mapRef = useRef<LeafletMap>(null);

  // Redux state
  const center = useAppSelector((state) => state.map.center);
  const zoom = useAppSelector((state) => state.map.zoom);
  const isUserInteracting = useAppSelector((state) => state.map.isUserInteracting);
  const followUserLocation = useAppSelector((state) => state.map.followUserLocation);
  const mapStyle = useAppSelector((state) => state.map.mapStyle);
  const showPOILabels = useAppSelector((state) => state.map.showPOILabels);

  // Location hook
  const { userLocation, isLocationEnabled } = useLocation();

  // Filter POIs by itinerary if specified
  const filteredPois = useMemo(() => {
    return itineraryFilter ? pois.filter((poi) => poi.itineraryId === itineraryFilter) : pois;
  }, [pois, itineraryFilter]);

  // Generate colors for itineraries
  const itineraryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    // Prefer semantic tokens for primary semantic colors and fall back to tuned hexes for variety
    const colorPalette = [
      tokens.colors.primary,
      tokens.colors.error,
      tokens.colors.success,
      tokens.colors.warning,
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#84CC16', // lime
      '#F97316', // orange
      '#6366F1', // indigo
    ];

    filteredPois.forEach((poi, index) => {
      if (!colors[poi.itineraryId]) {
        colors[poi.itineraryId] = colorPalette[Object.keys(colors).length % colorPalette.length];
      }
    });

    return colors;
  }, [filteredPois]);

  // Map tile layer based on style
  const tileLayer = useMemo(() => {
    switch (mapStyle) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution:
            '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        };
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
    }
  }, [mapStyle]);

  // Handle map interactions
  const handleMapMove = (center: { lat: number; lng: number }, zoom: number) => {
    dispatch(setCenter({ latitude: center.lat, longitude: center.lng }));
    dispatch(setZoom(zoom));
  };

  const handleMapMoveStart = () => {
    dispatch(setUserInteracting(true));
  };

  const handleMapMoveEnd = () => {
    dispatch(setUserInteracting(false));
  };

  const handleMapBoundsChange = (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    dispatch(setBounds(bounds));
  };

  // Ensure map resizes properly on mount
  useEffect(() => {
    if (mapRef.current) {
      // Try multiple invalidations with small delays — sometimes the DOM needs a
      // couple frames to finish layout (mobile browsers / Next.js hydration quirks).
      const doInvalidate = () => {
        try {
          if (mapRef.current) mapRef.current.invalidateSize();
        } catch (e) {
          /* ignore */
        }
      };

      doInvalidate();
      const t1 = window.setTimeout(doInvalidate, 120);
      const t2 = window.setTimeout(doInvalidate, 300);
      const t3 = window.setTimeout(doInvalidate, 700);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, []);

  // Listen for explicit resize events from the page so Leaflet can re-render tiles
  useEffect(() => {
    const handler = () => {
      try {
        if (mapRef.current) mapRef.current.invalidateSize();
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('map-resize', handler);
    return () => window.removeEventListener('map-resize', handler);
  }, []);

  // Follow Redux center/zoom updates by setting the map view when needed.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // If the user is interacting with the map, avoid interrupting them
    if (isUserInteracting) return;

    try {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();

      const latChanged = Math.abs(currentCenter.lat - center.latitude) > 1e-6;
      const lngChanged = Math.abs(currentCenter.lng - center.longitude) > 1e-6;
      const zoomChanged = currentZoom !== zoom;

      if (latChanged || lngChanged || zoomChanged) {
        map.setView([center.latitude, center.longitude], zoom, { animate: true });
      }
    } catch (e) {
      // ignore if map not ready
    }
  }, [center.latitude, center.longitude, zoom, isUserInteracting]);

  // Map container classes
  const mapClasses = `relative w-full h-full overflow-hidden rounded-lg ${className}`.trim();

  return (
    <div className={mapClasses}>
      <MapContainer
        ref={mapRef}
        center={[center.latitude, center.longitude]}
        zoom={zoom}
        className="w-full h-full z-0"
        // disable Leaflet's default zoom controls because we render custom controls
        zoomControl={false}
        attributionControl={true}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
      >
        <TileLayer {...tileLayer} />

        {/* Event Handler Component */}
        <MapEventHandler
          onMove={handleMapMove}
          onMoveStart={handleMapMoveStart}
          onMoveEnd={handleMapMoveEnd}
          onBoundsChange={handleMapBoundsChange}
          onClick={onMapClick}
        />

        {/* Route Visualization */}
        {showRoute && (
          <RouteVisualization
            pois={filteredPois}
            itineraryId={itineraryFilter}
            color={itineraryFilter ? itineraryColors[itineraryFilter] : undefined}
            showDirections={true}
            animated={animatedRoute}
          />
        )}

        {/* User Location Marker */}
        {showUserLocation && isLocationEnabled && userLocation && (
          <UserLocationMarker
            position={[userLocation.latitude, userLocation.longitude]}
            accuracy={50} // You can get this from location accuracy
          />
        )}

        {/* POI Markers */}
        {filteredPois.map((poi) => (
          <POIMarker
            key={poi.trackId}
            poi={poi}
            color={itineraryColors[poi.itineraryId]}
            isSelected={selectedPoiId === poi.trackId}
            showLabel={showPOILabels}
            onClick={() => onMarkerClick?.(poi)}
          />
        ))}
      </MapContainer>

      {/* No fullscreen overlay here; fullscreen is handled by container classes and map resize */}
    </div>
  );
};

export default MapComponent;
