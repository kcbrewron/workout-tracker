import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { convertToStorageUnits } from '$lib/utils/units.js';

function createAnalyticsStore() {
    const { subscribe, set, update } = writable({
        bodyMeasurements: [],
        weightHistory: [],
        goals: [],
        analytics: {
            currentWeight: null,
            weightChange30Days: null,
            weightTrend: 'stable',
            lastMeasurementDate: null,
            measurementProgress: {}
        },
        isLoading: false,
        error: null
    });

    const STORAGE_KEY = 'workout_tracker_analytics';

    const loadFromStorage = () => {
        if (browser && typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored);
                    update(state => ({ ...state, ...data }));
                }
            } catch (error) {
                console.error('Failed to load analytics from storage:', error);
            }
        }
    };

    const saveToStorage = (state) => {
        if (browser && typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    bodyMeasurements: state.bodyMeasurements,
                    weightHistory: state.weightHistory,
                    goals: state.goals
                }));
            } catch (error) {
                console.error('Failed to save analytics to storage:', error);
            }
        }
    };

    const calculateAnalytics = (measurements, weightHistory) => {
        const analytics = {
            currentWeight: null,
            weightChange30Days: null,
            weightTrend: 'stable',
            lastMeasurementDate: null,
            measurementProgress: {}
        };

        if (weightHistory.length > 0) {
            const sortedWeights = weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            analytics.currentWeight = sortedWeights[0].weight;
            analytics.lastMeasurementDate = sortedWeights[0].date;

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const oldWeight = sortedWeights.find(w => new Date(w.date) <= thirtyDaysAgo);
            if (oldWeight) {
                analytics.weightChange30Days = analytics.currentWeight - oldWeight.weight;
                analytics.weightTrend = analytics.weightChange30Days > 0.5 ? 'gaining' : 
                                       analytics.weightChange30Days < -0.5 ? 'losing' : 'stable';
            }
        }

        if (measurements.length > 0) {
            const sortedMeasurements = measurements.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latest = sortedMeasurements[0];
            
            if (sortedMeasurements.length > 1) {
                const previous = sortedMeasurements[1];
                const measurementFields = ['chest', 'waist', 'hips', 'leftBicep', 'rightBicep', 'leftThigh', 'rightThigh'];
                
                measurementFields.forEach(field => {
                    if (latest[field] && previous[field]) {
                        analytics.measurementProgress[field] = latest[field] - previous[field];
                    }
                });
            }
        }

        return analytics;
    };

    return {
        subscribe,
        
        addWeightEntry: (weight, date = new Date().toISOString().split('T')[0], notes = '', inputUnit = 'kg') => {
            update(state => {
                // Always store weight in kg (metric)
                const weightInKg = convertToStorageUnits(parseFloat(weight), 'weight', inputUnit === 'lbs' ? 'imperial' : 'metric');
                
                const newEntry = {
                    id: Date.now().toString(),
                    weight: weightInKg,
                    date,
                    notes,
                    createdAt: new Date().toISOString()
                };
                
                const updatedWeightHistory = [...state.weightHistory, newEntry]
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                
                const analytics = calculateAnalytics(state.bodyMeasurements, updatedWeightHistory);
                
                const newState = {
                    ...state,
                    weightHistory: updatedWeightHistory,
                    analytics
                };
                
                saveToStorage(newState);
                return newState;
            });
        },

        updateWeightEntry: (id, weight, date, notes = '', inputUnit = 'kg') => {
            update(state => {
                // Always store weight in kg (metric)
                const weightInKg = convertToStorageUnits(parseFloat(weight), 'weight', inputUnit === 'lbs' ? 'imperial' : 'metric');
                
                const updatedWeightHistory = state.weightHistory.map(entry => 
                    entry.id === id 
                        ? { ...entry, weight: weightInKg, date, notes, updatedAt: new Date().toISOString() }
                        : entry
                ).sort((a, b) => new Date(b.date) - new Date(a.date));
                
                const analytics = calculateAnalytics(state.bodyMeasurements, updatedWeightHistory);
                
                const newState = {
                    ...state,
                    weightHistory: updatedWeightHistory,
                    analytics
                };
                
                saveToStorage(newState);
                return newState;
            });
        },

        deleteWeightEntry: (id) => {
            update(state => {
                const updatedWeightHistory = state.weightHistory.filter(entry => entry.id !== id);
                const analytics = calculateAnalytics(state.bodyMeasurements, updatedWeightHistory);
                
                const newState = {
                    ...state,
                    weightHistory: updatedWeightHistory,
                    analytics
                };
                
                saveToStorage(newState);
                return newState;
            });
        },

        addBodyMeasurement: (measurements, date = new Date().toISOString().split('T')[0], notes = '', inputUnit = 'cm') => {
            update(state => {
                // Always store measurements in cm (metric)
                const measurementsInCm = {};
                Object.entries(measurements).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        measurementsInCm[key] = convertToStorageUnits(parseFloat(value), 'length', inputUnit === 'in' ? 'imperial' : 'metric');
                    }
                });
                
                const newMeasurement = {
                    id: Date.now().toString(),
                    date,
                    notes,
                    createdAt: new Date().toISOString(),
                    ...measurementsInCm
                };
                
                const updatedMeasurements = [...state.bodyMeasurements, newMeasurement]
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                
                const analytics = calculateAnalytics(updatedMeasurements, state.weightHistory);
                
                const newState = {
                    ...state,
                    bodyMeasurements: updatedMeasurements,
                    analytics
                };
                
                saveToStorage(newState);
                return newState;
            });
        },

        updateBodyMeasurement: (id, measurements, date, notes = '', inputUnit = 'cm') => {
            update(state => {
                // Always store measurements in cm (metric)
                const measurementsInCm = {};
                Object.entries(measurements).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        measurementsInCm[key] = convertToStorageUnits(parseFloat(value), 'length', inputUnit === 'in' ? 'imperial' : 'metric');
                    }
                });
                
                const updatedMeasurements = state.bodyMeasurements.map(entry => 
                    entry.id === id 
                        ? { ...entry, ...measurementsInCm, date, notes, updatedAt: new Date().toISOString() }
                        : entry
                ).sort((a, b) => new Date(b.date) - new Date(a.date));
                
                const analytics = calculateAnalytics(updatedMeasurements, state.weightHistory);
                
                const newState = {
                    ...state,
                    bodyMeasurements: updatedMeasurements,
                    analytics
                };
                
                saveToStorage(newState);
                return newState;
            });
        },

        deleteBodyMeasurement: (id) => {
            update(state => {
                const updatedMeasurements = state.bodyMeasurements.filter(entry => entry.id !== id);
                const analytics = calculateAnalytics(updatedMeasurements, state.weightHistory);
                
                const newState = {
                    ...state,
                    bodyMeasurements: updatedMeasurements,
                    analytics
                };
                
                saveToStorage(newState);
                return newState;
            });
        },

        addGoal: (goalData) => {
            update(state => {
                const newGoal = {
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    status: 'active',
                    ...goalData
                };
                
                const newState = {
                    ...state,
                    goals: [...state.goals, newGoal]
                };
                
                saveToStorage(newState);
                return newState;
            });
        },

        updateGoal: (id, goalData) => {
            update(state => {
                const updatedGoals = state.goals.map(goal => 
                    goal.id === id 
                        ? { ...goal, ...goalData, updatedAt: new Date().toISOString() }
                        : goal
                );
                
                const newState = {
                    ...state,
                    goals: updatedGoals
                };
                
                saveToStorage(newState);
                return newState;
            });
        },

        deleteGoal: (id) => {
            update(state => {
                const newState = {
                    ...state,
                    goals: state.goals.filter(goal => goal.id !== id)
                };
                
                saveToStorage(newState);
                return newState;
            });
        },

        getWeightHistory: (days = 30) => {
            let weightHistory = [];
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            update(state => {
                weightHistory = state.weightHistory.filter(entry => 
                    new Date(entry.date) >= cutoffDate
                ).sort((a, b) => new Date(a.date) - new Date(b.date));
                return state;
            });
            
            return weightHistory;
        },

        init: () => {
            loadFromStorage();
        },

        reset: () => {
            set({
                bodyMeasurements: [],
                weightHistory: [],
                goals: [],
                analytics: {
                    currentWeight: null,
                    weightChange30Days: null,
                    weightTrend: 'stable',
                    lastMeasurementDate: null,
                    measurementProgress: {}
                },
                isLoading: false,
                error: null
            });
            
            if (browser && typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    };
}

export const analytics = createAnalyticsStore();