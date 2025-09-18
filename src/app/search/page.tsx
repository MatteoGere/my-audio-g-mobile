'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import { Input } from '@/components/ui';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'relevance' | 'rating' | 'duration' | 'distance'>('relevance');

  const categories = [
    { id: 'history', label: 'History', icon: '🏛️' },
    { id: 'art', label: 'Art & Culture', icon: '🎨' },
    { id: 'nature', label: 'Nature', icon: '🌳' },
    { id: 'food', label: 'Food & Drink', icon: '🍷' },
    { id: 'architecture', label: 'Architecture', icon: '🏗️' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  ];

  const searchResults = [
    {
      id: '1',
      title: 'Ancient Rome Underground',
      description: 'Explore the hidden chambers beneath the Eternal City',
      duration: '2h 15m',
      rating: 4.7,
      distance: '1.2 km',
      price: '€15',
      category: 'history',
      difficulty: 'Easy',
    },
    {
      id: '2',
      title: 'Vatican Art Treasures',
      description: 'Masterpieces of Renaissance art in the papal collections',
      duration: '3h 30m',
      rating: 4.9,
      distance: '2.8 km',
      price: '€25',
      category: 'art',
      difficulty: 'Moderate',
    },
    {
      id: '3',
      title: 'Trastevere Food Tour',
      description: 'Taste authentic Roman cuisine in historic neighborhoods',
      duration: '2h 45m',
      rating: 4.6,
      distance: '0.8 km',
      price: '€20',
      category: 'food',
      difficulty: 'Easy',
    },
  ];

  const filteredResults = selectedCategory
    ? searchResults.filter(result => result.category === selectedCategory)
    : searchResults;

  return (
    <MainLayout 
      title="Search Tours" 
      showBackButton={false}
    >
      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Input
            type="search"
            placeholder="Search destinations, tours, attractions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Categories</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className="whitespace-nowrap"
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </Button>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-surface rounded-md px-3 py-1 bg-background text-foreground"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="duration">Duration</option>
            <option value="distance">Distance</option>
          </select>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">
              {filteredResults.length} results found
            </h3>
          </div>

          <div className="space-y-4">
            {filteredResults.map((tour) => (
              <Card key={tour.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground truncate">
                        {tour.title}
                      </h3>
                      <div className="text-sm font-semibold text-primary ml-2">
                        {tour.price}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted mb-3 line-clamp-2">
                      {tour.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" size="sm">
                        {tour.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <svg className="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{tour.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{tour.duration}</span>
                      <span>{tour.distance} away</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}