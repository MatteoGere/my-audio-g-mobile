import { Card, Button, Badge } from '@/components/ui';
import Link from 'next/link';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import NearbyItineraries from '@/components/NearbyItineraries';
import CategoriesGrid from '@/components/CategoriesGrid';

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden text-center py-10 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-2xl border border-primary/20 shadow-medium">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Badge
            variant="primary"
            className="mb-3 bg-gradient-to-r from-primary to-accent backdrop-blur-sm"
          >
            ✨ Audio Travel Guide
          </Badge>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Welcome to MyAudioG
          </h1>
          <p className="text-muted text-lg max-w-md mx-auto">
            Discover immersive audio tours and travel experiences around the world
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          padding="md"
          variant="glass"
          className="text-center border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
        >
          <div className="text-2xl font-bold text-primary mb-1">100+</div>
          <div className="text-xs text-muted">Tours</div>
        </Card>
        <Card
          padding="md"
          variant="glass"
          className="text-center border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10"
        >
          <div className="text-2xl font-bold text-accent mb-1">50+</div>
          <div className="text-xs text-muted">Cities</div>
        </Card>
        <Card
          padding="md"
          variant="glass"
          className="text-center border border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10"
        >
          <div className="text-2xl font-bold text-secondary mb-1">4.8★</div>
          <div className="text-xs text-muted">Rating</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/search" className="block">
          <Card
            padding="md"
            variant="glass"
            className="text-center border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 transition-all duration-300 hover:scale-[1.03] hover:shadow-medium hover:border-primary/40 cursor-pointer group"
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center backdrop-blur-sm shadow-soft group-hover:scale-110 transition-transform">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="font-bold text-foreground mb-1">Explore Tours</h3>
            <p className="text-xs text-muted mb-3">Find amazing audio guides</p>
            <div className="inline-flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all">
              <span>Search</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </Card>
        </Link>

        <Link href="/map" className="block">
          <Card
            padding="md"
            variant="glass"
            className="text-center border border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 transition-all duration-300 hover:scale-[1.03] hover:shadow-medium hover:border-secondary/40 cursor-pointer group"
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center backdrop-blur-sm shadow-soft group-hover:scale-110 transition-transform">
              <span className="text-3xl">📍</span>
            </div>
            <h3 className="font-bold text-foreground mb-1">Nearby</h3>
            <p className="text-xs text-muted mb-3">Tours near your location</p>
            <div className="inline-flex items-center text-secondary text-sm font-semibold group-hover:gap-2 transition-all">
              <span>View Map</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Featured Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
          <h2 className="text-xl font-bold text-foreground">Featured Tours</h2>
          <Badge
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-primary/20 to-primary/10"
          >
            Popular
          </Badge>
        </div>
        <FeaturedCarousel />
      </div>

      {/* Nearby Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-accent to-secondary rounded-full" />
          <h2 className="text-xl font-bold text-foreground">Near You</h2>
          <Badge
            variant="accent"
            size="sm"
            className="bg-gradient-to-r from-accent/20 to-accent/10"
          >
            📍 Local
          </Badge>
        </div>
        <NearbyItineraries />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-secondary to-primary rounded-full" />
          <h2 className="text-xl font-bold text-foreground">Browse Categories</h2>
        </div>
        <CategoriesGrid />
      </div>
    </div>
  );
}
