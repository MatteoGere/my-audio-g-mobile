import { Tables, Enums } from './supabase-types';

// ==============================================
// ENHANCED DATABASE TYPES WITH COMPUTED FIELDS
// ==============================================

/**
 * Enhanced Company with image file data
 */
export interface EnhancedCompany extends Tables<'company'> {
  image_file?: Tables<'image_file'> | null;
  image_url?: string; // Signed URL for the company image
}

/**
 * Enhanced Audio Itinerary with related data and computed fields
 */
export interface EnhancedAudioItinerary extends Tables<'audio_itinerary'> {
  // Related data
  company?: EnhancedCompany;
  image_file?: Tables<'image_file'> | null;
  tracks?: EnhancedAudioTrack[];

  // Computed fields
  image_url?: string; // Signed URL for the itinerary cover image
  track_count?: number;
  poi_count?: number;
  min_distance_meters?: number; // Distance from user's location
  avg_latitude?: number; // Average POI latitude
  avg_longitude?: number; // Average POI longitude

  // UI state
  is_favorite?: boolean;
  is_downloaded?: boolean; // For offline support
  download_progress?: number; // 0-100
}

/**
 * Enhanced Audio Track with POI and related data
 */
export interface EnhancedAudioTrack extends Tables<'audio_track'> {
  // Related data
  audio_itinerary?: EnhancedAudioItinerary;
  image_file?: Tables<'image_file'> | null;
  poi?: Tables<'audio_track_poi'> | null;

  // Computed fields
  image_url?: string; // Signed URL for track image
  audio_url?: string; // Signed URL for audio file

  // POI data (flattened for convenience)
  latitude?: number;
  longitude?: number;

  // Playback state
  is_playing?: boolean;
  is_current?: boolean;
  progress?: number; // 0-1 (percentage played)
  last_position?: number; // Last playback position in seconds

  // UI state
  is_favorite?: boolean;
  is_downloaded?: boolean;
  download_progress?: number;
}

/**
 * Enhanced User Profile with preferences and computed data
 */
export interface EnhancedUserProfile extends Tables<'user_profile'> {
  // Preferences (from Redux state)
  preferences?: {
    language: 'en' | 'it';
    theme: 'light' | 'dark' | 'system';
    audio_settings: {
      playback_speed: number;
      enable_background_play: boolean;
      auto_play: boolean;
      skip_silence: boolean;
      quality?: 'standard' | 'high' | 'data-saver';
    };
    map_settings: {
      enable_location: boolean;
      follow_user_location: boolean;
      show_traffic: boolean;
      default_zoom: number;
    };
    notifications: {
      enable_push: boolean;
      enable_location_alerts: boolean;
      enable_new_content_alerts: boolean;
    };
    accessibility: {
      reduce_motion: boolean;
      high_contrast: boolean;
      large_text: boolean;
    };
    privacy?: {
      share_listening_history: boolean;
      personalized_recommendations: boolean;
      location_based_suggestions: boolean;
    };
  };

  // Computed stats
  total_favorites?: number;
  total_listening_time?: number; // Total seconds listened
  completed_itineraries?: number;
  last_activity?: string; // ISO date string
}

/**
 * User Favorite with enhanced data
 */
export interface EnhancedUserFavorite extends Tables<'user_favourite'> {
  // Related data based on type
  itinerary?: EnhancedAudioItinerary; // If type is 'FAVOURITE-ITINERARY'
  track?: EnhancedAudioTrack; // If type is 'FAVOURITE-TRACK'
}

// ==============================================
// MAP AND LOCATION TYPES
// ==============================================

/**
 * Geographic coordinate
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Map bounds for viewport calculation
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Point of Interest for map display
 */
export interface POI {
  id: string; // track ID
  type: 'audio_track';
  position: LatLng;
  title: string;
  description?: string;
  image_url?: string;
  audio_track: EnhancedAudioTrack;

  // Map display options
  marker_type?: 'default' | 'current' | 'completed' | 'favorite';
  is_clustered?: boolean;
  cluster_count?: number;
}

/**
 * POI Marker Data for map rendering
 */
export interface POIMarkerData {
  trackId: string;
  trackName: string;
  itineraryId: string;
  itineraryName: string;
  latitude: number;
  longitude: number;
  duration: number;
  imageStorageKey?: string | null;
  audioStorageKey: string;
  companyId: string;
  companyName: string;
}

/**
 * Map marker configuration
 */
export interface MapMarkerConfig {
  type: 'default' | 'current' | 'completed' | 'favorite' | 'user_location' | 'cluster';
  size: 'sm' | 'md' | 'lg';
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  icon?: string; // Icon name from react-icons
  badge?: string | number; // For cluster counts
}

/**
 * Location with accuracy and timestamp
 */
export interface UserLocation {
  position: LatLng;
  accuracy?: number; // meters
  timestamp: number; // milliseconds
  heading?: number; // degrees
  speed?: number; // m/s
}

// ==============================================
// AUDIO PLAYER TYPES
// ==============================================

/**
 * Playback state for audio player
 */
export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

/**
 * Audio quality levels
 */
export type AudioQuality = 'low' | 'medium' | 'high' | 'auto';

/**
 * Queue item for audio player
 */
export interface QueueItem {
  id: string; // track ID
  track: EnhancedAudioTrack;
  position_in_queue: number;
  added_at: number; // timestamp
  added_by?: 'user' | 'auto' | 'recommendation';
}

/**
 * Audio player state
 */
export interface AudioPlayerState {
  // Current track
  current_track?: EnhancedAudioTrack;
  current_itinerary?: EnhancedAudioItinerary;

