//@ts-nocheck
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Messages = Record<string, any>;

interface I18nContextValue {
  locale: string;
  setLocale: (l: string) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{
  defaultLocale?: string;
  children: React.ReactNode;
}> = ({ defaultLocale = 'it', children }) => {
  const reduxLocale = useAppSelector((s) => s.userPreferences.language);
  const dispatch = useAppDispatch();
  const [locale, setLocaleState] = useState<string>(reduxLocale || defaultLocale);
  const [messages, setMessages] = useState<Messages>({});

  // Keep local locale in sync with redux preference
  useEffect(() => {
    if (reduxLocale && reduxLocale !== locale) setLocaleState(reduxLocale);
  }, [reduxLocale, locale]);

  useEffect(() => {
    let mounted = true;
    import(`./${locale}.json`)
      .then((m) => {
        if (mounted) setMessages(m as unknown as Messages);
      })
      .catch(() => {
        // fallback to english
        import('./en.json').then((m) => {
          if (mounted) setMessages(m as unknown as Messages);
        });
      });
    return () => {
      mounted = false;
    };
  }, [locale]);

  const setLocale = (l: string) => {
    setLocaleState(l);
    try {
      dispatch(setLanguage(l as any));
    } catch (e) {
      // ignore dispatch errors in non-redux contexts
    }
    // Persist the selected language in the Cache so the Service Worker can read it
    try {
      if ('caches' in window) {
        caches.open('my-audio-g-cache-v1').then((cache) => {
          cache.put('/offline.lang', new Response(l));
        });
      }
    } catch (e) {
      // ignore storage errors
    }
  };

  const t = (key: string, fallback = '') => {
    const parts = key.split('.');
    let cur: any = messages;
    for (const p of parts) {
      if (!cur) return fallback || key;
      cur = cur[p];
    }
    return typeof cur === 'string' ? cur : fallback || key;
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
};
