import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for user preferences
export interface UserPreferencesState {
  language: 'en' | 'it';
  theme: 'light' | 'dark' | 'system';
  audioSettings: {
    playbackSpeed: number; // 0.5 to 2.0
    enableBackgroundPlay: boolean;
    autoPlay: boolean;
    skipSilence: boolean;
  };
  mapSettings: {
    enableLocation: boolean;
    followUserLocation: boolean;
    showTraffic: boolean;
    defaultZoom: number;
  };
  notifications: {
    enablePush: boolean;
    enableLocationAlerts: boolean;
    enableNewContentAlerts: boolean;
  };
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
}

// Initial state
const initialState: UserPreferencesState = {
  language: 'it',
  theme: 'system',
  audioSettings: {
    playbackSpeed: 1.0,
    enableBackgroundPlay: true,
    autoPlay: false,
    skipSilence: false,
  },
  mapSettings: {
    enableLocation: true,
    followUserLocation: true,
    showTraffic: false,
    defaultZoom: 15,
  },
  notifications: {
    enablePush: true,
    enableLocationAlerts: true,
    enableNewContentAlerts: true,
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    largeText: false,
  },
};

// User preferences slice
export const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    // Language settings
    setLanguage: (state, action: PayloadAction<'en' | 'it'>) => {
      state.language = action.payload;
    },

    // Theme settings
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },

    // Audio settings
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.audioSettings.playbackSpeed = Math.max(0.5, Math.min(2.0, action.payload));
    },
    setEnableBackgroundPlay: (state, action: PayloadAction<boolean>) => {
      state.audioSettings.enableBackgroundPlay = action.payload;
    },
    setAutoPlay: (state, action: PayloadAction<boolean>) => {
      state.audioSettings.autoPlay = action.payload;
    },
    setSkipSilence: (state, action: PayloadAction<boolean>) => {
      state.audioSettings.skipSilence = action.payload;
    },
    updateAudioSettings: (
      state,
      action: PayloadAction<Partial<UserPreferencesState['audioSettings']>>,
    ) => {
      state.audioSettings = { ...state.audioSettings, ...action.payload };
    },

    // Map settings
    setEnableLocation: (state, action: PayloadAction<boolean>) => {
      state.mapSettings.enableLocation = action.payload;
    },
    setFollowUserLocation: (state, action: PayloadAction<boolean>) => {
      state.mapSettings.followUserLocation = action.payload;
    },
    setShowTraffic: (state, action: PayloadAction<boolean>) => {
      state.mapSettings.showTraffic = action.payload;
    },
    setDefaultZoom: (state, action: PayloadAction<number>) => {
      state.mapSettings.defaultZoom = Math.max(1, Math.min(20, action.payload));
    },
    updateMapSettings: (
      state,
      action: PayloadAction<Partial<UserPreferencesState['mapSettings']>>,
    ) => {
      state.mapSettings = { ...state.mapSettings, ...action.payload };
    },

    // Notification settings
    setEnablePush: (state, action: PayloadAction<boolean>) => {
      state.notifications.enablePush = action.payload;
    },
    setEnableLocationAlerts: (state, action: PayloadAction<boolean>) => {
      state.notifications.enableLocationAlerts = action.payload;
    },
    setEnableNewContentAlerts: (state, action: PayloadAction<boolean>) => {
      state.notifications.enableNewContentAlerts = action.payload;
    },
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<UserPreferencesState['notifications']>>,
    ) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },

    // Accessibility settings
    setReduceMotion: (state, action: PayloadAction<boolean>) => {
      state.accessibility.reduceMotion = action.payload;
    },
    setHighContrast: (state, action: PayloadAction<boolean>) => {
      state.accessibility.highContrast = action.payload;
    },
    setLargeText: (state, action: PayloadAction<boolean>) => {
      state.accessibility.largeText = action.payload;
    },
    updateAccessibilitySettings: (
      state,
      action: PayloadAction<Partial<UserPreferencesState['accessibility']>>,
    ) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },

    // Reset all preferences
    resetPreferences: () => initialState,
  },
});

// Export actions
export const {
  setLanguage,
  setTheme,
  setPlaybackSpeed,
  setEnableBackgroundPlay,
  setAutoPlay,
  setSkipSilence,
  updateAudioSettings,
  setEnableLocation,
  setFollowUserLocation,
  setShowTraffic,
  setDefaultZoom,
  updateMapSettings,
  setEnablePush,
  setEnableLocationAlerts,
  setEnableNewContentAlerts,
  updateNotificationSettings,
  setReduceMotion,
  setHighContrast,
  setLargeText,
  updateAccessibilitySettings,
  resetPreferences,
} = userPreferencesSlice.actions;

// Selectors
export const selectLanguage = (state: { userPreferences: UserPreferencesState }) =>
  state.userPreferences.language;
export const selectTheme = (state: { userPreferences: UserPreferencesState }) =>
  state.userPreferences.theme;
export const selectAudioSettings = (state: { userPreferences: UserPreferencesState }) =>
  state.userPreferences.audioSettings;
export const selectMapSettings = (state: { userPreferences: UserPreferencesState }) =>
  state.userPreferences.mapSettings;
export const selectNotificationSettings = (state: { userPreferences: UserPreferencesState }) =>
  state.userPreferences.notifications;
export const selectAccessibilitySettings = (state: { userPreferences: UserPreferencesState }) =>
  state.userPreferences.accessibility;

export default userPreferencesSlice.reducer;
