import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { workoutSession } from '../workoutSession.js';

// Mock browser environment
vi.mock('$app/environment', () => ({
    browser: true
}));

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock navigator.vibrate
global.navigator = {
    vibrate: vi.fn()
};

describe('workoutSession store', () => {
    beforeEach(() => {
        // Clear all mocks
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        
        // Reset store
        workoutSession.clearAllData();
    });

    describe('store initialization', () => {
        it('should initialize with default state', () => {
            const state = get(workoutSession);
            
            expect(state).toEqual({
                currentSession: null,
                isActive: false,
                activeExerciseIndex: 0,
                sessionHistory: [],
                lastSyncedAt: null
            });
        });

        it.skip('should load persisted current session if recent', () => {
            const recentSession = {
                id: 'test-session',
                startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
                exercises: [],
                activeExerciseIndex: 0
            };
            
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'current_workout_session') {
                    return JSON.stringify(recentSession);
                }
                return null;
            });

            workoutSession.init();
            
            const state = get(workoutSession);
            expect(state.currentSession).toEqual(recentSession);
            expect(state.isActive).toBe(true);
        });

        it.skip('should not load persisted session if too old', () => {
            const oldSession = {
                id: 'test-session',
                startedAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
                exercises: []
            };
            
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'current_workout_session') {
                    return JSON.stringify(oldSession);
                }
                return null;
            });

            workoutSession.init();
            
            const state = get(workoutSession);
            expect(state.currentSession).toBe(null);
            expect(state.isActive).toBe(false);
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_workout_session');
        });

        it.skip('should load session history from localStorage', () => {
            const history = [
                { id: 'session1', completedAt: '2023-01-01T00:00:00.000Z' },
                { id: 'session2', completedAt: '2023-01-02T00:00:00.000Z' }
            ];
            
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'workout_session_history') {
                    return JSON.stringify(history);
                }
                return null;
            });

            workoutSession.init();
            
            const state = get(workoutSession);
            expect(state.sessionHistory).toEqual(history);
        });
    });

    describe('session management', () => {
        it.skip('should start a new session with routine', () => {
            const routine = {
                id: 'test-routine',
                name: 'Test Routine',
                exercises: [
                    { id: 'exercise1', name: 'Push-ups', sets: 3 },
                    { id: 'exercise2', name: 'Squats', sets: 2 }
                ]
            };

            const session = workoutSession.startSession(routine);
            const state = get(workoutSession);

            expect(session).toBeDefined();
            expect(session.routineId).toBe('test-routine');
            expect(session.routineName).toBe('Test Routine');
            expect(session.exercises).toHaveLength(2);
            expect(session.exercises[0].sets).toHaveLength(3);
            expect(session.exercises[1].sets).toHaveLength(2);
            expect(session.isQuickStart).toBe(false);
            
            expect(state.currentSession).toEqual(session);
            expect(state.isActive).toBe(true);
            expect(state.activeExerciseIndex).toBe(0);
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'current_workout_session',
                JSON.stringify(session)
            );
        });

        it('should start a quick workout session without routine', () => {
            const session = workoutSession.startSession(null);
            const state = get(workoutSession);

            expect(session.routineId).toBe(null);
            expect(session.routineName).toBe('Quick Workout');
            expect(session.exercises).toEqual([]);
            expect(session.isQuickStart).toBe(true);
            
            expect(state.currentSession).toEqual(session);
            expect(state.isActive).toBe(true);
        });

        it('should add exercise to quick start session', () => {
            workoutSession.startSession(null);
            
            const exercise = {
                id: 'push-ups',
                name: 'Push-ups',
                sets: 3
            };
            
            workoutSession.addExercise(exercise);
            
            const state = get(workoutSession);
            expect(state.currentSession.exercises).toHaveLength(1);
            expect(state.currentSession.exercises[0].name).toBe('Push-ups');
            expect(state.currentSession.exercises[0].sets).toHaveLength(3);
        });

        it('should navigate between exercises', () => {
            const routine = {
                id: 'test-routine',
                name: 'Test Routine',
                exercises: [
                    { id: 'exercise1', name: 'Exercise 1', sets: 3 },
                    { id: 'exercise2', name: 'Exercise 2', sets: 3 },
                    { id: 'exercise3', name: 'Exercise 3', sets: 3 }
                ]
            };

            workoutSession.startSession(routine);
            
            // Navigate to exercise 2
            workoutSession.setActiveExercise(1);
            let state = get(workoutSession);
            expect(state.activeExerciseIndex).toBe(1);
            expect(state.currentSession.activeExerciseIndex).toBe(1);
            
            // Navigate to exercise 3
            workoutSession.setActiveExercise(2);
            state = get(workoutSession);
            expect(state.activeExerciseIndex).toBe(2);
            
            // Try to navigate beyond bounds
            workoutSession.setActiveExercise(5);
            state = get(workoutSession);
            expect(state.activeExerciseIndex).toBe(2); // Should remain unchanged
        });

        it('should pause and resume session', () => {
            workoutSession.startSession(null);
            
            workoutSession.pauseSession();
            let state = get(workoutSession);
            expect(state.currentSession.isPaused).toBe(true);
            expect(state.currentSession.pausedAt).toBeDefined();
            
            workoutSession.resumeSession();
            state = get(workoutSession);
            expect(state.currentSession.isPaused).toBe(false);
            expect(state.currentSession.pausedAt).toBe(null);
        });

        it.skip('should cancel session', () => {
            workoutSession.startSession(null);
            
            workoutSession.cancelSession();
            
            const state = get(workoutSession);
            expect(state.currentSession).toBe(null);
            expect(state.isActive).toBe(false);
            expect(state.activeExerciseIndex).toBe(0);
            
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_workout_session');
        });
    });

    describe('set recording', () => {
        beforeEach(() => {
            const routine = {
                id: 'test-routine',
                name: 'Test Routine',
                exercises: [
                    { id: 'exercise1', name: 'Push-ups', sets: 3 }
                ]
            };
            workoutSession.startSession(routine);
        });

        it('should record a set with all data', () => {
            const setData = {
                reps: 12,
                weight: 50,
                rpe: 7
            };

            workoutSession.recordSet(0, 0, setData);
            
            const state = get(workoutSession);
            const recordedSet = state.currentSession.exercises[0].sets[0];
            
            expect(recordedSet.reps).toBe(12);
            expect(recordedSet.weight).toBe(50);
            expect(recordedSet.rpe).toBe(7);
            expect(recordedSet.completed).toBe(true);
            expect(recordedSet.timestamp).toBeDefined();
        });

        it.skip('should handle partial set data', () => {
            const setData = {
                reps: 10
                // weight and rpe not provided
            };

            workoutSession.recordSet(0, 0, setData);
            
            const state = get(workoutSession);
            const recordedSet = state.currentSession.exercises[0].sets[0];
            
            expect(recordedSet.reps).toBe(10);
            expect(recordedSet.weight).toBeUndefined();
            expect(recordedSet.rpe).toBeUndefined();
            expect(recordedSet.completed).toBe(true);
        });

        it('should not record if invalid exercise or set index', () => {
            const setData = { reps: 10 };
            
            // Invalid exercise index
            workoutSession.recordSet(5, 0, setData);
            let state = get(workoutSession);
            expect(state.currentSession.exercises[0].sets[0].completed).toBe(false);
            
            // Invalid set index
            workoutSession.recordSet(0, 5, setData);
            state = get(workoutSession);
            expect(state.currentSession.exercises[0].sets[0].completed).toBe(false);
        });
    });

    describe('last set data retrieval', () => {
        it('should return previous set data from same exercise', () => {
            const routine = {
                id: 'test-routine',
                name: 'Test Routine',
                exercises: [
                    { id: 'exercise1', name: 'Push-ups', sets: 3 }
                ]
            };
            workoutSession.startSession(routine);
            
            // Record first set
            workoutSession.recordSet(0, 0, { reps: 10, weight: 50, rpe: 6 });
            
            // Get last set data for second set
            const lastSetData = workoutSession.getLastSetData(0, 1);
            
            expect(lastSetData).toEqual({
                setNumber: 1,
                reps: 10,
                weight: 50,
                rpe: 6,
                completed: true,
                timestamp: expect.any(String)
            });
        });

        it('should return null if no previous set data', () => {
            const routine = {
                id: 'test-routine',
                name: 'Test Routine',
                exercises: [
                    { id: 'exercise1', name: 'Push-ups', sets: 3 }
                ]
            };
            workoutSession.startSession(routine);
            
            const lastSetData = workoutSession.getLastSetData(0, 0);
            expect(lastSetData).toBe(null);
        });
    });

    describe('session completion', () => {
        it.skip('should complete session and add to history', () => {
            const routine = {
                id: 'test-routine',
                name: 'Test Routine',
                exercises: [
                    { id: 'exercise1', name: 'Push-ups', sets: 2 }
                ]
            };
            workoutSession.startSession(routine);
            
            // Record some sets
            workoutSession.recordSet(0, 0, { reps: 10 });
            workoutSession.recordSet(0, 1, { reps: 8 });
            
            const notes = 'Great workout today!';
            workoutSession.completeSession(notes);
            
            const state = get(workoutSession);
            
            expect(state.currentSession).toBe(null);
            expect(state.isActive).toBe(false);
            expect(state.activeExerciseIndex).toBe(0);
            expect(state.sessionHistory).toHaveLength(1);
            
            const completedSession = state.sessionHistory[0];
            expect(completedSession.completedAt).toBeDefined();
            expect(completedSession.notes).toBe(notes);
            expect(completedSession.duration).toBeGreaterThan(0);
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'workout_session_history',
                expect.any(String)
            );
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_workout_session');
        });

        it.skip('should limit session history to 50 entries', () => {
            // Create 51 sessions in history
            const existingHistory = Array.from({ length: 51 }, (_, i) => ({
                id: `session-${i}`,
                completedAt: new Date().toISOString()
            }));
            
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'workout_session_history') {
                    return JSON.stringify(existingHistory);
                }
                return null;
            });
            
            workoutSession.init();
            workoutSession.startSession(null);
            workoutSession.completeSession('test');
            
            const state = get(workoutSession);
            expect(state.sessionHistory).toHaveLength(50);
        });
    });

    describe('workout statistics', () => {
        it.skip('should calculate correct workout statistics', () => {
            // Add some session history
            const history = [
                {
                    id: 'session1',
                    duration: 1800000, // 30 minutes
                    exercises: [
                        {
                            name: 'Push-ups',
                            sets: [
                                { completed: true },
                                { completed: true }
                            ]
                        },
                        {
                            name: 'Squats',
                            sets: [
                                { completed: true }
                            ]
                        }
                    ]
                },
                {
                    id: 'session2',
                    duration: 2400000, // 40 minutes
                    exercises: [
                        {
                            name: 'Push-ups',
                            sets: [
                                { completed: true }
                            ]
                        }
                    ]
                }
            ];
            
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'workout_session_history') {
                    return JSON.stringify(history);
                }
                return null;
            });
            
            workoutSession.init();
            const stats = workoutSession.getWorkoutStats();
            
            expect(stats.totalWorkouts).toBe(2);
            expect(stats.totalDuration).toBe(4200000); // 70 minutes total
            expect(stats.averageDuration).toBe(2100000); // 35 minutes average
            expect(stats.totalSets).toBe(4);
            expect(stats.favoriteExercises['Push-ups']).toBe(2);
            expect(stats.favoriteExercises['Squats']).toBe(1);
        });
    });

    describe('data persistence', () => {
        it.skip('should persist current session to localStorage', () => {
            const routine = {
                id: 'test-routine',
                name: 'Test Routine',
                exercises: []
            };
            
            workoutSession.startSession(routine);
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'current_workout_session',
                expect.stringContaining('test-routine')
            );
        });

        it('should handle localStorage errors gracefully', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('LocalStorage full');
            });
            
            // Should not throw error
            expect(() => {
                workoutSession.startSession(null);
            }).not.toThrow();
        });

        it.skip('should add completed sessions to sync queue', () => {
            workoutSession.startSession(null);
            workoutSession.completeSession('test');
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'workout_sync_queue',
                expect.stringContaining('queuedAt')
            );
        });
    });

    describe('data clearing', () => {
        it.skip('should clear all data when requested', () => {
            workoutSession.startSession(null);
            workoutSession.clearAllData();
            
            const state = get(workoutSession);
            expect(state).toEqual({
                currentSession: null,
                isActive: false,
                activeExerciseIndex: 0,
                sessionHistory: [],
                lastSyncedAt: null
            });
            
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_workout_session');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('workout_session_history');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('workout_sync_queue');
        });
    });
});