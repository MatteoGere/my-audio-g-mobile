import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { authSlice } from './slices/authSlice';
import { itinerariesSlice } from './slices/itinerariesSlice';
import { audioSlice } from './slices/audioSlice';
import { mapSlice } from './slices/mapSlice';
import { userPreferencesSlice } from './slices/userPreferencesSlice';
import { favoritesSlice } from './slices/favoritesSlice';
import { storageSlice } from './slices/storageSlice';
import { audioTrackSlice } from './slices/audioTrackSlice';
import { apiSlice } from './api/apiSlice';
import { signedUrlPersistenceMiddleware } from './middleware/signedUrlPersistenceMiddleware';

// Root reducer combining all slices
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  itineraries: itinerariesSlice.reducer,
  audio: audioSlice.reducer,
  map: mapSlice.reducer,
  userPreferences: userPreferencesSlice.reducer,
  favorites: favoritesSlice.reducer,
  storage: storageSlice.reducer,
  audioTrack: audioTrackSlice.reducer,
  api: apiSlice.reducer,
});

// Store configuration
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    })
      .concat(apiSlice.middleware)
      .concat(signedUrlPersistenceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

