import { useMemo } from 'react';
import { useAppSelector } from '@/lib/redux';
import { useGetPoisForMapQuery } from '@/lib/redux/api/apiSlice';
import { POIMarkerData } from '@/types/app-types';

interface UseMapPOIsOptions {
  itineraryId?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  enableCaching?: boolean;
}

interface UseMapPOIsReturn {
  pois: POIMarkerData[];
  isLoading: boolean;
  error: any;
  itineraryColors: Record<string, string>;
  refreshPOIs: () => void;
}

// Consistent color palette for itineraries
const COLOR_PALETTE = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F43F5E', // rose
  '#8B5A2B', // brown
  '#6B7280', // gray
  '#DC2626', // red-600
  '#059669', // emerald-600
  '#7C3AED', // violet-700
  '#BE185D', // pink-700
  '#0891B2', // cyan-600
  '#65A30D', // lime-600
];

// Generate hash from string for consistent color assignment
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const useMapPOIs = ({
  itineraryId,
  bounds,
  enableCaching = true,
}: UseMapPOIsOptions = {}): UseMapPOIsReturn => {
  // Get map bounds from Redux if not provided
  const mapBounds = useAppSelector((state) => state.map.bounds);
  const effectiveBounds = bounds || mapBounds;

  // Fetch POIs from API
  const {
    data: poisData,
    isLoading,
    error,
    refetch,
  } = useGetPoisForMapQuery(
    {
      bounds: effectiveBounds || undefined,
      itineraryId,
    },
    {
      skip: !effectiveBounds && !itineraryId, // Skip if no bounds and no specific itinerary
      refetchOnMountOrArgChange: !enableCaching,
      refetchOnFocus: false,
      refetchOnReconnect: true,
    },
  );

  // Process POIs and generate colors
  const { pois, itineraryColors } = useMemo(() => {
    if (!poisData) {
      return { pois: [], itineraryColors: {} };
    }

    const processedPOIs = poisData;
    const colors: Record<string, string> = {};

    // Generate consistent colors for each itinerary
    poisData.forEach((poi) => {
      if (!colors[poi.itineraryId]) {
        const hash = hashString(poi.itineraryId);
        const colorIndex = hash % COLOR_PALETTE.length;
        colors[poi.itineraryId] = COLOR_PALETTE[colorIndex];
      }
    });

    return {
      pois: processedPOIs,
      itineraryColors: colors,
    };
  }, [poisData]);

  return {
    pois,
    isLoading,
    error,
    itineraryColors,
    refreshPOIs: refetch,
  };
};

export default useMapPOIs;
