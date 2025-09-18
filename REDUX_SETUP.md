# Redux Toolkit Setup - Audio Guide PWA

## Overview

Complete Redux Toolkit configuration with RTK Query for state management in the audio guide PWA. This setup includes authentication, itineraries, audio player, map functionality, and user preferences.

## 🏗️ Architecture

### Store Structure

```
src/store/
├── index.ts              # Main store configuration
├── hooks.ts              # Typed Redux hooks
├── ReduxProvider.tsx     # React Provider component
├── api/                  # RTK Query APIs
│   ├── apiSlice.ts      # Base API configuration
│   ├── companiesApi.ts   # Company CRUD operations
│   ├── itinerariesApi.ts # Itinerary and tour management
│   ├── tracksApi.ts     # Audio track operations
│   ├── userFavouritesApi.ts # User favorites
│   ├── userProfilesApi.ts   # User profile management
│   └── index.ts         # API exports
└── slices/              # Redux slices
    ├── authSlice.ts     # Authentication state
    ├── itinerariesSlice.ts # Tours/itineraries discovery
    ├── audioSlice.ts    # Audio player state
    ├── mapSlice.ts      # Map and location state
    ├── userPreferencesSlice.ts # User settings
    └── index.ts         # Slice exports
```

## 🔧 Setup Instructions

### 1. Environment Variables

Create `.env.local` file (use `.env.local.example` as template):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Usage in Components

```typescript
// Import typed hooks
import { useAppDispatch, useAppSelector } from '@/store/hooks'

// Import actions
import { signIn, signOut } from '@/store/slices/authSlice'

// Import API hooks
import { useGetItinerariesQuery } from '@/store/api/itinerariesApi'

function MyComponent() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const { data: itineraries, isLoading } = useGetItinerariesQuery()

  const handleLogin = async () => {
    await dispatch(signIn({ email: 'user@example.com', password: 'password' }))
  }

  return (
    // Your component JSX
  )
}
```

## 📊 State Slices

### 1. Auth Slice (`authSlice.ts`)

**Purpose**: Authentication and user session management

**State**:

- `user`: Current Supabase user
- `session`: Supabase session
- `userProfile`: User profile data
- `isAuthenticated`: Boolean auth status
- `isLoading`: Loading state
- `error`: Error messages

**Key Actions**:

- `signUp()` - Register new user with profile creation
- `signIn()` - Authenticate user
- `signOut()` - Sign out user
- `fetchUserProfile()` - Get user profile data

### 2. Itineraries Slice (`itinerariesSlice.ts`)

**Purpose**: Tour discovery and itinerary management

**State**:

- `featuredItineraries`: Promoted tours
- `nearbyItineraries`: Location-based tours
- `searchResults`: Search results
- `currentItinerary`: Selected tour details
- `currentTracks`: Tracks for current tour
- Search filters and sorting options

**Key Actions**:

- `setSearchQuery()` - Update search term
- `setCurrentItinerary()` - Select tour
- `addCategory()` / `removeCategory()` - Filter management
- `setSortBy()` - Sort options

### 3. Audio Slice (`audioSlice.ts`)

**Purpose**: Audio player state and playback control

**State**:

- `currentTrack`: Currently playing track
- `playlist`: Current playlist
- `isPlaying` / `isPaused`: Playback state
- `currentTime` / `duration`: Progress tracking
- `volume` / `playbackRate`: Audio settings
- `repeatMode` / `shuffleMode`: Playback modes
- Download management

**Key Actions**:

- `play()` / `pause()` / `stop()` - Playback control
- `nextTrack()` / `previousTrack()` - Navigation
- `setVolume()` / `setPlaybackRate()` - Audio settings
- `addDownloadedTrack()` - Offline management

### 4. Map Slice (`mapSlice.ts`)

**Purpose**: Location services and map interaction

**State**:

- `userLocation`: GPS coordinates
- `center` / `zoom`: Map view
- `markers`: Map markers
- `trackPOIs`: Points of interest
- Geofencing and navigation state

