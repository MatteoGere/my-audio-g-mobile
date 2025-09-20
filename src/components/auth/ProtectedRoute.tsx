'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only redirect if we're done loading and not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 bg-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show fallback if not authenticated
  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}
