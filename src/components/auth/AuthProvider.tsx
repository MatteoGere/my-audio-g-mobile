'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component that initializes authentication state
 * and handles session management across the app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoading, updateActivity } = useAuth();

  // Update user activity for session management
  useEffect(() => {
    const handleUserActivity = () => {
      updateActivity();
    };

    // Track user interactions for session timeout
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Initial activity update
    updateActivity();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [updateActivity]);

  // Show loading state during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-marble-50 dark:bg-carbon-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-carbon-600 dark:text-carbon-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