  // Playback state
  state: PlaybackState;
  position: number; // Current position in seconds
  duration: number; // Total duration in seconds
  buffered_ranges: Array<{ start: number; end: number }>;

  // Controls
  volume: number; // 0-1
  playback_rate: number; // 0.5-2.0
  is_muted: boolean;
  is_shuffled: boolean;
  repeat_mode: 'none' | 'track' | 'queue';

  // Queue management
  queue: QueueItem[];
  queue_position: number; // Current position in queue
  history: QueueItem[]; // Previously played tracks

  // UI state
  player_view: 'mini' | 'full' | 'hidden';
  is_loading: boolean;
  error?: string;

  // Background play
  is_background_supported: boolean;
  is_background_active: boolean;
}

/**
 * Audio session for background play (Media Session API)
 */
export interface AudioSession {
  title: string;
  artist: string; // Company name or itinerary name
  album?: string; // Itinerary name
  artwork?: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
  duration?: number;
  position?: number;
}

// ==============================================
// SEARCH AND FILTERING TYPES
// ==============================================

/**
 * Search filters for content discovery
 */
export interface SearchFilters {
  query?: string;
  company_ids?: string[];
  duration_range?: {
    min?: number; // seconds
    max?: number; // seconds
  };
  location?: {
    center: LatLng;
    radius: number; // meters
  };
  content_type?: Array<'itinerary' | 'track'>;
  sort_by?: 'relevance' | 'distance' | 'duration' | 'created_at' | 'name';
  sort_order?: 'asc' | 'desc';
  favorites_only?: boolean;
  has_location?: boolean; // Only content with POI data
}

/**
 * Search result item (union type)
 */
export type SearchResultItem =
  | {
      type: 'itinerary';
      item: EnhancedAudioItinerary;
      relevance_score?: number;
    }
  | {
      type: 'track';
      item: EnhancedAudioTrack;
      relevance_score?: number;
    };

/**
 * Search results with pagination
 */
export interface SearchResults {
  items: SearchResultItem[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
  query_time_ms?: number;
}

// ==============================================
// UI AND NAVIGATION TYPES
// ==============================================

/**
 * Navigation route parameters
 */
export interface RouteParams {
  itinerary_id?: string;
  track_id?: string;
  company_id?: string;
  search_query?: string;
}

/**
 * Page metadata for SEO and navigation
 */
export interface PageMetadata {
  title: string;
  description?: string;
  image_url?: string;
  canonical_url?: string;
  breadcrumbs?: Array<{
    label: string;
    href: string;
  }>;
}

/**
 * Loading state for async operations
 */
export interface LoadingState {
  is_loading: boolean;
  progress?: number; // 0-100
  message?: string;
  error?: string;
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  page_size: number;
  total_count: number;
  has_more: boolean;
}

// ==============================================
// OFFLINE AND CACHING TYPES
// ==============================================

/**
 * Download status for offline content
 */
export type DownloadStatus = 'not_downloaded' | 'queued' | 'downloading' | 'downloaded' | 'error';

/**
 * Downloadable content item
 */
export interface DownloadableContent {
  id: string;
  type: 'itinerary' | 'track';
  title: string;
  size_bytes: number;
  status: DownloadStatus;
  progress: number; // 0-100
  downloaded_at?: number; // timestamp
  expires_at?: number; // timestamp for cache expiration
  error_message?: string;
}

/**
 * Offline storage statistics
 */
export interface OfflineStorageStats {
  total_size_bytes: number;
  available_space_bytes: number;
  downloaded_items: number;
  cache_size_bytes: number;
  last_cleanup_at: number; // timestamp
}

// ==============================================
// ANALYTICS AND TRACKING TYPES
// ==============================================

/**
 * User interaction tracking
 */
export interface UserInteraction {
  action:
    | 'play'
    | 'pause'
    | 'skip'
    | 'favorite'
    | 'share'
    | 'download'
    | 'search'
    | 'location_view';
  target_type: 'itinerary' | 'track' | 'company' | 'search_result';
  target_id: string;
  context?: {
    page?: string;
    position?: number; // Position in list/queue
    search_query?: string;
    user_location?: LatLng;
  };
  timestamp: number;
}

/**
 * Listening session for analytics
 */
export interface ListeningSession {
  session_id: string;
  track_id: string;
  itinerary_id?: string;
  started_at: number; // timestamp
  ended_at?: number; // timestamp
  total_duration: number; // seconds
  completion_percentage: number; // 0-100
  skip_count: number;
  replay_count: number;
  user_location?: LatLng;
  device_info?: {
    platform: string;
    user_agent: string;
    screen_size: string;
  };
}

// ==============================================
// TYPE GUARDS AND UTILITIES
// ==============================================

/**
 * Type guard for enhanced audio itinerary
 */
export const isEnhancedAudioItinerary = (item: any): item is EnhancedAudioItinerary => {
  return item && typeof item.id === 'string' && typeof item.name === 'string';
};

/**
 * Type guard for enhanced audio track
 */
export const isEnhancedAudioTrack = (item: any): item is EnhancedAudioTrack => {
  return item && typeof item.id === 'string' && typeof item.audio_storage_key === 'string';
};

/**
 * Type guard for search result item
 */
export const isSearchResultItem = (item: any): item is SearchResultItem => {
  return item && item.type && item.item && ['itinerary', 'track'].includes(item.type);
};

// ==============================================
// API RESPONSE TYPES
// ==============================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total_count?: number;
    page?: number;
    page_size?: number;
    query_time_ms?: number;
  };
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T = any> {
  success_count: number;
  error_count: number;
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
}
