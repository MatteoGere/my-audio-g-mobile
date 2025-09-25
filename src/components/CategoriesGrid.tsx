'use client';

import { Card } from '@/components/ui';
import Link from 'next/link';
import { useGetCompaniesQuery } from '@/lib/redux/api/apiSlice';

// Define static categories with icons and search parameters
const STATIC_CATEGORIES = [
  {
    id: 'museums',
    name: 'Museums',
    icon: '🏛️',
    searchParams: '?type=featured&category=museums',
    description: 'Explore art, history, and culture',
  },
  {
    id: 'historic-sites',
    name: 'Historic Sites',
    icon: '🏰',
    searchParams: '?type=featured&category=historic',
    description: 'Discover heritage locations',
  },
  {
    id: 'nature',
    name: 'Nature Tours',
    icon: '🌲',
    searchParams: '?type=featured&category=nature',
    description: 'Parks, gardens, and outdoor experiences',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    icon: '🏗️',
    searchParams: '?type=featured&category=architecture',
    description: 'Buildings and urban design',
  },
  {
    id: 'short-tours',
    name: 'Quick Tours',
    icon: '⚡',
    searchParams: '?duration=short',
    description: 'Under 30 minutes',
  },
  {
    id: 'long-tours',
    name: 'Deep Dives',
    icon: '🎓',
    searchParams: '?duration=long',
    description: 'Over 1 hour experiences',
  },
];

export default function CategoriesGrid() {
  const { data: companies = [], isLoading: companiesLoading } = useGetCompaniesQuery();

  // Take top 2 companies for dynamic categories
  const topCompanies = companies.slice(0, 2);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground mb-1">Browse Categories</h2>

      {/* Static Categories Grid */}
      <div className="grid grid-cols-2 gap-4">
        {STATIC_CATEGORIES.map((category) => (
          <Link key={category.id} href={`/search${category.searchParams}`} tabIndex={0}>
            <Card padding="md" className="flex flex-col items-center justify-center gap-2 rounded-xl shadow-md min-h-[120px] transition-colors hover:bg-background">
              <div className="w-14 h-14 bg-surface rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl" role="img" aria-label={category.name}>
                  {category.icon}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-base mb-1">
                {category.name}
              </h3>
              <p className="text-xs text-muted leading-normal text-center">
                {category.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Company Categories */}
      {!companiesLoading && topCompanies.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground mb-1">Browse by Company</h3>
          <div className="grid grid-cols-2 gap-4">
            {topCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/search?company=${encodeURIComponent(company.name)}`}
                tabIndex={0}
              >
                <Card padding="md" className="flex flex-col items-center justify-center gap-2 rounded-xl shadow-md min-h-[100px] transition-colors hover:bg-background">
                  <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center mb-2">
                    <span className="text-primary text-base font-bold">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm truncate">
                    {company.name}
                  </h4>
                  {company.description && (
                    <p className="text-xs text-muted line-clamp-1 mt-1 text-center">
                      {company.description}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Loading state for companies */}
      {companiesLoading && (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card
              key={i}
              padding="md"
              className="flex flex-col items-center justify-center gap-2 rounded-xl animate-pulse shadow-md"
            >
              <div className="w-10 h-10 bg-background rounded-lg mb-2" />
              <div className="h-4 bg-background rounded w-3/4" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
