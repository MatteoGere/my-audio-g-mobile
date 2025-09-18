'use client';

import React from 'react';
import { Header } from '../navigation';
import { MiniPlayer, FullPlayer } from '../audio';
import { cn } from '@/lib/utils';

export interface PlayerLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showMiniPlayer?: boolean;
  isFullPlayerOpen?: boolean;
  onFullPlayerToggle?: () => void;
  className?: string;
}

export function PlayerLayout({
  children,
  title,
  showBackButton = true,
  showMiniPlayer = true,
  isFullPlayerOpen = false,
  onFullPlayerToggle,
  className,
}: PlayerLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Header */}
      <Header
        title={title}
        showBackButton={showBackButton}
      />

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 overflow-y-auto pt-16',
          showMiniPlayer && !isFullPlayerOpen && 'pb-20', // Space for mini player
          className
        )}
      >
        {children}
      </main>

      {/* Mini Player - Fixed at bottom */}
      {showMiniPlayer && !isFullPlayerOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <MiniPlayer onExpand={onFullPlayerToggle} />
        </div>
      )}

      {/* Full Player - Modal overlay */}
      {isFullPlayerOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <FullPlayer onCollapse={onFullPlayerToggle} />
        </div>
      )}
    </div>
  );
}