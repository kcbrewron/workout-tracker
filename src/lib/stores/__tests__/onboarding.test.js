import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { onboarding } from '../onboarding.js';

// Mock browser environment
vi.mock('$app/environment', () => ({
    browser: true
}));

describe('Onboarding Store', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        
        // Reset the onboarding store to initial state
        onboarding.reset();
    });

    it('should initialize with default state', () => {
        const state = get(onboarding);
        expect(state.currentStep).toBe(0);
        expect(state.isComplete).toBe(false);
        expect(state.goals.primaryObjective).toBe('');
        expect(state.experience.level).toBe('');
        expect(state.preferences.sports).toEqual([]);
    });

    it('should set goals and save to localStorage', () => {
        const goals = {
            primaryObjective: 'strength',
            timeline: '6_months',
            frequency: '3_4_times',
            duration: '60_min'
        };
        
        onboarding.setGoals(goals);
        
        const state = get(onboarding);
        expect(state.goals).toEqual(expect.objectContaining(goals));
        expect(JSON.parse(localStorage.getItem('onboarding_goals'))).toEqual(goals);
    });

    it('should set experience and save to localStorage', () => {
        const experience = {
            level: 'intermediate',
            currentRoutine: 'regular',
            previousExperience: 'moderate',
            injuries: ['lower_back', 'knee']
        };
        
        onboarding.setExperience(experience);
        
        const state = get(onboarding);
        expect(state.experience).toEqual(expect.objectContaining(experience));
        expect(JSON.parse(localStorage.getItem('onboarding_experience'))).toEqual(experience);
    });

    it('should set preferences and save to localStorage', () => {
        const preferences = {
            sports: ['running', 'weightlifting'],
            equipment: ['full_gym', 'bodyweight'],
            focusType: 'performance',
            schedule: ['morning', 'evening']
        };
        
        onboarding.setPreferences(preferences);
        
        const state = get(onboarding);
        expect(state.preferences).toEqual(expect.objectContaining(preferences));
        expect(JSON.parse(localStorage.getItem('onboarding_preferences'))).toEqual(preferences);
    });

    it('should navigate between steps correctly', () => {
        let state = get(onboarding);
        expect(state.currentStep).toBe(0);
        
        onboarding.nextStep();
        state = get(onboarding);
        expect(state.currentStep).toBe(1);
        
        onboarding.nextStep();
        state = get(onboarding);
        expect(state.currentStep).toBe(2);
        
        onboarding.previousStep();
        state = get(onboarding);
        expect(state.currentStep).toBe(1);
        
        onboarding.previousStep();
        state = get(onboarding);
        expect(state.currentStep).toBe(0);
    });

    it('should not allow navigation beyond bounds', () => {
        let state = get(onboarding);
        expect(state.currentStep).toBe(0);
        
        // Try to go before first step
        onboarding.previousStep();
        state = get(onboarding);
        expect(state.currentStep).toBe(0);
        
        // Go to last step
        onboarding.setStep(3);
        onboarding.nextStep();
        state = get(onboarding);
        expect(state.currentStep).toBe(3);
    });

    it('should set step directly', () => {
        onboarding.setStep(2);
        
        const state = get(onboarding);
        expect(state.currentStep).toBe(2);
    });

    it('should complete onboarding successfully', async () => {
        const result = await onboarding.complete();
        
        expect(result.success).toBe(true);
        
        const state = get(onboarding);
        expect(state.isComplete).toBe(true);
        expect(localStorage.getItem('onboarding_complete')).toBe('true');
    });

    it('should restore state from localStorage on init', () => {
        const goals = { primaryObjective: 'strength' };
        const experience = { level: 'beginner' };
        const preferences = { sports: ['running'] };
        
        localStorage.setItem('onboarding_goals', JSON.stringify(goals));
        localStorage.setItem('onboarding_experience', JSON.stringify(experience));
        localStorage.setItem('onboarding_preferences', JSON.stringify(preferences));
        localStorage.setItem('onboarding_complete', 'true');
        
        onboarding.init();
        
        const state = get(onboarding);
        expect(state.goals).toEqual(expect.objectContaining(goals));
        expect(state.experience).toEqual(expect.objectContaining(experience));
        expect(state.preferences).toEqual(expect.objectContaining(preferences));
        expect(state.isComplete).toBe(true);
    });

    it('should reset all data correctly', () => {
        // Set some data first
        onboarding.setGoals({ primaryObjective: 'strength' });
        onboarding.setExperience({ level: 'beginner' });
        onboarding.setPreferences({ sports: ['running'] });
        onboarding.setStep(2);
        
        // Reset
        onboarding.reset();
        
        const state = get(onboarding);
        expect(state.currentStep).toBe(0);
        expect(state.isComplete).toBe(false);
        expect(state.goals.primaryObjective).toBe('');
        expect(state.experience.level).toBe('');
        expect(state.preferences.sports).toEqual([]);
        
        // Check localStorage is cleared
        expect(localStorage.getItem('onboarding_goals')).toBe(null);
        expect(localStorage.getItem('onboarding_experience')).toBe(null);
        expect(localStorage.getItem('onboarding_preferences')).toBe(null);
        expect(localStorage.getItem('onboarding_complete')).toBe(null);
    });
});