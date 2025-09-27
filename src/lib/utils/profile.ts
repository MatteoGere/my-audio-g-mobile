import type { Json } from '@/types/supabase-types';
import type { UserPreferencesState } from '@/lib/redux/slices/userPreferencesSlice';

export interface ProfileAddress {
  street?: string;
  line2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

export interface SerializedUserPreferences {
  language: UserPreferencesState['language'];
  theme: UserPreferencesState['theme'];
  audio_settings: {
    playback_speed: number;
    enable_background_play: boolean;
    auto_play: boolean;
    skip_silence: boolean;
    quality: UserPreferencesState['audioSettings']['quality'];
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
  privacy: {
    share_listening_history: boolean;
    personalized_recommendations: boolean;
    location_based_suggestions: boolean;
  };
}

export interface ParsedProfileSettings {
  address: ProfileAddress;
  preferences: SerializedUserPreferences | null;
}

const isRecord = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseAddressFromRecord = (record: Record<string, any>): ProfileAddress => {
  const source = isRecord(record.address) ? record.address : record;

  return {
    street: typeof source.street === 'string' ? source.street : '',
    line2: typeof source.line2 === 'string' ? source.line2 : '',
    city: typeof source.city === 'string' ? source.city : '',
    province: typeof source.province === 'string' ? source.province : '',
    postalCode: typeof source.postalCode === 'string' ? source.postalCode : '',
    country: typeof source.country === 'string' ? source.country : '',
  };
};

const parsePreferencesFromRecord = (
  record: Record<string, any>,
): SerializedUserPreferences | null => {
  const source = isRecord(record.preferences) ? record.preferences : null;

  if (!source) {
    return null;
  }

  return {
    language: source.language === 'en' ? 'en' : 'it',
    theme: ['light', 'dark', 'system'].includes(source.theme)
      ? (source.theme as SerializedUserPreferences['theme'])
      : 'system',
    audio_settings: {
      playback_speed:
        typeof source.audio_settings?.playback_speed === 'number'
          ? source.audio_settings.playback_speed
          : 1,
      enable_background_play: !!source.audio_settings?.enable_background_play,
      auto_play: !!source.audio_settings?.auto_play,
      skip_silence: !!source.audio_settings?.skip_silence,
      quality: ['standard', 'high', 'data-saver'].includes(source.audio_settings?.quality)
        ? (source.audio_settings.quality as SerializedUserPreferences['audio_settings']['quality'])
        : 'standard',
    },
    map_settings: {
      enable_location: source.map_settings?.enable_location !== false,
      follow_user_location: source.map_settings?.follow_user_location !== false,
      show_traffic: !!source.map_settings?.show_traffic,
      default_zoom:
        typeof source.map_settings?.default_zoom === 'number'
          ? source.map_settings.default_zoom
          : 15,
    },
    notifications: {
      enable_push: source.notifications?.enable_push !== false,
      enable_location_alerts: source.notifications?.enable_location_alerts !== false,
      enable_new_content_alerts: source.notifications?.enable_new_content_alerts !== false,
    },
    accessibility: {
      reduce_motion: !!source.accessibility?.reduce_motion,
      high_contrast: !!source.accessibility?.high_contrast,
      large_text: !!source.accessibility?.large_text,
    },
    privacy: {
      share_listening_history: source.privacy?.share_listening_history !== false,
      personalized_recommendations: source.privacy?.personalized_recommendations !== false,
      location_based_suggestions: source.privacy?.location_based_suggestions !== false,
    },
  };
};

export const parseProfileSettings = (addressJson: Json | null): ParsedProfileSettings => {
  if (!isRecord(addressJson)) {
    return {
      address: {
        street: '',
        line2: '',
        city: '',
        province: '',
        postalCode: '',
        country: '',
      },
      preferences: null,
    };
  }

  return {
    address: parseAddressFromRecord(addressJson),
    preferences: parsePreferencesFromRecord(addressJson),
  };
};

export const serializePreferences = (
  preferences: UserPreferencesState,
): SerializedUserPreferences => ({
  language: preferences.language,
  theme: preferences.theme,
  audio_settings: {
    playback_speed: preferences.audioSettings.playbackSpeed,
    enable_background_play: preferences.audioSettings.enableBackgroundPlay,
    auto_play: preferences.audioSettings.autoPlay,
    skip_silence: preferences.audioSettings.skipSilence,
    quality: preferences.audioSettings.quality,
  },
  map_settings: {
    enable_location: preferences.mapSettings.enableLocation,
    follow_user_location: preferences.mapSettings.followUserLocation,
    show_traffic: preferences.mapSettings.showTraffic,
    default_zoom: preferences.mapSettings.defaultZoom,
  },
  notifications: {
    enable_push: preferences.notifications.enablePush,
    enable_location_alerts: preferences.notifications.enableLocationAlerts,
    enable_new_content_alerts: preferences.notifications.enableNewContentAlerts,
  },
  accessibility: {
    reduce_motion: preferences.accessibility.reduceMotion,
    high_contrast: preferences.accessibility.highContrast,
    large_text: preferences.accessibility.largeText,
  },
  privacy: {
    share_listening_history: preferences.privacy.shareListeningHistory,
    personalized_recommendations: preferences.privacy.personalizedRecommendations,
    location_based_suggestions: preferences.privacy.locationBasedSuggestions,
  },
});

export const mergePreferencesState = (
  current: UserPreferencesState,
  serialized: SerializedUserPreferences | null,
): UserPreferencesState => {
  if (!serialized) {
    return current;
  }

  return {
    ...current,
    language: serialized.language,
    theme: serialized.theme,
    audioSettings: {
      ...current.audioSettings,
      playbackSpeed: serialized.audio_settings.playback_speed,
      enableBackgroundPlay: serialized.audio_settings.enable_background_play,
      autoPlay: serialized.audio_settings.auto_play,
      skipSilence: serialized.audio_settings.skip_silence,
      quality: serialized.audio_settings.quality,
    },
    mapSettings: {
      ...current.mapSettings,
      enableLocation: serialized.map_settings.enable_location,
      followUserLocation: serialized.map_settings.follow_user_location,
      showTraffic: serialized.map_settings.show_traffic,
      defaultZoom: serialized.map_settings.default_zoom,
    },
    notifications: {
      ...current.notifications,
      enablePush: serialized.notifications.enable_push,
      enableLocationAlerts: serialized.notifications.enable_location_alerts,
      enableNewContentAlerts: serialized.notifications.enable_new_content_alerts,
    },
    accessibility: {
      ...current.accessibility,
      reduceMotion: serialized.accessibility.reduce_motion,
      highContrast: serialized.accessibility.high_contrast,
      largeText: serialized.accessibility.large_text,
    },
    privacy: {
      ...current.privacy,
      shareListeningHistory: serialized.privacy.share_listening_history,
      personalizedRecommendations: serialized.privacy.personalized_recommendations,
      locationBasedSuggestions: serialized.privacy.location_based_suggestions,
    },
  };
};

export const buildAddressPayload = (
  address: ProfileAddress,
  serializedPreferences: SerializedUserPreferences | null,
): Json => {
  const payload: Record<string, any> = {
    street: address.street || '',
    line2: address.line2 || '',
    city: address.city || '',
    province: address.province || '',
    postalCode: address.postalCode || '',
    country: address.country || '',
  };

  if (serializedPreferences) {
    payload.preferences = serializedPreferences;
  }

  return payload as Json;
};
