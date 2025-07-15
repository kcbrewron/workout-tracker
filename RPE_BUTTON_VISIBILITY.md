# RPE Button Visibility Issues - Analysis and Fix Plan

## Issue Description
RPE (Rate of Perceived Exertion) buttons have poor visibility and contrast, failing to meet WCAG AA accessibility standards.

## Root Cause Analysis

### Problem Areas Identified:

1. **RPEPicker Component (`src/lib/components/workout/RPEPicker.svelte:208-213`)**
   - White text on colored backgrounds with insufficient contrast
   - Some color combinations fail WCAG AA 4.5:1 contrast requirement
   - Poor visibility especially on lighter background colors

## Current Code Issues

### RPEPicker.svelte Lines 208-213:
```svelte
<!-- RPE buttons with white text on colored backgrounds -->
<button
  class="w-12 h-12 rounded-full text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
  style="background-color: {color};"
  on:click={() => selectRPE(rpe)}
>
  {rpe}
</button>
```

### Contrast Issues:
- White text (#FFFFFF) on light green/yellow backgrounds
- Insufficient contrast ratio for accessibility compliance
- Poor visibility in various lighting conditions
- May be difficult to read for users with visual impairments

## WCAG AA Compliance Analysis

### Current Contrast Ratios (estimated):
- Light green backgrounds: ~2.1:1 (fails WCAG AA)
- Yellow backgrounds: ~1.8:1 (fails WCAG AA)
- Orange backgrounds: ~3.2:1 (fails WCAG AA)
- Red backgrounds: ~4.2:1 (marginally passes)

### Required Standard:
- WCAG AA requires 4.5:1 contrast ratio for normal text
- WCAG AAA requires 7:1 contrast ratio for enhanced accessibility

## Fix Plan

### 1. Dynamic Text Color Based on Background
- Implement contrast calculation function
- Use dark text on light backgrounds, light text on dark backgrounds
- Ensure all combinations meet WCAG AA standards

### 2. Alternative Design Approaches
- Consider outlined buttons with colored borders
- Add background patterns or textures for better visibility
- Implement hover states with improved contrast

### 3. Color Palette Adjustment
- Modify RPE color scale to ensure better contrast
- Consider darker variants of current colors
- Add border or shadow effects for better definition

### 4. Testing Strategy
- Test all RPE values (1-10) for contrast compliance
- Verify with accessibility tools and color contrast analyzers
- Test with users who have visual impairments
- Check visibility in different lighting conditions

## Technical Implementation

### Contrast Calculation Function:
```javascript
function getContrastColor(backgroundColor) {
  // Calculate luminance and return appropriate text color
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

### Updated Button Styling:
```svelte
<button
  class="w-12 h-12 rounded-full font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500"
  style="background-color: {color}; color: {getContrastColor(color)};"
  on:click={() => selectRPE(rpe)}
>
  {rpe}
</button>
```

## Files to Modify
- `src/lib/components/workout/RPEPicker.svelte` - Fix button contrast
- `src/lib/utils/contrast.js` - Add contrast calculation utilities
- `src/lib/components/workout/__tests__/RPEPicker.test.js` - Add accessibility tests

## Expected Outcome
- All RPE buttons meet WCAG AA contrast requirements
- Improved visibility across all background colors
- Better accessibility for users with visual impairments
- Consistent and professional appearance
- Maintained visual hierarchy and user experience