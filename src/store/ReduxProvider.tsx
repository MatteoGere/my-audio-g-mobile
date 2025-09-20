'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { supabase } from '../lib/supabase';
import { setAuth, clearAuth } from './slices/authSlice';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        store.dispatch(
          setAuth({
            user: session.user,
            session,
          }),
        );
      } else {
        store.dispatch(clearAuth());
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        store.dispatch(
          setAuth({
            user: session.user,
            session,
          }),
        );
      } else {
        store.dispatch(clearAuth());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
