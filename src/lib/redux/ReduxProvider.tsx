'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import {
  hydrateSignedUrlCaches,
  setupPeriodicCleanup,
} from './middleware/signedUrlPersistenceMiddleware';

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

  return <Provider store={store}>{children}</Provider>;
}

export default ReduxProvider;
