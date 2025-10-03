# UI Components Update Summary

All UI components in the `src/components/ui` folder have been updated to follow the 2025 mobile-first design guidelines. Here's what was changed:

## Core Interactive Components

### Button

- Added `danger` variant for destructive actions
- Added `icon` size for icon-only buttons
- Added `fullWidth` and `rounded` props for more flexibility
- Updated with modern shadow effects (shadow-lg, shadow-primary/25, etc.)
- Improved active states with scale animations
- Custom loading spinner using CSS border animation

### Input

- Changed default variant from `default` to `filled` for modern look
- Added `ghost` variant for minimal inputs
- Separated `leftIcon` and `rightIcon` props (replacing single `icon` prop)
- Improved focus states with ring-offset
- Better dark mode support with marble color tokens

### Card

- Added `glass` variant with backdrop-blur-xl for glassmorphism
- Added `interactive` variant with hover effects for clickable cards
- Changed from `outlined` to `outline` for consistency
- Updated to use rounded-2xl for more modern look
- Improved shadow system (shadow-soft, shadow-medium, shadow-strong)

## Form Components

### Checkbox

- Complete rewrite using hidden input + custom visual
- Removed icon dependency (now uses inline SVG)
- Smooth scale animations for checkmark
- Better touch targets and accessibility
- Simplified API with `size` prop (sm/md/lg)

### Radio

- Complete rewrite using hidden input + custom visual
- Smooth animations for the inner dot
- Better visual hierarchy with marble color tokens
- Updated RadioGroup with cleaner flex layout

### Switch

- Simplified implementation with better animations
- Removed unnecessary complexity
- Smooth thumb transition
- Better visual feedback

### Select

- Complete rewrite with modern dropdown design
- Added icon support for options
- Better keyboard navigation
- Smooth animations with animate-slide-up-fade
- Improved accessibility

### Textarea

- Added `autoResize` functionality
- Added `showCount` and `maxLength` for character limits
- Better variants (default/filled)
- Improved visual consistency with other inputs

## Feedback Components

### Modal

- Added `variant` prop: center/bottom/fullscreen
- Bottom sheet style for mobile-first approach
- Better animations (slide-up, scale-up, fade-in)
- Improved glassmorphism with backdrop-blur
- Added body scroll lock when open

### Toast

- Repositioned to bottom of screen (above bottom nav)
- Added `pb-safe` for iOS safe area
- Better visual design with rounded-2xl
- Improved icons and colors
- Better dark mode support

### Badge

- Added `dot` prop for status indicators
- Simplified variant system
- Better color tokens using `/10` opacity
- Improved text legibility

### Progress

- Added `animated` prop for shimmer effect
- Better visual design with marble color tokens
- Improved label positioning
- Updated Spinner component to use CSS border animation

## Navigation/Layout Components

### Tabs

- Complete rewrite with modern segmented control design
- Three variants: default (segmented), pills, underline
- Added badge support
- Better fullWidth behavior
- Smooth transitions
- Better mobile touch targets

### Accordion

- (Existing implementation kept - already follows guidelines)

### Breadcrumb

- (Existing implementation kept - already follows guidelines)

### Avatar

- Added `shape` prop (circle/square)
- Added `border` prop for ring effect
- Better status indicator positioning
- Improved fallback handling
- Removed icon dependency

### Tooltip

- (Existing implementation kept)

### Popover

- (Existing implementation kept)

## Design Tokens Used

### New Color Patterns

- `marble-100`, `marble-200` for neutral backgrounds
- `/10`, `/20`, `/30` opacity variants for subtle effects
- Better dark mode with `dark:` prefixes

### Shadows

- `shadow-soft` - subtle elevation
- `shadow-medium` - moderate elevation
- `shadow-strong` - prominent elevation
- Variant-specific shadows (e.g., `shadow-primary/25`)

### Animations

- `animate-fade-in` - simple fade
- `animate-slide-up` - bottom sheet entrance
- `animate-scale-up` - modal entrance
- `animate-slide-up-fade` - dropdown entrance
- `animate-shimmer` - progress bar animation

### Border Radius

- Increased to `rounded-xl` and `rounded-2xl` for modern look
- `rounded-full` for pills and circular elements

## Breaking Changes

### API Changes

1. **Input**: `icon` + `iconPosition` → `leftIcon` / `rightIcon`
2. **Checkbox**: Removed `indeterminate` prop, simplified to `size` prop
3. **Select**: Completely new API, no longer supports `multiple` mode
4. **Tabs**: New simplified API focusing on controlled component pattern
5. **Avatar**: Removed `showStatus` prop (status auto-shows if provided)
6. **Card**: `outlined` → `outline` variant

### Import Changes

- Components no longer depend on HeroIcons (hi2) except where absolutely necessary
- Using inline SVGs for better customization

## Mobile-First Features

1. **Touch Targets**: All interactive elements meet 44x44px minimum
2. **Safe Areas**: Added `pb-safe` classes for iOS notch support
3. **Gestures**: Better touch feedback with active states
4. **Performance**: Reduced dependencies, optimized animations
5. **Accessibility**: Improved ARIA labels and keyboard navigation

## Next Steps

To use these updated components:

1. Update any component usage to match new APIs
2. Add the animation keyframes to `globals.css` (if not already present):
   - @keyframes fade-in
   - @keyframes slide-up
   - @keyframes scale-up
   - @keyframes shimmer
3. Ensure Tailwind config includes custom colors:
   - marble-100, marble-200
   - Safe area utilities

4. Test on actual mobile devices for touch targets and animations
5. Verify dark mode appearance across all components

All components now follow the 2025 design guidelines with improved mobile support, better animations, and modern visual design.
