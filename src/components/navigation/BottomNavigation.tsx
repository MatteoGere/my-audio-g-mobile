'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineHome, HiOutlineMagnifyingGlass, HiOutlineHeart, HiOutlineUser } from 'react-icons/hi2';
import { HiHome, HiMagnifyingGlass, HiHeart, HiUser } from 'react-icons/hi2';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: '/home',
    label: 'Home',
    icon: HiOutlineHome,
    activeIcon: HiHome,
  },
  {
    href: '/search',
    label: 'Search',
    icon: HiOutlineMagnifyingGlass,
    activeIcon: HiMagnifyingGlass,
  },
  {
    href: '/favorites',
    label: 'Favorites',
    icon: HiOutlineHeart,
    activeIcon: HiHeart,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: HiOutlineUser,
    activeIcon: HiUser,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-stone-200 dark:bg-gray-900/90 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-colors min-w-0 flex-1 ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-stone-600 hover:text-primary hover:bg-primary/5 dark:text-gray-400 dark:hover:text-primary'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-6 w-6 mb-1" aria-hidden="true" />
              <span className="text-xs font-medium leading-none truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}