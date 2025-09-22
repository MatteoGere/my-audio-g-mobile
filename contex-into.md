# Audio Guide App - Project Context Information

## 📋 Project Overview

**Project Type**: Audio Guide Progressive Web Application  
**Target Platform**: Web-based application (mobile-first, responsive design)  
**Primary User**: End consumers accessing audio tours and itineraries  
**Main Purpose**: Allow users to discover, play, and navigate audio-guided tours with interactive maps

## 🏗️ Technical Architecture

### Core Technologies

- **Framework**: Next.js 15.x with App Router
- **Language**: TypeScript (strict type checking required)
- **State Management**: Redux Toolkit (RTK) + RTK Query for API calls
- **Backend/Database**: Supabase + supabase client ts
- **Styling**: Tailwind CSS + react-icons
- **Maps**: Leaflet with OpenStreetMap tiles
- **Audio**: Web Audio API + Media Session API

### Key Technical Constraints

- **User-only app**: No company admin features, only end-user functionality
- **NO testing framework**: Focus only on implementation code

## 🗄️ Database Schema (Supabase)

### Core Tables

```typescript
// Main content structure
audio_itinerary: {
  id: string;
  name: string;
  description: string;
  company_id: string; // FK to company
  image_file_id: string | null; // FK to image_file
  total_duration: number; // in seconds
  created_at: string;
}

audio_track: {
  id: string;
  name: string | null;
  description: string | null;
  audio_itinerary_id: string; // FK to audio_itinerary
  audio_itinerary_order: number; // sequence in itinerary
  audio_storage_key: string; // Supabase Storage reference
  duration: number; // in seconds
  track_object_id: string; // unique identifier
  image_file_id: string | null; // FK to image_file
  created_at: string;
}

audio_track_poi: {
  audio_track_id: string; // FK to audio_track (one-to-one)
  latitude: number;
  longitude: number;
  location: unknown; // PostGIS geometry
  created_at: string;
}

// User management
user_profile: {
  id: string; // matches Supabase Auth user ID
  name: string;
  surname: string;
  role: 'ADMIN' | 'USER' | 'COMPANY-USER';
  address: Json | null;
  created_at: string;
}

user_favourite: {
  id: number;
  user_id: string;
  favourite_id: string; // itinerary or track ID
  type: 'FAVOURITE-TRACK' | 'FAVOURITE-ITINERARY';
  created_at: string;
}

// Content organization
company: {
  id: string;
  name: string;
  description: string | null;
  image_file_id: string | null;
  created_at: string;
}

image_file: {
  id: string;
  image_storage_key: string; // Supabase Storage reference
  image_type: 'COMPANY-PROFILE' | 'ITINERARY' | 'TRACK';
  object_id: string; // references the object this image belongs to
  created_at: string;
}
```

### Key Database Functions

```typescript
fn_nearby_audio_itineraries(user_lat: number, user_lng: number, radius_meters?: number)
// Returns itineraries with POI locations near user's coordinates
// Includes: distance calculations, POI count, track count, company info
```

## 🔐 Signed URL Management System

### Purpose

All media files (audio tracks, images) are stored in Supabase Storage with private access. The app uses a sophisticated signed URL caching system to provide secure, temporary access while minimizing API calls and improving performance.

### Architecture Overview

```
Component → Hook → Redux Cache → RTK Query → Backend API → Supabase Storage
                ↓
            localStorage (persistence)
```

### Redux Store Structure

```typescript
// Additional slices for signed URL management
audioTrack: {
  signedUrls: Record<string, SignedUrlEntry>; // key: path
}

storage: {
  signedUrls: Record<string, StorageSignedUrlEntry>; // key: ${bucket}:${path}
}

// Entry structures
SignedUrlEntry: {
  url: string;
  expiresAt: number; // millisecond timestamp
}

StorageSignedUrlEntry: {
  url: string;
  expiresAt: number;
  bucket: 'audio-files' | 'image-files';
}
```

Use Supabase client to interact with storage:

### Custom Hooks

```typescript
// Single URL hooks
useSignedAudioUrl(path: string, expiresIn?: number)
useSignedUrl(path: string, bucket: 'audio-files' | 'image-files', expiresIn?: number)

// Batch URL hooks
useSignedAudioUrls(paths: string[], expiresIn?: number)
useSignedUrls(paths: string[], bucket: string, expiresIn?: number)

// All hooks return:
{
  signedUrl: string | undefined;
  isLoading: boolean;
  error: any;
  refreshUrl: () => void; // force cache invalidation
}
```

### Persistence Strategy

- **localStorage Keys**:
  - `'app:signedUrls:storage'`: For all storage URLs with bucket information
  - `'app:signedUrls:audio'`: For audio-only URLs (legacy compatibility)
- **Middleware**: `signedUrlPersistenceMiddleware`
  - Debounced writes (250ms) to batch multiple updates
  - Filters expired entries before saving
  - Clears all cached URLs on user logout
