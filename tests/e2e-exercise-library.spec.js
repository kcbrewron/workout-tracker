import { test, expect } from '@playwright/test';

test.describe('Exercise Library', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/exercise-library');
	});

	test('should display exercise library page title', async ({ page }) => {
		await expect(page.locator('h1')).toHaveText('Exercise Library');
		await expect(page.locator('text=Discover exercises with detailed instructions and form guidance')).toBeVisible();
	});

	test('should show categories view by default', async ({ page }) => {
		await expect(page.locator('text=Categories')).toBeVisible();
		await expect(page.locator('text=Quick Filters')).toBeVisible();
		await expect(page.locator('text=By Muscle Group')).toBeVisible();
		await expect(page.locator('text=By Equipment')).toBeVisible();
		await expect(page.locator('text=By Difficulty')).toBeVisible();
	});

	test('should navigate to all exercises view', async ({ page }) => {
		await page.click('text=All Exercises');
		await expect(page.locator('text=exercises found')).toBeVisible();
		await expect(page.locator('input[placeholder*="Search exercises"]')).toBeVisible();
	});

	test('should filter exercises by muscle group', async ({ page }) => {
		await page.click('text=chest');
		await expect(page.locator('text=exercises found')).toBeVisible();
		
		// Check that chest exercises are displayed
		await expect(page.locator('text=Push-ups')).toBeVisible();
		await expect(page.locator('text=chest')).toBeVisible();
	});

	test('should filter exercises by equipment', async ({ page }) => {
		await page.click('text=bodyweight');
		await expect(page.locator('text=exercises found')).toBeVisible();
		
		// Check that bodyweight exercises are displayed
		await expect(page.locator('text=Push-ups')).toBeVisible();
		await expect(page.locator('text=bodyweight')).toBeVisible();
	});

	test('should filter exercises by difficulty', async ({ page }) => {
		await page.click('text=beginner');
		await expect(page.locator('text=exercises found')).toBeVisible();
		
		// Check that beginner exercises are displayed
		await expect(page.locator('.bg-green-100')).toBeVisible();
	});

	test('should search exercises by name', async ({ page }) => {
		await page.click('text=All Exercises');
		await page.fill('input[placeholder*="Search exercises"]', 'push');
		
		await expect(page.locator('text=Push-ups')).toBeVisible();
		await expect(page.locator('text=exercises found')).toBeVisible();
	});

	test('should open and close exercise filters', async ({ page }) => {
		await page.click('text=All Exercises');
		
		// Filters should be hidden initially
		await expect(page.locator('text=Muscle Groups')).not.toBeVisible();
		
		// Click to show filters
		await page.click('text=🎛️ Filters');
		await expect(page.locator('text=Muscle Groups')).toBeVisible();
		await expect(page.locator('text=Equipment')).toBeVisible();
		await expect(page.locator('text=Difficulty')).toBeVisible();
		await expect(page.locator('text=Tags')).toBeVisible();
		
		// Click to hide filters
		await page.click('text=🎛️ Filters');
		await expect(page.locator('text=Muscle Groups')).not.toBeVisible();
	});

	test('should apply multiple filters', async ({ page }) => {
		await page.click('text=All Exercises');
		await page.click('text=🎛️ Filters');
		
		// Apply muscle group filter
		await page.click('text=chest');
		
		// Apply equipment filter
		await page.click('text=bodyweight');
		
		// Check that filters are applied
		await expect(page.locator('text=chest')).toBeVisible();
		await expect(page.locator('text=bodyweight')).toBeVisible();
		
		// Should show fewer exercises
		await expect(page.locator('text=exercises found')).toBeVisible();
	});

	test('should clear all filters', async ({ page }) => {
		await page.click('text=All Exercises');
		await page.click('text=🎛️ Filters');
		
		// Apply some filters
		await page.click('text=chest');
		await page.click('text=bodyweight');
		
		// Clear all filters
		await page.click('text=Clear all');
		
		// Check that filters are cleared
		await expect(page.locator('text=chest')).not.toBeVisible();
		await expect(page.locator('text=bodyweight')).not.toBeVisible();
	});

	test('should sort exercises', async ({ page }) => {
		await page.click('text=All Exercises');
		
		// Test sorting by difficulty
		await page.click('text=Difficulty');
		await expect(page.locator('text=exercises found')).toBeVisible();
		
		// Test sorting by name
		await page.click('text=Name');
		await expect(page.locator('text=exercises found')).toBeVisible();
	});

	test('should open exercise detail modal', async ({ page }) => {
		await page.click('text=All Exercises');
		
		// Find and click on an exercise card
		await page.click('text=Push-ups');
		
		// Check that modal is opened
		await expect(page.locator('text=Push-ups')).toBeVisible();
		await expect(page.locator('text=Instructions')).toBeVisible();
		await expect(page.locator('text=Form Cues')).toBeVisible();
		await expect(page.locator('text=Primary Muscles')).toBeVisible();
	});

	test('should close exercise detail modal', async ({ page }) => {
		await page.click('text=All Exercises');
		await page.click('text=Push-ups');
		
		// Close modal by clicking close button
		await page.click('text=Close');
		
		// Modal should be closed
		await expect(page.locator('text=Instructions')).not.toBeVisible();
	});

	test('should toggle exercise favorite', async ({ page }) => {
		await page.click('text=All Exercises');
		
		// Find an exercise card and click favorite
		const exerciseCard = page.locator('.bg-white').first();
		await exerciseCard.locator('button[title*="favorite"]').click();
		
		// Check that favorite is toggled (heart icon changes)
		await expect(exerciseCard.locator('text=❤️')).toBeVisible();
		
		// Click again to remove from favorites
		await exerciseCard.locator('button[title*="favorite"]').click();
		await expect(exerciseCard.locator('text=🤍')).toBeVisible();
	});

	test('should show favorites count when favorites exist', async ({ page }) => {
		await page.click('text=All Exercises');
		
		// Add an exercise to favorites
		const exerciseCard = page.locator('.bg-white').first();
		await exerciseCard.locator('button[title*="favorite"]').click();
		
		// Check that favorites button appears in navigation
		await expect(page.locator('text=❤️ Favorites')).toBeVisible();
	});

	test('should show recently viewed section', async ({ page }) => {
		await page.click('text=All Exercises');
		
		// Click on an exercise to view it
		await page.click('text=Push-ups');
		await page.click('text=Close');
		
		// Go back to categories
		await page.click('text=← Back to categories');
		
		// Check that recently viewed section appears
		await expect(page.locator('text=Recently Viewed')).toBeVisible();
	});

	test('should handle empty search results', async ({ page }) => {
		await page.click('text=All Exercises');
		
		// Search for non-existent exercise
		await page.fill('input[placeholder*="Search exercises"]', 'nonexistentexercise');
		
		// Should show no results message
		await expect(page.locator('text=No exercises found')).toBeVisible();
		await expect(page.locator('text=Try adjusting your search criteria')).toBeVisible();
		await expect(page.locator('text=Clear all filters')).toBeVisible();
	});

	test('should clear search and return to all exercises', async ({ page }) => {
		await page.click('text=All Exercises');
		await page.fill('input[placeholder*="Search exercises"]', 'nonexistentexercise');
		
		// Clear search
		await page.fill('input[placeholder*="Search exercises"]', '');
		
		// Should show all exercises again
		await expect(page.locator('text=exercises found')).toBeVisible();
		await expect(page.locator('text=Push-ups')).toBeVisible();
	});

	test('should show exercise details with all sections', async ({ page }) => {
		await page.click('text=All Exercises');
		await page.click('text=Push-ups');
		
		// Check all sections are present
		await expect(page.locator('text=Instructions')).toBeVisible();
		await expect(page.locator('text=Form Cues')).toBeVisible();
		await expect(page.locator('text=Primary Muscles')).toBeVisible();
		await expect(page.locator('text=Secondary Muscles')).toBeVisible();
		await expect(page.locator('text=Common Mistakes')).toBeVisible();
		await expect(page.locator('text=Safety Notes')).toBeVisible();
		await expect(page.locator('text=Progressions')).toBeVisible();
		await expect(page.locator('text=Tags')).toBeVisible();
	});

	test('should navigate back to categories from exercise list', async ({ page }) => {
		await page.click('text=All Exercises');
		await page.click('text=← Back to categories');
		
		// Should be back to categories view
		await expect(page.locator('text=Quick Filters')).toBeVisible();
		await expect(page.locator('text=By Muscle Group')).toBeVisible();
	});

	test('should persist favorites across page refreshes', async ({ page }) => {
		await page.click('text=All Exercises');
		
		// Add to favorites
		const exerciseCard = page.locator('.bg-white').first();
		await exerciseCard.locator('button[title*="favorite"]').click();
		
		// Refresh page
		await page.reload();
		
		// Check that favorite is still there
		await page.click('text=All Exercises');
		await expect(page.locator('text=❤️ Favorites')).toBeVisible();
	});

	test('should show correct difficulty colors', async ({ page }) => {
		await page.click('text=All Exercises');
		
		// Check that beginner exercises have green background
		await expect(page.locator('.bg-green-100')).toBeVisible();
		
		// Filter by intermediate to check yellow
		await page.click('text=🎛️ Filters');
		await page.click('text=intermediate');
		await expect(page.locator('.bg-yellow-100')).toBeVisible();
	});

	test('should handle responsive design', async ({ page }) => {
		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('text=Categories')).toBeVisible();
		
		// Test tablet viewport
		await page.setViewportSize({ width: 768, height: 1024 });
		
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('text=Categories')).toBeVisible();
	});
});