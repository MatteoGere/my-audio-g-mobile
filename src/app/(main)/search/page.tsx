'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Badge } from '@/components/ui';
import SearchBar from '@/components/SearchBar';
import { useGetAudioItinerariesQuery } from '@/lib/redux/api/apiSlice';
import { HiOutlineClock, HiOutlineMapPin, HiOutlineHeart } from 'react-icons/hi2';

interface SearchPageContentProps {
  searchParams: URLSearchParams;
}

function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const query = searchParams.get('q') || '';
  const duration = searchParams.get('duration') as 'short' | 'medium' | 'long' | null;
  const location = searchParams.get('location') as 'nearby' | 'anywhere' | null;
  const company = searchParams.get('company') || '';
  const type = searchParams.get('type') as 'featured' | 'recent' | 'popular' | null;

  const [page, setPage] = useState(1);
  const [allResults, setAllResults] = useState<any[]>([]);

  // Fetch search results
  const {
    data: results,
    isLoading,
    error,
  } = useGetAudioItinerariesQuery({
    search: query,
    page,
    limit: 20,
  });

  // Accumulate results for pagination
  useEffect(() => {
    if (results && page === 1) {
      setAllResults(results);
    } else if (results && page > 1) {
      setAllResults((prev) => [...prev, ...results]);
    }
  }, [results, page]);

  // Reset when search changes
  useEffect(() => {
    setPage(1);
    setAllResults([]);
  }, [query, duration, location, company, type]);

  // Filter results based on criteria
  const filteredResults = allResults.filter((result) => {
    if (duration) {
      const durationMinutes = result.total_duration / 60;
      switch (duration) {
        case 'short':
          if (durationMinutes >= 30) return false;
          break;
        case 'medium':
          if (durationMinutes < 30 || durationMinutes > 60) return false;
          break;
        case 'long':
          if (durationMinutes <= 60) return false;
          break;
      }
    }

    if (company && !(result as any).company?.name.toLowerCase().includes(company.toLowerCase())) {
      return false;
    }

    return true;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getDurationColor = (seconds: number) => {
    const minutes = seconds / 60;
    if (minutes < 30)
      return 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-300';
    if (minutes < 60)
      return 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300';
    return 'bg-info-100 text-info-700 dark:bg-info-900/20 dark:text-info-300';
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <SearchBar
          placeholder="Search audio guides, companies, locations..."
          showFilters={true}
          autoFocus={false}
        />

        {/* Active Filters */}
        {(query || duration || location || company || type) && (
          <div className="flex flex-wrap gap-2">
            {query && <Badge variant="primary">Search: "{query}"</Badge>}
            {duration && (
              <Badge variant="secondary">
                <HiOutlineClock className="h-3 w-3 mr-1" />
                {duration === 'short' ? '<30 min' : duration === 'medium' ? '30-60 min' : '>60 min'}
              </Badge>
            )}
            {location && (
              <Badge variant="secondary">
                <HiOutlineMapPin className="h-3 w-3 mr-1" />
                {location === 'nearby' ? 'Near me' : 'Anywhere'}
              </Badge>
            )}
            {company && <Badge variant="secondary">Company: {company}</Badge>}
            {type && (
              <Badge variant="secondary">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {query ? `Search Results for "${query}"` : 'Audio Guides'}
        </h2>
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Loading State */}
      {isLoading && page === 1 && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-4"
            >
              <div className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4"></div>
                    <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2"></div>
                    <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-stone-500 dark:text-stone-400">
            Something went wrong while searching. Please try again.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && filteredResults.length === 0 && query && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
            <HiOutlineMapPin className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
            No results found
          </h3>
          <p className="text-stone-500 dark:text-stone-400 mb-4">
            We couldn't find any audio guides matching your search.
          </p>
          <div className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
            <p>Try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Using different keywords</li>
              <li>Removing some filters</li>
              <li>Checking your spelling</li>
            </ul>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {filteredResults.length > 0 && (
        <div className="space-y-4">
          {filteredResults.map((result, index) => (
            <div
              key={result.id}
              className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.open(`/itinerary/${result.id}`, '_blank')}
            >
              <div className="flex space-x-4">
                {/* Image */}
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {(result as any).image_file ? (
                    <img
                      src="#" // Will be handled by signed URL system
                      alt={result.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <HiOutlineMapPin className="h-6 w-6 text-stone-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-stone-900 dark:text-stone-100 truncate">
                        {result.name}
                      </h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                        {result.description}
                      </p>
                    </div>
                    <button className="ml-2 p-1 text-stone-400 hover:text-red-500 transition-colors">
                      <HiOutlineHeart className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 mt-3">
                    {(result as any).company && (
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {(result as any).company.name}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDurationColor(result.total_duration)}`}
                    >
                      <HiOutlineClock className="h-3 w-3 mr-1" />
                      {formatDuration(result.total_duration)}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">Free</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load More */}
          {results && results.length === 20 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((prev) => prev + 1)}
                loading={isLoading && page > 1}
                disabled={isLoading}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <SearchPageContent searchParams={searchParams} />
    </Suspense>
  );
}
