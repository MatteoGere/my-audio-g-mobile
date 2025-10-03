'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import {
  hydrateSignedUrlCaches,
  setupPeriodicCleanup,
} from './middleware/signedUrlPersistenceMiddleware';
import { useAppSelector, useAppDispatch } from './store';
import { useTheme } from 'next-themes';
import { hydratePreferences } from './slices/userPreferencesSlice';

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
    const dispatch = useAppDispatch();

    const { theme: currentTheme, setTheme } = useTheme();

    useEffect(() => {
      // On first mount, if Redux has the default 'system' theme, attempt to
      // read the persisted theme from next-themes (which writes to localStorage)
      // and hydrate Redux so we don't overwrite the user's saved choice.
      try {
        if ((theme === 'system' || theme == null) && currentTheme) {
          // next-themes exposes `theme` which can be 'light' | 'dark' | 'system'
          // If it's explicit light/dark, update Redux so state reflects persisted value.
          if (currentTheme === 'light' || currentTheme === 'dark') {
            dispatch(
              hydratePreferences({
                // keep other preference defaults by reading from store state
                ...store.getState().userPreferences,
                theme: currentTheme as 'light' | 'dark' | 'system',
              }),
            );
            return;
          }
        }
      } catch (e) {
        // ignore if theme API not available yet (SSR) or localStorage blocked
      }

      // For subsequent updates, only push to next-themes when Redux theme is
      // explicitly 'light' or 'dark' — avoid mapping 'system' -> 'light' which
      // caused overwriting the persisted value with 'light'.
      try {
        if (typeof setTheme === 'function') {
          if (theme === 'light' || theme === 'dark') {
            setTheme(theme as 'light' | 'dark');
          }
        }
      } catch (e) {
        // ignore during SSR or if theme API not available yet
      }
    }, [theme, currentTheme, setTheme, dispatch]);

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
