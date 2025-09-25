'use client';

import React, { useState, useCallback } from 'react';
import { POIMarkerData } from '@/types/app-types';
import { FaFilter, FaTimes, FaSearch, FaMapMarkerAlt, FaBuilding, FaClock } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import Select from '@/components/ui/Select';

interface MapFiltersProps {
  pois: POIMarkerData[];
  onFiltersChange: (filteredPois: POIMarkerData[]) => void;
  className?: string;
}

interface FilterState {
  searchTerm: string;
  selectedCompanies: string[];
  selectedItineraries: string[];
  durationRange: {
    min: number;
    max: number;
  };
  sortBy: 'name' | 'duration' | 'distance';
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  pois,
  onFiltersChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedCompanies: [],
    selectedItineraries: [],
    durationRange: {
      min: 0,
      max: Math.max(...pois.map((p) => p.duration), 3600), // Default max 1 hour
    },
    sortBy: 'name',
  });

  // Get unique companies and itineraries
  const uniqueCompanies = React.useMemo(() => {
    const companies = new Set(pois.map((poi) => poi.companyName));
    return Array.from(companies).sort();
  }, [pois]);

  const uniqueItineraries = React.useMemo(() => {
    const itineraries = new Set(pois.map((poi) => poi.itineraryName));
    return Array.from(itineraries).sort();
  }, [pois]);

  // Apply filters
  const applyFilters = useCallback(
    (newFilters: FilterState) => {
      let filtered = [...pois];

      // Search term filter
      if (newFilters.searchTerm) {
        const searchLower = newFilters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (poi) =>
            poi.trackName.toLowerCase().includes(searchLower) ||
            poi.itineraryName.toLowerCase().includes(searchLower) ||
            poi.companyName.toLowerCase().includes(searchLower),
        );
      }

      // Company filter
      if (newFilters.selectedCompanies.length > 0) {
        filtered = filtered.filter((poi) => newFilters.selectedCompanies.includes(poi.companyName));
      }

      // Itinerary filter
      if (newFilters.selectedItineraries.length > 0) {
        filtered = filtered.filter((poi) =>
          newFilters.selectedItineraries.includes(poi.itineraryName),
        );
      }

      // Duration filter
      filtered = filtered.filter(
        (poi) =>
          poi.duration >= newFilters.durationRange.min &&
          poi.duration <= newFilters.durationRange.max,
      );

      // Sort
      filtered.sort((a, b) => {
        switch (newFilters.sortBy) {
          case 'name':
            return a.trackName.localeCompare(b.trackName);
          case 'duration':
            return a.duration - b.duration;
          case 'distance':
            // TODO: Implement distance sorting based on user location
            return a.trackName.localeCompare(b.trackName);
          default:
            return 0;
        }
      });

      onFiltersChange(filtered);
    },
    [pois, onFiltersChange],
  );

  // Update filters
  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const newFilters = { ...filters, ...updates };
      setFilters(newFilters);
      applyFilters(newFilters);
    },
    [filters, applyFilters],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      searchTerm: '',
      selectedCompanies: [],
      selectedItineraries: [],
      durationRange: {
        min: 0,
        max: Math.max(...pois.map((p) => p.duration), 3600),
      },
      sortBy: 'name',
    };
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
  }, [pois, applyFilters]);

  // Count active filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.selectedCompanies.length > 0) count++;
    if (filters.selectedItineraries.length > 0) count++;
    if (
      filters.durationRange.min > 0 ||
      filters.durationRange.max < Math.max(...pois.map((p) => p.duration), 3600)
    )
      count++;
    return count;
  }, [filters, pois]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  };

  return (
    <div className={className}>
      {/* Filter Toggle Button */}
      <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="relative">
        <FaFilter className="mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Filters Panel */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-20 max-w-md" padding="md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">Filters</h3>
            <div className="flex gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted text-sm" />
                <Input
                  type="text"
                  placeholder="Search tracks..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Sort by</label>
              <Select
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'duration', label: 'Duration' },
                  { value: 'distance', label: 'Distance' },
                ]}
                value={filters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value as FilterState['sortBy'] })}
              />
            </div>

            {/* Companies */}
            {uniqueCompanies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  <FaBuilding className="inline mr-1" />
                  Companies ({uniqueCompanies.length})
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uniqueCompanies.map((company) => (
                    <div key={company} className="flex items-center">
                      <Checkbox
                        id={`company-${company}`}
                        checked={filters.selectedCompanies.includes(company)}
                        onChange={(checked) => {
                          const newSelection = checked
                            ? [...filters.selectedCompanies, company]
                            : filters.selectedCompanies.filter((c) => c !== company);
                          updateFilters({ selectedCompanies: newSelection });
                        }}
                      />
                      <label
                        htmlFor={`company-${company}`}
                        className="ml-2 text-sm text-muted cursor-pointer truncate"
                      >
                        {company}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itineraries */}
            {uniqueItineraries.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  <FaMapMarkerAlt className="inline mr-1" />
                  Itineraries ({uniqueItineraries.length})
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uniqueItineraries.map((itinerary) => (
                    <div key={itinerary} className="flex items-center">
                      <Checkbox
                        id={`itinerary-${itinerary}`}
                        checked={filters.selectedItineraries.includes(itinerary)}
                        onChange={(checked) => {
                          const newSelection = checked
                            ? [...filters.selectedItineraries, itinerary]
                            : filters.selectedItineraries.filter((i) => i !== itinerary);
                          updateFilters({ selectedItineraries: newSelection });
                        }}
                      />
                      <label
                        htmlFor={`itinerary-${itinerary}`}
                        className="ml-2 text-sm text-muted cursor-pointer truncate"
                      >
                        {itinerary}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duration Range */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                <FaClock className="inline mr-1" />
                Duration Range
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="range"
                    min={0}
                    max={Math.max(...pois.map((p) => p.duration))}
                    value={filters.durationRange.min}
                    onChange={(e) =>
                      updateFilters({
                        durationRange: {
                          ...filters.durationRange,
                          min: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full"
                  />
                  <div className="text-xs text-muted text-center">
                    {formatDuration(filters.durationRange.min)}
                  </div>
                </div>
                <span className="text-muted">to</span>
                <div className="flex-1">
                  <Input
                    type="range"
                    min={0}
                    max={Math.max(...pois.map((p) => p.duration))}
                    value={filters.durationRange.max}
                    onChange={(e) =>
                      updateFilters({
                        durationRange: {
                          ...filters.durationRange,
                          max: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full"
                  />
                  <div className="text-xs text-muted text-center">
                    {formatDuration(filters.durationRange.max)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MapFilters;
