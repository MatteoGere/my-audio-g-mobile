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
import 'leaflet/dist/leaflet.css';

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
  fullscreen?: boolean;
  interactive?: boolean;
  onMarkerClick?: (poi: POIMarkerData) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPoiId?: string;
  itineraryFilter?: string; // Show only POIs from this itinerary
}

export const MapComponent: React.FC<MapComponentProps> = ({
  className = '',
  pois = [],
  showUserLocation = true,
  fullscreen = false,
  interactive = true,
  onMarkerClick,
  onMapClick,
  selectedPoiId,
  itineraryFilter,
}) => {
  const dispatch = useAppDispatch();
  const mapRef = useRef<LeafletMap>(null);
  
  // Redux state
  const center = useAppSelector((state) => state.map.center);
  const zoom = useAppSelector((state) => state.map.zoom);
  const mapStyle = useAppSelector((state) => state.map.mapStyle);
  const showPOILabels = useAppSelector((state) => state.map.showPOILabels);
  
  // Location hook
  const { userLocation, isLocationEnabled } = useLocation();

  // Filter POIs by itinerary if specified
  const filteredPois = useMemo(() => {
    return itineraryFilter 
      ? pois.filter(poi => poi.itineraryId === itineraryFilter)
      : pois;
  }, [pois, itineraryFilter]);

  // Generate colors for itineraries
  const itineraryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    const colorPalette = [
      '#3B82F6', // blue
      '#EF4444', // red
      '#10B981', // green
      '#F59E0B', // yellow
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
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        };
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

  const handleMapBoundsChange = (bounds: { north: number; south: number; east: number; west: number }) => {
    dispatch(setBounds(bounds));
  };

  // Map container classes
  const mapClasses = `
    relative w-full h-full overflow-hidden rounded-lg
    ${fullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}
    ${className}
  `.trim();

  return (
    <div className={mapClasses}>
      <MapContainer
        ref={mapRef}
        center={[center.latitude, center.longitude]}
        zoom={zoom}
        className="w-full h-full z-0"
        zoomControl={true}
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

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none" />
      )}
    </div>
  );
};

export default MapComponent;