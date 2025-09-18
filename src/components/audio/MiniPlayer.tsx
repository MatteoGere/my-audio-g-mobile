'use client';

import React from 'react';
import Button from '../ui/Button';
import { cn } from '@/lib/utils';

export interface MiniPlayerProps {
  onExpand?: () => void;
  className?: string;
}

export function MiniPlayer({ onExpand, className }: MiniPlayerProps) {
  // This is a placeholder - will be implemented in audio phase
  return (
    <div
      className={cn(
        'bg-surface border-t border-surface p-4 shadow-strong',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Track Art */}
          <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0" />
          
          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-foreground truncate">
              Track Title Placeholder
            </h4>
            <p className="text-xs text-muted truncate">
              Location Name
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8"
            aria-label="Play/Pause"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="p-2 h-8 w-8"
            aria-label="Expand player"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}