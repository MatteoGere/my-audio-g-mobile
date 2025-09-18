'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function Header({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  actions,
  className,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-surface h-16',
        className
      )}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Back button */}
        <div className="flex items-center min-w-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-2 p-2 h-8 w-8"
              aria-label="Go back"
            >
              <svg
                className="w-5 h-5"
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
            </Button>
          )}

          {/* Title and subtitle */}
          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        {actions && (
          <div className="flex items-center gap-2 ml-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}