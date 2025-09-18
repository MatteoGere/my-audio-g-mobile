'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import { Input } from '@/components/ui';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Placeholder data - will be replaced with real data from API
  const featuredTours = [
    {
      id: '1',
      title: 'Historic Rome Walking Tour',
      description: 'Discover the ancient heart of Rome with expert narration',
      duration: '2h 30m',
      rating: 4.8,
      imageUrl: '/placeholder-tour.jpg',
    },
    {
      id: '2', 
      title: 'Vatican Museums Audio Guide',
      description: 'Explore the masterpieces of Vatican City',
      duration: '3h 15m',
      rating: 4.9,
      imageUrl: '/placeholder-tour.jpg',
    },
  ];

  const nearbyTours = [
    {
      id: '3',
      title: 'Trastevere Night Walk',
      description: 'Experience Rome\'s bohemian quarter after dark',
      duration: '1h 45m',
      distance: '0.5 km',
    },
    {
      id: '4',
      title: 'Colosseum Underground',
      description: 'Go beneath the arena floor',
      duration: '1h 20m',
      distance: '1.2 km',
    },
  ];

  return (
    <MainLayout title="MyAudioG">
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome back!
          </h1>
          <p className="text-muted">
            Ready for your next audio adventure?
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Input
            type="search"
            placeholder="Search destinations, tours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10"
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-sm">Nearby Tours</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm">My Favorites</span>
          </Button>
        </div>

        {/* Featured Tours */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Featured Tours</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {featuredTours.map((tour) => (
              <Card key={tour.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1 truncate">
                      {tour.title}
                    </h3>
                    <p className="text-sm text-muted mb-2 line-clamp-2">
                      {tour.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{tour.duration}</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{tour.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Nearby Tours */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Near You</h2>
          <div className="space-y-3">
            {nearbyTours.map((tour) => (
              <Card key={tour.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1 truncate">
                      {tour.title}
                    </h3>
                    <p className="text-sm text-muted">
                      {tour.description}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted ml-4">
                    <div>{tour.duration}</div>
                    <div>{tour.distance}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}