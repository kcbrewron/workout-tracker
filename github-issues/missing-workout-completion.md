# Missing workout completion/finish functionality in active workout

## Bug Description
Users cannot complete or finish their workout from the active workout session screen. There's no visible "Finish Workout" or "Complete Workout" button in the main workout interface.

## Steps to Reproduce
1. Start a workout (quick start or saved routine)
2. Record some sets in the active workout session
3. Look for a way to complete/finish the workout
4. Observe no clear completion mechanism is available

## Expected Behavior
- Clear "Finish Workout" button should be prominently displayed
- Users should be able to complete workout at any time
- Completion should redirect to workout summary/notes page

## Current State Analysis
Looking at the code:
- **Active Workout:** `src/routes/workout/+page.svelte` has session controls (pause, cancel) but missing finish
- **Completion Page:** `src/routes/workout/complete/+page.svelte` exists but no navigation to it
- **Function:** `finishWorkout()` exists in line 248 but button might be missing

## Technical Details
- **Component:** `src/routes/workout/+page.svelte`
- **Missing Element:** Finish/Complete workout button in session header actions
- **Navigation:** Should redirect to `/workout/complete`

## Impact
- **Critical:** Core workout flow is broken
- **User Experience:** Users get stuck in workout sessions
- **Data Loss Risk:** No way to save completed workouts

## Root Cause
The finish button appears to be implemented in the code (`finishWorkout()` function) but may not be visible in the UI or is positioned where users can't find it.

## Acceptance Criteria
- [ ] Prominent "Finish Workout" button visible in active session
- [ ] Button accessible on mobile devices
- [ ] Redirects to completion page with summary
- [ ] Works for both quick start and routine workouts
- [ ] Button styling consistent with other session controls
- [ ] Proper confirmation if workout is incomplete

## Investigation Needed
- [ ] Check if button exists but is hidden
- [ ] Verify button positioning and visibility
- [ ] Test navigation flow to completion page
- [ ] Ensure proper data persistence on completion

## Suggested Labels
- `bug`
- `critical`
- `user-flow`
- `ui/ux`