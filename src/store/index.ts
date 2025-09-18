import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { audioReducer, authReducer, itinerariesReducer, mapReducer, userPreferencesReducer } from './slices'
import { apiSlice } from './api'


export const store = configureStore({
  reducer: {
    auth: authReducer,
    itineraries: itinerariesReducer,
    audio: audioReducer,
    map: mapReducer,
    userPreferences: userPreferencesReducer,
    // RTK Query API slice
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Setup RTK Query listeners for caching, invalidation, polling, etc.
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch