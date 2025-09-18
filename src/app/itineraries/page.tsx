'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';

export default function ItinerariesPage() {
  const [activeTab, setActiveTab] = React.useState<'featured' | 'recent' | 'downloaded'>('featured');

  const featuredItineraries = [
    {
      id: '1',
      title: 'Rome in a Day',
      description: 'Complete overview of Rome\'s most iconic landmarks',
      duration: '8h 30m',
      stops: 12,
      rating: 4.8,
      price: '€35',
      difficulty: 'Moderate',
      languages: ['English', 'Italian', 'Spanish'],
    },
    {
      id: '2',
      title: 'Vatican Discovery',
      description: 'In-depth exploration of Vatican City and its treasures',
      duration: '4h 15m',
      stops: 8,
      rating: 4.9,
      price: '€28',
      difficulty: 'Easy',
      languages: ['English', 'Italian'],
    },
  ];

  const recentItineraries = [
    {
      id: '3',
      title: 'Trastevere Walking Tour',
      lastPlayed: '2 days ago',
      progress: 75,
      duration: '2h 15m',
    },
    {
      id: '4',
      title: 'Colosseum Underground',
      lastPlayed: '1 week ago',
      progress: 100,
      duration: '1h 45m',
    },
  ];

  const downloadedItineraries = [
    {
      id: '5',
      title: 'Florence Art Walk',
      downloadDate: '3 days ago',
      size: '120 MB',
      duration: '3h 30m',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'featured':
        return (
          <div className="space-y-4">
            {featuredItineraries.map((itinerary) => (
              <Card key={itinerary.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground">
                        {itinerary.title}
                      </h3>
                      <div className="text-sm font-semibold text-primary ml-2">
                        {itinerary.price}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted mb-3 line-clamp-2">
                      {itinerary.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" size="sm">
                        {itinerary.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <svg className="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{itinerary.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted mb-3">
                      <span>{itinerary.duration}</span>
                      <span>{itinerary.stops} stops</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {itinerary.languages.map((lang) => (
                        <Badge key={lang} variant="outline" size="sm">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
        
      case 'recent':
        return (
          <div className="space-y-4">
            {recentItineraries.map((itinerary) => (
              <Card key={itinerary.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1">
                      {itinerary.title}
                    </h3>
                    <p className="text-sm text-muted">
                      Last played {itinerary.lastPlayed} • {itinerary.duration}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-foreground">
                      {itinerary.progress}%
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-surface rounded-full h-2 mb-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${itinerary.progress}%` }}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    {itinerary.progress === 100 ? 'Replay' : 'Continue'}
                  </Button>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        );
        
      case 'downloaded':
        return (
          <div className="space-y-4">
            {downloadedItineraries.map((itinerary) => (
              <Card key={itinerary.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1">
                      {itinerary.title}
                    </h3>
                    <p className="text-sm text-muted">
                      Downloaded {itinerary.downloadDate} • {itinerary.size} • {itinerary.duration}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    Start Tour
                  </Button>
                  <Button variant="outline" size="sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <MainLayout title="Itineraries" showBackButton={false}>
      <div className="p-4 space-y-6">
        {/* Tabs */}
        <div className="flex bg-surface rounded-lg p-1">
          {[
            { id: 'featured', label: 'Featured' },
            { id: 'recent', label: 'Recent' },
            { id: 'downloaded', label: 'Downloaded' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-soft'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </MainLayout>
  );
}