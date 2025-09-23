# Audio Guide App - Complete Development Roadmap

## 🏗️ PHASE 1: Infrastructure Setup & State Management

### 1.1 Redux Toolkit Configuration

- [ ] Setup Redux store with RTK configuration
- [ ] Configure RTK Query for API calls with Supabase integration
- [ ] Define core slices:
  - **authSlice**: User authentication state, login/logout actions, session management
  - **itinerariesSlice**: Audio itineraries data, loading states, search filters
  - **audioSlice**: Audio player state, current track, playback progress, playlist queue
  - **mapSlice**: Map state, current location, selected POI, zoom level, markers
  - **userPreferencesSlice**: Settings, language, theme, audio preferences
  - **favoritesSlice**: User favorites for itineraries and tracks

### 1.2 Supabase Integration & API Layer

- [ ] Setup Supabase client with environment variables
- [ ] Implement RTK Query API endpoints:
  - **Itineraries API**: R operations for audio_itinerary table
  - **Audio Tracks API**: Fetch tracks by itinerary_id, handle audio_track table
  - **POI API**: Get track locations from audio_track_poi table
  - **User Profile API**: Manage user_profile data
  - **Favorites API**: Handle user_favourite table operations
  - **Nearby Itineraries API**: Use fn_nearby_audio_itineraries function
  - **Companies API**: Fetch company data and associated itineraries
  - **Signed URLs API**: Backend endpoints for generating signed URLs from Supabase Storage
- [ ] Implement authentication hooks with Supabase Auth
- [ ] Setup error handling and loading states for all API calls

### 1.3 Signed URL Management System

- [ ] **Redux Slices for Signed URL Caching**:
  - **audioTrack.signedUrls**: Cache audio file signed URLs with expiration
  - **storage.signedUrls**: Cache all storage signed URLs (audio + images) with bucket prefixing
  - Methods: `setSignedUrl`, `removeSignedUrl`, `clearExpiredUrls`, `hydrateSignedUrls`
- [ ] **Persistence Middleware Implementation**:
  - Create `signedUrlPersistenceMiddleware` with 250ms debounced localStorage writes
  - Save two keys: `'app:signedUrls:storage'` and `'app:signedUrls:audio'`
  - Filter expired entries before persistence (expiresAt > Date.now())
  - Handle logout cleanup: remove localStorage keys and dispatch clearAll actions
- [ ] **Cache Hydration System**:
  - `hydrateSignedUrlCaches(store)` function to restore cache from localStorage on app start
  - Parse JSON safely, filter non-expired entries only
  - Separate hydration for storage (with bucket field) and audio-only entries
  - Skip hydration in SSR environments
- [ ] **Custom Hooks for Signed URLs**:
  - `useSignedAudioUrl(path, expiresIn?)`: Single audio file URL with caching
  - `useSignedAudioUrls(paths[], expiresIn?)`: Batch audio URLs fetching
  - `useSignedUrl(path, bucket, expiresIn?)`: Generic storage URL (images + audio)
  - `useSignedUrls(paths[], bucket, expiresIn?)`: Batch generic URLs
  - Auto-cleanup expired URLs every 5 minutes with setInterval
  - Skip RTK Query fetch if cache is valid (expiresAt > Date.now())
  - `refreshUrl()` method to force cache invalidation and refetch
- [ ] **URL Cache Key Strategy**:
  - Storage cache keys: `${bucket}:${path}` format (e.g., 'image-files:images/foo.jpg')
  - Audio cache keys: plain `path` for legacy compatibility
  - Avoid key collisions between different buckets
- [ ] **Expiration & Validation Logic**:
  - Default expiration: 3600 seconds (1 hour) for audio files
  - Store `expiresAt` as millisecond timestamp (Date.now() + expiresIn \* 1000)
  - Consider URLs near expiration (< 5 minutes remaining) as invalid for refetch
  - Safety margin for clock skew protection

### 1.3 Database Schema Understanding & Types

- [ ] Define custom TypeScript interfaces for:
  - Enhanced itinerary objects with related data
  - Audio track with POI information
  - User profile with preferences
  - Map marker types and POI data
  - Audio player state interfaces

## 🎨 PHASE 2: Next.js 15 Setup & Routing

### 2.1 Next.js App Router Structure

