'use client';

import React from 'react';
import Button from '../ui/Button';
import { cn } from '@/lib/utils';

export interface FullPlayerProps {
  onCollapse?: () => void;
  className?: string;
}

export function FullPlayer({ onCollapse, className }: FullPlayerProps) {
  // This is a placeholder - will be implemented in audio phase
  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className="p-2 h-8 w-8"
          aria-label="Collapse player"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
        
        <h2 className="text-lg font-semibold text-foreground">Now Playing</h2>
        
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Track Art */}
        <div className="w-64 h-64 bg-muted rounded-2xl mb-8" />
        
        {/* Track Info */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Track Title Placeholder
          </h3>
          <p className="text-base text-muted">
            Location Name
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-sm mb-8">
          <div className="w-full bg-surface rounded-full h-2">
            <div className="bg-primary h-2 rounded-full w-1/3" />
          </div>
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>1:23</span>
            <span>4:56</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6">
          <Button variant="ghost" size="sm" className="p-3 h-12 w-12">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </Button>
          
          <Button variant="primary" size="lg" className="p-4 h-16 w-16 rounded-full">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </Button>
          
          <Button variant="ghost" size="sm" className="p-3 h-12 w-12">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}