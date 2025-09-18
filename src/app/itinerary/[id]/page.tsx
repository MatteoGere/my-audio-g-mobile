'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import { Breadcrumb } from '@/components/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui';

interface ItineraryDetailPageProps {
  params: {
    id: string;
  };
}

export default function ItineraryDetailPage({ params }: ItineraryDetailPageProps) {
  const { id } = params;

  // Placeholder data - would be fetched based on ID
  const itinerary = {
    id,
    title: 'Rome in a Day',
    description: 'Experience the eternal city\'s most iconic landmarks in this comprehensive full-day audio tour. From ancient ruins to Renaissance masterpieces, discover the layers of history that make Rome truly unique.',
    duration: '8h 30m',
    distance: '12.5 km',
    stopCount: 12,
    rating: 4.8,
    reviews: 1247,
    price: '€35',
    difficulty: 'Moderate',
    languages: ['English', 'Italian', 'Spanish', 'French'],
    highlights: [
      'Colosseum Underground Tour',
      'Roman Forum Archaeological Walk',
      'Pantheon Interior Guide',
      'Trevi Fountain History',
      'Spanish Steps Cultural Context',
      'Vatican Square Overview',
    ],
    stops: [
      {
        id: '1',
        title: 'Colosseum',
        description: 'Ancient amphitheater and symbol of Imperial Rome',
        duration: '45 min',
        walkingTime: '0 min',
        audioLength: '12 min',
      },
      {
        id: '2',
        title: 'Roman Forum',
        description: 'Heart of ancient Rome\'s political and commercial life',
        duration: '60 min',
        walkingTime: '8 min',
        audioLength: '15 min',
      },
      {
        id: '3',
        title: 'Pantheon',
        description: 'Best preserved Roman building with spectacular dome',
        duration: '30 min',
        walkingTime: '15 min',
        audioLength: '10 min',
      },
    ],
  };

  const breadcrumbItems = [
    { label: 'Itineraries', href: '/itineraries' },
    { label: itinerary.title, isActive: true },
  ];

  return (
    <MainLayout 
      title="Tour Details" 
      showBackButton
      headerActions={
        <Button variant="ghost" size="sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative">
          <div className="h-64 bg-muted" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl font-bold mb-2">{itinerary.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span>{itinerary.duration}</span>
              <span>•</span>
              <span>{itinerary.stopCount} stops</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{itinerary.rating} ({itinerary.reviews})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Overview */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Overview</h2>
                <p className="text-sm text-muted leading-relaxed">
                  {itinerary.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-primary">{itinerary.price}</div>
                <div className="text-sm text-muted">per person</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-surface rounded-lg">
                <div className="font-semibold text-foreground">{itinerary.duration}</div>
                <div className="text-sm text-muted">Duration</div>
              </div>
              <div className="text-center p-3 bg-surface rounded-lg">
                <div className="font-semibold text-foreground">{itinerary.distance}</div>
                <div className="text-sm text-muted">Walking Distance</div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{itinerary.difficulty}</Badge>
              <div className="flex flex-wrap gap-1">
                {itinerary.languages.map((lang) => (
                  <Badge key={lang} variant="outline" size="sm">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1">
                Start Tour
              </Button>
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </Button>
            </div>
          </Card>

          {/* Highlights */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tour Highlights</h3>
            <div className="space-y-2">
              {itinerary.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-sm text-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Stops */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tour Stops</h3>
            <div className="space-y-4">
              {itinerary.stops.map((stop, index) => (
                <div key={stop.id} className="flex gap-4 p-3 bg-surface rounded-lg">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1">{stop.title}</h4>
                    <p className="text-sm text-muted mb-2">{stop.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>📍 {stop.duration}</span>
                      <span>🚶 {stop.walkingTime}</span>
                      <span>🎧 {stop.audioLength}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}