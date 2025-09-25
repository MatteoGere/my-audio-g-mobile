"use client";

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import {
  hydrateSignedUrlCaches,
  setupPeriodicCleanup,
} from './middleware/signedUrlPersistenceMiddleware';
import { useAppSelector } from './store';
import { useTheme } from 'next-themes';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  useEffect(() => {
    // Hydrate signed URL caches from localStorage on app start
    hydrateSignedUrlCaches(store);

    // Set up periodic cleanup of expired URLs
    const cleanupInterval = setupPeriodicCleanup();

    // Cleanup on unmount
    return () => {
      if (cleanupInterval) {
        cleanupInterval();
      }
    };
  }, []);

  // Theme synchronization helper: apply theme changes from redux to document
  const ThemeSync = () => {
    const theme = useAppSelector((s) => s.userPreferences.theme);

    const { setTheme } = useTheme();

    useEffect(() => {
      try {
        // Delegate theme switching to next-themes so it handles the class on <html>
        if (typeof setTheme === 'function') {
          // setTheme accepts 'light' | 'dark' | 'system'
          // Map any 'system' value to a concrete 'light' (class-only policy)
          const mapped = theme === 'system' || theme == null ? 'light' : theme;
          setTheme(mapped as 'light' | 'dark');
        }
      } catch (e) {
        // ignore during SSR or if theme API not available yet
      }
    }, [theme, setTheme]);

    return null;
  };

  return (
    <Provider store={store}>
      <ThemeSync />
      {children}
    </Provider>
  );
}

export default ReduxProvider;
