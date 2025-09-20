'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';
import { useSearchAudioItinerariesQuery } from '../../store/api/supabaseApi';
import { ItineraryCard } from '../itinerary/ItineraryCard';
import { Spinner } from '../ui';
import { Database } from '../../types/supabase-types';

type AudioItinerary = Database['public']['Tables']['audio_itinerary']['Row'] & {
  image_file?: Database['public']['Tables']['image_file']['Row'];
};

interface SearchBarProps {
  placeholder?: string;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search audio tours...',
  onSearchFocus,
  onSearchBlur,
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search query
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
  } = useSearchAudioItinerariesQuery(
    { searchTerm: debouncedSearchTerm, limit: 5 },
    {
      skip: debouncedSearchTerm.length < 2,
    },
  );

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchFocus = () => {
    setIsExpanded(true);
    onSearchFocus?.();
  };

  const handleSearchBlur = () => {
    onSearchBlur?.();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleViewAllResults = () => {
    if (debouncedSearchTerm) {
      router.push(`/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
      setIsExpanded(false);
      setSearchTerm('');
    }
  };

  const showResults = isExpanded && debouncedSearchTerm.length >= 2;

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-10 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-stone-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          autoComplete="off"
        />

        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <HiOutlineMagnifyingGlass className="h-5 w-5 text-stone-400 dark:text-gray-500" />
        </div>

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Clear search"
          >
            <HiOutlineXMark className="h-4 w-4 text-stone-400 dark:text-gray-500" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl shadow-medium dark:shadow-strong max-h-96 overflow-y-auto z-50">
          {isSearching && (
            <div className="p-4 text-center">
              <Spinner size="sm" variant="primary" />
              <p className="text-sm text-stone-600 dark:text-gray-400 mt-2">Searching...</p>
            </div>
          )}

          {searchError && (
            <div className="p-4 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to search. Please try again.
              </p>
            </div>
          )}

          {!isSearching && !searchError && searchResults && (
            <>
              {searchResults.length > 0 ? (
                <>
                  <div className="p-2 space-y-2">
                    {searchResults.map((itinerary: AudioItinerary) => (
                      <div
                        key={itinerary.id}
                        onClick={() => {
                          setIsExpanded(false);
                          setSearchTerm('');
                        }}
                      >
                        <ItineraryCard
                          itinerary={itinerary}
                          className="hover:bg-stone-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  {/* View All Results */}
                  <div className="border-t border-stone-200 dark:border-gray-700 p-3">
                    <button
                      onClick={handleViewAllResults}
                      className="w-full text-center text-primary hover:text-primary/80 font-medium text-sm py-2 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      View all results for "{debouncedSearchTerm}"
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-stone-600 dark:text-gray-400">
                    No tours found for "{debouncedSearchTerm}"
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
