'use client';

import { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { Card, Button, Input, Badge, Select } from '@/components/ui';
import { useGetAudioItinerariesQuery, useGetCompaniesQuery } from '@/lib/redux/api/apiSlice';
import { useSignedUrls } from '@/lib/hooks/useSignedUrls';
import { useFavorites } from '@/lib/hooks';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineClock,
  HiOutlineSquares2X2,
  HiOutlineBars3,
  HiOutlineHeart,
  HiHeart,
} from 'react-icons/hi2';
import tokens from '@/design/tokens';

// Small collapsible text helper (copied from itinerary detail page)
function CollapsibleText({ id, text }: { id: string; text: string }) {
  const [expanded, setExpanded] = useState(false);
  const shouldCollapse = text.length > 150;

  if (!shouldCollapse) {
    return <p className="text-sm text-muted leading-relaxed mb-1">{text}</p>;
  }

  return (
    <div className="mb-1">
      <p
        id={id}
        className={'text-sm text-muted leading-relaxed ' + (expanded ? '' : 'line-clamp-2')}
      >
        {text}
      </p>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={(e) => {
          // Prevent the click from bubbling to the parent article which navigates
          e.stopPropagation();
          setExpanded((s) => !s);
        }}
        onKeyDown={(e) => {
          // Prevent keyboard events from triggering parent handlers
          e.stopPropagation();
        }}
        className="mt-1 text-sm text-primary hover:underline"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'popular' | 'nearest' | 'duration_asc' | 'duration_desc';

type SearchFilters = {
  query: string;
  company: string;
  minDuration: number;
  maxDuration: number;
  maxDistance: number;
  sortBy: SortOption;
};

type ItineraryWithImage = {
  id: string;
  name: string;
  description: string;
  total_duration: number;
  created_at: string;
  company_id: string;
  company?: { id: string; name: string };
  image_file?: { image_storage_key?: string | null } | null;
};

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${minutes}m`;
}

interface SearchPageContentProps {
  searchParams: ReadonlyURLSearchParams;
}

function SearchPageContent({ searchParams }: SearchPageContentProps) {
  // Mobile-first: default to list view
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const {
    favoriteItineraryIds,
    toggleFavorite: toggleFavoriteMutation,
    isAddingFavorite,
    isRemovingFavorite,
  } = useFavorites();
  const favoritesBusy = isAddingFavorite || isRemovingFavorite;

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    company: '',
    minDuration: 0,
    maxDuration: 300, // 5 hours in minutes
    maxDistance: 50, // km
    sortBy: 'newest',
  });

  // Local debounced search text to avoid calling API on every keystroke
  const [searchText, setSearchText] = useState<string>(filters.query || '');

  // Fetch companies for filter dropdown
  const { data: companies = [] } = useGetCompaniesQuery();

  // Fetch itineraries with current filters
  const {
    data: itinerariesData = [],
    isLoading,
    error,
    refetch,
  } = useGetAudioItinerariesQuery({
    page,
    limit: 20,
    search: filters.query || undefined,
  }) as {
    data?: ItineraryWithImage[];
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };

  const itineraries = itinerariesData as ItineraryWithImage[];

  // Get image paths for signed URLs
  const imagePaths = useMemo(
    () => itineraries.map((item) => item.image_file?.image_storage_key).filter(Boolean) as string[],
    [itineraries],
  );

  const { signedUrls } = useSignedUrls(imagePaths, 'image-files', 3600);

  // Filter and sort results client-side (in production, move to backend)
  const filteredResults = useMemo(() => {
    let results = [...itineraries];

    // Filter by company
    if (filters.company) {
      results = results.filter((item) => item.company_id === filters.company);
    }

    // Filter by duration
    const minDurationSec = filters.minDuration * 60;
    const maxDurationSec = filters.maxDuration * 60;
    results = results.filter(
      (item) => item.total_duration >= minDurationSec && item.total_duration <= maxDurationSec,
    );

    // Sort results
    switch (filters.sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'duration_asc':
        results.sort((a, b) => a.total_duration - b.total_duration);
        break;
      case 'duration_desc':
        results.sort((a, b) => b.total_duration - a.total_duration);
        break;
      case 'popular':
        // For now, sort by created_at (in production, use actual popularity metrics)
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'nearest':
        // For now, keep original order (in production, use location-based sorting)
        break;
    }

    return results;
  }, [itineraries, filters]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  }, []);

  // Debounce: apply searchText to filters.query only after 450ms of inactivity
  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((prev) => {
        if (prev.query === searchText) return prev;
        return { ...prev, query: searchText };
      });
      setPage(1);
    }, 700);

    return () => clearTimeout(id);
  }, [searchText]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      query: '',
      company: '',
      minDuration: 0,
      maxDuration: 300,
      maxDistance: 50,
      sortBy: 'newest',
    });
    setPage(1);
  }, []);

  const handleToggleFavorite = useCallback(
    (itineraryId: string) => {
      void toggleFavoriteMutation({ favouriteId: itineraryId, type: 'FAVOURITE-ITINERARY' });
    },
    [toggleFavoriteMutation],
  );

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'nearest', label: 'Nearest to Me' },
    { value: 'duration_asc', label: 'Shortest First' },
    { value: 'duration_desc', label: 'Longest First' },
  ];

  const companyOptions = [
    { value: '', label: 'All Companies' },
    ...(companies as any[]).map((company) => ({
      value: company.id,
      label: company.name,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <Card
        padding="md"
        variant="glass"
        className="bg-gradient-to-br from-surface via-surface to-primary/5 border-b border-primary/20 sticky top-0 z-10 mb-6 shadow-soft backdrop-blur-lg"
      >
        <div className="space-y-4">
          {/* Header Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-7 bg-gradient-to-b from-primary to-accent rounded-full" />
              <h1 className="text-2xl font-bold text-foreground">Discover Tours</h1>
            </div>
            {filteredResults.length > 0 && (
              <Badge
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-primary/20 to-primary/10"
              >
                {filteredResults.length} found
              </Badge>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Search audio tours..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              leftIcon={<HiOutlineMagnifyingGlass className="h-5 w-5 text-primary" />}
              className="pr-12 border-primary/20"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${showFilters ? 'text-primary bg-primary/10' : ''}`}
            >
              <HiOutlineAdjustmentsHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Sort and View Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="px-3 py-2 border border-primary/20 rounded-xl text-sm bg-surface shadow-soft transition-all hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {(filters.company || filters.minDuration > 0 || filters.maxDuration < 300) && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-gradient-to-r from-secondary/90 to-secondary backdrop-blur-sm"
                >
                  {Object.values(filters).filter((v) => v && v !== 'newest').length} filters
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <HiOutlineSquares2X2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <HiOutlineBars3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="space-y-4 pt-4">
            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Company</label>
              <Select
                options={companyOptions}
                value={filters.company}
                onChange={(val) => updateFilter('company', String(val || ''))}
                placeholder="All Companies"
              />
            </div>

            {/* Duration Range */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Duration (minutes)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minDuration || ''}
                  onChange={(e) => updateFilter('minDuration', parseInt(e.target.value) || 0)}
                  className="flex-1"
                />
                <span className="text-muted">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxDuration || ''}
                  onChange={(e) => updateFilter('maxDuration', parseInt(e.target.value) || 300)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Max Distance (km)
              </label>
              <Input
                type="number"
                placeholder="50"
                value={filters.maxDistance || ''}
                onChange={(e) => updateFilter('maxDistance', parseInt(e.target.value) || 50)}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end mt-2">
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      <div>
        {isLoading && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
            {Array.from({ length: 6 }, (_, i) => (
              <Card
                key={i}
                padding="md"
                variant="glass"
                className={`overflow-hidden bg-gradient-to-br from-marble-100/30 to-marble-200/30 border border-marble-200/30 rounded-2xl shadow-soft ${
                  viewMode === 'list' ? 'flex items-start' : ''
                }`}
              >
                <div
                  className={
                    viewMode === 'grid'
                      ? 'h-48 bg-gradient-to-br from-marble-100/50 to-marble-200/50 rounded-xl mb-3 w-full animate-pulse'
                      : 'h-48 w-48 bg-gradient-to-br from-marble-100/50 to-marble-200/50 rounded-xl flex-shrink-0 mr-4 animate-pulse'
                  }
                />
                <div className="flex-1">
                  <div className="space-y-2">
                    <div className="h-4 bg-marble-200/50 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-marble-200/50 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted mb-4">Failed to load results</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredResults.length === 0 && (
          <Card
            padding="lg"
            variant="glass"
            className="text-center py-12 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl shadow-soft"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <HiOutlineMagnifyingGlass className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No tours found</h3>
            <p className="text-muted mb-4">
              Try adjusting your search criteria or clear the filters
            </p>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="border-primary/30 hover:bg-primary/5"
            >
              Clear Filters
            </Button>
          </Card>
        )}

        {/* Results List (mobile-first) */}
        {!isLoading && filteredResults.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
            {filteredResults.map((itinerary) => {
              const imagePath = itinerary.image_file?.image_storage_key;
              const imageUrl = imagePath ? signedUrls[imagePath] : undefined;
              const isFavorite = favoriteItineraryIds.includes(itinerary.id);

              return (
                <article
                  key={itinerary.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open itinerary ${itinerary.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      window.location.href = `/itinerary/${itinerary.id}`;
                    }
                  }}
                  onClick={() => (window.location.href = `/itinerary/${itinerary.id}`)}
                  className={`w-full`}
                >
                  <Card
                    padding="md"
                    variant="glass"
                    className="group relative bg-gradient-to-br from-surface to-primary/5 border border-primary/20 rounded-2xl shadow-soft overflow-hidden transition-all duration-300 hover:shadow-medium hover:scale-[1.02] hover:border-primary/30 cursor-pointer"
                  >
                    {/* Favorite Button - Absolute Position */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10 bg-surface/80 backdrop-blur-sm rounded-xl shadow-soft hover:bg-surface transition-all"
                      loading={favoritesBusy}
                      aria-label={
                        isFavorite
                          ? 'Remove itinerary from favourites'
                          : 'Add itinerary to favourites'
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleFavorite(itinerary.id);
                      }}
                    >
                      {isFavorite ? (
                        <HiHeart
                          className="h-5 w-5"
                          aria-hidden="true"
                          style={{ color: tokens.colors.error, opacity: 0.95 }}
                        />
                      ) : (
                        <HiOutlineHeart
                          className="h-5 w-5 text-foreground/60 group-hover:text-foreground transition-colors"
                          aria-hidden="true"
                        />
                      )}
                    </Button>

                    {/* Image - Always on top */}
                    <div
                      className={`relative ${
                        viewMode === 'grid' ? 'h-40' : 'h-32'
                      } w-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl overflow-hidden mb-3`}
                    >
                      {imageUrl ? (
                        <>
                          <img
                            src={imageUrl}
                            alt={itinerary.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full grid place-items-center text-muted/50 text-xs">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-sm">
                            <HiOutlineMagnifyingGlass className="h-6 w-6" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground line-clamp-2 text-base group-hover:text-primary transition-colors">
                          {itinerary.name}
                        </h3>

                        {viewMode === 'list' && itinerary.description && (
                          <CollapsibleText
                            id={`search-desc-${itinerary.id}`}
                            text={itinerary.description}
                          />
                        )}

                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-secondary">
                            <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center backdrop-blur-sm">
                              <HiOutlineClock className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium">
                              {formatDuration(itinerary.total_duration)}
                            </span>
                          </div>

                          {itinerary.company?.name && (
                            <Badge
                              variant="outline"
                              size="sm"
                              className="bg-marble-50/50 border-marble-200/50 backdrop-blur-sm"
                            >
                              {itinerary.company.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </article>
              );
            })}
          </div>
        )}

        {/* Load More Button (placeholder for infinite scroll) */}
        {!isLoading && filteredResults.length > 0 && filteredResults.length >= 20 && (
          <div className="text-center mt-8">
            <Button onClick={() => setPage((prev) => prev + 1)}>Load More</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  return <SearchPageContent searchParams={searchParams} />;
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
