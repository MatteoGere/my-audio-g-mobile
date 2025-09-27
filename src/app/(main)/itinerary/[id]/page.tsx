'use client';

import { memo, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { useGetAudioItineraryQuery, useGetItineraryTracksQuery } from '@/lib/redux/api/apiSlice';
import { useSignedUrl, useSignedAudioUrls } from '@/lib/hooks/useSignedUrls';
import { useFavorites } from '@/lib/hooks';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi2';
import tokens from '@/design/tokens';

type CollapsibleTextProps = {
  id: string;
  text?: string | null;
};

const CollapsibleText = memo(function CollapsibleTextComponent({ id, text }: CollapsibleTextProps) {
  const [expanded, setExpanded] = useState(false);
  const content = (text ?? '').trim();
  const shouldCollapse = content.length > 240;

  if (!content) {
    return null;
  }

  if (!shouldCollapse) {
    return <p className="text-sm text-muted leading-relaxed mb-1">{content}</p>;
  }

  return (
    <div className="mb-1">
      <p
        id={id}
        className={'text-sm text-muted leading-relaxed ' + (expanded ? '' : 'line-clamp-2')}
      >
        {content}
      </p>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={(event) => {
          event.stopPropagation();
          setExpanded((state) => !state);
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
        }}
        className="mt-1 text-sm text-primary hover:underline"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
});

CollapsibleText.displayName = 'CollapsibleText';

export default function ItineraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
console.log("okok")
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

  const tracksErrorMessage = tracksError
    ? 'We ran into an issue loading the audio tracks. Please try again shortly.'
    : null;

  // Signed image URL for itinerary hero
  const imageKey = (itinerary as any)?.image_file?.image_storage_key as string | undefined;
  const { signedUrl: heroImageUrl } = useSignedUrl(imageKey || '', 'image-files');

  // Preload signed audio URLs for tracks (warm the cache for Play page)
  const audioPaths = useMemo(
    () => (tracks ? tracks.map((t) => t.audio_storage_key).filter(Boolean) : []),
    [tracks],
  );
  useSignedAudioUrls(audioPaths, 3600);

  const {
    favoriteItineraryIds,
    favoriteTrackIds,
    toggleFavorite,
    isAddingFavorite,
    isRemovingFavorite,
  } = useFavorites();

  const formatDuration = (seconds?: number | null) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(total / 60);
    return `${minutes} min`;
  };

  if (itineraryLoading) {
    return (
      <div className="space-y-6 px-5">
        <Card padding="lg" className="overflow-hidden animate-pulse">
          <div className="h-48 bg-background" />
          <div className="space-y-3">
            <div className="h-6 bg-background rounded w-2/3" />
            <div className="h-4 bg-background rounded w-1/3" />
            <div className="h-4 bg-background rounded w-full" />
            <div className="h-9 bg-background rounded w-full" />
          </div>
        </Card>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md" className="animate-pulse">
              <div className="h-8 bg-background rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (itineraryError || !itinerary) {
    return (
      <div className="space-y-6 px-5">
        <Card padding="lg" className="text-center">
          <h2 className="text-lg font-semibold mb-2">Itinerary not found</h2>
          <p className="text-muted mb-4">The itinerary may have been removed or is unavailable.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const isItineraryFavorite = favoriteItineraryIds.includes(itinerary.id);
  const isFavoritesBusy = isAddingFavorite || isRemovingFavorite;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card padding="lg" className="overflow-hidden">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={itinerary.name}
            className="h-48 w-full object-cover rounded-t-xl"
          />
        ) : (
          <div className="h-48 bg-surface flex items-center justify-center rounded-t-xl">
            <span className="text-primary text-4xl">🏛️</span>
          </div>
        )}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground mb-2">{itinerary.name}</h1>
              {(itinerary as any)?.company?.name && (
                <p className="text-sm text-muted">by {(itinerary as any).company.name}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label={
                isItineraryFavorite
                  ? 'Remove itinerary from favourites'
                  : 'Add itinerary to favourites'
              }
              loading={isFavoritesBusy}
              onClick={() =>
                toggleFavorite({ favouriteId: itinerary.id, type: 'FAVOURITE-ITINERARY' })
              }
            >
              {isItineraryFavorite ? (
                <HiHeart
                  className="h-5 w-5"
                  aria-hidden="true"
                  style={{ color: tokens.colors.error, opacity: 0.95 }}
                />
              ) : (
                <HiOutlineHeart className="h-5 w-5" aria-hidden="true" style={{ opacity: 0.65 }} />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline">{formatDuration(itinerary.total_duration)}</Badge>
            <Badge variant="outline">{tracks?.length || 0} stops</Badge>
            <Badge variant="secondary">Walking Tour</Badge>
          </div>

          {itinerary.description && (
            <p className="text-muted text-sm leading-relaxed mb-4">{itinerary.description}</p>
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
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Audio Tracks ({tracks?.length || 0})
        </h2>
        <div className="space-y-3">
          {tracksLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} padding="md" className="animate-pulse">
                  <div className="h-6 bg-background rounded" />
                </Card>
              ))}
            </div>
          )}

          {tracksErrorMessage && (
            <Card padding="md" variant="outlined">
              <p className="text-sm text-muted">
                {tracksErrorMessage}
              </p>
            </Card>
          )}

          {tracks?.map((track) => (
            <Card key={track.id} padding="md">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-foreground text-sm font-semibold">
                    {track.audio_itinerary_order}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground mb-1">
                      {track.name || 'Untitled track'}
                    </h3>
                    <span className="text-xs text-muted">{formatDuration(track.duration)}</span>
                  </div>
                  {track.description && (
                    <CollapsibleText id={`track-desc-${track.id}`} text={track.description} />
                  )}
                </div>
                <div className="flex-shrink-0 self-start flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/itinerary/${id}/play`)}
                  >
                    ▶
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={
                      favoriteTrackIds.includes(track.id)
                        ? 'Remove track from favourites'
                        : 'Add track to favourites'
                    }
                    loading={isFavoritesBusy}
                    onClick={() =>
                      toggleFavorite({ favouriteId: track.id, type: 'FAVOURITE-TRACK' })
                    }
                  >
                    {favoriteTrackIds.includes(track.id) ? (
                      <HiHeart
                        className="h-4 w-4"
                        aria-hidden="true"
                        style={{ color: tokens.colors.error, opacity: 0.95 }}
                      />
                    ) : (
                      <HiOutlineHeart
                        className="h-4 w-4"
                        aria-hidden="true"
                        style={{ opacity: 0.65 }}
                      />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Map Preview */}
      <Card padding="md">
        <h3 className="font-semibold text-foreground mb-4">Tour Route</h3>
        <div className="h-32 bg-surface rounded-lg flex items-center justify-center border-dashed border-2 border-muted">
          <div className="text-center">
            <span className="text-muted text-2xl block mb-2">🗺️</span>
            <p className="text-sm text-muted">Interactive map with {tracks?.length || 0} stops</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/map')}>
          View Full Map
        </Button>
      </Card>

      {/* Company Info */}
      {(itinerary as any)?.company?.name && (
        <Card padding="md">
          <h3 className="font-medium text-foreground mb-2">
            About {(itinerary as any).company.name}
          </h3>
          {(itinerary as any).company?.description && (
            <p className="text-sm text-muted mb-3">{(itinerary as any).company.description}</p>
          )}
          <Button variant="ghost" size="sm">
            View All Tours by {(itinerary as any).company.name}
          </Button>
        </Card>
      )}
    </div>
  );
}
