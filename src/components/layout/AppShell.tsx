'use client';

import { BottomNavigation } from '../navigation/BottomNavigation';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-sand-50 dark:bg-gray-900 flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 pb-16 overflow-x-hidden">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}