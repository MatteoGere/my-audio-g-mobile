'use client';

import React from 'react';
import { BottomTabNavigation } from '../navigation';
import { Header } from '../navigation';
import { cn } from '@/lib/utils';

export interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showHeader?: boolean;
  showBottomNav?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
}

export function MainLayout({
  children,
  title,
  showBackButton = false,
  showHeader = true,
  showBottomNav = true,
  headerActions,
  className,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {showHeader && (
        <Header
          title={title}
          showBackButton={showBackButton}
          actions={headerActions}
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 overflow-y-auto',
          showBottomNav && 'pb-16', // Add bottom padding when nav is visible
          showHeader && 'pt-16', // Add top padding when header is visible
          className
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomTabNavigation />}
    </div>
  );
}