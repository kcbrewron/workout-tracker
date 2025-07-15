# Workout completion button unclear and hard to find

## Issue Description
The workout completion functionality exists but the finish button (✅) is not obvious to users. The current implementation uses small emoji icons that may be unclear on mobile devices.

## Current Implementation
- **Location:** Session header actions area
- **Button:** Uses ✅ emoji with `aria-label="Finish workout"`
- **Size:** Small circular button (12x12 based on `action-btn` class)
- **Visibility:** May be too small/unclear on mobile

## User Experience Problems
1. **Unclear Intent:** ✅ emoji doesn't clearly indicate "finish workout"
2. **Size:** Small button may be hard to tap on mobile
3. **Discoverability:** Users expect a prominent "Finish" or "Complete" button
4. **Icon Ambiguity:** Checkmark could mean "mark complete" vs "finish session"

## Proposed Improvements

### Option 1: Text Button
Replace emoji with clear text button:
```html
<button class="finish-workout-btn">
    Finish Workout
</button>
```

### Option 2: Icon + Text
Combine icon with descriptive text:
```html
<button class="action-btn finish-btn">
    <span class="icon">✅</span>
    <span class="text">Finish</span>
</button>
```

### Option 3: Prominent Primary Button
Make finish button the primary action:
```html
<button class="primary-finish-btn">
    Complete Workout
</button>
```

## Technical Requirements
- [ ] Increase button size for better mobile accessibility
- [ ] Add clear text label alongside or instead of emoji
- [ ] Ensure button is prominent enough to find easily
- [ ] Maintain consistent spacing with other session controls
- [ ] Consider making it the primary action button

## Acceptance Criteria
- [ ] Users can easily identify how to finish their workout
- [ ] Button is easily tappable on mobile devices
- [ ] Clear visual hierarchy shows this as an important action
- [ ] Maintains accessibility standards (WCAG AA)
- [ ] Consistent with overall app design language

## Design Considerations
- Should finish button be more prominent than pause/cancel?
- Consider different states: "Finish Early" vs "Complete Workout"
- Mobile-first design for gym environment use

## Suggested Labels
- `enhancement`
- `ui/ux`
- `mobile`
- `user-experience`