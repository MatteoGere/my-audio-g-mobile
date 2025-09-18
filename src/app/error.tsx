'use client';

import React from 'react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-error/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong!</h2>
        <p className="text-muted mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/home'}
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}