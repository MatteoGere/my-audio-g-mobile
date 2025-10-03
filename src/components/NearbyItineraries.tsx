'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import Link from 'next/link';
import { useGetNearbyItinerariesQuery } from '@/lib/redux/api/apiSlice';
import { useSignedUrls } from '@/lib/hooks/useSignedUrls';
import { supabase } from '@/lib/redux/api/apiSlice';
import { HiOutlineClock, HiOutlineMapPin } from 'react-icons/hi2';
import { useLocation } from '@/lib/hooks';

type NearbyItem = {
  id: string;
  name: string;
  description?: string | null;
  total_duration: number;
  image_file?: { image_storage_key?: string | null } | null;
  image_file_id?: string | null;
  distance_meters: number;
};

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return '0m';
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${minutes}m`;
}

function formatDistance(meters?: number | null) {
  if (meters == null) return '';
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

// Helper to get color class based on distance
function getDistanceColorClass(meters?: number | null) {
  if (meters == null) return 'bg-muted/10 text-muted';
  if (meters < 500) return 'bg-gradient-to-r from-accent/90 to-accent text-accent-foreground'; // Very close - green
  if (meters < 1500) return 'bg-gradient-to-r from-primary/90 to-primary text-primary-foreground'; // Close - teal
  if (meters < 3000)
    return 'bg-gradient-to-r from-secondary/90 to-secondary text-secondary-foreground'; // Medium - amber
  return 'bg-gradient-to-r from-muted/60 to-muted/80 text-foreground'; // Far - gray
}
export default function NearbyItineraries() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Use centralized location hook instead of calling navigator directly.
  // We consume `userLocation` from the hook (keeps single source of truth in the store).
  const { userLocation, requestLocation, locationError } = useLocation();

  // Sync local coords state with store-backed userLocation
  +useEffect(() => {
    if (userLocation) {
      setCoords({ lat: userLocation.latitude, lng: userLocation.longitude });
      setGeoError(null);
    } else {
      // if there's no userLocation available, clear coords so queries are skipped
      +setCoords(null);
    }
  }, [userLocation]);

  // Keep local geoError in sync if the hook reports an error later
  useEffect(() => {
    if (locationError) setGeoError(locationError);
  }, [locationError]);

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useGetNearbyItinerariesQuery(
    coords ? { latitude: coords.lat, longitude: coords.lng, radius: 5000 } : (undefined as any),
    { skip: !coords },
  );

  const items = useMemo(() => (data as NearbyItem[]).slice(0, 8), [data]);
  // Map of image_file.id -> image_storage_key for items returned by the RPC
  const [imageFileMap, setImageFileMap] = useState<Record<string, string>>({});

  // Derive image paths from either the nested image_file or from image_file_id -> image_storage_key map
  const imagePaths = useMemo(
    () =>
      items
        .map(
          (it) =>
            it.image_file?.image_storage_key ??
            (it.image_file_id ? imageFileMap[it.image_file_id] : undefined),
        )
        .filter(Boolean) as string[],
    [items, imageFileMap],
  );

  // When the RPC doesn't populate the nested image_file, fetch the image_storage_key by image_file_id
  useEffect(() => {
    let cancelled = false;
    const idsToFetch = Array.from(
      new Set(
        (data as NearbyItem[])
          .map((it) => it.image_file_id)
          .filter((id): id is string => Boolean(id) && !imageFileMap[id as string]),
      ),
    );

    if (idsToFetch.length === 0) return;

    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from('image_file')
          .select('id, image_storage_key')
          .in('id', idsToFetch as string[]);

        if (cancelled) return;
        if (!error && Array.isArray(rows)) {
          const map: Record<string, string> = {};
          rows.forEach((r: any) => {
            if (r?.id && r?.image_storage_key) map[r.id] = r.image_storage_key;
          });
          if (Object.keys(map).length > 0) setImageFileMap((p) => ({ ...p, ...map }));
        }
      } catch (e) {
        // silent
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data, imageFileMap]);

  const { signedUrls } = useSignedUrls(imagePaths, 'image-files', 3600);

  if (geoError) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-muted">
          {geoError || 'Location access is disabled. Enable it to see tours near you.'}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            // Trigger centralized permission/request flow. The hook will update store and
            // the effect above will populate coords so the query runs automatically.
            await requestLocation();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Nearby Recommendations</h2>
        {coords && (
          <div className="text-xs text-muted flex items-center gap-2">
            <HiOutlineMapPin className="h-4 w-4" />
            {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              padding="md"
              variant="glass"
              className="flex flex-col overflow-hidden rounded-2xl shadow-soft border border-marble-200/30"
            >
              <div className="h-24 bg-gradient-to-br from-marble-100/50 to-marble-200/50 rounded-xl animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="h-4 bg-marble-200/50 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-marble-200/50 rounded animate-pulse w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {!!error && !isLoading && <p className="text-sm text-muted">Failed to load nearby tours.</p>}

      {/* Results */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {items.map((it) => {
            const path =
              it.image_file?.image_storage_key ??
              (it.image_file_id ? imageFileMap[it.image_file_id] : '');
            const imgUrl = path ? signedUrls[path] : undefined;
            const distanceColorClass = getDistanceColorClass(it.distance_meters);

            return (
              <Link key={it.id} href={`/itinerary/${it.id}`} className="block" tabIndex={0}>
                <Card
                  padding="md"
                  variant="glass"
                  className="flex flex-col overflow-hidden rounded-2xl shadow-soft border border-marble-200/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-medium"
                >
                  <div className="relative h-24 bg-gradient-to-br from-marble-100 to-marble-200 rounded-xl overflow-hidden">
                    {imgUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt={it.name} className="w-full h-full object-cover" />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2 min-h-[2.5rem]">{it.name}</h3>
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1.5 w-fit backdrop-blur-sm ${distanceColorClass}`}
                      >
                        <HiOutlineMapPin className="h-3 w-3" />
                        <span className="font-semibold">{formatDistance(it.distance_meters)}</span>
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="shrink-0 px-2 py-0.5 rounded-full text-xs inline-flex items-center gap-1 bg-gradient-to-r from-secondary/90 to-secondary backdrop-blur-sm"
                      >
                        <HiOutlineClock className="h-3 w-3" />
                        {formatDuration(it.total_duration)}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
