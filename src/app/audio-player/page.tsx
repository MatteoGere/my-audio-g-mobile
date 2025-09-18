'use client';

import React from 'react';
import { PlayerLayout } from '@/components/layouts';

export default function AudioPlayerPage() {
  const [isFullPlayerOpen, setIsFullPlayerOpen] = React.useState(false);

  return (
    <PlayerLayout
      title="Audio Player"
      showMiniPlayer
      isFullPlayerOpen={isFullPlayerOpen}
      onFullPlayerToggle={() => setIsFullPlayerOpen(!isFullPlayerOpen)}
    >
      <div className="p-4 space-y-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Audio Player</h1>
          <p className="text-muted max-w-sm mx-auto">
            This page will contain the audio player interface with track controls, 
            playlist management, and synchronized map integration.
          </p>
        </div>

        {/* Placeholder content for audio player features */}
        <div className="space-y-4">
          <div className="bg-surface rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Current Track</h3>
            <p className="text-sm text-muted">Track details and controls will be implemented in the audio phase.</p>
          </div>
          
          <div className="bg-surface rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Playlist</h3>
            <p className="text-sm text-muted">Queue management and track selection interface.</p>
          </div>
          
          <div className="bg-surface rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Sync with Map</h3>
            <p className="text-sm text-muted">Real-time location tracking and audio synchronization.</p>
          </div>
        </div>
      </div>
    </PlayerLayout>
  );
}