'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface MapLayoutProps {
  children: React.ReactNode;
  showControls?: boolean;
  onBack?: () => void;
  className?: string;
}

export function MapLayout({
  children,
  showControls = true,
  onBack,
  className,
}: MapLayoutProps) {
  return (
    <div className={cn('relative h-screen w-full overflow-hidden bg-background', className)}>
      {/* Map Controls Overlay */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-background/80 to-transparent">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-medium"
                aria-label="Go back"
              >
                <svg
                  className="w-6 h-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Map Controls */}
            <div className="flex gap-2">
              {/* Location Button */}
              <button
                className="p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-medium"
                aria-label="Center on current location"
              >
                <svg
                  className="w-6 h-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {/* Layers Button */}
              <button
                className="p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-medium"
                aria-label="Toggle map layers"
              >
                <svg
                  className="w-6 h-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Content */}
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}