'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineHeart,
  HiHeart,
} from 'react-icons/hi2';
import { Card, Button, Progress } from '@/components/ui';
import { QueueManager } from '@/components/audio/QueueManager';
import { useGetAudioItineraryQuery, useGetItineraryTracksQuery } from '@/lib/redux/api/apiSlice';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { useSignedAudioUrls } from '@/lib/hooks/useSignedUrls';
import {
  setCurrentTrack,
  play,
  pause,
  stop,
  setCurrentTime,
  setDuration,
  setPlaybackSpeed,
  toggleMute,
  setVolume,
  updatePlaybackState,
  nextTrack,
  previousTrack,
  setCurrentQueueIndex,
  setQueue,
  toggleShuffle,
  setRepeatMode,
  setLoadingTrack,
  setAudioError,
} from '@/lib/redux/slices/audioSlice';

export default function AudioPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const itineraryId = params.id as string;

  // Local state
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null);

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
  const { signedUrls, isLoading: urlsLoading } = useSignedAudioUrls(audioPaths, 3600);

  // Current track data
  const currentTrack = audioState.currentTrack;
  const currentTrackIndex = useMemo(() => {
    if (!tracks || !currentTrack) return 0;
    return tracks.findIndex((track) => track.id === currentTrack.id);
  }, [tracks, currentTrack]);

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

  // Audio control functions
  const handlePlayPause = useCallback(() => {
    if (!currentTrack || !audioRef.current) return;

    const audioUrl = signedUrls[currentTrack.audio_storage_key];
    
    if (!audioUrl) {
      dispatch(setAudioError('Audio URL not available'));
      return;
    }

    if (audioState.playbackState.isPlaying) {
      audioRef.current.pause();
    } else {
      // Set audio source if not already set
      if (audioRef.current.src !== audioUrl) {
        dispatch(setLoadingTrack(true));
        setIsBuffering(true);
        audioRef.current.src = audioUrl;
      }
      audioRef.current.play().catch((error) => {
        console.error('Audio play error:', error);
        dispatch(setAudioError(error.message));
      });
    }
  }, [currentTrack, signedUrls, audioState.playbackState.isPlaying, dispatch]);

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

  const handleSeek = useCallback((percentage: number) => {
    if (!currentTrack || !audioRef.current) return;
    
    const newTime = (percentage / 100) * currentTrack.duration;
    audioRef.current.currentTime = newTime;
    dispatch(setCurrentTime(newTime));
  }, [currentTrack, dispatch]);

  const handleVolumeChange = useCallback((volume: number) => {
    const normalizedVolume = volume / 100;
    dispatch(setVolume(normalizedVolume));
    if (audioRef.current) {
      audioRef.current.volume = normalizedVolume;
    }
  }, [dispatch]);

  const handleSpeedChange = useCallback((speed: number) => {
    dispatch(setPlaybackSpeed(speed));
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  }, [dispatch]);

  const handleMuteToggle = useCallback(() => {
    dispatch(toggleMute());
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  }, [dispatch]);

  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      dispatch(setCurrentTime(audioRef.current.currentTime));
    }
  }, [dispatch]);

  const handleTrackEnd = useCallback(() => {
    if (audioState.repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (audioState.repeatMode === 'all' || currentTrackIndex < (tracks?.length || 0) - 1) {
      handleNextTrack();
    } else {
      dispatch(stop());
    }
  }, [audioState.repeatMode, currentTrackIndex, tracks?.length, handleNextTrack, dispatch]);

  const handleLoadStart = useCallback(() => {
    setIsBuffering(true);
    dispatch(setLoadingTrack(true));
  }, [dispatch]);

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
    dispatch(setLoadingTrack(false));
  }, [dispatch]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && currentTrack) {
      dispatch(setDuration(audioRef.current.duration));
    }
  }, [dispatch, currentTrack]);

  const handleError = useCallback(() => {
    setIsBuffering(false);
    dispatch(setLoadingTrack(false));
    dispatch(setAudioError('Failed to load audio'));
  }, [dispatch]);

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

  // Audio element setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Apply current state to audio element
    audio.volume = audioState.playbackState.volume;
    audio.playbackRate = audioState.playbackState.playbackSpeed;
    audio.muted = audioState.playbackState.isMuted;

    return () => {
      // Cleanup
      if (audio.src) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audioState.playbackState]);

  // Media Session API integration
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name || 'Audio Track',
        artist: itinerary?.name || 'Audio Guide',
        album: itinerary?.name,
        artwork: currentTrack.image_file_id ? [
          {
            src: '/placeholder-track.jpg', // You can use signed image URL here
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ] : undefined,
      });

      navigator.mediaSession.setActionHandler('play', handlePlayPause);
      navigator.mediaSession.setActionHandler('pause', handlePlayPause);
      navigator.mediaSession.setActionHandler('previoustrack', handlePreviousTrack);
      navigator.mediaSession.setActionHandler('nexttrack', handleNextTrack);
    }
  }, [currentTrack, itinerary, handlePlayPause, handlePreviousTrack, handleNextTrack]);

  // Loading state
  if (itineraryLoading || tracksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sea-50 dark:from-stone-900 dark:to-stone-800">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-1/3"></div>
            <div className="aspect-square bg-stone-200 dark:bg-stone-700 rounded-lg"></div>
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-2/3 mx-auto"></div>
            <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded"></div>
            <div className="flex justify-center space-x-4">
              <div className="w-12 h-12 bg-stone-200 dark:bg-stone-700 rounded-full"></div>
              <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-full"></div>
              <div className="w-12 h-12 bg-stone-200 dark:bg-stone-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (itineraryError || tracksError || !currentTrack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sea-50 dark:from-stone-900 dark:to-stone-800">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
              Audio Not Available
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Unable to load the audio tracks for this itinerary.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sea-50 dark:from-stone-900 dark:to-stone-800">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => dispatch(play())}
        onPause={() => dispatch(pause())}
        onError={handleError}
        preload="none" // Lazy loading
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm dark:bg-stone-900/80">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <HiChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold text-stone-900 dark:text-stone-100">Now Playing</h1>
        <Button variant="ghost" size="sm" onClick={() => setShowQueue(!showQueue)}>
          <HiOutlineQueueList className="w-5 h-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Track Image/Visual */}
        <Card className="overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-primary-200 to-sea-200 dark:from-primary-800 dark:to-sea-800 flex items-center justify-center relative">
            {isBuffering && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            {currentTrack?.image_file_id ? (
              <img
                src={`/placeholder-track-${currentTrackIndex + 1}.jpg`}
                alt={currentTrack.name || 'Track'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl">🎵</span>
            )}
          </div>
        </Card>

        {/* Track Info */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {currentTrack?.name || 'Loading...'}
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            {itinerary?.name || 'Audio Tour'}
          </p>
          <p className="text-stone-500 dark:text-stone-500 text-xs">
            Track {currentTrackIndex + 1} of {tracks?.length || 0}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={progress}
            className="h-2 cursor-pointer"
            variant="primary"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = (x / rect.width) * 100;
              handleSeek(percentage);
            }}
          />
          <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>{formatTime(audioState.playbackState.currentTime)}</span>
            <span>{formatTime(currentTrack?.duration || 0)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6">
          <Button variant="ghost" size="lg" className="p-3" onClick={handlePreviousTrack}>
            <HiBackward className="w-6 h-6" />
          </Button>

          <Button
            variant="primary"
            size="lg"
            className="w-16 h-16 rounded-full p-0"
            onClick={handlePlayPause}
            disabled={isBuffering || urlsLoading}
          >
            {isBuffering ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : audioState.playbackState.isPlaying ? (
              <HiPause className="w-8 h-8" />
            ) : (
              <HiPlay className="w-8 h-8" />
            )}
          </Button>

          <Button variant="ghost" size="lg" className="p-3" onClick={handleNextTrack}>
            <HiForward className="w-6 h-6" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleMuteToggle}>
            {audioState.playbackState.isMuted ? (
              <HiSpeakerXMark className="w-5 h-5" />
            ) : (
              <HiSpeakerWave className="w-5 h-5" />
            )}
          </Button>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSeek(Math.max(0, progress - 10))}
            >
              <span className="text-lg">⏪</span>
            </Button>

            <div className="relative">
              <button
                className="bg-stone-100 dark:bg-stone-800 rounded-lg px-3 py-1"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              >
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {audioState.playbackState.playbackSpeed}x
                </span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 p-2 z-10">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      className="block w-full text-left px-3 py-1 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 rounded"
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSeek(Math.min(100, progress + 10))}
            >
              <span className="text-lg">⏩</span>
            </Button>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            >
              <HiSpeakerWave className="w-5 h-5" />
            </Button>

            {showVolumeSlider && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 p-3 z-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioState.playbackState.volume * 100}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-20 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Track Description */}
        <Card className="p-4">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
            About this track
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            {currentTrack?.description || 'No description available for this track.'}
          </p>
        </Card>

        {/* Enhanced Queue Manager */}
        {showQueue && (
          <QueueManager 
            isVisible={showQueue}
            onClose={() => setShowQueue(false)}
          />
        )}

        {/* Playlist Management Controls */}
        <div className="grid grid-cols-2 gap-3">
          {/* Queue Toggle */}
          <Button 
            variant={showQueue ? "primary" : "outline"} 
            className="flex items-center justify-center space-x-2"
            onClick={() => setShowQueue(!showQueue)}
          >
            <HiOutlineQueueList className="w-4 h-4" />
            <span>Queue ({queue.length})</span>
          </Button>

          {/* Add to Favorites */}
          <Button variant="outline" className="flex items-center justify-center space-x-2">
            <HiOutlineHeart className="w-4 h-4" />
            <span>Favorite</span>
          </Button>
        </div>

        {/* Playback Mode Controls */}
        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant={audioState.shuffleMode ? "primary" : "outline"} 
            size="sm"
            className="flex flex-col items-center justify-center space-y-1 h-12"
            onClick={() => dispatch(toggleShuffle())}
            title={audioState.shuffleMode ? "Shuffle: On" : "Shuffle: Off"}
          >
            <span className="text-lg">🔀</span>
            <span className="text-xs">Shuffle</span>
          </Button>
          
          <Button 
            variant={audioState.repeatMode !== 'none' ? "primary" : "outline"} 
            size="sm"
            className="flex flex-col items-center justify-center space-y-1 h-12"
            onClick={() => {
              const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
              const currentIndex = modes.indexOf(audioState.repeatMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              dispatch(setRepeatMode(nextMode));
            }}
            title={`Repeat: ${audioState.repeatMode === 'one' ? 'One' : audioState.repeatMode === 'all' ? 'All' : 'Off'}`}
          >
            <span className="text-lg">
              {audioState.repeatMode === 'one' ? '🔂' : audioState.repeatMode === 'all' ? '🔁' : '🔁'}
            </span>
            <span className="text-xs">Repeat</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            className="flex flex-col items-center justify-center space-y-1 h-12"
            onClick={() => router.push(`/map?itinerary=${itineraryId}&track=${currentTrack?.id}`)}
            title="View on Map"
          >
            <HiMapPin className="w-4 h-4" />
            <span className="text-xs">Map</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            className="flex flex-col items-center justify-center space-y-1 h-12"
            title="Share Track"
          >
            <HiShare className="w-4 h-4" />
            <span className="text-xs">Share</span>
          </Button>
        </div>

        {/* Error Display */}
        {audioState.audioError && (
          <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {audioState.audioError}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                dispatch(setAudioError(null));
                if (audioRef.current && currentTrack) {
                  const audioUrl = signedUrls[currentTrack.audio_storage_key];
                  if (audioUrl) {
                    audioRef.current.src = audioUrl;
                  }
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
