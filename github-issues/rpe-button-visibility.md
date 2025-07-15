# RPE buttons have white text/outline when pressed making them unreadable

## Bug Description
When users press RPE (Rate of Perceived Exertion) buttons in the workout tracking interface, the text and outline turn white, making them completely unreadable against the white background.

## Steps to Reproduce
1. Start a workout session
2. Navigate to set recording
3. Press any RPE button (1-10)
4. Observe that text and outline become white

## Expected Behavior
- RPE buttons should maintain readable contrast when selected
- Text should remain visible against the button background
- Selected state should be clearly distinguishable

## Technical Details
- **Component:** `src/lib/components/workout/RPEPicker.svelte`
- **Issue:** CSS styling for selected state uses white text on colored background
- **WCAG Compliance:** AA compliance requires 4.5:1 contrast ratio

## Root Cause Analysis
The CSS in RPEPicker.svelte line ~195-200 sets:
```css
.rpe-button[style*="bg-green-500"],
.rpe-button[style*="bg-yellow-500"],
.rpe-button[style*="bg-orange-500"],
.rpe-button[style*="bg-red-500"] {
    color: white !important;
}
```
This forces white text even when the background might not provide sufficient contrast.

## Acceptance Criteria
- [ ] Selected RPE buttons have readable text color
- [ ] Button outline/border remains visible when selected
- [ ] Maintains WCAG AA contrast requirements (4.5:1 ratio)
- [ ] Visual feedback clearly indicates selected state
- [ ] Works across all RPE intensity levels (1-10)

## Suggested Labels
- `bug`
- `ui/ux`
- `accessibility`
- `high-priority`