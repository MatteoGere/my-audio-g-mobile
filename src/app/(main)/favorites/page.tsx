'use client';

import { Card, Button } from '@/components/ui';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';

export default function FavoritesPage() {
  return (
    <NavigationGuard requireAuth={true}>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Your Favorites
        </h1>
        <p className="text-stone-600 dark:text-stone-400">Your saved audio tours and tracks</p>
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
              <div className="w-16 h-16 bg-forest-100 dark:bg-forest-900 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-forest-600 dark:text-forest-400 text-sm font-medium">❤️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                  Cathedral Architecture Tour
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                  Discover the stunning architectural details of this historic cathedral.
                </p>
                <div className="flex items-center text-xs text-stone-500 dark:text-stone-400 space-x-4">
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
          <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-stone-400 text-2xl">💝</span>
          </div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
            No favorites yet
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
            Start exploring tours and save your favorites here
          </p>
          <Button variant="primary">Explore Tours</Button>
        </Card>
      )}
      </div>
    </NavigationGuard>
  );
}
