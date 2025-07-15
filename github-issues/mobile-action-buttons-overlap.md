# Mobile action buttons may overlap with bottom navigation/browser UI

## Issue Description
On mobile devices, the fixed-positioned action buttons in workout screens may overlap with device navigation bars, browser UI, or be positioned outside the safe viewing area.

## Affected Components
- `src/lib/components/workout/SetRecorder.svelte` (lines ~400-410)
- Action buttons with fixed positioning at bottom of screen

## Technical Details
Current CSS implementation:
```css
@media (max-width: 640px) and (orientation: portrait) {
    .action-buttons {
        @apply fixed bottom-4 left-4 right-4 z-10;
        @apply bg-white border-t border-gray-200 pt-4;
        @apply shadow-lg rounded-t-lg;
    }
}
```

## Potential Problems
1. **iOS Safari:** Dynamic viewport height changes with address bar
2. **Android Chrome:** Navigation bar overlay
3. **Bottom Safe Area:** iPhone X+ home indicator area
4. **Gesture Navigation:** Conflicts with swipe gestures

## Expected Issues
- Buttons positioned behind system UI
- Reduced accessibility on devices with gesture navigation
- Content cut off below the fold
- Difficulty tapping buttons in safe area

## Proposed Solutions

### 1. CSS Environment Variables
```css
.action-buttons {
    bottom: calc(1rem + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
}
```

### 2. Viewport Height Units
```css
/* Use dvh (dynamic viewport height) instead of vh */
.workout-container {
    min-height: 100dvh;
}
```

### 3. Scroll Container Approach
Instead of fixed positioning, use a scroll container with proper padding

## Testing Requirements
- [ ] iPhone with notch (12, 13, 14 series)
- [ ] iPhone with home button (SE, 8 series)  
- [ ] Android with gesture navigation
- [ ] Android with navigation buttons
- [ ] Various mobile browsers (Safari, Chrome, Firefox)
- [ ] Both portrait and landscape orientations

## Acceptance Criteria
- [ ] Action buttons always accessible on all mobile devices
- [ ] No overlap with system UI elements
- [ ] Proper spacing from screen edges and safe areas
- [ ] Maintains one-handed operation usability
- [ ] Smooth scrolling to reveal buttons if needed

## Investigation Tasks
- [ ] Test current implementation on real devices
- [ ] Measure safe area insets on different devices
- [ ] Verify viewport height behavior across browsers
- [ ] Check accessibility with assistive technologies

## Related Issues
- Links to mobile scroll issue
- May affect workout completion UX

## Suggested Labels
- `bug`
- `mobile`
- `css`
- `accessibility`
- `device-compatibility`