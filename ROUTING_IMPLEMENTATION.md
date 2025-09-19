# Phase 2: Screens and Routing Implementation

## Overview

This implementation provides a complete routing structure for the MyAudioG mobile PWA using Next.js App Router, with mobile-first design and full accessibility support.

## Routing Structure

### App Router Implementation

- **/** - Root page (redirects to /home)
- **/onboarding** - User onboarding flow with multi-step guidance
- **/home** - Main dashboard with featured content and quick actions
- **/search** - Tour discovery with filters and categories
- **/itineraries** - Browse featured, recent, and downloaded tours
- **/itinerary/[id]** - Dynamic route for individual tour details
- **/audio-player** - Audio playback interface (placeholder)
- **/map** - Interactive map view (placeholder)
- **/favorites** - User's saved tours, places, and collections
- **/profile** - User profile with stats and achievements
- **/settings** - App configuration and preferences

## Layout Components

### 1. MainLayout

- **Purpose**: Standard app layout with navigation
- **Features**:
  - Header with title and back button
  - Bottom tab navigation
  - Content area with proper spacing
  - Mobile-first responsive design

### 2. AuthLayout

- **Purpose**: Onboarding and authentication flows
- **Features**:
  - Progress indicator for multi-step flows
  - Centered content layout
  - Clean, distraction-free design

### 3. PlayerLayout

- **Purpose**: Audio playback interfaces
- **Features**:
  - Mini player at bottom
  - Full-screen player modal
  - Header with context actions
  - Audio controls integration (placeholder)

### 4. MapLayout

- **Purpose**: Full-screen map experiences
- **Features**:
  - Overlay controls
  - Back navigation
  - Location controls
  - Map layers toggle

## Navigation System

### 1. BottomTabNavigation

- **Mobile-first**: Primary navigation method
- **5 Main Tabs**: Home, Search, Map, Favorites, Profile
- **Features**:
  - Active state indication
  - Accessibility support (ARIA labels, roles)
  - Touch-optimized tap targets (≥44px)
  - Keyboard navigation support

### 2. Header Component

- **Purpose**: Context navigation and actions
- **Features**:
  - Dynamic title display
  - Back button with router integration
  - Custom action buttons
  - Subtitle support

### 3. Breadcrumb Component

- **Purpose**: Nested navigation context
- **Features**:
  - SEO-friendly markup
  - Customizable separators
  - Active state management
  - Keyboard accessibility

## Key Features Implemented

### Mobile-First Design

- Touch-optimized interactions
- Responsive breakpoints
- Finger-friendly tap targets
- Swipe-friendly layouts

### Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast support
- Focus management

### Performance

- Lazy loading with Next.js App Router
- Optimized bundle splitting
- Component-level loading states
- Error boundaries
- Proper TypeScript typing

### Error Handling

- Global error boundary
- 404 page with helpful navigation
- Loading states for all routes
- Graceful degradation

## Technical Implementation

### TypeScript Support

- Strict typing for all components
- Proper interface definitions
- Type-safe prop passing
- IntelliSense support

### Component Architecture

- Atomic design principles
- Reusable layout components
- Consistent prop interfaces
- Modular file structure

### Next.js App Router

- File-based routing
- Layout composition
- Loading UI
- Error handling
- Dynamic routes

## File Structure

```
src/app/
├── globals.css
├── layout.tsx          # Root layout
├── page.tsx           # Root page
├── loading.tsx        # Global loading
├── error.tsx          # Global error boundary
├── not-found.tsx      # 404 page
├── onboarding/
│   └── page.tsx
├── home/
│   ├── page.tsx
│   └── loading.tsx
├── search/
│   └── page.tsx
├── itineraries/
│   └── page.tsx
├── itinerary/
│   └── [id]/
│       └── page.tsx
├── audio-player/
│   └── page.tsx
├── map/
│   └── page.tsx
├── favorites/
│   └── page.tsx
├── profile/
│   └── page.tsx
└── settings/
    └── page.tsx

src/components/
├── layouts/
│   ├── MainLayout.tsx
│   ├── AuthLayout.tsx
│   ├── PlayerLayout.tsx
│   ├── MapLayout.tsx
│   └── index.ts
├── navigation/
│   ├── Header.tsx
│   ├── BottomTabNavigation.tsx
│   ├── Breadcrumb.tsx
│   └── index.ts
└── audio/
    ├── MiniPlayer.tsx
    ├── FullPlayer.tsx
    └── index.ts
```

## Next Steps

1. Implement audio functionality (MiniPlayer, FullPlayer)
2. Add map integration (MapBox, Google Maps)
3. Connect to Supabase backend
4. Implement offline functionality
5. Add PWA features (service worker, install prompt)
6. Performance optimization and testing

## Usage Examples

### Basic Page with Navigation

```tsx
import { MainLayout } from '@/components/layouts';

export default function MyPage() {
  return (
    <MainLayout title="Page Title" showBackButton>
      <div className="p-4">{/* Page content */}</div>
    </MainLayout>
  );
}
```

### Onboarding Flow

```tsx
import { AuthLayout } from '@/components/layouts';

export default function OnboardingStep() {
  return (
    <AuthLayout
      title="Welcome"
      subtitle="Get started with MyAudioG"
      showProgress
      currentStep={1}
      totalSteps={4}
    >
      {/* Onboarding content */}
    </AuthLayout>
  );
}
```

### Audio Player Page

```tsx
import { PlayerLayout } from '@/components/layouts';

export default function AudioPage() {
  return (
    <PlayerLayout title="Now Playing" showMiniPlayer isFullPlayerOpen={false}>
      {/* Audio interface content */}
    </PlayerLayout>
  );
}
```

This implementation provides a solid foundation for the audio guide app with proper routing, navigation, and mobile-first design patterns.