**Key Actions**:

- `setUserLocation()` - Update GPS
- `setTrackingLocation()` - Enable/disable tracking
- `centerOnUser()` / `centerOnPOI()` - Map navigation
- `startNavigation()` / `stopNavigation()` - Route planning

### 5. User Preferences Slice (`userPreferencesSlice.ts`)

**Purpose**: App settings and user preferences

**State**:

- App settings (language, theme)
- Audio preferences (quality, auto-play)
- Location settings
- Accessibility options
- Favorites and history
- Onboarding state

**Key Actions**:

- `setLanguage()` / `setTheme()` - App settings
- `addFavouriteItinerary()` / `addFavouriteTrack()` - Favorites
- `completeOnboarding()` - Tutorial progress
- `updatePreferences()` - Bulk updates

## 🌐 RTK Query APIs

### Base Configuration (`apiSlice.ts`)

- Supabase client integration with native API methods
- Uses `fakeBaseQuery()` with custom `queryFn` for each endpoint
- Automatic authentication through Supabase client
- Centralized cache tags for data invalidation
- Error handling and type safety with Supabase types

### API Implementation Approach:

Instead of using REST endpoints directly, all APIs use Supabase's native JavaScript client:

```typescript
// Example: Instead of REST calls
queryFn: async () => {
  try {
    const { data, error } = await supabase.from('audio_itinerary').select(`
        *,
        company(*),
        image_file(*)
      `);

    if (error) throw error;
    return { data: data || [] };
  } catch (error) {
    return { error: { status: 'FETCH_ERROR', error: String(error) } };
  }
};
```

**Benefits of Native Supabase API:**

- ✅ Row Level Security (RLS) automatically enforced
- ✅ Full TypeScript support with generated types
- ✅ Optimized queries with built-in caching
- ✅ Real-time subscriptions ready (if needed)
- ✅ Better error handling and debugging
- ✅ Automatic relation handling

### Available APIs:

1. **Companies API** - Company CRUD operations
2. **Itineraries API** - Tour management with relationships
3. **Tracks API** - Audio track operations with POIs
4. **User Favourites API** - Favorites management
5. **User Profiles API** - Profile CRUD operations

### Example Usage:

```typescript
// Fetch itineraries with company details (using native Supabase API)
const { data: itineraries, isLoading, error } = useGetItinerariesQuery();

// Get nearby tours based on location (using RPC function)
const { data: nearbyTours } = useGetNearbyItinerariesQuery({
  lat: 41.9028,
  lng: 12.4964,
  radius: 5000,
});

// Add to favorites (with proper type safety)
const [addFavourite] = useAddFavouriteMutation();
await addFavourite({
  user_id: user.id,
  favourite_id: itinerary.id,
  type: 'FAVOURITE-ITINERARY', // Fully typed enum
});
```

## 🔒 Type Safety

All slices and APIs are fully typed using:

- Supabase generated types from `supabase-types.ts`
- TypeScript interfaces for state shapes
- Typed Redux hooks (`useAppDispatch`, `useAppSelector`)
- RTK Query generated hooks with proper types

## 🚀 Next Steps

1. **Set up Supabase project** with environment variables
2. **Implement auth flow** using auth slice
3. **Create tour discovery screens** using itineraries slice
4. **Build audio player** using audio slice
5. **Add map integration** using map slice
6. **Implement settings screens** using preferences slice

## 📝 Development Notes

- All slices include loading states and error handling
- RTK Query provides automatic caching and invalidation
- State is designed for offline-first architecture
- Geolocation and audio APIs ready for PWA features
- Accessibility and internationalization support built-in

## 🔄 Data Flow

1. **Authentication**: User signs in → Profile loaded → Preferences synced
2. **Discovery**: Location detected → Nearby tours fetched → User browses
3. **Playback**: Tour selected → Tracks loaded → Audio player activated
4. **Navigation**: POIs loaded → Map centered → Geofencing active
5. **Offline**: Content downloaded → Local state updated → Sync on reconnect
