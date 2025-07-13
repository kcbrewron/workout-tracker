import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createOnboardingStore() {
    const { subscribe, set, update } = writable({
        currentStep: 0,
        goals: {
            primaryObjective: '',
            timeline: '',
            frequency: '',
            duration: ''
        },
        experience: {
            level: '',
            currentRoutine: '',
            previousExperience: '',
            injuries: []
        },
        preferences: {
            sports: [],
            equipment: [],
            focusType: '',
            schedule: []
        },
        isComplete: false
    });

    return {
        subscribe,
        
        setGoals: (goals) => {
            update(state => ({
                ...state,
                goals: { ...state.goals, ...goals }
            }));
            if (browser) {
                localStorage.setItem('onboarding_goals', JSON.stringify(goals));
            }
        },
        
        setExperience: (experience) => {
            update(state => ({
                ...state,
                experience: { ...state.experience, ...experience }
            }));
            if (browser) {
                localStorage.setItem('onboarding_experience', JSON.stringify(experience));
            }
        },
        
        setPreferences: (preferences) => {
            update(state => ({
                ...state,
                preferences: { ...state.preferences, ...preferences }
            }));
            if (browser) {
                localStorage.setItem('onboarding_preferences', JSON.stringify(preferences));
            }
        },
        
        nextStep: () => {
            update(state => ({
                ...state,
                currentStep: Math.min(state.currentStep + 1, 3)
            }));
        },
        
        previousStep: () => {
            update(state => ({
                ...state,
                currentStep: Math.max(state.currentStep - 1, 0)
            }));
        },
        
        setStep: (step) => {
            update(state => ({
                ...state,
                currentStep: step
            }));
        },
        
        complete: async () => {
            update(state => ({ ...state, isComplete: true }));
            
            if (browser) {
                localStorage.setItem('onboarding_complete', 'true');
            }
            
            // Mock API call to save onboarding data
            await new Promise(resolve => setTimeout(resolve, 500));
            return { success: true };
        },
        
        reset: () => {
            set({
                currentStep: 0,
                goals: {
                    primaryObjective: '',
                    timeline: '',
                    frequency: '',
                    duration: ''
                },
                experience: {
                    level: '',
                    currentRoutine: '',
                    previousExperience: '',
                    injuries: []
                },
                preferences: {
                    sports: [],
                    equipment: [],
                    focusType: '',
                    schedule: []
                },
                isComplete: false
            });
            
            if (browser) {
                localStorage.removeItem('onboarding_goals');
                localStorage.removeItem('onboarding_experience');
                localStorage.removeItem('onboarding_preferences');
                localStorage.removeItem('onboarding_complete');
            }
        },
        
        init: () => {
            if (browser) {
                const goals = localStorage.getItem('onboarding_goals');
                const experience = localStorage.getItem('onboarding_experience');
                const preferences = localStorage.getItem('onboarding_preferences');
                const isComplete = localStorage.getItem('onboarding_complete') === 'true';
                
                update(state => ({
                    ...state,
                    goals: goals ? JSON.parse(goals) : state.goals,
                    experience: experience ? JSON.parse(experience) : state.experience,
                    preferences: preferences ? JSON.parse(preferences) : state.preferences,
                    isComplete
                }));
            }
        }
    };
}

export const onboarding = createOnboardingStore();