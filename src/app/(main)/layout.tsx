import type { Metadata } from 'next';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { AudioManager } from '@/components/audio/AudioManager';
import { NavigationGuard } from '@/components/navigation/NavigationGuard';

export const metadata: Metadata = {
  title: 'MyAudioG - Audio Guide Experience',
  description: 'Discover immersive audio tours and travel experiences',
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <NavigationGuard>
      <div className="flex flex-col min-h-screen bg-marble-50 dark:bg-carbon-900">
        {/* Main Navigation Header */}
        <MainNavigation />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="container mx-auto px-4 py-6 max-w-md">{children}</div>
        </main>

        {/* Global Audio Manager */}
        <AudioManager />

        {/* Mini Player (persistent across pages) */}
        <MiniPlayer />
      </div>
    </NavigationGuard>
  );
}