- **Hydration**: `hydrateSignedUrlCaches(store)` on app startup
  - Restores valid (non-expired) URLs from localStorage
  - Skipped during SSR

### Cache Management

- **Expiration Logic**:
  - Default: 3600 seconds (1 hour) for audio files
  - URLs with < 5 minutes remaining are considered "near expiry" and trigger refetch
  - Automatic cleanup every 5 minutes via setInterval in hooks
- **Cache Keys**:
  - Storage: `${bucket}:${path}` (e.g., 'image-files:images/123/cover.jpg')
  - Audio: plain `path` for legacy compatibility
- **Invalidation**:
  - Manual via `refreshUrl()` method
  - Automatic on expiration
  - Complete clear on logout

### Error Handling

- **Network failures**: Hooks return `isError: true`
- **Expired URLs**: Automatic refetch when cache entry expires
- **Storage quota**: localStorage writes wrapped in try/catch, app continues with memory-only cache
- **Clock skew**: Consider implementing safety margin for expiration checks

### Implementation Priority

1. Redux slices with cache management methods
2. Persistence middleware with debounced localStorage writes
3. Custom hooks with automatic cache validation
4. Backend API endpoints for signed URL generation
5. Integration with existing components (ImageManager, AudioPlayer)

### Usage Examples

```typescript
// In components
const { signedUrl, isLoading } = useSignedAudioUrl('audio/track-123.mp3');
const { signedUrls } = useSignedUrls(['img1.jpg', 'img2.jpg'], 'image-files');

// Cache operations
dispatch(setSignedUrl({ path, url, expiresIn: 3600 }));
dispatch(removeSignedUrl({ path, bucket: 'image-files' }));
dispatch(clearExpiredUrls());

## 🎯 Core Features Requirements

### User Authentication (Supabase Auth)
- Email/password authentication
- User profile management (name, surname, address)
- Guest mode support
- Session management with automatic token refresh

### Audio System
- Web Audio API for playback control
- Support for background audio (Media Session API)
- Mini player (persistent bottom bar) + Full player page
- Playlist management and queue system
- Progress tracking and resume functionality
- Speed controls (0.5x to 2x)

### Map Integration (Leaflet)
- Interactive maps showing POI locations for each track
- Custom markers for different track types
- Current location tracking with GPS
- Route visualization between POIs
- Location-based recommendations using fn_nearby_audio_itineraries

### Content Discovery
- Search functionality across itineraries and tracks
- Filter by company, duration, location, distance
- Featured/recommended itineraries
- Location-based content suggestions
- Favorites system for itineraries and tracks

## 🎨 UI/UX Requirements

### Design Principles
- **Mobile-first**: All components designed for mobile, then responsive for desktop
- **Modern aesthetics**: Contemporary design with smooth animations
- **Accessibility**: WCAG 2.1 compliance, screen reader support
- **Performance**: Lazy loading, optimized images, smooth scrolling

## 🚀 Implementation Priority

### Phase 1: Foundation
1. Next.js 15 setup with App Router
2. Redux Toolkit configuration
3. Supabase client setup and authentication
4. Basic routing and layouts

### Phase 2: Core Features
1. Home page with search and featured content
2. Itinerary listing and detail pages
3. Basic audio player implementation
4. User profile and favorites

### Phase 3: Advanced Features
1. Interactive maps with Leaflet
2. Location-based recommendations
3. Advanced search and filtering
4. Performance optimization

## 🔍 Key Implementation Notes

### Audio Handling
- Use Supabase Storage URLs for audio files (audio_storage_key field)
- Implement progressive loading for large audio files
- Handle audio format compatibility across browsers
- Provide fallbacks for unsupported audio formats

### Map Integration
- POI data comes from audio_track_poi table (latitude/longitude)
- Each audio track can have one associated POI location
- Use clustering for dense POI areas
- Implement smooth animations for marker interactions

### Data Fetching Strategy
- Use RTK Query for all Supabase API calls
- Implement proper error handling and loading states
- Cache frequently accessed data (itineraries, user preferences)
- Handle real-time updates for user favorites

### Performance Considerations
- Lazy load images and audio content
- Use Next.js Image component for optimization
- Implement virtual scrolling for long lists
- Minimize bundle size with dynamic imports

## 🎨 UI Component Libraries
- **Icons**: Lucide React (available in environment)

- **Styling**: Tailwind CSS utility classes only


## 🔒 Security & Privacy
- Row Level Security (RLS) policies in Supabase for user data
- User data isolation (users can only access their own favorites/profile)
- Secure audio and image file access through Supabase Storage
- No sensitive data stored in browser storage

## 📝 Development Guidelines

### Code Style
- Strict TypeScript with proper type definitions
- Functional components with hooks
- Custom hooks for reusable logic
- Proper error boundaries for graceful failures

### State Management
- Use Redux for global state (user, audio, maps)
- Use React state for local component state
- RTK Query for all API operations
- Normalized data structure in Redux store
```
