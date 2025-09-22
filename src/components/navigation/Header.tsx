'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/hooks';
import { 
  HiOutlineChevronLeft, 
  HiOutlineMagnifyingGlass, 
  HiOutlineUser,
  HiOutlineBars3,
} from 'react-icons/hi2';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSearchButton?: boolean;
  customActions?: React.ReactNode;
}

export function Header({ 
  title, 
  showBackButton = false, 
  showSearchButton = true,
  customActions 
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  
  // Dynamic title based on route
  const getPageTitle = () => {
    if (title) return title;
    
    switch (pathname) {
      case '/':
      case '/home':
        return 'MyAudioG';
      case '/search':
        return 'Search';
      case '/map':
        return 'Map';
      case '/favorites':
        return 'Favorites';
      case '/profile':
        return 'Profile';
      default:
        if (pathname.startsWith('/itinerary/')) {
          return 'Itinerary';
        }
        return 'MyAudioG';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 shadow-soft">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-2 flex-1">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <HiOutlineChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100 truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {customActions}
          
          {showSearchButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/search')}
              className="p-2"
            >
              <HiOutlineMagnifyingGlass className="h-5 w-5" />
            </Button>
          )}

          {/* User Avatar / Login Button */}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/profile')}
              className="p-2"
            >
              <HiOutlineUser className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}