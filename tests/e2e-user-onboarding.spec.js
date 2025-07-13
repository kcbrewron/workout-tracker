import { test, expect } from '@playwright/test';

test.describe('User Onboarding Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should redirect unauthenticated users to auth page', async ({ page }) => {
        await expect(page).toHaveURL('/auth');
    });

    test('should complete full registration and onboarding flow', async ({ page }) => {
        // Start at auth page
        await expect(page).toHaveURL('/auth');
        await expect(page.locator('h2')).toContainText('Create your account');
        
        // Fill out registration form
        await page.fill('[data-testid="name"]', 'John Doe');
        await page.fill('[data-testid="email"]', 'john@example.com');
        await page.fill('[data-testid="password"]', 'password123');
        await page.fill('[data-testid="confirmPassword"]', 'password123');
        
        // Submit registration
        await page.click('button[type="submit"]');
        
        // Should redirect to onboarding
        await expect(page).toHaveURL('/onboarding');
        await expect(page.locator('h2')).toContainText('What are your fitness goals?');
        
        // Step 1: Goals
        await page.click('input[value="strength"]');
        await page.click('input[value="6_months"]');
        await page.click('input[value="3_4_times"]');
        await page.click('input[value="60_min"]');
        await page.click('text=Continue');
        
        // Step 2: Experience
        await expect(page.locator('h2')).toContainText('Tell us about your experience');
        await page.click('input[value="intermediate"]');
        await page.click('input[value="regular"]');
        await page.click('input[value="moderate"]');
        await page.click('text=Continue');
        
        // Step 3: Preferences
        await expect(page.locator('h2')).toContainText('Your preferences');
        await page.click('text=Running').first();
        await page.click('text=Weightlifting').first();
        await page.click('input[value="full_gym"]');
        await page.click('input[value="performance"]');
        await page.click('input[value="morning"]');
        await page.click('text=Complete Setup');
        
        // Should redirect to dashboard
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('h2')).toContainText('Welcome to Your Dashboard!');
    });

    test('should allow user to login with existing account', async ({ page }) => {
        await expect(page).toHaveURL('/auth');
        
        // Switch to login mode
        await page.click('text=Sign in instead');
        await expect(page.locator('h2')).toContainText('Welcome back');
        
        // Fill out login form
        await page.fill('[data-testid="email"]', 'existing@example.com');
        await page.fill('[data-testid="password"]', 'password123');
        
        // Submit login
        await page.click('button[type="submit"]');
        
        // Should redirect to onboarding (assuming no previous onboarding)
        await expect(page).toHaveURL('/onboarding');
    });

    test('should validate form fields correctly', async ({ page }) => {
        await expect(page).toHaveURL('/auth');
        
        // Test name validation
        await page.fill('[data-testid="name"]', 'A');
        await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
        
        // Test email validation
        await page.fill('[data-testid="email"]', 'invalid-email');
        await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
        
        // Test password validation
        await page.fill('[data-testid="password"]', '123');
        await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
        
        // Test password confirmation
        await page.fill('[data-testid="password"]', 'password123');
        await page.fill('[data-testid="confirmPassword"]', 'different');
        await expect(page.locator('text=Passwords do not match')).toBeVisible();
        
        // Submit button should be disabled
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeDisabled();
    });

    test('should show progress indicator during onboarding', async ({ page }) => {
        // Complete registration first
        await page.fill('[data-testid="name"]', 'Jane Doe');
        await page.fill('[data-testid="email"]', 'jane@example.com');
        await page.fill('[data-testid="password"]', 'password123');
        await page.fill('[data-testid="confirmPassword"]', 'password123');
        await page.click('button[type="submit"]');
        
        await expect(page).toHaveURL('/onboarding');
        
        // Check progress indicators
        await expect(page.locator('text=Step 1 of 3')).toBeVisible();
        
        // Complete first step
        await page.click('input[value="strength"]');
        await page.click('input[value="6_months"]');
        await page.click('input[value="3_4_times"]');
        await page.click('input[value="60_min"]');
        await page.click('text=Continue');
        
        // Check step 2
        await expect(page.locator('text=Step 2 of 3')).toBeVisible();
        
        // Test back navigation
        await page.click('text=Back');
        await expect(page.locator('text=Step 1 of 3')).toBeVisible();
        await expect(page.locator('h2')).toContainText('What are your fitness goals?');
    });

    test('should persist onboarding data in localStorage', async ({ page }) => {
        // Complete registration
        await page.fill('[data-testid="name"]', 'Test User');
        await page.fill('[data-testid="email"]', 'test@example.com');
        await page.fill('[data-testid="password"]', 'password123');
        await page.fill('[data-testid="confirmPassword"]', 'password123');
        await page.click('button[type="submit"]');
        
        await expect(page).toHaveURL('/onboarding');
        
        // Fill out goals
        await page.click('input[value="strength"]');
        await page.click('input[value="6_months"]');
        await page.click('input[value="3_4_times"]');
        await page.click('input[value="60_min"]');
        await page.click('text=Continue');
        
        // Refresh the page
        await page.reload();
        
        // Should remember the progress and stay on step 2
        await expect(page.locator('text=Step 2 of 3')).toBeVisible();
        await expect(page.locator('h2')).toContainText('Tell us about your experience');
        
        // Go back to verify goals were saved
        await page.click('text=Back');
        await expect(page.locator('input[value="strength"]')).toBeChecked();
        await expect(page.locator('input[value="6_months"]')).toBeChecked();
    });

    test('should handle logout correctly', async ({ page }) => {
        // Complete registration
        await page.fill('[data-testid="name"]', 'Logout Test');
        await page.fill('[data-testid="email"]', 'logout@example.com');
        await page.fill('[data-testid="password"]', 'password123');
        await page.fill('[data-testid="confirmPassword"]', 'password123');
        await page.click('button[type="submit"]');
        
        await expect(page).toHaveURL('/onboarding');
        
        // Click logout
        await page.click('text=Sign Out');
        
        // Should redirect to auth page
        await expect(page).toHaveURL('/auth');
    });
});