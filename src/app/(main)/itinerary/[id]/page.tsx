'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { useGetAudioItineraryQuery, useGetItineraryTracksQuery } from '@/lib/redux/api/apiSlice';
import { useSignedUrl, useSignedAudioUrls } from '@/lib/hooks/useSignedUrls';

export default function ItineraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Fetch itinerary and tracks
  const {
    data: itinerary,
    isLoading: itineraryLoading,
    error: itineraryError,
  } = useGetAudioItineraryQuery(id);

  const {
    data: tracks,
    isLoading: tracksLoading,
    error: tracksError,
  } = useGetItineraryTracksQuery(id);

  // Signed image URL for itinerary hero
  const imageKey = (itinerary as any)?.image_file?.image_storage_key as string | undefined;
  const { signedUrl: heroImageUrl } = useSignedUrl(imageKey || '', 'image-files');

  // Preload signed audio URLs for tracks (warm the cache for Play page)
  const audioPaths = useMemo(
    () => (tracks ? tracks.map((t) => t.audio_storage_key).filter(Boolean) : []),
    [tracks],
  );
  useSignedAudioUrls(audioPaths, 3600);

  const formatDuration = (seconds?: number | null) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(total / 60);
    return `${minutes} min`;
  };

  if (itineraryLoading) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden animate-pulse">
          <div className="h-48 bg-stone-200" />
          <div className="p-6 space-y-3">
            <div className="h-6 bg-stone-200 rounded w-2/3" />
            <div className="h-4 bg-stone-200 rounded w-1/3" />
            <div className="h-4 bg-stone-200 rounded w-full" />
            <div className="h-9 bg-stone-200 rounded w-full" />
          </div>
        </Card>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-8 bg-stone-200 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (itineraryError || !itinerary) {
    return (
      <div className="space-y-6">
        <Card className="p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Itinerary not found</h2>
          <p className="text-stone-600 mb-4">
            The itinerary may have been removed or is unavailable.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="overflow-hidden">
        {heroImageUrl ? (
          <img src={heroImageUrl} alt={itinerary.name} className="h-48 w-full object-cover" />
        ) : (
          <div className="h-48 bg-gradient-to-br from-primary-100 to-sea-100 dark:from-primary-900 dark:to-sea-900 flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-400 text-4xl">🏛️</span>
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                {itinerary.name}
              </h1>
              {(itinerary as any)?.company?.name && (
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  by {(itinerary as any).company.name}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" aria-label="Add to favorites">
              ♡
            </Button>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <Badge variant="outline">{formatDuration(itinerary.total_duration)}</Badge>
            <Badge variant="outline">{tracks?.length || 0} stops</Badge>
            <Badge variant="secondary">Walking Tour</Badge>
          </div>

          {itinerary.description && (
            <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed mb-4">
              {itinerary.description}
            </p>
          )}

          <div className="flex space-x-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => router.push(`/itinerary/${id}/play`)}
            >
              ▶ Start Tour
            </Button>
            <Button variant="outline" onClick={() => router.push('/map')}>
              📍 View Map
            </Button>
          </div>
        </div>
      </Card>

      {/* Audio Tracks */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
          Audio Tracks ({tracks?.length || 0})
        </h2>
        <div className="space-y-3">
          {tracksLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-6 bg-stone-200 rounded" />
                </Card>
              ))}
            </div>
          )}

          {tracks?.map((track) => (
            <Card key={track.id} className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold">
                    {track.audio_itinerary_order}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-1">
                    {track.name || 'Untitled track'}
                  </h3>
                  {track.description && (
                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">
                      {track.description}
                    </p>
                  )}
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {formatDuration(track.duration)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/itinerary/${id}/play`)}
                >
                  ▶
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Map Preview */}
      <Card className="p-6">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Tour Route</h3>
        <div className="h-32 bg-sea-50 dark:bg-sea-900 rounded-lg flex items-center justify-center border-dashed border-2 border-sea-200 dark:border-sea-700">
          <div className="text-center">
            <span className="text-sea-600 dark:text-sea-400 text-2xl block mb-2">🗺️</span>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Interactive map with {tracks?.length || 0} stops
            </p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/map')}>
          View Full Map
        </Button>
      </Card>

      {/* Company Info */}
      {(itinerary as any)?.company?.name && (
        <Card className="p-4">
          <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-2">
            About {(itinerary as any).company.name}
          </h3>
          {(itinerary as any).company?.description && (
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
              {(itinerary as any).company.description}
            </p>
          )}
          <Button variant="ghost" size="sm">
            View All Tours by {(itinerary as any).company.name}
          </Button>
        </Card>
      )}
    </div>
  );
}