/app
├── layout.tsx (root layout with Redux provider, auth wrapper)
├── page.tsx (home page)
├── (auth)
│ ├── layout.tsx (auth-specific layout)
│ ├── login
│ │ └── page.tsx
│ └── register
│ └── page.tsx
├── (main)
│ ├── layout.tsx (main app layout with navigation)
│ ├── search
│ │ └── page.tsx
│ ├── itinerary
│ │ └── [id]
│ │ ├── page.tsx (detail page)
│ │ └── play
│ │ └── page.tsx (audio player)
│ ├── map
│ │ ├── page.tsx (full-screen map)
│ │ └── [itineraryId]
│ │ └── page.tsx (itinerary-specific map)
│ ├── favorites
│ │ └── page.tsx
│ └── profile
│ └── page.tsx
└── api
├── signed-url
│ └── route.ts
└── signed-urls
└── route.ts

### 2.2 Layout Components Architecture

RootLayout: Redux provider, global styles, authentication wrapper
MainLayout: Navigation header, bottom navigation, footer
AuthLayout: Clean layout for login/register pages
PlayerLayout: Layout with persistent mini-player at bottom
MapLayout: Fullscreen layout for map interactions

### 2.3 Navigation System Implementation

- [ ] **Header Component**:
  - Dynamic title based on current page
  - Back navigation button
  - Search trigger button
  - User avatar/login button
- [ ] **Bottom Navigation**:
  - Home, Search, Map, Favorites, Profile tabs
  - Active state indicators
  - Badge notifications for new content
- [ ] **Navigation Guards**:
  - Protected routes for authenticated users
  - Redirect logic for unauthenticated access

## 📱 PHASE 3: Core Pages Development

### 3.1 Authentication Flow

- [ ] **Login Page**:
  - Email/password form with validation
  - Social login options (Google, if available)
  - Guest mode option
  - Forgot password functionality
- [ ] **Registration Page**:
  - User profile creation form
  - Name, surname, address fields
  - Email verification flow
  - Terms and conditions acceptance
- [ ] **Authentication Logic**:
  - Session management with Supabase Auth
  - Auto-login on app startup
  - Logout functionality
  - Profile update capabilities

### 3.2 Home Page Implementation

- [ ] **Search Bar Component**:
  - Real-time search suggestions
  - Search history
  - Filter shortcuts (by duration, type, distance)
- [ ] **Featured Itineraries Section**:
  - Carousel of popular/recommended itineraries
  - Auto-scroll with manual controls
  - Preview cards with image, title, duration, rating
- [ ] **Location-Based Recommendations**:
  - Use fn_nearby_audio_itineraries function
  - Current location detection
  - Distance-based sorting
  - "Near you" section
- [ ] **Categories Grid**:
  - Filter by company or content type
  - Visual category cards
  - Quick navigation to filtered results

### 3.3 Search & Discovery Page

- [ ] **Search Interface**:
  - Advanced search filters (duration, company, location)
  - Sort options (newest, popular, nearest, duration)
  - Search results with infinite scroll
  - Empty state handling
- [ ] **Filter System**:
  - Company filter using company table
  - Duration range slider
  - Distance from current location
  - Clear all filters option
- [ ] **Results Display**:
  - Grid/list view toggle
  - Itinerary cards with key information
  - Lazy loading for performance
  - Favorites toggle on each card

### 3.4 Itinerary Detail Page

- [ ] **Hero Section**:
  - Full-width header image from image_file table
  - Itinerary title, description, total duration
  - Company information and branding
  - Favorite button and share options
- [ ] **Interactive Map Preview**:
  - Leaflet map showing all POI markers
  - Track route visualization
  - Zoom controls and full-screen option
  - Current location indicator
- [ ] **Audio Tracks List**:
  - Sequential list of all tracks in itinerary
  - Track name, description, duration
  - Individual play buttons
  - Download progress indicators
  - POI information for each track
- [ ] **Metadata Section**:
  - Total duration calculation
  - Number of tracks
  - Company details
  - Creation date and last update

## 🎵 PHASE 4: Audio System Implementation

### 4.1 Audio Player Core Logic

- [ ] **Web Audio API Integration**:
  - Audio context management
  - Support for various audio formats
  - Volume control and fade effects
  - Audio preloading for smooth playback
