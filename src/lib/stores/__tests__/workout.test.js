import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { workout } from '../workout.js';

// Mock browser environment
vi.mock('$app/environment', () => ({
    browser: true
}));

describe('Workout Store', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset workout store to initial state
        const state = get(workout);
        workout.clearGeneratedRoutine();
    });

    it('should initialize with default state', () => {
        const state = get(workout);
        expect(state.currentRoutine).toBe(null);
        expect(state.savedRoutines).toEqual([]);
        expect(state.generatedRoutine).toBe(null);
        expect(state.isGenerating).toBe(false);
    });

    describe('generateRoutine', () => {
        const mockUserProfile = {
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
            }
        };

        it('should generate a strength routine for muscle building', async () => {
            const preferences = { type: 'strength', duration: '30_45_mins' };
            
            const routine = await workout.generateRoutine(mockUserProfile, preferences);
            
            expect(routine).toBeDefined();
            expect(routine.type).toBe('strength');
            expect(routine.name).toContain('Muscle Building');
            expect(routine.exercises).toBeInstanceOf(Array);
            expect(routine.exercises.length).toBeGreaterThan(0);
            
            // Check for warm-up, main, and cool-down phases
            const phases = routine.exercises.map(ex => ex.phase);
            expect(phases).toContain('warmup');
            expect(phases).toContain('main');
            expect(phases).toContain('cooldown');
        });

        it('should generate a cardio routine for endurance', async () => {
            const cardioProfile = {
                ...mockUserProfile,
                goals: { ...mockUserProfile.goals, primaryObjective: 'improve_endurance' }
            };
            const preferences = { type: 'cardio', duration: '30_45_mins' };
            
            const routine = await workout.generateRoutine(cardioProfile, preferences);
            
            expect(routine.type).toBe('cardio');
            expect(routine.exercises).toBeInstanceOf(Array);
            
            // Should have sustained and interval cardio exercises
            const mainExercises = routine.exercises.filter(ex => ex.phase === 'main');
            expect(mainExercises.length).toBeGreaterThan(0);
        });

        it('should generate appropriate exercises for beginner level', async () => {
            const preferences = { type: 'strength', duration: '30_45_mins' };
            
            const routine = await workout.generateRoutine(mockUserProfile, preferences);
            
            const mainExercises = routine.exercises.filter(ex => ex.phase === 'main');
            mainExercises.forEach(exercise => {
                expect(exercise.sets).toBeGreaterThanOrEqual(2);
                expect(exercise.sets).toBeLessThanOrEqual(4);
                expect(exercise.restTime).toBeGreaterThanOrEqual(60);
            });
        });

        it('should generate appropriate exercises for advanced level', async () => {
            const advancedProfile = {
                ...mockUserProfile,
                experience: { ...mockUserProfile.experience, level: 'advanced' }
            };
            const preferences = { type: 'strength', duration: '30_45_mins' };
            
            const routine = await workout.generateRoutine(advancedProfile, preferences);
            
            const mainExercises = routine.exercises.filter(ex => ex.phase === 'main');
            mainExercises.forEach(exercise => {
                expect(exercise.sets).toBeGreaterThanOrEqual(3);
                expect(exercise.sets).toBeLessThanOrEqual(4);
            });
        });

        it('should respect equipment preferences', async () => {
            const bodyweightProfile = {
                ...mockUserProfile,
                preferences: { ...mockUserProfile.preferences, equipment: ['bodyweight'] }
            };
            const preferences = { type: 'strength', duration: '30_45_mins' };
            
            const routine = await workout.generateRoutine(bodyweightProfile, preferences);
            
            const mainExercises = routine.exercises.filter(ex => ex.phase === 'main');
            mainExercises.forEach(exercise => {
                expect(['bodyweight', 'none']).toContain(exercise.equipment);
            });
        });

        it('should set isGenerating state during generation', async () => {
            const preferences = { type: 'strength', duration: '30_45_mins' };
            
            // Start generation
            const routinePromise = workout.generateRoutine(mockUserProfile, preferences);
            
            // Check that isGenerating is true during generation
            let state = get(workout);
            expect(state.isGenerating).toBe(true);
            
            // Wait for completion
            await routinePromise;
            
            // Check that isGenerating is false after completion
            state = get(workout);
            expect(state.isGenerating).toBe(false);
            expect(state.generatedRoutine).toBeDefined();
        });

        it('should generate unique routine IDs', async () => {
            const preferences = { type: 'strength', duration: '30_45_mins' };
            
            const routine1 = await workout.generateRoutine(mockUserProfile, preferences);
            const routine2 = await workout.generateRoutine(mockUserProfile, preferences);
            
            expect(routine1.id).toBeDefined();
            expect(routine2.id).toBeDefined();
            expect(routine1.id).not.toBe(routine2.id);
        });
    });

    describe('saveRoutine', () => {
        it('should save a routine to localStorage and store', () => {
            const mockRoutine = {
                name: 'Test Routine',
                type: 'strength',
                exercises: [],
                estimatedTime: 30
            };
            
            const savedRoutine = workout.saveRoutine(mockRoutine);
            
            expect(savedRoutine).toBeDefined();
            expect(savedRoutine.id).toBeDefined();
            expect(savedRoutine.createdAt).toBeDefined();
            expect(savedRoutine.name).toBe('Test Routine');
            
            const state = get(workout);
            expect(state.savedRoutines).toContain(savedRoutine);
            
            const savedInStorage = JSON.parse(localStorage.getItem('saved_routines'));
            expect(savedInStorage).toHaveLength(1);
            expect(savedInStorage[0]).toMatchObject({
                name: 'Test Routine',
                type: 'strength'
            });
        });
    });

    describe('loadSavedRoutines', () => {
        it('should load routines from localStorage', () => {
            const mockRoutines = [
                { id: '1', name: 'Routine 1', type: 'strength' },
                { id: '2', name: 'Routine 2', type: 'cardio' }
            ];
            
            localStorage.setItem('saved_routines', JSON.stringify(mockRoutines));
            
            workout.loadSavedRoutines();
            
            const state = get(workout);
            expect(state.savedRoutines).toEqual(mockRoutines);
        });

        it('should handle empty localStorage', () => {
            workout.loadSavedRoutines();
            
            const state = get(workout);
            expect(state.savedRoutines).toEqual([]);
        });
    });

    describe('setCurrentRoutine', () => {
        it('should set the current routine', () => {
            const mockRoutine = { id: '1', name: 'Test Routine' };
            
            workout.setCurrentRoutine(mockRoutine);
            
            const state = get(workout);
            expect(state.currentRoutine).toBe(mockRoutine);
        });
    });

    describe('clearGeneratedRoutine', () => {
        it('should clear the generated routine', () => {
            // First set a generated routine
            const mockRoutine = { id: '1', name: 'Test Routine' };
            workout.setCurrentRoutine(mockRoutine);
            
            // Then clear it
            workout.clearGeneratedRoutine();
            
            const state = get(workout);
            expect(state.generatedRoutine).toBe(null);
        });
    });
});

