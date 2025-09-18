'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showProgress = false,
  currentStep,
  totalSteps,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator for onboarding */}
      {showProgress && currentStep && totalSteps && (
        <div className="p-4 pt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">{`${currentStep} of ${totalSteps}`}</span>
            <span className="text-sm text-muted">{`${Math.round((currentStep / totalSteps) * 100)}%`}</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      {(title || subtitle) && (
        <div className="px-6 py-8 text-center">
          {title && (
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-base text-muted max-w-sm mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 flex flex-col px-6 pb-8',
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}