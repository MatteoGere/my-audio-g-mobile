'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered', reg);

          // Optionally listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  // New content available
                  console.log('New SW installed');
                }
              });
            }
          });
        } catch (err) {
          console.warn('SW registration failed:', err);
        }
      };

      register();
    }
  }, []);

  return null;
}
