'use client';

import { Card, Button } from '@/components/ui';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';

export default function FavoritesPage() {
  return (
    <NavigationGuard requireAuth={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Favorites</h1>
          <p className="text-muted">Your saved audio tours and tracks</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <Button variant="primary" size="sm">
            All Favorites
          </Button>
          <Button variant="ghost" size="sm">
            Tours
          </Button>
          <Button variant="ghost" size="sm">
            Tracks
          </Button>
        </div>

        {/* Favorites List */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="p-4">
              <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-teal-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-teal text-sm font-medium">❤️</span>
                  </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">
                    Cathedral Architecture Tour
                  </h3>
                    <p className="text-sm text-muted mb-2">
                    Discover the stunning architectural details of this historic cathedral.
                  </p>
                    <div className="flex items-center text-xs text-muted space-x-4">
                    <span>30 minutes</span>
                    <span>5 stops</span>
                    <span>Added 3 days ago</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button variant="ghost" size="sm">
                    Play
                  </Button>
                  <Button variant="ghost" size="sm" className="text-error-600 hover:text-error-700">
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State (when no favorites) */}
        {false && (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-carbon-100 dark:bg-carbon-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-carbon-400 text-2xl">💝</span>
            </div>
            <h3 className="font-semibold text-carbon-900 dark:text-carbon-100 mb-2">
              No favorites yet
            </h3>
            <p className="text-sm text-carbon-600 dark:text-carbon-400 mb-4">
              Start exploring tours and save your favorites here
            </p>
            <Button variant="primary">Explore Tours</Button>
          </Card>
        )}
      </div>
    </NavigationGuard>
  );
}
