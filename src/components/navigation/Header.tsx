'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { useAuth, useUserProfile } from '@/lib/hooks';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { setTheme as setThemeAction } from '@/lib/redux/slices/userPreferencesSlice';
import { setPlayerView } from '@/lib/redux/slices/audioSlice';
import {
  HiOutlineChevronLeft,
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDown,
  HiOutlineMusicalNote,
  HiOutlineSun,
  HiOutlineMoon,
} from 'react-icons/hi2';
import { useTheme } from 'next-themes';

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
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render theme-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Audio player state for reopen button
  const { currentTrack, playerView } = useAppSelector((state) => state.audio);
  const shouldShowReopenButton =
    currentTrack && playerView === 'hidden' && !pathname?.includes('/play');

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
    <header className="sticky top-0 z-50 bg-surface border-b border-muted shadow-md">
      <div className="flex items-center justify-between h-16 px-5 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <HiOutlineChevronLeft className="h-5 w-5" />
            </Button>
          )}

          <h1 className="text-xl font-bold text-foreground truncate">{getPageTitle()}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {customActions}

          {/* Reopen MiniPlayer Button */}
          {shouldShowReopenButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(setPlayerView('mini'))}
              className="text-primary"
              title="Show player"
            >
              <HiOutlineMusicalNote className="h-5 w-5" />
            </Button>
          )}

          {showSearchButton && (
            <Button variant="ghost" size="sm" onClick={() => router.push('/search')}>
              <HiOutlineMagnifyingGlass className="h-5 w-5" />
            </Button>
          )}

          {/* Theme toggler */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Toggle theme and persist choice to Redux so ThemeSync doesn't override it
              const newTheme = theme === 'dark' ? 'light' : 'dark';
              try {
                setTheme(newTheme);
              } catch (e) {
                // ignore if setTheme not available yet
              }
              dispatch(setThemeAction(newTheme));
            }}
            title="Toggle theme"
          >
            {mounted ? (
              theme === 'dark' ? (
                <HiOutlineSun className="h-5 w-5" />
              ) : (
                <HiOutlineMoon className="h-5 w-5" />
              )
            ) : (
              <HiOutlineSun className="h-5 w-5 opacity-0" />
            )}
          </Button>

          {/* User Avatar / Login Button */}
          {isAuthenticated ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
              >
                {/* Usa Avatar UI component per consistenza */}
                <span className="sr-only">User menu</span>
                <span className="inline-flex">
                  <Avatar size="sm" fallback={getUserDisplayName()} />
                </span>
                <HiOutlineChevronDown className="h-4 w-4 text-muted" />
              </Button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-xl shadow-lg border border-muted py-1 z-50">
                  <div className="px-4 py-3 border-b border-muted">
                    <p className="text-sm font-bold text-foreground">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted">{user?.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-background rounded-lg"
                  >
                    <HiOutlineUser className="h-4 w-4" />
                    Profile Settings
                  </Link>

                  <Link
                    href="/favorites"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-background rounded-lg"
                  >
                    <HiOutlineCog6Tooth className="h-4 w-4" />
                    Preferences
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg"
                  >
                    <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
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
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}
    </header>
  );
}
