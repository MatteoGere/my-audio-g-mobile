'use client';

import { Card } from '@/components/ui';
import Link from 'next/link';
import { useGetCompaniesQuery } from '@/lib/redux/api/apiSlice';

// Define static categories with icons, colors, and search parameters
const STATIC_CATEGORIES = [
  {
    id: 'museums',
    name: 'Museums',
    icon: '🏛️',
    searchParams: '?type=featured&category=museums',
    description: 'Explore art, history, and culture',
    bgClass: 'bg-gradient-to-br from-teal-50 to-teal-100',
    iconBgClass: 'bg-teal-100/50',
    borderClass: 'border-teal-200/30',
  },
  {
    id: 'historic-sites',
    name: 'Historic Sites',
    icon: '🏰',
    searchParams: '?type=featured&category=historic',
    description: 'Discover heritage locations',
    bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100',
    iconBgClass: 'bg-amber-100/50',
    borderClass: 'border-amber-200/30',
  },
  {
    id: 'nature',
    name: 'Nature Tours',
    icon: '🌲',
    searchParams: '?type=featured&category=nature',
    description: 'Parks, gardens, and outdoor experiences',
    bgClass: 'bg-gradient-to-br from-accent/5 to-accent/10',
    iconBgClass: 'bg-accent/10',
    borderClass: 'border-accent/20',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    icon: '🏗️',
    searchParams: '?type=featured&category=architecture',
    description: 'Buildings and urban design',
    bgClass: 'bg-gradient-to-br from-primary/5 to-primary/10',
    iconBgClass: 'bg-primary/10',
    borderClass: 'border-primary/20',
  },
  {
    id: 'short-tours',
    name: 'Quick Tours',
    icon: '⚡',
    searchParams: '?duration=short',
    description: 'Under 30 minutes',
    bgClass: 'bg-gradient-to-br from-secondary/5 to-secondary/10',
    iconBgClass: 'bg-secondary/10',
    borderClass: 'border-secondary/20',
  },
  {
    id: 'long-tours',
    name: 'Deep Dives',
    icon: '🎓',
    searchParams: '?duration=long',
    description: 'Over 1 hour experiences',
    bgClass: 'bg-gradient-to-br from-marble-100 to-marble-200',
    iconBgClass: 'bg-marble-200/50',
    borderClass: 'border-marble-200/30',
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
            <Card
              padding="md"
              className={`flex flex-col items-center justify-center gap-2 rounded-xl shadow-soft min-h-[120px] border transition-all duration-200 hover:scale-[1.02] hover:shadow-medium ${category.bgClass} ${category.borderClass}`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-2 ${category.iconBgClass} backdrop-blur-sm`}
              >
                <span className="text-2xl" role="img" aria-label={category.name}>
                  {category.icon}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-base mb-1">{category.name}</h3>
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
            {topCompanies.map((company, idx) => {
              // Alternate colors for variety
              const colorClass =
                idx % 2 === 0
                  ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20'
                  : 'bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20';
              const iconBgClass = idx % 2 === 0 ? 'bg-primary/10' : 'bg-accent/10';
              const textColorClass = idx % 2 === 0 ? 'text-primary' : 'text-accent';

              return (
                <Link
                  key={company.id}
                  href={`/search?company=${encodeURIComponent(company.name)}`}
                  tabIndex={0}
                >
                  <Card
                    padding="md"
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl shadow-soft min-h-[100px] border transition-all duration-200 hover:scale-[1.02] hover:shadow-medium ${colorClass}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${iconBgClass} backdrop-blur-sm`}
                    >
                      <span className={`text-base font-bold ${textColorClass}`}>
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-foreground text-sm truncate">{company.name}</h4>
                    {company.description && (
                      <p className="text-xs text-muted line-clamp-1 mt-1 text-center">
                        {company.description}
                      </p>
                    )}
                  </Card>
                </Link>
              );
            })}
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
              className="flex flex-col items-center justify-center gap-2 rounded-xl shadow-soft border border-marble-200/30 bg-gradient-to-br from-marble-100/30 to-marble-200/30"
            >
              <div className="w-10 h-10 bg-marble-200/50 rounded-xl mb-2 animate-pulse" />
              <div className="h-4 bg-marble-200/50 rounded w-3/4 animate-pulse" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
