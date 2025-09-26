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
      <p id={id} className={'text-sm text-muted leading-relaxed ' + (expanded ? '' : 'line-clamp-2')}>
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
      <Card padding="md" className="bg-surface border-b border-muted sticky top-0 z-10 mb-6">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Search audio tours..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              icon={<HiOutlineMagnifyingGlass className="h-5 w-5" />}
              className="pr-12"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
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
                className="px-3 py-2 border border-muted rounded-lg text-sm bg-surface"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {(filters.company || filters.minDuration > 0 || filters.maxDuration < 300) && (
                <Badge variant="secondary" className="text-xs">
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
                onValueChange={(val) => updateFilter('company', String(val || ''))}
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
        {/* Results Header (not contained in a Card — mobile-first list view) */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {filters.query ? `Search: "${filters.query}"` : 'Discover Tours'}
              </h1>
              <p className="text-muted mt-1">
                {filteredResults.length} tour{filteredResults.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
            {Array.from({ length: 6 }, (_, i) => (
              <Card
                key={i}
                padding="md"
                className={`overflow-hidden animate-pulse bg-surface rounded-xl shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex items-start' : ''
                }`}
              >
                <div
                  className={
                    viewMode === 'grid'
                      ? 'h-48 bg-background rounded-md mb-3 w-full'
                      : 'h-48 w-48 bg-background rounded-md flex-shrink-0 mr-4'
                  }
                />
                <div className="flex-1">
                  <div className="space-y-2">
                    <div className="h-4 bg-background rounded w-3/4" />
                    <div className="h-3 bg-background rounded w-1/2" />
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
          <div className="text-center py-12">
            <HiOutlineMagnifyingGlass className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tours found</h3>
            <p className="text-muted mb-4">
              Try adjusting your search criteria or clear the filters
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </div>
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
                    className={`relative bg-surface rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg cursor-pointer ${
                      viewMode === 'list' ? 'flex items-start' : ''
                    }`}
                  >                  

                    {/* Image */}
                    <div
                      className={`relative ${
                        viewMode === 'grid' ? 'h-32 w-full' : 'h-24 w-24 flex-shrink-0 mr-4'
                      } bg-surface`}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={itinerary.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-muted text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="space-y-1">
                        <h3 className="font-medium text-foreground line-clamp-2">
                          {itinerary.name}
                        </h3>

                        {viewMode === 'list' && itinerary.description && (
                          <CollapsibleText id={`search-desc-${itinerary.id}`} text={itinerary.description} />
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted">
                          <div className="flex items-center gap-1">
                            <HiOutlineClock className="h-3 w-3" />
                            {formatDuration(itinerary.total_duration)}
                          </div>

                          {itinerary.company?.name && (
                            <>
                              <span>•</span>
                              <span>{itinerary.company.name}</span>
                            </>
                          )}
                           <Button
                      type="button"
                      variant='ghost'
                      size="sm"
                      className=""
                      loading={favoritesBusy}
                      aria-label={
                        isFavorite ? 'Remove itinerary from favourites' : 'Add itinerary to favourites'
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleFavorite(itinerary.id);
                      }}
                    >
                      {isFavorite ? (
                        <HiHeart className="h-5 w-5" aria-hidden="true" style={{ color: tokens.colors.error, opacity: 0.95 }} />
                      ) : (
                        <HiOutlineHeart className="h-5 w-5" aria-hidden="true" style={{ opacity: 0.65 }} />
                      )}
                    </Button>
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
