# Mobile UI Issues - Analysis and Fix Plan

## Issue Description
Mobile UI elements are overlapping and not properly accounting for mobile safe areas, causing usability issues on mobile devices.

## Root Cause Analysis

### Problem Areas Identified:

1. **SetRecorder Component (`src/lib/components/workout/SetRecorder.svelte:410-420`)**
   - Fixed positioning at `bottom-4` without safe area insets
   - Overlaps with mobile navigation gestures and home indicator
   - Missing `env(safe-area-inset-bottom)` consideration

2. **Missing Safe Area Support**
   - No CSS environment variables for mobile safe areas
   - Action buttons can be obscured by system UI elements
   - Poor user experience on devices with notches/home indicators

## Current Code Issues

### SetRecorder.svelte Lines 410-420:
```svelte
<div class="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border">
  <!-- Action buttons positioned without safe area consideration -->
</div>
```

### Missing CSS Support:
- No `viewport-fit=cover` meta tag
- No safe area inset variables in CSS
- No padding adjustments for mobile safe areas

## Fix Plan

### 1. Add Safe Area Support
- Add `viewport-fit=cover` to app.html
- Implement CSS custom properties for safe areas
- Update Tailwind config for safe area utilities

### 2. Update SetRecorder Component
- Replace fixed positioning with safe area aware positioning
- Add `pb-safe` or similar safe area bottom padding
- Test on various mobile devices

### 3. Review Other Fixed Elements
- Check all components with fixed positioning
- Ensure consistent safe area implementation
- Update mobile navigation if needed

## Testing Strategy
- Test on iOS devices with notches/home indicators
- Test on Android devices with gesture navigation
- Verify action buttons are accessible and not obscured
- Check landscape and portrait orientations

## Files to Modify
- `src/app.html` - Add viewport meta tag
- `src/lib/components/workout/SetRecorder.svelte` - Fix positioning
- `tailwind.config.js` - Add safe area utilities
- Any other components with fixed positioning

## Expected Outcome
- Mobile action buttons properly positioned above safe areas
- No overlap with system UI elements
- Improved mobile user experience
- Consistent behavior across different mobile devices