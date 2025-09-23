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
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
        Browse Categories
      </h2>

      {/* Static Categories Grid */}
      <div className="grid grid-cols-2 gap-3">
        {STATIC_CATEGORIES.map((category) => (
          <Link key={category.id} href={`/search${category.searchParams}`}>
            <Card className="p-4 text-center hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-forest-100 dark:bg-forest-900 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl" role="img" aria-label={category.name}>
                  {category.icon}
                </span>
              </div>
              <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-1">
                {category.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {category.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Company Categories */}
      {!companiesLoading && topCompanies.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Browse by Company
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {topCompanies.map((company) => (
              <Link key={company.id} href={`/search?company=${encodeURIComponent(company.name)}`}>
                <Card className="p-3 text-center hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-stone-200 dark:border-stone-700">
                  <div className="w-8 h-8 bg-sand-100 dark:bg-sand-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-sand-600 dark:text-sand-400 text-xs font-bold">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 text-sm truncate">
                    {company.name}
                  </h4>
                  {company.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-1">
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
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <Card
              key={i}
              className="p-3 text-center animate-pulse border-stone-200 dark:border-stone-700"
            >
              <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-lg mx-auto mb-2" />
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mx-auto" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}