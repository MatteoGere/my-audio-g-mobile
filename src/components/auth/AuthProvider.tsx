'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAuth, setLoading } from '../../store/slices/authSlice';
import { supabase } from '../../lib/supabase';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          dispatch(setAuth({ user: null, session: null }));
          return;
        }

        dispatch(setAuth({ user: session?.user ?? null, session }));
      } catch (error) {
        console.error('Error getting initial session:', error);
        dispatch(setAuth({ user: null, session: null }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      dispatch(setAuth({ user: session?.user ?? null, session }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 bg-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
