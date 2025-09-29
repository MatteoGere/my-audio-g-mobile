'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  HiPlay,
  HiPause,
  HiForward,
  HiBackward,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiMapPin,
  HiShare,
  HiChevronLeft,
  HiOutlineQueueList,
  HiOutlineHeart,
  HiHeart,
} from 'react-icons/hi2';
import { Card, Button, Tabs, Popover } from '@/components/ui';
import { QueueManager } from '@/components/audio/QueueManager';
import { useGetAudioItineraryQuery, useGetItineraryTracksQuery } from '@/lib/redux/api/apiSlice';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { useSignedAudioUrls, useSignedUrl } from '@/lib/hooks/useSignedUrls';
import { useFavorites } from '@/lib/hooks';
import {
  setCurrentTrack,
  play,
  pause,
  setCurrentTime,
  setPlaybackSpeed,
  toggleMute,
  setVolume,
  setCurrentQueueIndex,
  setQueue,
  toggleShuffle,
  setRepeatMode,
  setAudioError,
} from '@/lib/redux/slices/audioSlice';

export default function AudioPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const itineraryId = params.id as string;

  // Local state
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'queue' | 'actions'>('details');
  const [isBuffering] = useState(false);

  // No longer need audio element ref - using AudioManager

  // API calls
  const {
    data: itinerary,
    isLoading: itineraryLoading,
    error: itineraryError,
  } = useGetAudioItineraryQuery(itineraryId);

  const {
    data: tracks,
    isLoading: tracksLoading,
    error: tracksError,
  } = useGetItineraryTracksQuery(itineraryId);

  // Redux state
  const audioState = useAppSelector((state) => state.audio);
  const { queue } = audioState;

  // Prepare audio paths for lazy loading
  const audioPaths = useMemo(
    () => (tracks ? tracks.map((track) => track.audio_storage_key).filter(Boolean) : []),
    [tracks],
  );

  // Get signed URLs with lazy loading
  const { isLoading: urlsLoading } = useSignedAudioUrls(audioPaths, 3600);

  // Current track data
  const currentTrack = audioState.currentTrack;

  // Memoize the image key to prevent unnecessary signed URL calls - only based on the storage key itself
  const currentTrackImageKey = (currentTrack as any)?.image_file?.image_storage_key || '';

  // Get signed URL for current track image (only when key actually changes)
  const { signedUrl: currentTrackImageUrl } = useSignedUrl(currentTrackImageKey, 'image-files');
  const currentTrackIndex = useMemo(() => {
    if (!tracks || !currentTrack) return 0;
    return tracks.findIndex((track) => track.id === currentTrack.id);
  }, [tracks, currentTrack]);

  const { favoriteTrackIds, toggleFavorite, isAddingFavorite, isRemovingFavorite } = useFavorites();
  const isCurrentTrackFavorite = currentTrack ? favoriteTrackIds.includes(currentTrack.id) : false;
  const favoritesBusy = isAddingFavorite || isRemovingFavorite;

  // Helper functions
  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progress = useMemo(() => {
    if (!currentTrack?.duration || !audioState.playbackState.currentTime) return 0;
    return (audioState.playbackState.currentTime / currentTrack.duration) * 100;
  }, [currentTrack?.duration, audioState.playbackState.currentTime]);

  // Audio control functions - use Redux actions only
  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;

    if (audioState.playbackState.isPlaying) {
      dispatch(pause());
    } else {
      dispatch(play());
    }
  }, [currentTrack, audioState.playbackState.isPlaying, dispatch]);

  const handlePreviousTrack = useCallback(() => {
    if (!tracks || tracks.length === 0) return;

    let newIndex;
    if (audioState.shuffleMode) {
      newIndex = Math.floor(Math.random() * tracks.length);
    } else {
      newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    }

    const newTrack = tracks[newIndex];
    dispatch(setCurrentTrack({ track: newTrack as any }));
    dispatch(setCurrentQueueIndex(newIndex));
    dispatch(setCurrentTime(0));
  }, [tracks, currentTrackIndex, audioState.shuffleMode, dispatch]);

  const handleNextTrack = useCallback(() => {
    if (!tracks || tracks.length === 0) return;

    let newIndex;
    if (audioState.shuffleMode) {
      newIndex = Math.floor(Math.random() * tracks.length);
    } else {
      newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    }

    const newTrack = tracks[newIndex];
    dispatch(setCurrentTrack({ track: newTrack as any }));
    dispatch(setCurrentQueueIndex(newIndex));
    dispatch(setCurrentTime(0));
  }, [tracks, currentTrackIndex, audioState.shuffleMode, dispatch]);

  const handleSeek = useCallback(
    (percentage: number) => {
      if (!currentTrack) return;

      const newTime = (percentage / 100) * currentTrack.duration;
      dispatch(setCurrentTime(newTime));
    },
    [currentTrack, dispatch],
  );

  const handleVolumeChange = useCallback(
    (volume: number) => {
      const normalizedVolume = volume / 100;
      dispatch(setVolume(normalizedVolume));
    },
    [dispatch],
  );

  const handleSpeedChange = useCallback(
    (speed: number) => {
      dispatch(setPlaybackSpeed(speed));
      setShowSpeedMenu(false);
    },
    [dispatch],
  );

  const handleMuteToggle = useCallback(() => {
    dispatch(toggleMute());
  }, [dispatch]);

  // Audio loading state is now managed by AudioManager

  // Initialize queue and first track
  useEffect(() => {
    if (tracks && tracks.length > 0) {
      // Set up queue
      const queueItems = tracks.map((track, index) => ({
        track: track as any,
        index,
      }));
      dispatch(setQueue(queueItems));

      // Set first track if no current track
      if (!currentTrack) {
        dispatch(setCurrentTrack({ track: tracks[0] as any }));
        dispatch(setCurrentQueueIndex(0));
      }
    }
  }, [tracks, currentTrack, dispatch]);

  // Audio element is now managed by AudioManager

  // Media Session API integration
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name || 'Audio Track',
        artist: itinerary?.name || 'Audio Guide',
        album: itinerary?.name,
        artwork:
          currentTrack.image_file_id && currentTrackImageUrl
            ? [
                {
                  src: currentTrackImageUrl,
                  sizes: '512x512',
                  type: 'image/jpeg',
                },
              ]
            : undefined,
      });

      // Use stable function references for media session handlers
      navigator.mediaSession.setActionHandler('play', () => {
        if (currentTrack) {
          dispatch(audioState.playbackState.isPlaying ? pause() : play());
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (currentTrack) {
          dispatch(audioState.playbackState.isPlaying ? pause() : play());
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        // Handle previous track logic inline
        if (tracks && tracks.length > 0) {
          const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
          let newIndex;
          if (audioState.shuffleMode) {
            newIndex = Math.floor(Math.random() * tracks.length);
          } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
          }
          const newTrack = tracks[newIndex];
          dispatch(setCurrentTrack({ track: newTrack as any }));
          dispatch(setCurrentQueueIndex(newIndex));
          dispatch(setCurrentTime(0));
        }
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        // Handle next track logic inline
        if (tracks && tracks.length > 0) {
          const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
          let newIndex;
          if (audioState.shuffleMode) {
            newIndex = Math.floor(Math.random() * tracks.length);
          } else {
            newIndex = currentIndex < tracks.length - 1 ? currentIndex + 1 : 0;
          }
          const newTrack = tracks[newIndex];
          dispatch(setCurrentTrack({ track: newTrack as any }));
          dispatch(setCurrentQueueIndex(newIndex));
          dispatch(setCurrentTime(0));
        }
      });
    }
  }, [
    currentTrack?.id,
    itinerary?.name,
    currentTrackImageUrl,
    tracks,
    audioState.shuffleMode,
    dispatch,
  ]);

  // Loading state
  if (itineraryLoading || tracksLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-5 pt-12">
          <Card
            padding="lg"
            className="space-y-6 rounded-3xl border border-muted/40 bg-surface/90 shadow-lg"
          >
            <div className="h-6 w-32 animate-pulse rounded-full bg-muted/30" />
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted/20" />
            <div className="mx-auto h-4 w-1/2 animate-pulse rounded-full bg-muted/30" />
            <div className="h-2 w-full animate-pulse rounded-full bg-muted/20" />
            <div className="flex items-center justify-center gap-6">
              <div className="h-12 w-12 animate-pulse rounded-full bg-muted/20" />
              <div className="h-16 w-16 animate-pulse rounded-full bg-muted/30" />
              <div className="h-12 w-12 animate-pulse rounded-full bg-muted/20" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (itineraryError || tracksError || !currentTrack) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto flex w-full max-w-lg flex-col px-5 pt-12">
          <Card
            padding="lg"
            className="space-y-4 rounded-3xl border border-error/30 bg-error/10 text-center shadow-lg"
          >
            <h2 className="text-xl font-semibold text-foreground">Audio not available</h2>
            <p className="text-sm text-muted">
              Unable to load the audio tracks for this itinerary. Please try again later.
            </p>
            <div className="flex justify-center">
              <Button variant="primary" onClick={() => router.back()}>
                Go back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      id: 'details',
      label: 'Dettagli',
      content: (
        <Card
          padding="lg"
          className="space-y-4 rounded-2xl border border-muted/40 bg-surface/95 shadow-sm"
        >
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">Dettagli traccia</h3>
            <p className="text-sm leading-relaxed text-muted">
              {currentTrack?.description || 'Nessuna descrizione disponibile per questa traccia.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted/80">Durata</span>
              <span className="font-semibold text-foreground">
                {formatTime(currentTrack?.duration || 0)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted/80">Posizione</span>
              <span className="font-semibold text-foreground">
                {currentTrackIndex + 1} / {tracks?.length || 0}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted/80">Itinerario</span>
              <span className="font-semibold text-foreground">{itinerary?.name || '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted/80">Preferito</span>
              <span className="font-semibold text-foreground">
                {isCurrentTrackFavorite ? 'Sì' : 'No'}
              </span>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'queue',
      label: `Coda (${queue.length})`,
      content:
        queue.length > 0 ? (
          <div className="pt-1">
            <QueueManager isVisible={true} />
          </div>
        ) : (
          <Card
            padding="lg"
            className="space-y-2 rounded-2xl border border-muted/40 bg-surface/95 text-center shadow-sm"
          >
            <h3 className="text-base font-semibold text-foreground">Coda vuota</h3>
            <p className="text-sm text-muted">
              Aggiungi altre tracce all&apos;itinerario per popolare la coda di riproduzione.
            </p>
          </Card>
        ),
    },
    {
      id: 'actions',
      label: 'Azioni',
      content: (
        <div className="space-y-4">
          <Card
            padding="lg"
            className="space-y-3 rounded-2xl border border-muted/40 bg-surface/95 shadow-sm"
          >
            <h3 className="text-base font-semibold text-foreground">Azioni rapide</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 rounded-2xl"
                onClick={() => setActiveTab('queue')}
              >
                <HiOutlineQueueList className="h-4 w-4" />
                <span>Apri coda</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center justify-center gap-2 rounded-2xl"
                disabled={!currentTrack}
                loading={favoritesBusy}
                onClick={() =>
                  currentTrack &&
                  toggleFavorite({ favouriteId: currentTrack.id, type: 'FAVOURITE-TRACK' })
                }
              >
                {isCurrentTrackFavorite ? (
                  <HiHeart className="h-4 w-4 text-error" />
                ) : (
                  <HiOutlineHeart className="h-4 w-4 text-muted" />
                )}
                <span>{isCurrentTrackFavorite ? 'Rimuovi preferito' : 'Aggiungi ai preferiti'}</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 rounded-2xl"
                onClick={() => router.push(`/map?itinerary=${itineraryId}&track=${currentTrack?.id}`)}
              >
                <HiMapPin className="h-4 w-4" />
                <span>Mappa</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2 rounded-2xl">
                <HiShare className="h-4 w-4" />
                <span>Condividi</span>
              </Button>
            </div>
          </Card>

          <Card
            padding="lg"
            className="space-y-3 rounded-2xl border border-muted/40 bg-surface/95 shadow-sm"
          >
            <h3 className="text-base font-semibold text-foreground">Modalità di riproduzione</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={audioState.shuffleMode ? 'primary' : 'outline'}
                size="sm"
                className="h-16 rounded-2xl"
                onClick={() => dispatch(toggleShuffle())}
                title={audioState.shuffleMode ? 'Shuffle attivo' : 'Shuffle disattivato'}
              >
                <div className="flex flex-col items-center gap-1 text-xs font-semibold">
                  <span className="text-lg">🔀</span>
                  <span>Shuffle</span>
                </div>
              </Button>

              <Button
                variant={audioState.repeatMode !== 'none' ? 'primary' : 'outline'}
                size="sm"
                className="h-16 rounded-2xl"
                onClick={() => {
                  const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
                  const currentIndex = modes.indexOf(audioState.repeatMode);
                  const nextMode = modes[(currentIndex + 1) % modes.length];
                  dispatch(setRepeatMode(nextMode));
                }}
                title={`Repeat: ${audioState.repeatMode === 'one' ? 'Singola traccia' : audioState.repeatMode === 'all' ? 'Intera coda' : 'Disattivato'}`}
              >
                <div className="flex flex-col items-center gap-1 text-xs font-semibold">
                  <span className="text-lg">
                    {audioState.repeatMode === 'one'
                      ? '🔂'
                      : audioState.repeatMode === 'all'
                        ? '🔁'
                        : '🔁'}
                  </span>
                  <span>Repeat</span>
                </div>
              </Button>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 pt-6 pb-10">
        <div className="flex items-center justify-between rounded-2xl border border-muted/40 bg-surface/80 px-4 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur-xl">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-11 w-11 rounded-full">
            <HiChevronLeft className="h-5 w-5" />
          </Button>
          <span>Now Playing</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab((prev) => (prev === 'queue' ? 'details' : 'queue'))}
            className="h-11 w-11 rounded-full"
            title="Apri coda"
          >
            <HiOutlineQueueList className="h-5 w-5" />
          </Button>
        </div>

        <Card
          padding="none"
          className="overflow-hidden rounded-3xl border border-muted/40 bg-surface shadow-xl"
        >
          <div className="relative flex aspect-square items-center justify-center bg-background/60">
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 backdrop-blur-sm">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/40 border-t-primary" />
              </div>
            )}
            {currentTrack?.image_file_id && currentTrackImageUrl ? (
              <img
                key={`${currentTrack?.id ?? 'track'}-${currentTrackImageKey}`}
                src={currentTrackImageUrl}
                alt={currentTrack.name || 'Track visual'}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-7xl">🎵</span>
            )}
          </div>
        </Card>

        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold text-foreground">{currentTrack?.name || 'Loading…'}</h1>
          <p className="text-sm text-muted">{itinerary?.name || 'Audio Tour'}</p>
          <p className="text-xs text-muted/80">
            Track {currentTrackIndex + 1} of {tracks?.length || 0}
          </p>
        </div>

        <div className="space-y-2.5">
          <div
            className="group relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-muted/40 shadow-sm"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetX = e.clientX - rect.left;
              const percentage = (offsetX / rect.width) * 100;
              handleSeek(percentage);
            }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <span
                className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-foreground shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>{formatTime(audioState.playbackState.currentTime)}</span>
            <span>{formatTime(currentTrack?.duration || 0)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <Button
            variant="ghost"
            size="lg"
            className="h-14 w-14 rounded-2xl"
            onClick={handlePreviousTrack}
            title="Previous track"
          >
            <HiBackward className="h-6 w-6" />
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="h-20 w-20 rounded-full shadow-xl"
            onClick={handlePlayPause}
            disabled={isBuffering || urlsLoading}
            title={audioState.playbackState.isPlaying ? 'Pause playback' : 'Start playback'}
          >
            {isBuffering ? (
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-foreground/60 border-t-transparent" />
            ) : audioState.playbackState.isPlaying ? (
              <HiPause className="h-8 w-8" />
            ) : (
              <HiPlay className="h-8 w-8 translate-x-[2px]" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-14 w-14 rounded-2xl"
            onClick={handleNextTrack}
            title="Next track"
          >
            <HiForward className="h-6 w-6" />
          </Button>
        </div>

        <Card
          padding="md"
          className="rounded-2xl border border-muted/40 bg-surface/95 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full"
              onClick={handleMuteToggle}
              title={audioState.playbackState.isMuted ? 'Unmute' : 'Mute'}
            >
              {audioState.playbackState.isMuted ? (
                <HiSpeakerXMark className="h-5 w-5" />
              ) : (
                <HiSpeakerWave className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 rounded-full"
                onClick={() => handleSeek(Math.max(0, progress - 10))}
                title="Rewind 10%"
              >
                <span className="text-lg">⏪</span>
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl px-3"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  title="Playback speed"
                >
                  {audioState.playbackState.playbackSpeed}x
                </Button>
                {showSpeedMenu && (
                  <Card
                    padding="sm"
                    className="absolute bottom-full left-1/2 z-20 mb-3 w-32 -translate-x-1/2 space-y-1 rounded-xl border border-muted/40 bg-surface/98 shadow-xl backdrop-blur-lg"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-background/80"
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </Card>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 rounded-full"
                onClick={() => handleSeek(Math.min(100, progress + 10))}
                title="Forward 10%"
              >
                <span className="text-lg">⏩</span>
              </Button>
            </div>

            <Popover
              position="top"
              align="end"
              offset={12}
              className="w-36 rounded-xl border border-muted/40 bg-surface/98 shadow-xl backdrop-blur-lg"
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 w-11 rounded-full"
                  title="Volume"
                  aria-label="Adjust volume"
                >
                  <HiSpeakerWave className="h-5 w-5" />
                </Button>
              }
              content={
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(audioState.playbackState.volume * 100)}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted/40"
                    aria-label="Volume level"
                  />
                </div>
              }
            />
          </div>
        </Card>

        <Tabs
          items={tabItems}
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'details' | 'queue' | 'actions')}
          variant="pills"
          size="sm"
          className="w-full space-y-4"
        />

        {audioState.audioError && (
          <Card
            padding="md"
            className="rounded-2xl border border-error/40 bg-error/10 text-error shadow-sm"
          >
            <p className="text-sm">{audioState.audioError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 self-start rounded-xl border-error/40 text-error hover:bg-error/20"
              onClick={() => {
                dispatch(setAudioError(null));
                if (currentTrack) {
                  dispatch(play());
                }
              }}
            >
              Retry
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
