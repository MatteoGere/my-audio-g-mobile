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
        <Card padding="lg" className="overflow-hidden">
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
      <Card
        padding="lg"
        variant="glass"
        className="overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20"
      >
        <div className="relative">
          {heroImageUrl ? (
            <div className="relative h-56 rounded-2xl overflow-hidden">
              <img src={heroImageUrl} alt={itinerary.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
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
                className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-xl shadow-soft hover:bg-surface transition-all"
              >
                {isItineraryFavorite ? (
                  <HiHeart
                    className="h-5 w-5"
                    aria-hidden="true"
                    style={{ color: tokens.colors.error, opacity: 0.95 }}
                  />
                ) : (
                  <HiOutlineHeart className="h-5 w-5 text-foreground/80" aria-hidden="true" />
                )}
              </Button>
            </div>
          ) : (
            <div className="relative h-56 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-primary text-5xl">🏛️</span>
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
                className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-xl shadow-soft hover:bg-surface transition-all"
              >
                {isItineraryFavorite ? (
                  <HiHeart
                    className="h-5 w-5"
                    aria-hidden="true"
                    style={{ color: tokens.colors.error, opacity: 0.95 }}
                  />
                ) : (
                  <HiOutlineHeart className="h-5 w-5 text-foreground/80" aria-hidden="true" />
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-foreground mb-2">{itinerary.name}</h1>
            {(itinerary as any)?.company?.name && (
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <p className="text-sm text-muted">by {(itinerary as any).company.name}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge className="bg-gradient-to-r from-secondary/20 to-secondary/10 border-secondary/30">
              ⏱ {formatDuration(itinerary.total_duration)}
            </Badge>
            <Badge className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
              📍 {tracks?.length || 0} stops
            </Badge>
            <Badge className="bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30">
              🚶 Walking Tour
            </Badge>
          </div>

          {itinerary.description && (
            <p className="text-muted text-sm leading-relaxed mb-5">{itinerary.description}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-soft hover:shadow-medium transition-all"
              onClick={() => router.push(`/itinerary/${id}/play`)}
            >
              ▶ Start Tour
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/map')}
              className="border-primary/30 hover:bg-primary/5"
            >
              📍 Map
            </Button>
          </div>
        </div>
      </Card>

      {/* Audio Tracks */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-7 bg-gradient-to-b from-primary to-accent rounded-full" />
          <h2 className="text-xl font-bold text-foreground">Audio Tracks</h2>
          <Badge
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-primary/20 to-primary/10"
          >
            {tracks?.length || 0}
          </Badge>
        </div>
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
            <Card padding="md" variant="outline">
              <p className="text-sm text-muted">{tracksErrorMessage}</p>
            </Card>
          )}

          {tracks?.map((track) => (
            <Card
              key={track.id}
              padding="md"
              variant="glass"
              className="bg-gradient-to-br from-surface to-primary/5 border border-primary/20 hover:shadow-medium hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft">
                  <span className="text-white text-base font-bold">
                    {track.audio_itinerary_order}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">
                      {track.name || 'Untitled track'}
                    </h3>
                  </div>
                  {track.description && (
                    <CollapsibleText id={`track-desc-${track.id}`} text={track.description} />
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-xs">⏱</span>
                      </div>
                      <span className="text-xs font-medium">{formatDuration(track.duration)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 self-start flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/itinerary/${id}/play`)}
                    className="w-9 h-9 p-0 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all"
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
                    className="w-9 h-9 p-0 rounded-xl hover:bg-marble-100 transition-all"
                  >
                    {favoriteTrackIds.includes(track.id) ? (
                      <HiHeart
                        className="h-4 w-4"
                        aria-hidden="true"
                        style={{ color: tokens.colors.error, opacity: 0.95 }}
                      />
                    ) : (
                      <HiOutlineHeart className="h-4 w-4 text-foreground/60" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Map Preview */}
      <Card
        padding="md"
        variant="glass"
        className="bg-gradient-to-br from-accent/5 to-secondary/5 border border-accent/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-accent to-secondary rounded-full" />
          <h3 className="font-semibold text-foreground">Tour Route</h3>
        </div>
        <div className="relative h-40 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-accent/30 overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 bg-surface/80 rounded-lg backdrop-blur-sm flex items-center justify-center">
            <span className="text-xs">📍</span>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-accent/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-accent text-3xl">🗺️</span>
            </div>
            <p className="text-sm font-medium text-foreground">Interactive map</p>
            <p className="text-xs text-muted">{tracks?.length || 0} stops along the route</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-4 border-accent/30 hover:bg-accent/5 text-accent hover:text-accent"
          onClick={() => router.push('/map')}
        >
          View Full Map →
        </Button>
      </Card>

      {/* Company Info */}
      {(itinerary as any)?.company?.name && (
        <Card
          padding="md"
          variant="glass"
          className="bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-secondary text-lg">🏢</span>
            </div>
            <h3 className="font-semibold text-foreground">
              About {(itinerary as any).company.name}
            </h3>
          </div>
          {(itinerary as any).company?.description && (
            <p className="text-sm text-muted mb-4 leading-relaxed">
              {(itinerary as any).company.description}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-secondary/30 hover:bg-secondary/5 text-secondary hover:text-secondary"
          >
            View All Tours →
          </Button>
        </Card>
      )}
    </div>
  );
}
