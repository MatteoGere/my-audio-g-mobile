'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import {
  hydrateSignedUrlCaches,
  setupPeriodicCleanup,
} from './middleware/signedUrlPersistenceMiddleware';
import { useAppSelector } from './store';

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

    useEffect(() => {
      try {
        const el = document.documentElement;
        el.classList.remove('light', 'dark');
        if (theme === 'dark') el.classList.add('dark');
        else if (theme === 'light') el.classList.add('light');
        // system: let CSS handle it (or user agent)
      } catch (e) {
        // ignore during SSR or if document unavailable
      }
    }, [theme]);

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
