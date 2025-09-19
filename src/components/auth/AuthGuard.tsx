'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSession } from '@/store/slices/authSlice';
import { supabase } from '@/store/api/apiSlice';

export interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        dispatch(setSession({
          user: session?.user ?? null,
          session: session,
        }));

        // Handle different auth events
        if (event === 'SIGNED_OUT' && requireAuth) {
          router.push(redirectTo);
        } else if (event === 'SIGNED_IN' && session) {
          // If user just signed in and we're on an auth page, redirect to home
          if (window.location.pathname.startsWith('/auth/')) {
            router.push('/home');
          }
        }
      }
    );

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        dispatch(setSession({
          user: session.user,
          session: session,
        }));
      } else if (requireAuth) {
        router.push(redirectTo);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, [dispatch, router, requireAuth, redirectTo]);

  // For pages that require auth, show loading while checking
  if (requireAuth && !isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // For pages that don't require auth, or user is authenticated
  return <>{children}</>;
}