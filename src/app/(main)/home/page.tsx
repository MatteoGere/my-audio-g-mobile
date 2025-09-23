import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import FeaturedCarousel from '@/components/FeaturedCarousel';

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
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">Explore Tours</h3>
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
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">Nearby</h3>
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
      <FeaturedCarousel />

      {/* Categories */}
      <div>
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
          Browse Categories
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="w-12 h-12 bg-forest-100 dark:bg-forest-900 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-forest-600 dark:text-forest-400 text-xs font-medium">🏛️</span>
            </div>
            <h3 className="font-medium text-stone-900 dark:text-stone-100">Museums</h3>
          </Card>

          <Card className="p-4 text-center">
            <div className="w-12 h-12 bg-sand-100 dark:bg-sand-900 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-sand-600 dark:text-sand-400 text-xs font-medium">🏰</span>
            </div>
            <h3 className="font-medium text-stone-900 dark:text-stone-100">Historic Sites</h3>
          </Card>
        </div>
      </div>
    </div>
  );
}
