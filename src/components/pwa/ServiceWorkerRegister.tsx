'use client';

import { useEffect } from 'react';

const SERVICE_WORKER_URL = '/service-worker.js';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
          scope: '/',
          updateViaCache: 'none',
        });

        if (process.env.NODE_ENV === 'development') {
          console.info('[PWA] Service worker registered', registration.scope);
        }
      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
      }
    };

    const updateRegistration = () => {
      void registration?.update().catch(() => undefined);
    };

    register();

    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        updateRegistration();
      }
    };

    const intervalId = window.setInterval(updateRegistration, 1000 * 60 * 60);
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, []);

  return null;
}