describe('Exercise Generation Functions', () => {
    describe('Cardio exercises', () => {
        it('should generate realistic rep ranges for interval exercises', async () => {
            const mockUserProfile = {
                goals: { primaryObjective: 'improve_endurance', duration: '30_45_mins' },
                experience: { level: 'beginner' },
                preferences: { equipment: ['bodyweight'] }
            };
            
            const routine = await workout.generateRoutine(mockUserProfile, { type: 'cardio' });
            const intervalExercises = routine.exercises.filter(ex => 
                ex.phase === 'main' && ex.id === 'jumping_jacks'
            );
            
            if (intervalExercises.length > 0) {
                const exercise = intervalExercises[0];
                expect(exercise.sets).toBe(3); // Beginner should get 3 sets
                expect(exercise.reps).toBe(25); // Beginner should get 25 reps
                expect(exercise.restTime).toBe(60); // Beginner rest time
            }
        });

        it('should generate realistic durations for sustained cardio', async () => {
            const mockUserProfile = {
                goals: { primaryObjective: 'improve_endurance', duration: '30_45_mins' },
                experience: { level: 'intermediate' },
                preferences: { equipment: ['none'] }
            };
            
            const routine = await workout.generateRoutine(mockUserProfile, { type: 'cardio' });
            const sustainedExercises = routine.exercises.filter(ex => 
                ex.phase === 'main' && (ex.id === 'running' || ex.id === 'walking')
            );
            
            if (sustainedExercises.length > 0) {
                const exercise = sustainedExercises[0];
                expect(exercise.duration).toMatch(/\d+ minutes/);
                const minutes = parseInt(exercise.duration);
                expect(minutes).toBeGreaterThanOrEqual(10);
                expect(minutes).toBeLessThanOrEqual(35);
            }
        });
    });

    describe('Strength exercises', () => {
        it('should generate exercise-specific rep ranges', async () => {
            const mockUserProfile = {
                goals: { primaryObjective: 'build_muscle', duration: '30_45_mins' },
                experience: { level: 'beginner' },
                preferences: { equipment: ['bodyweight'] }
            };
            
            const routine = await workout.generateRoutine(mockUserProfile, { type: 'strength' });
            const strengthExercises = routine.exercises.filter(ex => ex.phase === 'main');
            
            strengthExercises.forEach(exercise => {
                expect(exercise.reps).toBeDefined();
                expect(exercise.sets).toBeGreaterThanOrEqual(2);
                expect(exercise.sets).toBeLessThanOrEqual(4);
                expect(exercise.restTime).toBeGreaterThanOrEqual(60);
            });
        });

        it('should include exercise notes for guidance', async () => {
            const mockUserProfile = {
                goals: { primaryObjective: 'build_muscle', duration: '30_45_mins' },
                experience: { level: 'beginner' },
                preferences: { equipment: ['bodyweight'] }
            };
            
            const routine = await workout.generateRoutine(mockUserProfile, { type: 'strength' });
            const mainExercises = routine.exercises.filter(ex => ex.phase === 'main');
            
            // At least some exercises should have notes
            const exercisesWithNotes = mainExercises.filter(ex => ex.notes);
            expect(exercisesWithNotes.length).toBeGreaterThan(0);
        });
    });

    describe('Warm-up and Cool-down', () => {
        it('should include warm-up exercises in every routine', async () => {
            const mockUserProfile = {
                goals: { primaryObjective: 'build_muscle', duration: '30_45_mins' },
                experience: { level: 'beginner' },
                preferences: { equipment: ['bodyweight'] }
            };
            
            const routine = await workout.generateRoutine(mockUserProfile, { type: 'strength' });
            const warmupExercises = routine.exercises.filter(ex => ex.phase === 'warmup');
            
            expect(warmupExercises.length).toBeGreaterThan(0);
            warmupExercises.forEach(exercise => {
                expect(exercise.restTime).toBe(0);
                expect(exercise.sets).toBe(1);
            });
        });

        it('should include cool-down exercises in every routine', async () => {
            const mockUserProfile = {
                goals: { primaryObjective: 'build_muscle', duration: '30_45_mins' },
                experience: { level: 'beginner' },
                preferences: { equipment: ['bodyweight'] }
            };
            
            const routine = await workout.generateRoutine(mockUserProfile, { type: 'strength' });
            const cooldownExercises = routine.exercises.filter(ex => ex.phase === 'cooldown');
            
            expect(cooldownExercises.length).toBeGreaterThan(0);
            cooldownExercises.forEach(exercise => {
                expect(exercise.restTime).toBe(0);
                expect(exercise.sets).toBe(1);
            });
        });
    });
});