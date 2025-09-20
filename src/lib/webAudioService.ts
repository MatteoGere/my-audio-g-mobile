/**
 * Web Audio API Service for advanced audio processing
 * Provides enhanced audio processing, effects, and control
 */
import { PlaylistTrack } from '@/store/slices/audioPlayerSlice';

export interface AudioEffects {
  enabled: boolean;
  equalizer: {
    enabled: boolean;
    bands: number[]; // 10-band EQ values (-12 to +12 dB)
  };
  playbackRate: number; // 0.5 to 2.0
  crossfade: {
    enabled: boolean;
    duration: number; // in seconds
  };
}

export interface AudioAnalyzer {
  enabled: boolean;
  fftSize: number;
  frequencyData: Uint8Array;
  waveformData: Uint8Array;
}

export class WebAudioService {
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private playing = false;
  
  // Media Session callbacks
  private onPlayPause?: (playing: boolean) => void;
  private onNext?: () => void;
  private onPrevious?: () => void;
  private onSeek?: (time: number) => void;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyzerNode: AnalyserNode | null = null;
  private eqNodes: BiquadFilterNode[] = [];
  private playbackRateNode: AudioWorkletNode | null = null;
  
  private currentUrl: string | null = null;
  private isInitialized = false;
  private crossfadeNode: GainNode | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      // Create AudioContext (suspended initially for iOS)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        // Will be resumed on first user interaction
        console.log('AudioContext created in suspended state');
      }

      await this.setupAudioChain();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
    }
  }

  private async setupAudioChain(): Promise<void> {
    if (!this.audioContext) return;

    // Create audio element
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'metadata';

    // Set up audio event listeners
    this.setupAudioEventListeners();

    // Create audio nodes
    this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
    this.gainNode = this.audioContext.createGain();
    this.analyzerNode = this.audioContext.createAnalyser();
    this.crossfadeNode = this.audioContext.createGain();

    // Set up analyzer
    this.analyzerNode.fftSize = 256;
    this.analyzerNode.smoothingTimeConstant = 0.8;

    // Create EQ bands (10-band equalizer)
    this.createEqualizerBands();

    // Connect audio chain
    this.connectAudioChain();
  }

  private createEqualizerBands(): void {
    if (!this.audioContext) return;

    const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    
    this.eqNodes = frequencies.map((freq, index) => {
      const filter = this.audioContext!.createBiquadFilter();
      
      if (index === 0) {
        filter.type = 'lowshelf';
      } else if (index === frequencies.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1;
      }
      
      filter.frequency.value = freq;
      filter.gain.value = 0;
      
      return filter;
    });
  }

  private connectAudioChain(): void {
    if (!this.sourceNode || !this.gainNode || !this.analyzerNode || !this.crossfadeNode) return;

    let currentNode: AudioNode = this.sourceNode;

    // Connect EQ bands in series
    this.eqNodes.forEach(eqNode => {
      currentNode.connect(eqNode);
      currentNode = eqNode;
    });

    // Connect to crossfade, gain, analyzer, and destination
    currentNode.connect(this.crossfadeNode);
    this.crossfadeNode.connect(this.gainNode);
    this.gainNode.connect(this.analyzerNode);
    this.analyzerNode.connect(this.audioContext!.destination);
  }

  private setupAudioEventListeners(): void {
    if (!this.audioElement) return;

    this.audioElement.addEventListener('loadstart', () => {
      this.onLoadStart?.();
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.onLoadedMetadata?.(this.audioElement!.duration);
    });

    this.audioElement.addEventListener('canplaythrough', () => {
      this.onCanPlayThrough?.();
    });

    this.audioElement.addEventListener('play', () => {
      this.resumeAudioContext();
      this.playing = true;
      this.updateMediaSessionPlaybackState(true);
      this.updateMediaSessionPositionState();
      this.onPlay?.();
    });

    this.audioElement.addEventListener('pause', () => {
      this.playing = false;
      this.updateMediaSessionPlaybackState(false);
      this.onPause?.();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      this.updateMediaSessionPositionState();
      this.onTimeUpdate?.(this.audioElement!.currentTime);
    });

    this.audioElement.addEventListener('ended', () => {
      this.onEnded?.();
    });

    this.audioElement.addEventListener('error', (e) => {
      this.onError?.(e.message || 'Audio playback error');
    });

    this.audioElement.addEventListener('waiting', () => {
      this.onWaiting?.();
    });

    this.audioElement.addEventListener('canplay', () => {
      this.onCanPlay?.();
    });
  }

  // Event handlers (to be set by the audio service)
  public onLoadStart?: () => void;
  public onLoadedMetadata?: (duration: number) => void;
  public onCanPlayThrough?: () => void;
  public onPlay?: () => void;
  public onPause?: () => void;
  public onTimeUpdate?: (currentTime: number) => void;
  public onEnded?: () => void;
  public onError?: (error: string) => void;
  public onWaiting?: () => void;
  public onCanPlay?: () => void;

  // Resume AudioContext (required for iOS)
  private async resumeAudioContext(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('AudioContext resumed');
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }
  }

  // Public methods
  public async loadAudio(url: string, track?: PlaylistTrack): Promise<void> {
    if (!this.audioElement || !this.isInitialized) {
      throw new Error('Web Audio API not initialized');
    }

    if (this.currentUrl === url) {
      return; // Already loaded
    }

    this.currentUrl = url;
    this.audioElement.src = url;
    
    // Set up Media Session if track info is provided
    if (track) {
      this.setupMediaSession(track);
    }
    
    return new Promise((resolve, reject) => {
      const handleCanPlay = () => {
        this.audioElement?.removeEventListener('canplay', handleCanPlay);
        this.audioElement?.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = () => {
        this.audioElement?.removeEventListener('canplay', handleCanPlay);
        this.audioElement?.removeEventListener('error', handleError);
        reject(new Error('Failed to load audio'));
      };

      this.audioElement?.addEventListener('canplay', handleCanPlay);
      this.audioElement?.addEventListener('error', handleError);
    });
  }

  public async play(): Promise<void> {
    if (!this.audioElement) throw new Error('Audio element not initialized');
    
    try {
      await this.resumeAudioContext();
      await this.audioElement.play();
    } catch (error) {
      console.error('Play failed:', error);
      throw error;
    }
  }

  public pause(): void {
    this.audioElement?.pause();
  }

  public stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  public setCurrentTime(time: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  public getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  public getDuration(): number {
    return this.audioElement?.duration || 0;
  }

  public setVolume(volume: number): void {
    if (this.gainNode) {
      // Use exponential curve for natural volume perception
      this.gainNode.gain.setValueAtTime(volume * volume, this.audioContext!.currentTime);
    }
  }

  public getVolume(): number {
    return this.gainNode?.gain.value || 0;
  }

  public setPlaybackRate(rate: number): void {
    if (this.audioElement) {
      this.audioElement.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    }
  }

  public getPlaybackRate(): number {
    return this.audioElement?.playbackRate || 1.0;
  }

  // Equalizer methods
  public setEQBand(bandIndex: number, gain: number): void {
    if (this.eqNodes[bandIndex]) {
      const clampedGain = Math.max(-12, Math.min(12, gain));
      this.eqNodes[bandIndex].gain.setValueAtTime(
        clampedGain,
        this.audioContext!.currentTime
      );
    }
  }

  public getEQBand(bandIndex: number): number {
    return this.eqNodes[bandIndex]?.gain.value || 0;
  }

  public resetEQ(): void {
    this.eqNodes.forEach(node => {
      node.gain.setValueAtTime(0, this.audioContext!.currentTime);
    });
  }

  // Crossfade methods
  public async crossfadeTo(newUrl: string, duration: number = 3): Promise<void> {
    if (!this.crossfadeNode || !this.audioContext) return;

    const startTime = this.audioContext.currentTime;
    
    // Fade out current audio
    this.crossfadeNode.gain.setValueAtTime(1, startTime);
    this.crossfadeNode.gain.linearRampToValueAtTime(0, startTime + duration);

    // Load new audio after half the crossfade duration
    setTimeout(async () => {
      await this.loadAudio(newUrl);
      await this.play();
      
      // Fade in new audio
      const fadeInStart = this.audioContext!.currentTime;
      this.crossfadeNode!.gain.setValueAtTime(0, fadeInStart);
      this.crossfadeNode!.gain.linearRampToValueAtTime(1, fadeInStart + duration / 2);
    }, (duration / 2) * 1000);
  }

  // Analyzer methods
  public getFrequencyData(): Uint8Array {
    if (!this.analyzerNode) return new Uint8Array();
    
    const dataArray = new Uint8Array(this.analyzerNode.frequencyBinCount);
    this.analyzerNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyzerNode) return new Uint8Array();
    
    const dataArray = new Uint8Array(this.analyzerNode.frequencyBinCount);
    this.analyzerNode.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  // Media Session API integration
  public setMediaSessionHandlers(handlers: {
    onPlayPause?: (playing: boolean) => void;
    onNext?: () => void;
    onPrevious?: () => void;
    onSeek?: (time: number) => void;
  }) {
    this.onPlayPause = handlers.onPlayPause;
    this.onNext = handlers.onNext;
    this.onPrevious = handlers.onPrevious;
    this.onSeek = handlers.onSeek;
  }

  private setupMediaSession(track: PlaylistTrack) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name || 'Untitled Track',
        artist: 'Audio Guide',
        album: 'Audio Guide',
        artwork: track.image_file_id ? [
          { src: `/api/files/${track.image_file_id}`, sizes: '96x96', type: 'image/jpeg' },
          { src: `/api/files/${track.image_file_id}`, sizes: '128x128', type: 'image/jpeg' },
          { src: `/api/files/${track.image_file_id}`, sizes: '192x192', type: 'image/jpeg' },
          { src: `/api/files/${track.image_file_id}`, sizes: '256x256', type: 'image/jpeg' },
          { src: `/api/files/${track.image_file_id}`, sizes: '384x384', type: 'image/jpeg' },
          { src: `/api/files/${track.image_file_id}`, sizes: '512x512', type: 'image/jpeg' },
        ] : [],
      });

      // Set up action handlers
      navigator.mediaSession.setActionHandler('play', () => {
        this.onPlayPause?.(true);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.onPlayPause?.(false);
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.onPrevious?.();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.onNext?.();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== null && details.seekTime !== undefined) {
          this.onSeek?.(details.seekTime);
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const seekOffset = details.seekOffset || 10;
        const currentTime = this.audioElement?.currentTime || 0;
        this.onSeek?.(Math.max(0, currentTime - seekOffset));
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const seekOffset = details.seekOffset || 10;
        const currentTime = this.audioElement?.currentTime || 0;
        const duration = this.audioElement?.duration || 0;
        this.onSeek?.(Math.min(duration, currentTime + seekOffset));
      });

      // Set initial playback state
      navigator.mediaSession.playbackState = this.playing ? 'playing' : 'paused';
    }
  }

  private updateMediaSessionPositionState() {
    if ('mediaSession' in navigator && this.audioElement) {
      navigator.mediaSession.setPositionState({
        duration: this.audioElement.duration || 0,
        playbackRate: this.audioElement.playbackRate || 1,
        position: this.audioElement.currentTime || 0,
      });
    }
  }

  private updateMediaSessionPlaybackState(playing: boolean) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
  }
  public isPlaying(): boolean {
    return this.playing;
  }

  public isPaused(): boolean {
    return !!(this.audioElement && this.audioElement.paused);
  }

  public getReadyState(): number {
    return this.audioElement?.readyState || 0;
  }

  public destroy(): void {
    this.audioElement?.pause();
    this.audioElement = null;
    this.sourceNode?.disconnect();
    this.gainNode?.disconnect();
    this.analyzerNode?.disconnect();
    this.eqNodes.forEach(node => node.disconnect());
    this.crossfadeNode?.disconnect();
    
    if (this.audioContext?.state !== 'closed') {
      this.audioContext?.close();
    }
    
    this.audioContext = null;
    this.isInitialized = false;
  }
}

// Singleton instance
let webAudioServiceInstance: WebAudioService | null = null;

export const getWebAudioService = (): WebAudioService => {
  if (!webAudioServiceInstance) {
    webAudioServiceInstance = new WebAudioService();
  }
  return webAudioServiceInstance;
};

export const destroyWebAudioService = (): void => {
  if (webAudioServiceInstance) {
    webAudioServiceInstance.destroy();
    webAudioServiceInstance = null;
  }
};