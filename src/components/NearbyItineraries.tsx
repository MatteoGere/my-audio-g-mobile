'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { useGetNearbyItinerariesQuery } from '@/lib/redux/api/apiSlice';
import { useSignedUrls } from '@/lib/hooks/useSignedUrls';
import { HiOutlineClock, HiOutlineMapPin } from 'react-icons/hi2';

type NearbyItem = {
  id: string;
  name: string;
  description: string | null;
  total_duration: number;
  distance_meters?: number | null;
  image_file?: { image_storage_key?: string | null } | null;
};

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${minutes}m`;
}

function formatDistance(meters?: number | null) {
  if (!meters && meters !== 0) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function NearbyItineraries() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGeoError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        if (cancelled) return;
        setGeoError(err.message || 'Location permission denied');
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const { data = [], isLoading, error, refetch } = useGetNearbyItinerariesQuery(
    coords ? { latitude: coords.lat, longitude: coords.lng, radius: 5000 } : (undefined as any),
    { skip: !coords },
  );

  const items = useMemo(() => (data as NearbyItem[]).slice(0, 8), [data]);
  const imagePaths = useMemo(
    () => items.map((it) => it.image_file?.image_storage_key).filter(Boolean) as string[],
    [items],
  );

  const { signedUrls } = useSignedUrls(imagePaths, 'image-files', 3600);

  if (geoError) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-stone-600 dark:text-stone-400">
          Location access is disabled. Enable it to see tours near you.
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          Nearby Recommendations
        </h2>
        {coords && (
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <HiOutlineMapPin className="h-4 w-4" />
            {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden animate-pulse border-stone-200 dark:border-stone-700">
              <div className="h-24 bg-stone-200 dark:bg-stone-700" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {!!error && !isLoading && (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Failed to load nearby tours.
        </p>
      )}

      {/* Results */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {items.map((it) => {
            const path = it.image_file?.image_storage_key ?? '';
            const imgUrl = path ? signedUrls[path] : undefined;
            return (
              <Card key={it.id} className="p-0 overflow-hidden border-stone-200 dark:border-stone-700">
                <div className="relative h-24 bg-stone-100 dark:bg-stone-800">
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt={it.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-stone-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-stone-900 dark:text-stone-100 truncate">
                      {it.name}
                    </h3>
                    <Badge variant="secondary" className="shrink-0">
                      <HiOutlineClock className="h-3 w-3 mr-1" /> {formatDuration(it.total_duration)}
                    </Badge>
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    {formatDistance(it.distance_meters)} away
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
