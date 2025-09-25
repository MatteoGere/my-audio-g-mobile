import { Card, Button } from '@/components/ui';
import Link from 'next/link';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import NearbyItineraries from '@/components/NearbyItineraries';
import CategoriesGrid from '@/components/CategoriesGrid';

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to MyAudioG</h1>
        <p className="text-muted">Discover immersive audio tours and travel experiences</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md" className="text-center">
          <h3 className="font-semibold text-foreground mb-2">Explore Tours</h3>
          <p className="text-sm text-muted mb-3">Find amazing audio guides</p>
          <Link href="/search" className="block">
            <Button variant="primary" size="sm" className="w-full">
              Search Tours
            </Button>
          </Link>
        </Card>

        <Card padding="md" className="text-center">
          <h3 className="font-semibold text-foreground mb-2">Nearby</h3>
          <p className="text-sm text-muted mb-3">Tours near your location</p>
          <Link href="/map" className="block">
            <Button variant="outline" size="sm" className="w-full">
              View Map
            </Button>
          </Link>
        </Card>
      </div>

      {/* Featured Section */}
      <FeaturedCarousel />

      {/* Nearby Recommendations */}
      <NearbyItineraries />

      {/* Categories */}
      <CategoriesGrid />
    </div>
  );
}