- [ ] **Playback State Management**:
  - Current track, position, duration
  - Play/pause/stop controls
  - Next/previous track navigation
  - Shuffle and repeat modes
- [ ] **Background Audio Support**:
  - Service Worker for background playback
  - Media Session API integration
  - Lock screen controls
  - Notification controls

### 4.2 Player UI Components

- [ ] **Mini Player** (Persistent Bottom Bar):
  - Current track info (title, duration)
  - Play/pause button
  - Progress bar with seek capability
  - Expand to full player button
- [ ] **Full Player Page**:
  - Large album art/track image
  - Complete track information
  - Full playback controls (play, pause, skip, previous)
  - Progress bar with time stamps
  - Volume control
  - Speed adjustment (0.5x to 2x)
  - Sleep timer functionality
- [ ] **Playlist Controls**:
  - Queue management
  - Track reordering
  - Add/remove tracks from queue
  - Current itinerary context

### 4.3 Audio Progress & Synchronization

- [ ] **Progress Tracking**:
  - Real-time progress updates in Redux store(Attention to handle carrefully in order to avoid component re-renders and performance issues)
  - Resume functionality from last position
  - Mark tracks as completed
  - Overall itinerary progress calculation
- [ ] **Database Synchronization**:
  - Save listening progress to user profile
  - Track completion status
  - Listening history

## 🗺️ PHASE 5: Map Integration with Leaflet

### 5.1 Leaflet Map Setup

- [ ] **Map Configuration**:
  - OpenStreetMap or custom tile layer
  - Responsive map container
  - Initial view based on user location
  - Zoom controls and attribution
- [ ] **Custom Markers Implementation**:
  - POI markers for each audio track
  - Custom marker icons for different track types
  - Marker clustering for dense areas
  - Interactive marker popups
- [ ] **Map Interactions**:
  - Click handlers for POI selection
  - Marker animations and highlights
  - Route visualization between POIs
  - Current location tracking with GPS

### 5.2 Map Features

- [ ] **POI Display System**:
  - Load POI data from audio_track_poi table
  - Display track information in marker popups
  - Play button in popup to start specific track
  - Connection lines between sequential tracks
- [ ] **Location Services**:
  - GPS tracking during tour
  - Location-based auto-suggestions
  - Geofencing for location-based notifications
  - Distance calculations to POIs
- [ ] **Map Modes**:
  - Standard map view
  - Satellite/terrain view options
  - Dark mode support
  - Fullscreen map functionality

### 5.3 Map-Audio Integration

- [ ] **Location-Based Audio**:
  - Proximity detection to POIs
  - Auto-play suggestions when near locations
  - Location history tracking
  - "Near this location" audio recommendations
- [ ] **Visual Route Planning**:
  - Display optimal route between POIs
  - Walking/driving directions
  - Estimated time between locations
  - Waypoint management

## 👤 PHASE 6: User Management & Personalization

### 6.1 User Profile Management

- [ ] **Profile Page**:
  - Display user information from user_profile table
  - Edit name, surname, address fields
  - Profile picture upload (if supported)
  - Account settings and preferences
- [ ] **User Preferences**:
  - Language selection
  - Audio quality preferences
  - Notification settings
  - Privacy controls
- [ ] **Account Management**:
  - Password change functionality
  - Email update with verification
  - Account deletion option
  - Data export functionality

### 6.2 Favorites System

- [ ] **Favorites Management**:
  - Add/remove favorites using user_favourite table
  - Support for both FAVOURITE-TRACK and FAVOURITE-ITINERARY types
  - Favorites page with organized display
  - Quick access to favorite content
- [ ] **Favorites UI**:
  - Heart/star icons throughout the app
  - Animated favorite toggle
  - Favorites counter and statistics
  - Organize favorites by categories

### 6.3 User History & Analytics

- [ ] **Listening History**:
  - Track playback history
  - Completed itineraries list
  - Time spent listening statistics
  - Recently played content
- [ ] **Progress Tracking**:
  - Individual track completion
  - Itinerary completion percentages
  - Achievement badges for milestones
  - Listening streaks and statistics

## 🔧 PHASE 7: Advanced Features

### 7.1 Search & Discovery Enhancement

- [ ] **Advanced Search**:
  - Full-text search across itineraries and tracks
  - Search by company, location, duration
  - Voice search integration
  - Search history and suggestions
