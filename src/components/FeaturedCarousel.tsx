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
  const [activeIndex, setActiveIndex] = useState(0);

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

  // Observe children to update active indicator based on visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = children.indexOf(entry.target as HTMLElement);
            if (idx >= 0) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.5 },
    );

    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
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
    <div className="px-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Featured Tours</h2>
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
        <div className="flex gap-3 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              padding="md"
              variant="glass"
              className="min-w-[240px] w-[240px] flex flex-col overflow-hidden rounded-2xl shadow-soft p-4 border border-marble-200/30"
            >
              <div className="h-36 bg-gradient-to-br from-marble-100/50 to-marble-200/50 rounded-xl animate-pulse" />
              <div className="flex flex-col gap-2 mt-2">
                <div className="h-4 bg-marble-200/50 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-marble-200/50 rounded animate-pulse w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {!!error && !isLoading && (
        <p className="text-sm text-muted">Failed to load featured tours.</p>
      )}

      {/* Carousel */}
      {items.length > 0 && (
        // Full-bleed carousel: extend to viewport edges while outer container keeps px-5
        <div className="-mx-5">
          <div
            ref={containerRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-track-transparent pb-2 hide-scrollbar"
          >
            {(items as Itinerary[]).map((it) => {
              const path = it.image_file?.image_storage_key ?? '';
              const imgUrl = path ? urlMap.get(path) : undefined;
              return (
                <Link key={it.id} href={`/itinerary/${it.id}`} className="block" tabIndex={0}>
                  <Card
                    padding="md"
                    variant="glass"
                    className="min-w-[260px] w-[260px] flex flex-col overflow-hidden rounded-2xl shadow-soft snap-start transition-all duration-300 hover:scale-[1.02] hover:shadow-medium border border-marble-200/30 p-4"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-marble-100 to-marble-200 rounded-xl overflow-hidden">
                      {imgUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgUrl} alt={it.name} className="w-full h-full object-cover" />
                          {/* Gradient overlay for better text readability on images */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full grid place-items-center text-muted">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3 mt-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-foreground truncate">{it.name}</h3>
                        <Badge
                          variant="secondary"
                          className="shrink-0 px-2 py-0.5 rounded-full text-xs inline-flex items-center gap-1 bg-gradient-to-r from-secondary/90 to-secondary backdrop-blur-sm"
                        >
                          <HiOutlineClock className="h-3 w-3" />
                          <span className="leading-none">{formatDuration(it.total_duration)}</span>
                        </Badge>
                      </div>

                      {it.description && (
                        <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                          {it.description}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Indicator bars */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {(items as Itinerary[]).map((_, i) => (
              <button
                key={`ind-${i}`}
                aria-label={`Show item ${i + 1}`}
                onClick={() => {
                  setIndex(i);
                  scrollToIndex(i);
                }}
                className={
                  'h-1.5 rounded-full hover:cursor-pointer transition-all duration-300 ease-out ' +
                  (i === activeIndex
                    ? 'bg-gradient-to-r from-primary to-accent w-10 shadow-md'
                    : 'bg-muted/30 w-6 hover:w-10 hover:bg-gradient-to-r hover:from-primary/40 hover:to-accent/40')
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
