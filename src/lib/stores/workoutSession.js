import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createWorkoutSessionStore() {
    const { subscribe, set, update } = writable({
        currentSession: null,
        isActive: false,
        activeExerciseIndex: 0,
        sessionHistory: [],
        lastSyncedAt: null
    });

    // Storage keys
    const CURRENT_SESSION_KEY = 'current_workout_session';
    const SESSION_HISTORY_KEY = 'workout_session_history';
    const SYNC_QUEUE_KEY = 'workout_sync_queue';

    // Load persisted data on initialization
    function loadPersistedData() {
        if (!browser) return;

        try {
            const currentSession = localStorage.getItem(CURRENT_SESSION_KEY);
            const sessionHistory = localStorage.getItem(SESSION_HISTORY_KEY);

            if (currentSession) {
                const session = JSON.parse(currentSession);
                // Resume session if it was started less than 24 hours ago
                const sessionAge = Date.now() - new Date(session.startedAt).getTime();
                if (sessionAge < 24 * 60 * 60 * 1000) {
                    update(state => ({
                        ...state,
                        currentSession: session,
                        isActive: true,
                        activeExerciseIndex: session.activeExerciseIndex || 0
                    }));
                } else {
                    // Session too old, clear it
                    localStorage.removeItem(CURRENT_SESSION_KEY);
                }
            }

            if (sessionHistory) {
                const history = JSON.parse(sessionHistory);
                update(state => ({
                    ...state,
                    sessionHistory: history
                }));
            }
        } catch (error) {
            console.error('Error loading persisted workout data:', error);
        }
    }

    // Persist current session to localStorage
    function persistCurrentSession(session) {
        if (!browser) return;
        
        try {
            if (session) {
                localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
            } else {
                localStorage.removeItem(CURRENT_SESSION_KEY);
            }
        } catch (error) {
            console.error('Error persisting current session:', error);
        }
    }

    // Persist session history to localStorage
    function persistSessionHistory(history) {
        if (!browser) return;
        
        try {
            localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Error persisting session history:', error);
        }
    }

    // Add to sync queue for later backend sync
    function addToSyncQueue(sessionData) {
        if (!browser) return;
        
        try {
            const syncQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
            syncQueue.push({
                ...sessionData,
                queuedAt: new Date().toISOString()
            });
            localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
        } catch (error) {
            console.error('Error adding to sync queue:', error);
        }
    }

    return {
        subscribe,
        
        // Initialize the store
        init: () => {
            loadPersistedData();
        },

        // Start a new workout session
        startSession: (routine) => {
            const session = {
                id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                routineId: routine?.id || null,
                routineName: routine?.name || 'Quick Workout',
                exercises: routine ? routine.exercises.map(exercise => ({
                    ...exercise,
                    sets: exercise.sets ? Array(exercise.sets).fill(null).map((_, index) => ({
                        setNumber: index + 1,
                        reps: null,
                        weight: null,
                        rpe: null,
                        completed: false,
                        timestamp: null
                    })) : []
                })) : [],
                startedAt: new Date().toISOString(),
                completedAt: null,
                activeExerciseIndex: 0,
                notes: '',
                duration: 0,
                isQuickStart: !routine
            };

            update(state => ({
                ...state,
                currentSession: session,
                isActive: true,
                activeExerciseIndex: 0
            }));

            persistCurrentSession(session);
            return session;
        },

        // Add exercise to current session (for quick start)
        addExercise: (exercise) => {
            update(state => {
                if (!state.currentSession) return state;

                const exerciseWithSets = {
                    ...exercise,
                    sets: exercise.sets ? Array(exercise.sets).fill(null).map((_, index) => ({
                        setNumber: index + 1,
                        reps: null,
                        weight: null,
                        rpe: null,
                        completed: false,
                        timestamp: null
                    })) : Array(3).fill(null).map((_, index) => ({
                        setNumber: index + 1,
                        reps: null,
                        weight: null,
                        rpe: null,
                        completed: false,
                        timestamp: null
                    }))
                };

                const updatedSession = {
                    ...state.currentSession,
                    exercises: [...state.currentSession.exercises, exerciseWithSets]
                };

                persistCurrentSession(updatedSession);

                return {
                    ...state,
                    currentSession: updatedSession
                };
            });
        },

        // Navigate between exercises
        setActiveExercise: (index) => {
            update(state => {
                if (!state.currentSession || index < 0 || index >= state.currentSession.exercises.length) {
                    return state;
                }

                const updatedSession = {
                    ...state.currentSession,
                    activeExerciseIndex: index
                };

                persistCurrentSession(updatedSession);

                return {
                    ...state,
                    currentSession: updatedSession,
                    activeExerciseIndex: index
                };
            });
        },

        // Record a set
        recordSet: (exerciseIndex, setIndex, setData) => {
            update(state => {
                if (!state.currentSession) return state;

                const updatedExercises = [...state.currentSession.exercises];
                const exercise = updatedExercises[exerciseIndex];
                
                if (!exercise || !exercise.sets[setIndex]) return state;

                exercise.sets[setIndex] = {
                    ...exercise.sets[setIndex],
                    ...setData,
                    completed: true,
                    timestamp: new Date().toISOString()
                };

                const updatedSession = {
                    ...state.currentSession,
                    exercises: updatedExercises
                };

                persistCurrentSession(updatedSession);

                return {
                    ...state,
                    currentSession: updatedSession
                };
            });
        },

        // Get last set data for quick presets
        getLastSetData: (exerciseIndex, setIndex) => {
            let lastSet = null;
            
            // First try previous set in current exercise
            update(state => {
                if (!state.currentSession) return state;
                
                const exercise = state.currentSession.exercises[exerciseIndex];
                if (exercise && setIndex > 0) {
                    const prevSet = exercise.sets[setIndex - 1];
                    if (prevSet && prevSet.completed) {
                        lastSet = prevSet;
                    }
                }
                
                return state;
            });

            if (lastSet) return lastSet;

            // Try to find last completed set from session history for same exercise
            let historySet = null;
            update(state => {
                const exerciseId = state.currentSession?.exercises[exerciseIndex]?.id;
                if (!exerciseId) return state;

                for (const session of state.sessionHistory.slice().reverse()) {
                    for (const exercise of session.exercises) {
                        if (exercise.id === exerciseId) {
                            const completedSets = exercise.sets.filter(set => set.completed);
                            if (completedSets.length > 0) {
                                historySet = completedSets[completedSets.length - 1];
                                return state;
                            }
                        }
                    }
                }
                
                return state;
            });

            return historySet;
        },

        // Complete current session
        completeSession: (notes = '') => {
            update(state => {
                if (!state.currentSession) return state;

                const completedSession = {
                    ...state.currentSession,
                    completedAt: new Date().toISOString(),
                    notes: notes,
                    duration: Date.now() - new Date(state.currentSession.startedAt).getTime()
                };

                const updatedHistory = [...state.sessionHistory, completedSession];
                
                // Keep only last 50 sessions in memory
                if (updatedHistory.length > 50) {
                    updatedHistory.splice(0, updatedHistory.length - 50);
                }

                persistSessionHistory(updatedHistory);
                addToSyncQueue(completedSession);
                
                // Clear current session
                localStorage.removeItem(CURRENT_SESSION_KEY);

                return {
                    ...state,
                    currentSession: null,
                    isActive: false,
                    activeExerciseIndex: 0,
                    sessionHistory: updatedHistory
                };
            });
        },

        // Cancel current session
        cancelSession: () => {
            update(state => {
                localStorage.removeItem(CURRENT_SESSION_KEY);
                
                return {
                    ...state,
                    currentSession: null,
                    isActive: false,
                    activeExerciseIndex: 0
                };
            });
        },

        // Pause/Resume session
        pauseSession: () => {
            update(state => {
                if (!state.currentSession) return state;

                const updatedSession = {
                    ...state.currentSession,
                    isPaused: true,
                    pausedAt: new Date().toISOString()
                };

                persistCurrentSession(updatedSession);

                return {
                    ...state,
                    currentSession: updatedSession
                };
            });
        },

        resumeSession: () => {
            update(state => {
                if (!state.currentSession) return state;

                const updatedSession = {
                    ...state.currentSession,
                    isPaused: false,
                    pausedAt: null
                };

                persistCurrentSession(updatedSession);

                return {
                    ...state,
                    currentSession: updatedSession
                };
            });
        },

        // Get workout statistics
        getWorkoutStats: () => {
            let stats = {
                totalWorkouts: 0,
                totalDuration: 0,
                averageDuration: 0,
                totalSets: 0,
                favoriteExercises: {}
            };

            update(state => {
                stats.totalWorkouts = state.sessionHistory.length;
                stats.totalDuration = state.sessionHistory.reduce((sum, session) => sum + (session.duration || 0), 0);
                stats.averageDuration = stats.totalWorkouts > 0 ? stats.totalDuration / stats.totalWorkouts : 0;

                // Count sets and favorite exercises
                state.sessionHistory.forEach(session => {
                    session.exercises.forEach(exercise => {
                        const completedSets = exercise.sets.filter(set => set.completed).length;
                        stats.totalSets += completedSets;
                        
                        if (completedSets > 0) {
                            stats.favoriteExercises[exercise.name] = (stats.favoriteExercises[exercise.name] || 0) + 1;
                        }
                    });
                });

                return state;
            });

            return stats;
        },

        // Clear all data (for development/testing)
        clearAllData: () => {
            if (!browser) return;
            
            localStorage.removeItem(CURRENT_SESSION_KEY);
            localStorage.removeItem(SESSION_HISTORY_KEY);
            localStorage.removeItem(SYNC_QUEUE_KEY);
            
            set({
                currentSession: null,
                isActive: false,
                activeExerciseIndex: 0,
                sessionHistory: [],
                lastSyncedAt: null
            });
        }
    };
}

export const workoutSession = createWorkoutSessionStore();