import { useMemo, useEffect } from 'react';
import tokens from '@/design/tokens';
import { useAppDispatch, useAppSelector } from '@/lib/redux';
import { useGetPoisForMapQuery } from '@/lib/redux/api/apiSlice';
import { MapBounds, POIMarkerData } from '@/types/app-types';
import { setLastWidestBounds } from '../redux/slices/mapSlice';

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
  tokens.colors.primary,
  tokens.colors.error,
  tokens.colors.success,
  tokens.colors.warning,
  '#8B5CF6', // purple (fallback)
  '#EC4899', // pink (fallback)
  '#06B6D4', // cyan (fallback)
  '#84CC16', // lime (fallback)
  '#F97316', // orange (fallback)
  '#6366F1', // indigo (fallback)
  '#14B8A6', // teal (fallback)
  '#F43F5E', // rose (fallback)
  '#8B5A2B', // brown (fallback)
  '#6B7280', // gray (fallback)
  tokens.colors.error, // extra error
  tokens.colors.success, // extra success
  '#7C3AED', // violet
  '#BE185D', // pink-700
  tokens.colors.primary, // extra primary
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
  let lastWidestBounds = useAppSelector((state) => state.map.lastWidestBounds);
  const effectiveBounds = bounds || mapBounds;
  const dispatch = useAppDispatch();

  // Determine whether the effective bounds are at least as wide as the last recorded widest bounds
  const isWider = useMemo(() => {
    if (!effectiveBounds) return false;
    if (!lastWidestBounds) return true; // no previous bounds: treat as wider so we fetch/update

    return (
      effectiveBounds.north >= lastWidestBounds.north &&
      effectiveBounds.south <= lastWidestBounds.south &&
      effectiveBounds.east >= lastWidestBounds.east &&
      effectiveBounds.west <= lastWidestBounds.west
    );
  }, [effectiveBounds, lastWidestBounds]);

  // Side-effect: update Redux stored widest bounds when the effective bounds expand beyond it
  useEffect(() => {
    if (!effectiveBounds) return;

    // If there are no last bounds, or the new bounds are strictly wider in any direction, update
    const shouldUpdate =
      !lastWidestBounds ||
      effectiveBounds.north > lastWidestBounds.north ||
      effectiveBounds.south < lastWidestBounds.south ||
      effectiveBounds.east > lastWidestBounds.east ||
      effectiveBounds.west < lastWidestBounds.west;

    if (shouldUpdate) {
      dispatch(setLastWidestBounds(effectiveBounds));
    }
  }, [effectiveBounds, lastWidestBounds, dispatch]);

  // Skip fetching when there's no bounds and no itinerary OR when bounds are present but not wider
  const skip = useMemo(() => {
    if (!effectiveBounds && !itineraryId) return true;
    if (effectiveBounds && lastWidestBounds) return !isWider;
    return false;
  }, [effectiveBounds, lastWidestBounds, itineraryId, isWider]);
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
      skip: (!effectiveBounds && !itineraryId) || skip, // Skip if no bounds and no specific itinerary
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
