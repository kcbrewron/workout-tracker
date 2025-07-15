# Mobile users cannot scroll to bottom of workout screens

## Bug Description
On mobile devices, users cannot scroll to the bottom of workout screens, preventing access to critical UI elements like action buttons and completion controls.

## Steps to Reproduce
1. Open the workout app on a mobile device or mobile browser view
2. Navigate to any workout screen (start workout, active session, completion)
3. Attempt to scroll to the bottom of the screen
4. Observe that bottom content is cut off and inaccessible

## Expected Behavior
- All content should be scrollable on mobile devices
- Bottom action buttons should be accessible
- No UI elements should be permanently hidden below the fold

## Technical Details
- **Affected Routes:** `/workout`, `/workout/complete`
- **Components:** `src/routes/workout/+page.svelte`, `src/lib/components/workout/SetRecorder.svelte`
- **Issue:** Likely viewport height issues or fixed positioning conflicts

## Impact
- **Critical:** Users cannot complete workouts
- **Accessibility:** Violates mobile usability standards
- **User Experience:** Core functionality is broken on mobile

## Root Cause Analysis
Potential causes:
1. Fixed positioning of action buttons interfering with scroll
2. Viewport height (100vh) not accounting for mobile browser UI
3. Missing `overflow-y: auto` or scroll container setup
4. Bottom padding insufficient for mobile navigation

## Acceptance Criteria
- [ ] All workout screens fully scrollable on mobile
- [ ] Bottom action buttons always accessible
- [ ] No content cut off below viewport
- [ ] Smooth scrolling behavior maintained
- [ ] Works across iOS Safari, Chrome Mobile, Firefox Mobile
- [ ] One-handed operation still functional

## Test Devices
- [ ] iPhone (various sizes)
- [ ] Android phones (various sizes)
- [ ] Mobile browsers with/without address bar

## Suggested Labels
- `bug`
- `mobile`
- `critical`
- `ui/ux`