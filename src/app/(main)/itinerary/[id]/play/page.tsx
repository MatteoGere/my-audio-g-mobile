'use client';

import { useState, useEffect, useRef } from 'react';
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
  HiClock,
  HiChevronLeft,
  HiAdjustmentsHorizontal,
} from 'react-icons/hi2';
import { Card, Button, Progress } from '@/components/ui';
import { useGetAudioItineraryQuery, useGetItineraryTracksQuery } from '@/lib/redux/api/apiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import {
  setCurrentTrack,
  play,
  pause,
  setCurrentTime,
  setPlaybackSpeed,
  toggleMute,
  setVolume,
  updatePlaybackState,
} from '@/lib/redux/slices/audioSlice';

export default function AudioPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const itineraryId = params.id as string;

  // Local state
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

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
  const audioState = useSelector((state: RootState) => state.audio);
  const signedUrls = useSelector((state: RootState) => state.storage.signedUrls);

  // Current track data
  const currentTrack = audioState.currentTrack || tracks?.[0];
  const currentTrackIndex =
    tracks?.findIndex((track) => track.id === audioState.currentTrack?.id) ?? 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentTrack?.duration
    ? (audioState.playbackState.currentTime / currentTrack.duration) * 100
    : 0;

  // Audio control functions
  const handlePlayPause = () => {
    if (!currentTrack) return;

    if (audioState.playbackState.isPlaying) {
      audioRef.current?.pause();
      dispatch(pause());
    } else {
      audioRef.current?.play();
      dispatch(play());
    }
  };

  const handlePreviousTrack = () => {
    if (!tracks || tracks.length === 0) return;

    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    const newTrack = tracks[newIndex];
    const audioUrl = signedUrls[newTrack.audio_storage_key]?.url;

    dispatch(setCurrentTrack({ track: newTrack as any, audioUrl }));
    dispatch(setCurrentTime(0));
  };

  const handleNextTrack = () => {
    if (!tracks || tracks.length === 0) return;

    const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    const newTrack = tracks[newIndex];
    const audioUrl = signedUrls[newTrack.audio_storage_key]?.url;

    dispatch(setCurrentTrack({ track: newTrack as any, audioUrl }));
    dispatch(setCurrentTime(0));
  };

  const handleSeek = (percentage: number) => {
    if (!currentTrack || !audioRef.current) return;

    const newTime = (percentage / 100) * currentTrack.duration;
    audioRef.current.currentTime = newTime;
    dispatch(setCurrentTime(newTime));
  };

  const handleSpeedChange = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    dispatch(setPlaybackSpeed(rate));
    setShowSpeedMenu(false);
  };

  const handleVolumeChange = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    dispatch(setVolume(volume / 100));
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioState.playbackState.isMuted;
    }
    dispatch(toggleMute());
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setCurrentTime(audioRef.current.currentTime));
    }
  };

  const handleTrackEnd = () => {
    handleNextTrack();
  };

  // Set up audio element when track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      const audioUrl =
        signedUrls[currentTrack.audio_storage_key]?.url || audioState.currentAudioUrl;
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.currentTime = audioState.playbackState.currentTime;
        audioRef.current.playbackRate = audioState.playbackState.playbackSpeed;
        audioRef.current.volume = audioState.playbackState.volume;
        audioRef.current.muted = audioState.playbackState.isMuted;

        if (audioState.playbackState.isPlaying) {
          audioRef.current.play();
        }
      }
    }
  }, [currentTrack, signedUrls, audioState.currentAudioUrl, audioState.playbackState]);

  // Initialize first track
  useEffect(() => {
    if (tracks && tracks.length > 0 && !audioState.currentTrack) {
      const firstTrack = tracks[0];
      const audioUrl = signedUrls[firstTrack.audio_storage_key]?.url;
      dispatch(setCurrentTrack({ track: firstTrack as any, audioUrl }));
    }
  }, [tracks, audioState.currentTrack, signedUrls, dispatch]);

  // Loading state
  if (itineraryLoading || tracksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sea-50 dark:from-stone-900 dark:to-stone-800">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="aspect-square bg-gray-300 rounded-lg"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto"></div>
            <div className="h-2 bg-gray-300 rounded"></div>
            <div className="flex justify-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Audio Not Available</h2>
            <p className="text-gray-600 mb-4">
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
        onLoadedMetadata={() => {
          if (audioRef.current) {
            dispatch(updatePlaybackState({ duration: audioRef.current.duration }));
          }
        }}
        onPlay={() => dispatch(play())}
        onPause={() => dispatch(pause())}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm dark:bg-stone-900/80">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <HiChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold text-stone-900 dark:text-stone-100">Now Playing</h1>
        <Button variant="ghost" size="sm">
          <HiAdjustmentsHorizontal className="w-5 h-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Track Image/Visual */}
        <Card className="overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-primary-200 to-sea-200 dark:from-primary-800 dark:to-sea-800 flex items-center justify-center">
            {currentTrack?.image_file_id ? (
              <img
                src={`/placeholder-track-${currentTrackIndex + 1}.jpg`}
                alt={currentTrack.name || 'Track'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl">�</span>
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
          >
            {audioState.playbackState.isPlaying ? (
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
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                    <button
                      key={speed}
                      className="block w-full text-left px-3 py-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-sm"
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
              <HiAdjustmentsHorizontal className="w-4 h-4" />
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

        {/* Up Next - Other Tracks */}
        {tracks && tracks.length > 1 && (
          <Card className="p-4">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Up Next</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {tracks
                .filter((track, index) => index !== currentTrackIndex)
                .slice(0, 5) // Show max 5 upcoming tracks
                .map((track, index) => (
                  <div key={track.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">
                        {track.name || `Track ${index + 1}`}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {formatTime(track.duration || 0)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const trackIndex = tracks.findIndex((t) => t.id === track.id);
                        const audioUrl = signedUrls[track.audio_storage_key]?.url;
                        dispatch(setCurrentTrack({ track: track as any, audioUrl }));
                      }}
                    >
                      <HiPlay className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Additional Controls */}
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            <HiShare className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/map?itinerary=${itineraryId}&track=${currentTrack?.id}`)}
          >
            <HiMapPin className="w-4 h-4 mr-2" />
            Map
          </Button>
          <Button variant="outline" className="flex-1">
            <HiClock className="w-4 h-4 mr-2" />
            Timer
          </Button>
        </div>
      </div>
    </div>
  );
}
