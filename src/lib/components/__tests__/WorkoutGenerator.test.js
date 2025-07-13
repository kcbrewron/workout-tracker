import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import WorkoutGenerator from '../workout/WorkoutGenerator.svelte';
import { workout } from '../../stores/workout.js';
import { onboarding } from '../../stores/onboarding.js';

// Mock browser environment
vi.mock('$app/environment', () => ({
    browser: true
}));

describe('WorkoutGenerator Component', () => {
    let mockOnboardingData;

    beforeEach(async () => {
        localStorage.clear();
        
        mockOnboardingData = {
            goals: {
                primaryObjective: 'build_muscle',
                timeline: '6_months',
                frequency: '3_4_times',
                duration: '30_45_mins'
            },
            experience: {
                level: 'beginner',
                currentRoutine: 'none',
                previousExperience: 'limited'
            },
            preferences: {
                sports: ['weightlifting'],
                equipment: ['bodyweight', 'dumbbells'],
                focusType: 'strength'
            },
            isComplete: true
        };

        // Mock onboarding store
        onboarding.setGoals(mockOnboardingData.goals);
        onboarding.setExperience(mockOnboardingData.experience);
        onboarding.setPreferences(mockOnboardingData.preferences);
        await onboarding.complete();
    });

    afterEach(() => {
        vi.clearAllMocks();
        workout.clearGeneratedRoutine();
    });

    it('should render workout type selection', () => {
        render(WorkoutGenerator);

        expect(screen.getByText('Workout Type')).toBeInTheDocument();
        expect(screen.getByText('Strength Training')).toBeInTheDocument();
        expect(screen.getByText('Cardiovascular')).toBeInTheDocument();
        expect(screen.getByText('Mixed Training')).toBeInTheDocument();
    });

    it('should render duration selection', () => {
        render(WorkoutGenerator);

        expect(screen.getByText('Workout Duration')).toBeInTheDocument();
        expect(screen.getByText('15-30 minutes')).toBeInTheDocument();
        expect(screen.getByText('30-45 minutes')).toBeInTheDocument();
        expect(screen.getByText('45-60 minutes')).toBeInTheDocument();
        expect(screen.getByText('60+ minutes')).toBeInTheDocument();
    });

    it('should render equipment selection', () => {
        render(WorkoutGenerator);

        expect(screen.getByText('Available Equipment')).toBeInTheDocument();
        expect(screen.getByText('Bodyweight Only')).toBeInTheDocument();
        expect(screen.getByText('Dumbbells')).toBeInTheDocument();
        expect(screen.getByText('Barbell')).toBeInTheDocument();
    });

    it('should render generate button', () => {
        render(WorkoutGenerator);

        const generateButton = screen.getByRole('button', { name: /generate workout/i });
        expect(generateButton).toBeInTheDocument();
    });

    it('should allow selecting workout type', async () => {
        render(WorkoutGenerator);

        const strengthButton = screen.getByText('Strength Training').closest('button');
        await fireEvent.click(strengthButton);

        // Check if button has selected styling (border-primary class)
        expect(strengthButton).toHaveClass('border-primary');
    });

    it('should allow selecting duration', async () => {
        render(WorkoutGenerator);

        const duration45Button = screen.getByText('45-60 minutes').closest('button');
        await fireEvent.click(duration45Button);

        expect(duration45Button).toHaveClass('border-primary');
    });

    it('should allow toggling equipment', async () => {
        render(WorkoutGenerator);

        const dumbbellsButton = screen.getByText('Dumbbells').closest('button');
        
        // Click to select dumbbells
        await fireEvent.click(dumbbellsButton);
        expect(dumbbellsButton).toHaveClass('border-primary');
        
        // Click to deselect
        await fireEvent.click(dumbbellsButton);
        expect(dumbbellsButton).not.toHaveClass('border-primary');
    });

    it('should show loading state during generation', async () => {
        render(WorkoutGenerator);

        const generateButton = screen.getByRole('button', { name: /generate workout/i });
        
        // Wait for button to become enabled
        await waitFor(() => {
            expect(generateButton).not.toBeDisabled();
        });

        await fireEvent.click(generateButton);

        // Should show loading text
        expect(screen.getByText('Generating...')).toBeInTheDocument();
        expect(generateButton).toBeDisabled();

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
        }, { timeout: 2000 });
    });

    it('should display medical disclaimer when routine is generated', async () => {
        render(WorkoutGenerator);

        const generateButton = screen.getByRole('button', { name: /generate workout/i });
        
        // Wait for button to become enabled
        await waitFor(() => {
            expect(generateButton).not.toBeDisabled();
        });

        await fireEvent.click(generateButton);

        await waitFor(() => {
            expect(screen.getByText('Medical Disclaimer')).toBeInTheDocument();
            expect(screen.getByText(/consult your physician/i)).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    it('should display workout phases correctly', async () => {
        render(WorkoutGenerator);

        const generateButton = screen.getByRole('button', { name: /generate workout/i });
        
        // Wait for button to become enabled
        await waitFor(() => {
            expect(generateButton).not.toBeDisabled();
        });

        await fireEvent.click(generateButton);

        await waitFor(() => {
            expect(screen.getByText(/warm-up/i)).toBeInTheDocument();
            expect(screen.getByText(/main workout/i)).toBeInTheDocument();
            expect(screen.getByText(/cool-down/i)).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    it('should save routine when save button is clicked', async () => {
        // Mock window.alert to avoid actual alerts in tests
        window.alert = vi.fn();
        
        render(WorkoutGenerator);

        const generateButton = screen.getByRole('button', { name: /generate workout/i });
        
        // Wait for button to become enabled
        await waitFor(() => {
            expect(generateButton).not.toBeDisabled();
        });

        // Generate a routine first
        await fireEvent.click(generateButton);

        // Wait for routine to be generated
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save routine/i })).toBeInTheDocument();
        }, { timeout: 2000 });

        // Click save
        const saveButton = screen.getByRole('button', { name: /save routine/i });
        await fireEvent.click(saveButton);

        // Should show success message
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('saved successfully'));

        // Check that routine was saved to store
        const workoutState = get(workout);
        expect(workoutState.savedRoutines.length).toBeGreaterThan(0);
    });

    it('should disable generate button when no onboarding data', () => {
        // Clear onboarding data
        onboarding.reset();
        
        render(WorkoutGenerator);

        const generateButton = screen.getByRole('button', { name: /generate workout/i });
        expect(generateButton).toBeDisabled();
    });
});