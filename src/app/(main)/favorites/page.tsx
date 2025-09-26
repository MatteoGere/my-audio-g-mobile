'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Loader,
} from '@/components/ui';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';
import { useFavorites } from '@/lib/hooks';
import {
  HiOutlineHeart,
  HiOutlineMap,
  HiOutlinePlay,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineMusicalNote,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

type FavoritesFilter = 'all' | 'itineraries' | 'tracks';

const formatDuration = (seconds?: number | null) => {
  if (!seconds || Number.isNaN(seconds)) {
    return 'Length unknown';
  }

  const totalMinutes = Math.max(Math.round(seconds / 60), 1);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};

const formatRelativeTime = (isoDate: string) => {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) {
    return 'recently';
  }

  const diffMs = timestamp - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);

  const intervals: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'year', seconds: 60 * 60 * 24 * 365 },
    { unit: 'month', seconds: 60 * 60 * 24 * 30 },
    { unit: 'week', seconds: 60 * 60 * 24 * 7 },
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
  ];

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const { unit, seconds } of intervals) {
    if (Math.abs(diffSeconds) >= seconds || unit === 'minute') {
      const value = Math.round(diffSeconds / seconds);
      return formatter.format(value, unit);
    }
  }

  return 'just now';
};

export default function FavoritesPage() {
  const {
    favoriteItineraries,
    favoriteTracks,
    isLoading,
    isAddingFavorite,
    isRemovingFavorite,
    summary,
    removeFavorite,
  } = useFavorites();

  const [activeFilter, setActiveFilter] = useState<FavoritesFilter>('all');
  const router = useRouter();

  const hasFavorites = summary.totalFavorites > 0;

  const filteredItineraries = useMemo(() => {
    if (activeFilter === 'tracks') return [];
    return favoriteItineraries;
  }, [activeFilter, favoriteItineraries]);

  const filteredTracks = useMemo(() => {
    if (activeFilter === 'itineraries') return [];
    return favoriteTracks;
  }, [activeFilter, favoriteTracks]);

  const showLoader = isLoading && !hasFavorites;

  const renderItineraryCard = (favorite: (typeof favoriteItineraries)[number]) => {
    const itinerary = favorite.itinerary;
    return (
      <Card key={`itinerary-${favorite.id}`} padding="lg" className="bg-surface">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-md">
            <HiOutlineSparkles className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <Badge variant="primary" size="sm">
                Itinerary
              </Badge>
              <span>{formatRelativeTime(favorite.created_at)}</span>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {itinerary?.name || 'Untitled itinerary'}
              </CardTitle>
              {itinerary?.description && (
                <CardDescription className="text-sm leading-relaxed line-clamp-2">
                  {itinerary.description}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <HiOutlineClock className="h-4 w-4" aria-hidden="true" />
                {formatDuration(itinerary?.total_duration)}
              </span>
              {itinerary?.company?.name && (
                <span className="inline-flex items-center gap-1">
                  <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" />
                  {itinerary.company.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <HiOutlineHeart className="h-4 w-4" aria-hidden="true" />
                Added {formatRelativeTime(favorite.created_at)}
              </span>
            </div>
            <CardFooter className="justify-between px-0 pt-2">
              <Link
                href={`/itinerary/${favorite.favourite_id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Explore itinerary
                <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-error"
                  loading={isRemovingFavorite}
                  onClick={() =>
                    removeFavorite({
                      favouriteId: favorite.favourite_id,
                      type: 'FAVOURITE-ITINERARY',
                      favoriteRecordId: favorite.id,
                    })
                  }
                  aria-label={`Remove ${itinerary?.name || 'itinerary'} from favourites`}
                >
                  Remove
                </Button>
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
    );
  };

  const renderTrackCard = (favorite: (typeof favoriteTracks)[number]) => {
    const track = favorite.track;
    const parentItinerary = track?.audio_itinerary;

    return (
      <Card key={`track-${favorite.id}`} padding="lg" className="bg-surface">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent shadow-md">
            <HiOutlineMusicalNote className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <Badge variant="accent" size="sm">
                Track
              </Badge>
              <span>{formatRelativeTime(favorite.created_at)}</span>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {track?.name || 'Untitled track'}
              </CardTitle>
              {track?.description && (
                <CardDescription className="text-sm leading-relaxed line-clamp-2">
                  {track.description}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <HiOutlineClock className="h-4 w-4" aria-hidden="true" />
                {formatDuration(track?.duration)}
              </span>
              {parentItinerary?.name && (
                <Link
                  href={`/itinerary/${parentItinerary.id}`}
                  className="inline-flex items-center gap-1 text-primary"
                >
                  <HiOutlineSparkles className="h-4 w-4" aria-hidden="true" />
                  {parentItinerary.name}
                </Link>
              )}
              {track?.latitude && track?.longitude && (
                <span className="inline-flex items-center gap-1">
                  <HiOutlineMap className="h-4 w-4" aria-hidden="true" />
                  POI ready
                </span>
              )}
            </div>
            <CardFooter className="justify-between px-0 pt-2">
              <Button size="sm" variant="ghost" className="text-primary" disabled>
                <HiOutlinePlay className="mr-2 h-4 w-4" aria-hidden="true" />
                Play soon
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-error"
                loading={isRemovingFavorite}
                onClick={() =>
                  removeFavorite({
                    favouriteId: favorite.favourite_id,
                    type: 'FAVOURITE-TRACK',
                    favoriteRecordId: favorite.id,
                  })
                }
                aria-label={`Remove ${track?.name || 'track'} from favourites`}
              >
                Remove
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <NavigationGuard requireAuth>
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Your favourites</h1>
          <p className="text-sm text-muted">
            Hand-picked audio tours, tracks, and moments ready to play whenever inspiration strikes.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Card padding="lg" className="flex items-center justify-between bg-surface/80 backdrop-blur">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Total favourites
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-foreground">
                  {summary.totalFavorites}
                </span>
                <Badge variant="outline" size="sm">
                  {summary.itineraryCount} itineraries • {summary.trackCount} tracks
                </Badge>
              </div>
            </div>
            <HiOutlineHeart className="h-10 w-10 text-primary" aria-hidden="true" />
          </Card>

          <Card padding="lg" className="space-y-3 bg-surface/80 backdrop-blur">
            <CardHeader className="gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Quick actions
              </span>
              <CardTitle className="text-lg">Jump back into the adventure</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-wrap gap-2 px-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/search')}
              >
                <HiOutlineSparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Discover new tours
              </Button>
              <Button variant="accent" size="sm" onClick={() => router.push('/map')}>
                <HiOutlineMap className="mr-2 h-4 w-4" aria-hidden="true" />
                View on map
              </Button>
              <Button variant="outline" size="sm" disabled={isAddingFavorite}>
                {isAddingFavorite ? 'Syncing favourites…' : 'Refresh feed'}
              </Button>
            </CardBody>
          </Card>
        </section>

        <section className="flex flex-wrap gap-2">
          {(['all', 'itineraries', 'tracks'] as FavoritesFilter[]).map((filter) => {
            const isActive = activeFilter === filter;
            const labelMap: Record<FavoritesFilter, string> = {
              all: 'All favourites',
              itineraries: 'Itineraries',
              tracks: 'Tracks',
            };
            return (
              <Button
                key={filter}
                size="sm"
                variant={isActive ? 'primary' : 'ghost'}
                onClick={() => setActiveFilter(filter)}
              >
                {labelMap[filter]}
              </Button>
            );
          })}
        </section>

        {showLoader && <Loader className="min-h-[180px]" />}

        {!showLoader && (
          <section className="space-y-6">
            {filteredItineraries.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">Saved itineraries</h2>
                <div className="space-y-4">
                  {filteredItineraries.map((favorite) => renderItineraryCard(favorite))}
                </div>
              </div>
            )}

            {filteredTracks.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">Saved tracks</h2>
                <div className="space-y-4">
                  {filteredTracks.map((favorite) => renderTrackCard(favorite))}
                </div>
              </div>
            )}

            {hasFavorites && filteredItineraries.length === 0 && filteredTracks.length === 0 && (
              <Card padding="lg" className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-md">
                  <HiOutlineHeart className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">No items here yet</h3>
                <p className="mt-2 text-sm text-muted">
                  Switch to another category or explore new content to grow your favourites.
                </p>
              </Card>
            )}
          </section>
        )}

        {!hasFavorites && !showLoader && (
          <Card padding="lg" className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-md">
              <HiOutlineHeart className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Start your collection</h3>
            <p className="mt-2 text-sm text-muted">
              Save itineraries or tracks while you explore. Everything you love will live here for
              quick access.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="primary" onClick={() => router.push('/home')}>
                Browse home feed
              </Button>
              <Button variant="ghost" onClick={() => router.push('/search')}>
                Open search
              </Button>
            </div>
          </Card>
        )}
      </div>
    </NavigationGuard>
  );
}
