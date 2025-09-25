'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Badge, Card } from '@/components/ui';
import { useGetAudioItinerariesQuery } from '@/lib/redux/api/apiSlice';
import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  duration?: 'short' | 'medium' | 'long'; // <30min, 30-60min, >60min
  location?: 'nearby' | 'anywhere';
  company?: string;
  type?: 'featured' | 'recent' | 'popular';
}

export interface SearchSuggestion {
  id: string;
  title: string;
  type: 'itinerary' | 'company' | 'location';
  subtitle?: string;
  duration?: number;
  company?: string;
}

interface SearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  showHistory?: boolean;
  onSearch?: (query: string, filters?: SearchFilters) => void;
  className?: string;
  autoFocus?: boolean;
}

const STORAGE_KEY = 'myaudiog:search-history';
const MAX_HISTORY_ITEMS = 10;

export default function SearchBar({
  placeholder = 'Search audio guides, companies, locations...',
  showFilters = true,
  showHistory = true,
  onSearch,
  className = '',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Search API for suggestions
  const { data: searchResults, isLoading } = useGetAudioItinerariesQuery(
    { search: query, limit: 5 },
    { skip: query.length < 2 },
  );

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Create suggestions from search results
  const suggestions: SearchSuggestion[] =
    searchResults?.map((item) => ({
      id: item.id,
      title: item.name,
      type: 'itinerary' as const,
      subtitle: item.description,
      duration: item.total_duration,
      company: (item as any).company?.name,
    })) || [];

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSuggestionIndex(-1);

    if (value.length > 0) {
      setIsExpanded(true);
    }
  };

  // Handle search submission
  const handleSearch = useCallback(
    (searchQuery: string = query) => {
      if (!searchQuery.trim()) return;

      // Add to search history
      const newHistory = [
        searchQuery,
        ...searchHistory.filter((item) => item !== searchQuery),
      ].slice(0, MAX_HISTORY_ITEMS);

      setSearchHistory(newHistory);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }

      // Call external handler or navigate
      if (onSearch) {
        onSearch(searchQuery, filters);
      } else {
        const searchParams = new URLSearchParams();
        searchParams.set('q', searchQuery);

        if (filters.duration) searchParams.set('duration', filters.duration);
        if (filters.location) searchParams.set('location', filters.location);
        if (filters.company) searchParams.set('company', filters.company);
        if (filters.type) searchParams.set('type', filters.type);

        router.push(`/search?${searchParams.toString()}`);
      }

      setIsExpanded(false);
      setQuery('');
      searchInputRef.current?.blur();
    },
    [query, filters, searchHistory, onSearch, router],
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isExpanded) return;

    const itemCount = suggestions.length + (showHistory ? searchHistory.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev < itemCount - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const allItems = [
            ...suggestions.map((s) => s.title),
            ...(showHistory ? searchHistory : []),
          ];
          handleSearch(allItems[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsExpanded(false);
        setSelectedSuggestionIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion | string) => {
    const searchTerm = typeof suggestion === 'string' ? suggestion : suggestion.title;
    handleSearch(searchTerm);
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  // Remove single history item
  const removeHistoryItem = (item: string) => {
    const newHistory = searchHistory.filter((h) => h !== item);
    setSearchHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to update search history:', error);
    }
  };

  // Filter shortcuts
  const filterShortcuts = [
    { key: 'nearby', label: 'Near me', icon: HiOutlineMapPin },
    { key: 'short', label: '<30 min', icon: HiOutlineClock },
    { key: 'medium', label: '30-60 min', icon: HiOutlineClock },
    { key: 'featured', label: 'Featured', icon: null },
  ];

  return (
    <div className={cn('relative space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsExpanded(true)}
          placeholder={placeholder}
          className="pl-10 pr-4"
          icon={<HiOutlineMagnifyingGlass className="h-5 w-5 text-muted" />}
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsExpanded(false);
              searchInputRef.current?.focus();
            }}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            tabIndex={0}
            aria-label="Clear search"
          >
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Shortcuts */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mt-3">
          {filterShortcuts.map((filter) => (
            <Badge
              key={filter.key}
              variant={
                filters.location === filter.key ||
                filters.duration === filter.key ||
                filters.type === filter.key
                  ? 'primary'
                  : 'outline'
              }
              className="cursor-pointer min-w-[44px] min-h-[32px] flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-background"
              onClick={() => {
                const newFilters = { ...filters };

                if (filter.key === 'nearby') {
                  newFilters.location = newFilters.location === 'nearby' ? undefined : 'nearby';
                } else if (['short', 'medium', 'long'].includes(filter.key)) {
                  newFilters.duration =
                    newFilters.duration === filter.key ? undefined : (filter.key as any);
                } else if (filter.key === 'featured') {
                  newFilters.type = newFilters.type === 'featured' ? undefined : 'featured';
                }

                setFilters(newFilters);
              }}
              tabIndex={0}
            >
              {filter.icon && <filter.icon className="h-4 w-4 mr-1" />}
              {filter.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isExpanded && (
  <div className="absolute top-full left-0 right-0 mt-2 z-50">
    <Card padding="md" className="bg-surface border border-muted rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {/* Loading */}
          {isLoading && query.length >= 2 && (
            <div className="text-center text-muted">
              <div className="inline-flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                Searching...
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-bold text-muted uppercase tracking-wide">
                Audio Guides
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    'w-full px-3 py-2 text-left rounded-lg transition-colors',
                    'hover:bg-background',
                      selectedSuggestionIndex === index && 'bg-primary/20',
                  )}
                  tabIndex={0}
                >
                  <div className="font-bold text-foreground">
                    {suggestion.title}
                  </div>
                  <div className="text-xs text-muted flex items-center gap-2 mt-1">
                    {suggestion.company && <span>{suggestion.company}</span>}
                    {suggestion.duration && (
                      <span className="flex items-center">
                        <HiOutlineClock className="h-3 w-3 mr-1" />
                        {Math.round(suggestion.duration / 60)}min
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && query.length === 0 && (
            <div className="py-2 border-t border-muted">
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-xs font-bold text-muted uppercase tracking-wide">
                  Recent Searches
                </span>
                <button onClick={clearHistory} className="text-xs text-primary hover:text-primary/80" tabIndex={0}>
                  Clear
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <div
                  key={index}
                    className={cn(
                    'flex items-center px-3 py-2 rounded-lg transition-colors',
                    'hover:bg-background',
                    selectedSuggestionIndex === suggestions.length + index && 'bg-primary/20',
                  )}
                >
                  <button
                    onClick={() => handleSuggestionClick(item)}
                    className="flex-1 text-left text-foreground"
                    tabIndex={0}
                  >
                    {item}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistoryItem(item);
                    }}
                    className="ml-2 text-muted hover:text-foreground"
                    tabIndex={0}
                    aria-label={`Remove ${item} from history`}
                  >
                    <HiOutlineXMark className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !isLoading && suggestions.length === 0 && (
            <div className="text-center text-muted">
              <p>No audio guides found for "{query}"</p>
              <button onClick={() => handleSearch()} className="mt-2 text-primary font-bold" tabIndex={0}>
                Search anyway
              </button>
            </div>
          )}
        </Card>
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && <div className="fixed inset-0 z-40" onClick={() => setIsExpanded(false)} />}
    </div>
  );
}
