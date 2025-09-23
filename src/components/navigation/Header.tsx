'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useAuth, useUserProfile } from '@/lib/hooks';
import {
  HiOutlineChevronLeft,
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDown,
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
  customActions,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  // Handle sign out
  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    router.push('/');
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (profile?.name && profile?.surname) {
      return `${profile.name} ${profile.surname}`;
    }
    if (profile?.name) {
      return profile.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.name && profile?.surname) {
      return `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
    }
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 shadow-soft">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-2 flex-1">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
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
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-1 flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {getUserInitials()}
                </div>
                <HiOutlineChevronDown className="h-4 w-4 text-stone-500" />
              </Button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 py-1 z-50">
                  <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
                  >
                    <HiOutlineUser className="h-4 w-4 mr-3" />
                    Profile Settings
                  </Link>

                  <Link
                    href="/favorites"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
                  >
                    <HiOutlineCog6Tooth className="h-4 w-4 mr-3" />
                    Preferences
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <HiOutlineArrowRightOnRectangle className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Overlay to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