- [ ] **Recommendation Engine**:
  - Based on listening history
  - Similar itineraries suggestions
  - Company-based recommendations
  - Location-based suggestions

### 7.2 Social Features

- [ ] **User Interactions**:
  - Rate itineraries and tracks
  - Write reviews and comments
  - Share itineraries on social media
  - User-generated content support
- [ ] **Community Features**:
  - Public user profiles (optional)
  - Follow other users
  - Share listening achievements
  - Community challenges

### 7.3 Company Integration

- [ ] **Company Profiles**:
  - Display company information from company table
  - Company-specific branding
  - All itineraries by company
  - Company contact information
- [ ] **Multi-tenant Support**:
  - Company-specific user roles from user_company_role table
  - Company-admin functionality
  - Content moderation tools
  - Analytics for company admins

## ⚡ PHASE 8: Performance & Optimization

### 8.1 Performance Optimization

- [ ] **Image Optimization**:
  - Next.js Image component implementation
  - Lazy loading for all images
  - WebP format conversion
  - Responsive image sizing
- [ ] **Audio Optimization**:
  - Audio compression and format optimization
  - Streaming vs. full download strategies
  - Memory management for audio buffers
  - Background loading optimization
- [ ] **Code Optimization**:
  - Bundle splitting and lazy loading
  - Component code splitting
  - Dynamic imports for heavy components
  - Tree shaking for unused code

### 8.2 Data Management

- [ ] **State Optimization**:
  - Memoization for expensive computations
  - Selective Redux state updates
  - Normalized state structure
  - Efficient data fetching strategies
- [ ] **Database Optimization**:
  - Efficient Supabase queries
  - Data pagination implementation
  - Index optimization strategies
  - Query result caching

### 8.3 User Experience Enhancement

- [ ] **Loading States**:
  - Skeleton screens for all loading states
  - Progressive loading indicators
  - Error boundaries for graceful failures
  - Retry mechanisms for failed requests
- [ ] **Accessibility Features**:
  - WCAG 2.1 compliance
  - Screen reader support
  - Keyboard navigation
  - High contrast mode
  - Font size scaling

## 🚀 PHASE 9: Deployment & Production

### 9.1 Production Setup

- [ ] **Environment Configuration**:
  - Production environment variables
  - Supabase production database
  - CDN setup for audio files
  - Error monitoring integration
- [ ] **Build Optimization**:
  - Production build configuration
  - Asset optimization
  - Service worker implementation
  - Performance monitoring setup

### 9.2 Monitoring & Analytics

- [ ] **User Analytics**:
  - Google Analytics integration
  - User behavior tracking
  - Audio playback analytics
  - Feature usage statistics
- [ ] **Performance Monitoring**:
  - Real User Monitoring (RUM)
  - Error tracking and reporting
  - API performance monitoring
  - Database query optimization

## 📋 Development Sprint Structure

### Sprint 1: Foundation (2-3 weeks)

- Redux Toolkit setup and Supabase integration
- Basic Next.js routing and layouts
- Authentication system implementation
- Core TypeScript interfaces and types

### Sprint 2: Core Navigation (2-3 weeks)

- Home page with search and featured content
- Itinerary listing and search functionality
- Basic map integration with Leaflet
- User profile and authentication UI

### Sprint 3: Audio System (3-4 weeks)

- Audio player core functionality
- Mini and full player UI components
- Audio state management and persistence
- Basic playback controls and progress tracking

### Sprint 4: Map & Content (2-3 weeks)

- Complete itinerary detail page
- Interactive map with POI markers
- Map-audio integration
- Favorites system implementation

### Sprint 5: Enhanced Features (2-3 weeks)

- Advanced search and filtering
- User preferences and settings
- Performance optimizations
- Social features and company integration

### Sprint 6: Polish & Deploy (1-2 weeks)

- UI/UX refinements
- Performance testing and optimization
- Production deployment setup
- Monitoring and analytics integration

## 🛠️ Complete Technology Stack

- **Frontend Framework**: Next.js 15.x with App Router
- **Language**: TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Backend**: Supabase (Database, Auth, Storage, Functions)
- **Maps**: Leaflet with OpenStreetMap
- **Audio**: Web Audio API + Media Session API
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Monitoring**: Vercel Analytics + Custom error tracking
