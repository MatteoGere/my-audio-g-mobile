import { Card, Button } from '@/components/ui';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Welcome to MyAudioG
        </h1>
        <p className="text-stone-600 dark:text-stone-400">
          Discover immersive audio tours and travel experiences
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Explore Tours
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
            Find amazing audio guides
          </p>
          <Link href="/search" className="block">
            <Button variant="primary" size="sm" className="w-full">
              Search Tours
            </Button>
          </Link>
        </Card>

        <Card className="p-4 text-center">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Nearby
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
            Tours near your location
          </p>
          <Link href="/map" className="block">
            <Button variant="outline" size="sm" className="w-full">
              View Map
            </Button>
          </Link>
        </Card>
      </div>

      {/* Featured Section */}
      <div>
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
          Featured Tours
        </h2>
        <div className="space-y-4">
          {/* Placeholder for featured tours */}
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                  Tour
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-stone-900 dark:text-stone-100 truncate">
                  Historic City Walk
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  45 minutes • 8 stops
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Play
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-sea-100 dark:bg-sea-900 rounded-lg flex items-center justify-center">
                <span className="text-sea-600 dark:text-sea-400 text-sm font-medium">
                  Tour
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-stone-900 dark:text-stone-100 truncate">
                  Museum Audio Guide
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  30 minutes • 5 exhibits
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Play
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
          Browse Categories
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="w-12 h-12 bg-forest-100 dark:bg-forest-900 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-forest-600 dark:text-forest-400 text-xs font-medium">
                🏛️
              </span>
            </div>
            <h3 className="font-medium text-stone-900 dark:text-stone-100">
              Museums
            </h3>
          </Card>

          <Card className="p-4 text-center">
            <div className="w-12 h-12 bg-sand-100 dark:bg-sand-900 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-sand-600 dark:text-sand-400 text-xs font-medium">
                🏰
              </span>
            </div>
            <h3 className="font-medium text-stone-900 dark:text-stone-100">
              Historic Sites
            </h3>
          </Card>
        </div>
      </div>
    </div>
  );
}