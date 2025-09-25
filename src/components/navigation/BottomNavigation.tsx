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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 shadow-lg">
      <div className="flex items-center justify-around h-16 px-5 gap-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl min-w-[44px] min-h-[44px] flex-1 transition-all duration-200',
                active
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700',
              )}
              tabIndex={0}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn('h-6 w-6 transition-transform duration-200', active && 'scale-110')}
                />
                {item.badge && (
                  <Badge
                    variant="error"
                    size="sm"
                    className="absolute -top-2 -right-2"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={cn('text-xs font-medium truncate max-w-full', active && 'font-semibold')}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
