'use client';

import { useAudioPlayerWithMediaSession } from '../../hooks/useAudioPlayerWithMediaSession';
import { MiniPlayer } from './MiniPlayer';

export interface AudioPlayerProviderProps {
  children: React.ReactNode;
  showMiniPlayer?: boolean;
}

export function AudioPlayerProvider({ 
  children, 
  showMiniPlayer = true 
}: AudioPlayerProviderProps) {
  const { audioRef } = useAudioPlayerWithMediaSession();

  return (
    <>
      {children}
      {/* Hidden audio element for playback */}
      <audio 
        ref={audioRef} 
        preload="metadata"
        className="hidden"
      />
      {showMiniPlayer && <MiniPlayer />}
    </>
  );
}