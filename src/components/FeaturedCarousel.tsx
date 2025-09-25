'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Badge } from '@/components/ui';
import Link from 'next/link';
import { useGetAudioItinerariesQuery } from '@/lib/redux/api/apiSlice';
import { useSignedUrls } from '@/lib/hooks/useSignedUrls';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineClock } from 'react-icons/hi2';

type Itinerary = {
  id: string;
  name: string;
  description: string | null;
  total_duration: number;
  image_file?: { image_storage_key?: string | null } | null;
};

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${minutes}m`;
}

export default function FeaturedCarousel() {
  const {
    data: items = [],
    isLoading,
    error,
  } = useGetAudioItinerariesQuery({ page: 1, limit: 10 });

  const imagePaths = useMemo(
    () =>
      (items as Itinerary[])
        .map((it) => it.image_file?.image_storage_key)
        .filter(Boolean) as string[],
    [items],
  );

  // Use caching hook for signed URLs to avoid redundant generation
  const { signedUrls, isLoading: isSigning } = useSignedUrls(imagePaths, 'image-files', 3600);
  const urlMap = useMemo(() => new Map<string, string>(Object.entries(signedUrls)), [signedUrls]);

  // Auto-scroll logic
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = (i: number) => {
    const container = containerRef.current;
    if (!container) return;
    const child = container.children[i] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % Math.max(items.length, 1);
        scrollToIndex(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  const onPrev = () => {
    const next = (index - 1 + items.length) % Math.max(items.length, 1);
    setIndex(next);
    scrollToIndex(next);
  };

  const onNext = () => {
    const next = (index + 1) % Math.max(items.length, 1);
    setIndex(next);
    scrollToIndex(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Featured Tours</h2>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onPrev} aria-label="Previous">
            <HiOutlineChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onNext} aria-label="Next">
            <HiOutlineChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {(isLoading || isSigning) && (
        <div className="flex gap-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="min-w-[240px] w-[240px] p-0 flex flex-col overflow-hidden rounded-xl animate-pulse shadow-md"
            >
              <div className="h-36 bg-stone-200 dark:bg-stone-700 rounded-t-xl" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {!!error && !isLoading && (
        <p className="text-sm text-stone-500 dark:text-stone-400">Failed to load featured tours.</p>
      )}

      {/* Carousel */}
      {items.length > 0 && (
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        >
          {(items as Itinerary[]).map((it) => {
            const path = it.image_file?.image_storage_key ?? '';
            const imgUrl = path ? urlMap.get(path) : undefined;
            return (
              <Link key={it.id} href={`/itinerary/${it.id}`} className="block" tabIndex={0}>
                <Card className="min-w-[260px] w-[260px] p-0 flex flex-col overflow-hidden rounded-xl shadow-md snap-start transition-colors hover:bg-stone-100 dark:hover:bg-stone-800">
                  <div className="relative h-40 bg-stone-100 dark:bg-stone-800 rounded-t-xl">
                    {imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgUrl} alt={it.name} className="w-full h-full object-cover rounded-t-xl" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-stone-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-stone-900 dark:text-stone-100 truncate">
                        {it.name}
                      </h3>
                      <Badge variant="secondary" className="shrink-0">
                        <HiOutlineClock className="h-3 w-3 mr-1" />{' '}
                        {formatDuration(it.total_duration)}
                      </Badge>
                    </div>
                    {it.description && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                        {it.description}
                      </p>
                    )}
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
