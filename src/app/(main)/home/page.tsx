"use client"
import { Card, Button } from '@/components/ui';
import { useI18n } from '@/i18n/I18nProvider';
import Link from 'next/link';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import NearbyItineraries from '@/components/NearbyItineraries';
import CategoriesGrid from '@/components/CategoriesGrid';

export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
  <h1 className="text-3xl font-bold text-foreground mb-2">{t('home.welcomeTitle')}</h1>
  <p className="text-muted">{t('home.welcomeSubtitle')}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md" className="text-center">
          <h3 className="font-semibold text-foreground mb-2">{t('home.exploreTours')}</h3>
          <p className="text-sm text-muted mb-3">{t('home.findGuides')}</p>
          <Link href="/search" className="block">
            <Button variant="primary" size="sm" className="w-full">
              {t('home.searchTours')}
            </Button>
          </Link>
        </Card>

        <Card padding="md" className="text-center">
          <h3 className="font-semibold text-foreground mb-2">{t('home.nearby')}</h3>
          <p className="text-sm text-muted mb-3">{t('home.toursNearYou')}</p>
          <Link href="/map" className="block">
            <Button variant="secondary" size="sm" className="w-full">
              {t('home.viewMap')}
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
