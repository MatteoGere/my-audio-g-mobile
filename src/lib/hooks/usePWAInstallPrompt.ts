'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_STORAGE_KEY = 'myaudiog:pwa-install-dismissed';

export function usePWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(DISMISS_STORAGE_KEY);
      if (stored === 'true') {
        setHasDismissed(true);
      }
    } catch {
      // Ignore storage errors (private mode, etc.)
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setHasDismissed(false);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
      try {
        window.localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
      } catch {
        // ignore storage write
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    if (
      mediaQuery.matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone
    ) {
      setIsInstalled(true);
    }

    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsInstalled(true);
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!hasDismissed) {
      try {
        window.localStorage.removeItem(DISMISS_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
    }
  }, [hasDismissed]);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const prompt = deferredPrompt;
    if (!prompt) {
      return 'unavailable';
    }

    setIsInstallable(false);

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setDeferredPrompt(null);

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setHasDismissed(true);
        try {
          window.localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
        } catch {
          // ignore storage errors
        }
      } else {
        setHasDismissed(true);
        try {
          window.localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
        } catch {
          // ignore storage errors
        }
      }

      return choice.outcome;
    } catch (error) {
      console.error('[PWA] install prompt error', error);
      return 'unavailable';
    }
  }, [deferredPrompt]);

  const dismissInstallPrompt = useCallback(() => {
    setHasDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
  }, []);

  const resetDismissed = useCallback(() => {
    setHasDismissed(false);
    try {
      window.localStorage.removeItem(DISMISS_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  const canInstall = useMemo(() => isInstallable && !isInstalled, [isInstallable, isInstalled]);

  return {
    canInstall,
    isInstallable,
    isInstalled,
    hasDismissed,
    promptInstall,
    dismissInstallPrompt,
    resetDismissed,
  };
}

export default usePWAInstallPrompt;
