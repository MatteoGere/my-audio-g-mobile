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
  HiOutlineXMark,
} from 'react-icons/hi2';
import { Card, Button, Popover } from '@/components/ui';
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
  setVolume,
  setCurrentQueueIndex,
  setQueue,
  setAudioError,
  setPlayerView,
} from '@/lib/redux/slices/audioSlice';

const TAB_TITLES = {
  details: 'Dettagli traccia',
  queue: 'Coda di riproduzione',
  actions: 'Azioni rapide',
} as const;

export default function AudioPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const itineraryId = params.id as string;

  // Local state
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'queue' | 'actions'>('details');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isBuffering] = useState(false);

  // Restore MiniPlayer when leaving this page
  useEffect(() => {
    return () => {
      // On unmount, restore mini player view if there's a current track
      dispatch(setPlayerView('mini'));
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPanelOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPanelOpen]);

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

  // Create a unique key that includes both the storage key and track ID to force refresh
  const currentTrackImageKey = useMemo(() => {
    if (!currentTrack?.image_file?.image_storage_key) return '';
    return `${currentTrack.image_file.image_storage_key}`;
  }, [currentTrack?.image_file?.image_storage_key]);

  // Get signed URL for current track image (force refresh by using track ID as dependency)
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

  const handleSpeedChange = useCallback(
    (speed: number) => {
      dispatch(setPlaybackSpeed(speed));
      setShowSpeedMenu(false);
    },
    [dispatch],
  );

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
            variant="glass"
            className="space-y-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-medium"
          >
            <div className="h-6 w-32 animate-pulse rounded-full bg-gradient-to-r from-primary/30 to-accent/30" />
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10" />
            <div className="mx-auto h-4 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-secondary/30 to-primary/30" />
            <div className="h-2 w-full animate-pulse rounded-full bg-gradient-to-r from-primary/20 to-accent/20" />
            <div className="flex items-center justify-center gap-6">
              <div className="h-14 w-14 animate-pulse rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30" />
              <div className="h-20 w-20 animate-pulse rounded-full bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 border-2 border-primary/30" />
              <div className="h-14 w-14 animate-pulse rounded-full bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30" />
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
            variant="glass"
            className="space-y-4 rounded-3xl border border-error/30 bg-gradient-to-br from-error/10 to-error/5 text-center shadow-medium"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-error/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Audio not available</h2>
            <p className="text-sm text-muted leading-relaxed">
              Unable to load the audio tracks for this itinerary. Please try again later.
            </p>
            <div className="flex justify-center pt-2">
              <Button
                variant="primary"
                onClick={() => router.back()}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-soft"
              >
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
          variant="glass"
          className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20"
        >
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
              <h3 className="text-base font-bold text-foreground">Dettagli traccia</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              {currentTrack?.description || 'Nessuna descrizione disponibile per questa traccia.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
              <span className="text-xs uppercase tracking-wide text-secondary font-semibold">
                ⏱ Durata
              </span>
              <span className="font-bold text-foreground">
                {formatTime(currentTrack?.duration || 0)}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-xs uppercase tracking-wide text-primary font-semibold">
                📍 Posizione
              </span>
              <span className="font-bold text-foreground">
                {currentTrackIndex + 1} / {tracks?.length || 0}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20">
              <span className="text-xs uppercase tracking-wide text-accent font-semibold">
                🎧 Itinerario
              </span>
              <span className="font-bold text-foreground truncate">{itinerary?.name || '—'}</span>
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-marble-100/50 border border-marble-200/50">
              <span className="text-xs uppercase tracking-wide text-muted font-semibold">
                ❤️ Preferito
              </span>
              <span className="font-bold text-foreground">
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
            <QueueManager isVisible={true} onClose={() => setIsPanelOpen(false)} />
          </div>
        ) : (
          <Card
            padding="lg"
            variant="glass"
            className="text-center bg-gradient-to-br from-marble-100/50 to-marble-200/50 border border-marble-200/50"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-marble-200/50 flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">🎵</span>
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">Coda vuota</h3>
            <p className="text-sm text-muted leading-relaxed">
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
            variant="glass"
            className="space-y-4 bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-secondary to-primary rounded-full" />
              <h3 className="text-base font-bold text-foreground">Azioni rapide</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="accent"
                className="flex items-center justify-center gap-2 rounded-xl h-12 bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-soft hover:shadow-medium transition-all"
                onClick={() => setActiveTab('queue')}
              >
                <HiOutlineQueueList className="h-5 w-5" />
                <span className="font-medium">Apri coda</span>
              </Button>
              <Button
                variant={isCurrentTrackFavorite ? 'outline' : 'accent'}
                className={`flex items-center justify-center gap-2 rounded-xl h-12 transition-all ${isCurrentTrackFavorite ? 'bg-error/10 border-error/30 hover:bg-error/20 text-error' : 'bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-soft hover:shadow-medium'}`}
                onClick={() =>
                  currentTrack &&
                  toggleFavorite({
                    favouriteId: currentTrack.id,
                    type: 'FAVOURITE-TRACK',
                  })
                }
              >
                {isCurrentTrackFavorite ? (
                  <HiHeart className="h-5 w-5" />
                ) : (
                  <HiOutlineHeart className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {isCurrentTrackFavorite ? 'Rimuovi' : 'Preferito'}
                </span>
              </Button>
              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2 rounded-xl h-12 bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-soft hover:shadow-medium transition-all"
                onClick={() =>
                  router.push(`/map?itinerary=${itineraryId}&track=${currentTrack?.id}`)
                }
              >
                <HiMapPin className="h-5 w-5" />
                <span className="font-medium">Mappa</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 rounded-xl h-12 bg-primary/10 border-primary/30 hover:bg-primary/20 text-primary transition-all"
              >
                <HiShare className="h-5 w-5" />
                <span className="font-medium">Condividi</span>
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
        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-gradient-to-r from-surface/95 via-surface/90 to-primary/5 px-4 py-3 text-sm font-semibold text-foreground shadow-soft backdrop-blur-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-11 w-11 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all"
          >
            <HiChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col items-center text-center">
            <span className="text-sm font-semibold text-foreground truncate max-w-48">
              {currentTrack?.name || 'Loading…'}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span className="text-muted/80">
                {currentTrackIndex + 1} / {tracks?.length || 0}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isPanelOpen && activeTab === 'queue') {
                setIsPanelOpen(false);
              } else {
                setActiveTab('queue');
                setIsPanelOpen(true);
              }
            }}
            className={`h-11 w-11 rounded-full transition-all ${isPanelOpen ? 'bg-accent/20 text-accent' : 'bg-accent/10 hover:bg-accent/20 text-accent'}`}
            title={isPanelOpen ? 'Chiudi pannello' : 'Apri coda'}
            aria-pressed={isPanelOpen}
          >
            {isPanelOpen ? (
              <HiOutlineXMark className="h-5 w-5" />
            ) : (
              <HiOutlineQueueList className="h-5 w-5" />
            )}
          </Button>
        </div>

        {isPanelOpen && (
          <div
            className="fixed inset-0 z-40 flex justify-center bg-background/70 px-4 pb-20 pt-24 backdrop-blur-xl"
            onClick={() => setIsPanelOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Informazioni traccia"
          >
            <div
              className="relative flex h-full w-full max-w-lg flex-col gap-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-gradient-to-r from-surface/95 to-primary/5 px-4 py-3 shadow-medium backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-lg">
                      {activeTab === 'details' ? '📝' : activeTab === 'queue' ? '🎵' : '⚡'}
                    </span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs uppercase tracking-wide text-muted">Pannello</span>
                    <span className="text-sm font-semibold text-foreground">
                      {TAB_TITLES[activeTab]}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 rounded-full bg-error/10 hover:bg-error/20 text-error transition-all"
                  onClick={() => setIsPanelOpen(false)}
                  title="Chiudi pannello"
                >
                  <HiOutlineXMark className="h-5 w-5" />
                </Button>
              </div>
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto ">
                  {tabItems.find((item) => item.id === activeTab)?.content}
                </div>
            </div>
          </div>
        )}

        <Card
          padding="none"
          variant="glass"
          className="mx-auto max-w-xs overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-surface to-primary/5 shadow-medium"
        >
          <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 backdrop-blur-sm z-10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/40 border-t-primary" />
              </div>
            )}
            {currentTrack?.image_file_id && currentTrackImageUrl ? (
              <>
                <img
                  key={`image-${currentTrack.id}-${currentTrackImageKey}`}
                  src={currentTrackImageUrl}
                  alt={currentTrack.name || 'Track visual'}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-6xl">🎵</span>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2.5">
            <div
              className="group relative h-2 w-full cursor-pointer overflow-hidden rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 shadow-sm border border-primary/20"
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
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 border-2 border-primary" />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-primary">
                {formatTime(audioState.playbackState.currentTime)}
              </span>
              <span className="text-muted">{formatTime(currentTrack?.duration || 0)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-xl p-0 shrink-0 bg-secondary/10 hover:bg-secondary/20 text-secondary transition-all"
              onClick={handlePreviousTrack}
              title="Previous track"
            >
              <HiBackward className="h-4 w-4" />
            </Button>

            <Button
              variant="primary"
              size="lg"
              className="h-24 w-24 rounded-full bg-gradient-to-br from-primary via-accent to-secondary shadow-medium hover:shadow-strong hover:scale-105 transition-all duration-300"
              onClick={handlePlayPause}
              disabled={isBuffering || urlsLoading}
              title={audioState.playbackState.isPlaying ? 'Pause playback' : 'Start playback'}
            >
              {isBuffering ? (
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/60 border-t-transparent" />
              ) : audioState.playbackState.isPlaying ? (
                <HiPause className="h-10 w-10 text-white" />
              ) : (
                <HiPlay className="h-10 w-10 text-white translate-x-[2px]" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-xl p-0 shrink-0 bg-accent/10 hover:bg-accent/20 text-accent transition-all"
              onClick={handleNextTrack}
              title="Next track"
            >
              <HiForward className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <p className="text-sm font-medium text-foreground">
                {itinerary?.name || 'Audio Tour'}
              </p>
            </div>
          </div>

          {/* Primary actions row - Speed, Queue, Details */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-11 w-20 rounded-xl font-semibold bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30 hover:bg-secondary/10 text-secondary transition-all"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                title="Velocità riproduzione"
              >
                {audioState.playbackState.playbackSpeed}x
              </Button>
              {showSpeedMenu && (
                <Card
                  padding="sm"
                  variant="glass"
                  className="absolute bottom-full left-1/2 z-30 mb-3 w-32 -translate-x-1/2 space-y-1 rounded-xl border border-secondary/20 bg-gradient-to-br from-surface/98 to-secondary/5 shadow-strong backdrop-blur-lg"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      className="w-full rounded-lg px-3 py-2 text-center text-sm font-semibold text-foreground hover:bg-secondary/10 hover:text-secondary transition-all"
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </Card>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-11 px-4 rounded-xl font-medium bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:bg-primary/10 text-primary transition-all"
              onClick={() => {
                setActiveTab('queue');
                setIsPanelOpen(true);
              }}
              title="Coda di riproduzione"
            >
              <HiOutlineQueueList className="h-4 w-4 mr-2" />
              Coda
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-11 px-4 rounded-xl font-medium bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 hover:bg-accent/10 text-accent transition-all"
              onClick={() => {
                setActiveTab('details');
                setIsPanelOpen(true);
              }}
              title="Dettagli traccia"
            >
              Dettagli
            </Button>
          </div>

          {/* Secondary controls row - Volume, Favorites, Share */}
          <div className="flex items-center justify-center gap-3">
            <Popover
              position="top"
              align="center"
              offset={12}
              className="w-36 rounded-xl border border-primary/20 bg-gradient-to-br from-surface/98 to-primary/5 shadow-strong backdrop-blur-lg"
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 w-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:bg-primary/10 text-primary transition-all"
                  title="Volume"
                  aria-label="Regola volume"
                >
                  {audioState.playbackState.isMuted ? (
                    <HiSpeakerXMark className="h-5 w-5" />
                  ) : (
                    <HiSpeakerWave className="h-5 w-5" />
                  )}
                </Button>
              }
              content={
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted">Volume</span>
                    <span className="text-primary">
                      {Math.round(audioState.playbackState.volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(audioState.playbackState.volume * 100)}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20"
                    aria-label="Livello volume"
                  />
                </div>
              }
            />

            <Button
              variant="outline"
              size="sm"
              className={`h-11 w-16 rounded-xl transition-all ${isCurrentTrackFavorite ? 'bg-gradient-to-br from-error/20 to-error/10 border-error/30 hover:bg-error/20' : 'bg-gradient-to-br from-marble-100/50 to-marble-200/50 border-marble-200/30 hover:bg-marble-100'}`}
              onClick={() =>
                currentTrack &&
                toggleFavorite({
                  favouriteId: currentTrack.id,
                  type: 'FAVOURITE-TRACK',
                })
              }
              disabled={favoritesBusy}
              title={isCurrentTrackFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            >
              {isCurrentTrackFavorite ? (
                <HiHeart className="h-5 w-5 text-error" />
              ) : (
                <HiOutlineHeart className="h-5 w-5 text-muted" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-11 px-4 rounded-xl font-medium bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30 hover:bg-secondary/10 text-secondary transition-all"
              onClick={() => {
                setActiveTab('actions');
                setIsPanelOpen(true);
              }}
              title="Azioni rapide"
            >
              <HiShare className="h-4 w-4 mr-2" />
              Altro
            </Button>
          </div>
        </div>
        {audioState.audioError && (
          <Card
            padding="md"
            variant="glass"
            className="rounded-2xl border border-error/30 bg-gradient-to-br from-error/10 to-error/5 shadow-soft"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-error mb-3">{audioState.audioError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-error/40 text-error hover:bg-error/20 bg-error/5 transition-all"
                  onClick={() => {
                    dispatch(setAudioError(null));
                    if (currentTrack) {
                      dispatch(play());
                    }
                  }}
                >
                  Riprova
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
