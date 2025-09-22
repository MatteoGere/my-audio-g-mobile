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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1',
                active
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700'
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    active && 'scale-110'
                  )} 
                />
                {item.badge && (
                  <Badge
                    variant="error"
                    size="sm"
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] text-xs px-1 flex items-center justify-center"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                'text-xs font-medium truncate max-w-full',
                active && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}