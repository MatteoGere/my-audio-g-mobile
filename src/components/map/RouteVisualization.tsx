'use client';

import React, { useMemo } from 'react';
import tokens from '@/design/tokens';
import { Polyline } from 'react-leaflet';
import { POIMarkerData } from '@/types/app-types';

interface RouteVisualizationProps {
  pois: POIMarkerData[];
  itineraryId?: string;
  color?: string;
  showDirections?: boolean;
  animated?: boolean;
}

export const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  pois,
  itineraryId,
  color = tokens.colors.primary as string,
  showDirections = true,
  animated = false,
}) => {
  // Sort POIs by track order (if available, otherwise by trackId)
  const sortedPois = useMemo(() => {
    if (!pois.length) return [];

    // Filter by itinerary if specified
    const filteredPois = itineraryId ? pois.filter((poi) => poi.itineraryId === itineraryId) : pois;

    // Sort by trackId as a simple ordering (in a real app, you'd have track_order)
    return filteredPois.sort((a, b) => a.trackId.localeCompare(b.trackId));
  }, [pois, itineraryId]);

  // Create route coordinates
  const routeCoordinates = useMemo(() => {
    return sortedPois.map((poi) => [poi.latitude, poi.longitude] as [number, number]);
  }, [sortedPois]);

  // Group POIs by itinerary for multi-itinerary routes
  const routesByItinerary = useMemo(() => {
    const grouped: Record<string, { pois: POIMarkerData[]; color: string }> = {};

    sortedPois.forEach((poi, index) => {
      if (!grouped[poi.itineraryId]) {
        // Generate color based on itinerary
        const hash = poi.itineraryId.split('').reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
  // Use a small palette for visual distinction but fall back to semantic tokens when reasonable
  const colors = [tokens.colors.primary, tokens.colors.error, tokens.colors.success, tokens.colors.warning, '#8B5CF6', '#EC4899'];
  const itineraryColor = (colors[Math.abs(hash) % colors.length] as string) || tokens.colors.primary;

        grouped[poi.itineraryId] = {
          pois: [],
          color: itineraryColor,
        };
      }
      grouped[poi.itineraryId].pois.push(poi);
    });

    return grouped;
  }, [sortedPois]);

  if (!showDirections || sortedPois.length < 2) {
    return null;
  }

  // If specific itinerary, show single route
  if (itineraryId && routeCoordinates.length >= 2) {
    return (
      <Polyline
        positions={routeCoordinates}
        pathOptions={{
          color: color,
          weight: 3,
          opacity: 0.7,
          dashArray: animated ? '10, 10' : undefined,
          className: animated ? 'animated-route' : undefined,
        }}
      />
    );
  }

  // Show routes for each itinerary
  return (
    <>
      {Object.entries(routesByItinerary).map(
        ([id, { pois: itineraryPois, color: itineraryColor }]) => {
          if (itineraryPois.length < 2) return null;

          const coordinates = itineraryPois
            .sort((a, b) => a.trackId.localeCompare(b.trackId))
            .map((poi) => [poi.latitude, poi.longitude] as [number, number]);

          return (
            <Polyline
              key={id}
              positions={coordinates}
              pathOptions={{
                color: itineraryColor,
                weight: 3,
                opacity: 0.6,
                dashArray: animated ? '5, 5' : undefined,
                className: animated ? 'animated-route' : undefined,
              }}
            />
          );
        },
      )}
    </>
  );
};

export default RouteVisualization;
