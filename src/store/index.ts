import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { supabaseApi } from './api/supabaseApi';
import authReducer from './slices/authSlice';
import userProfileReducer from './slices/userProfileSlice';
import signedUrlCacheReducer from './slices/signedUrlCacheSlice';
import audioPlayerReducer from './slices/audioPlayerSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    // API slice
    [supabaseApi.reducerPath]: supabaseApi.reducer,

    // Feature slices
    auth: authReducer,
    userProfile: userProfileReducer,
    signedUrlCache: signedUrlCacheReducer,
    audioPlayer: audioPlayerReducer,
    location: locationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['signedUrlCache.urls'],
      },
    }).concat(supabaseApi.middleware),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Inferred type: {auth: AuthState, userProfile: UserProfileState, ...}
export type AppStore = typeof store;
