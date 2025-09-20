'use client';

import { useState } from 'react';
import {
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineForward,
  HiOutlineBackward,
  HiOutlineSpeakerWave,
  HiOutlineSpeakerXMark,
  HiOutlineArrowsRightLeft,
  HiOutlineArrowPath,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useAudioPlayerWithMediaSession } from '../../hooks/useAudioPlayerWithMediaSession';
import { setShuffle, setRepeat } from '../../store/slices/audioPlayerSlice';
import { Button } from '../ui';

export interface AudioPlayerProps {
  onClose?: () => void;
  className?: string;
}

export function AudioPlayer({ onClose, className = '' }: AudioPlayerProps) {
  const dispatch = useAppDispatch();
  const { shuffle, repeat } = useAppSelector((state) => state.audioPlayer);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    playAudio,
    pauseAudio,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    audioRef,
  } = useAudioPlayerWithMediaSession();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolumeLevel(newVolume);
  };

  const toggleShuffle = () => {
    dispatch(setShuffle(!shuffle));
  };

  const toggleRepeat = () => {
    const nextRepeat = repeat === 'none' ? 'all' : repeat === 'all' ? 'one' : 'none';
    dispatch(setRepeat(nextRepeat));
  };

  if (!currentTrack) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 text-center ${className}`}>
        <p className="text-stone-600 dark:text-gray-400">No track selected</p>
      </div>
    );
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-6 ${className}`}>
        {/* Header */}
        {onClose && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Now Playing</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="!p-1">
              <HiOutlineXMark className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Track Info */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {currentTrack.name || 'Unknown Track'}
          </h3>
          {currentTrack.description && (
            <p className="text-stone-600 dark:text-gray-400 text-sm">
              {currentTrack.description}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            className="relative h-2 bg-stone-200 dark:bg-gray-600 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-300"
              style={{ left: `calc(${progressPercentage}% - 8px)` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-stone-600 dark:text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={playPrevious}
            disabled={isLoading}
            className="!p-3"
          >
            <HiOutlineBackward className="h-6 w-6" />
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={isPlaying ? pauseAudio : playAudio}
            disabled={isLoading}
            className="!p-4 rounded-full"
          >
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isPlaying ? (
              <HiOutlinePause className="h-8 w-8" />
            ) : (
              <HiOutlinePlay className="h-8 w-8" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={playNext}
            disabled={isLoading}
            className="!p-3"
          >
            <HiOutlineForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShuffle}
              className={`!p-2 ${shuffle ? 'text-primary' : 'text-stone-600 dark:text-gray-400'}`}
            >
              <HiOutlineArrowsRightLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRepeat}
              className={`!p-2 ${repeat !== 'none' ? 'text-primary' : 'text-stone-600 dark:text-gray-400'}`}
            >
              <HiOutlineArrowPath className="h-4 w-4" />
              {repeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>
              )}
            </Button>
          </div>

          {/* Volume controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="!p-2"
            >
              {volume === 0 ? (
                <HiOutlineSpeakerXMark className="h-4 w-4" />
              ) : (
                <HiOutlineSpeakerWave className="h-4 w-4" />
              )}
            </Button>

            {showVolumeSlider && (
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-stone-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-stone-600 dark:text-gray-400 w-8">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}