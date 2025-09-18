'use client';

import React from 'react';
import { MainLayout } from '@/components/layouts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = React.useState<'tours' | 'places' | 'collections'>('tours');

  const favoriteTours = [
    {
      id: '1',
      title: 'Vatican Museums Audio Guide',
      description: 'Explore the papal art collections',
      duration: '3h 15m',
      rating: 4.9,
      addedDate: '2 days ago',
      status: 'available',
    },
    {
      id: '2',
      title: 'Trastevere Food Tour',
      description: 'Taste authentic Roman cuisine',
      duration: '2h 45m',
      rating: 4.6,
      addedDate: '1 week ago',
      status: 'downloaded',
    },
  ];

  const favoritePlaces = [
    {
      id: '1',
      name: 'Pantheon',
      description: 'Ancient Roman temple',
      category: 'Historical Site',
      distance: '1.2 km',
      addedDate: '3 days ago',
    },
    {
      id: '2',
      name: 'Trevi Fountain',
      description: 'Baroque fountain masterpiece',
      category: 'Landmark',
      distance: '0.8 km',
      addedDate: '5 days ago',
    },
  ];

  const collections = [
    {
      id: '1',
      name: 'Rome Essentials',
      description: 'Must-see attractions in the Eternal City',
      itemCount: 8,
      createdDate: '1 week ago',
      isPublic: false,
    },
    {
      id: '2',
      name: 'Art & Architecture',
      description: 'Renaissance and Baroque masterpieces',
      itemCount: 12,
      createdDate: '2 weeks ago',
      isPublic: true,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tours':
        return (
          <div className="space-y-4">
            {favoriteTours.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No favorite tours yet</h3>
                <p className="text-muted mb-4">Start exploring and save tours you love</p>
                <Button>Browse Tours</Button>
              </div>
            ) : (
              favoriteTours.map((tour) => (
                <Card key={tour.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-foreground truncate">
                          {tour.title}
                        </h3>
                        <Button variant="ghost" size="sm" className="p-1 h-6 w-6 ml-2">
                          <svg className="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted mb-3 line-clamp-2">
                        {tour.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={tour.status === 'downloaded' ? 'success' : 'secondary'} size="sm">
                          {tour.status === 'downloaded' ? 'Downloaded' : 'Available'}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <svg className="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span>{tour.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted mb-3">
                        <span>{tour.duration}</span>
                        <span>Added {tour.addedDate}</span>
                      </div>
                      
                      <Button size="sm" className="w-full">
                        {tour.status === 'downloaded' ? 'Start Tour' : 'View Details'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        );
        
      case 'places':
        return (
          <div className="space-y-4">
            {favoritePlaces.map((place) => (
              <Card key={place.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground truncate">
                        {place.name}
                      </h3>
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6 ml-2">
                        <svg className="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                      </Button>
                    </div>
                    <p className="text-sm text-muted mb-2">{place.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm">{place.category}</Badge>
                        <span>{place.distance} away</span>
                      </div>
                      <span>Added {place.addedDate}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
        
      case 'collections':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-foreground">My Collections</h3>
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Collection
              </Button>
            </div>
            
            {collections.map((collection) => (
              <Card key={collection.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground truncate">
                        {collection.name}
                      </h3>
                      {collection.isPublic && (
                        <Badge variant="outline" size="sm">Public</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted mb-2">{collection.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{collection.itemCount} items</span>
                      <span>Created {collection.createdDate}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
    <MainLayout title="Favorites" showBackButton={false}>
      <div className="p-4 space-y-6">
        {/* Tabs */}
        <div className="flex bg-surface rounded-lg p-1">
          {[
            { id: 'tours', label: 'Tours' },
            { id: 'places', label: 'Places' },
            { id: 'collections', label: 'Collections' },
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