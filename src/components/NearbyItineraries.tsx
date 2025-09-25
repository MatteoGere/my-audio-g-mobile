"use client";

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
export default function NearbyItineraries() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Use centralized location hook instead of calling navigator directly.
  // We consume `userLocation` from the hook (keeps single source of truth in the store).
  const { userLocation, requestLocation, locationError } = useLocation();

  // Sync local coords state with store-backed userLocation
+  useEffect(() => {
    if (userLocation) {
      setCoords({ lat: userLocation.latitude, lng: userLocation.longitude });
      setGeoError(null);
    } else {
      // if there's no userLocation available, clear coords so queries are skipped
+      setCoords(null);
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
        <div className="text-sm text-muted">{geoError || 'Location access is disabled. Enable it to see tours near you.'}</div>
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
              className="flex flex-col overflow-hidden rounded-xl animate-pulse shadow-md"
            >
              <div className="h-24 bg-surface rounded-t-xl" />
              <div className="flex flex-col gap-2">
                <div className="h-4 bg-surface rounded w-3/4" />
                <div className="h-3 bg-surface rounded w-1/2" />
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
            return (
              <Link key={it.id} href={`/itinerary/${it.id}`} className="block" tabIndex={0}>
                <Card
                  padding="md"
                  className="flex flex-col overflow-hidden rounded-xl shadow-md hover:bg-surface"
                >
                  <div className="relative h-24 bg-surface rounded-t-xl">
                    {imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgUrl}
                        alt={it.name}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 mt-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-foreground truncate">{it.name}</h3>
                      <Badge
                        variant="secondary"
                        className="shrink-0 px-2 py-0.5 rounded-md text-xs inline-flex items-center gap-1"
                      >
                        <HiOutlineClock className="h-3 w-3" />
                        {formatDuration(it.total_duration)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted">
                      {formatDistance(it.distance_meters)} away
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
