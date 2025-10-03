'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import {
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiOutlineMap,
  HiOutlineHeart,
  HiOutlineUser,
} from 'react-icons/hi2';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/home',
    label: 'Home',
    icon: HiOutlineHome,
  },
  {
    href: '/search',
    label: 'Search',
    icon: HiOutlineMagnifyingGlass,
  },
  {
    href: '/map',
    label: 'Map',
    icon: HiOutlineMap,
  },
  {
    href: '/favorites',
    label: 'Favorites',
    icon: HiOutlineHeart,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: HiOutlineUser,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/home') {
      return pathname === '/' || pathname === '/home';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-surface via-surface to-primary/5 border-t border-primary/20 shadow-medium backdrop-blur-xl">
      <div className="flex items-center justify-around px-3 py-2 gap-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-center p-2 rounded-2xl min-w-[48px] min-h-[48px] flex-1 transition-all duration-300',
                active
                  ? 'text-primary bg-gradient-to-br from-primary/20 to-accent/10 shadow-soft scale-105'
                  : 'text-muted hover:text-foreground hover:bg-marble-100/50 hover:scale-105',
              )}
              tabIndex={0}
              aria-label={item.label}
            >
              <div
                className={cn(
                  'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                )}
              >
                <Icon
                  className={cn('h-6 w-6 transition-all duration-300', active && 'scale-110')}
                />

                {item.badge && (
                  <Badge
                    variant="error"
                    size="sm"
                    className="absolute -top-1 -right-1 bg-gradient-to-br from-error to-error/80 shadow-soft"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
