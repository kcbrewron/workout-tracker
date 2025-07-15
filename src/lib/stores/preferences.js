import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { detectUnitsFromGeoIP, isValidUnitSystem } from '$lib/utils/units.js';

function createPreferencesStore() {
    const { subscribe, set, update } = writable({
        unitSystem: 'metric', // 'metric' or 'imperial'
        weightUnit: 'kg', // 'kg' or 'lbs'
        lengthUnit: 'cm', // 'cm' or 'in'
        isDetecting: false,
        isInitialized: false
    });

    const STORAGE_KEY = 'workout_tracker_preferences';

    const loadFromStorage = () => {
        if (browser && typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored);
                    if (isValidUnitSystem(data.unitSystem)) {
                        update(state => ({
                            ...state,
                            ...data,
                            isInitialized: true
                        }));
                        return true;
                    }
                }
            } catch (error) {
                console.error('Failed to load preferences from storage:', error);
            }
        }
        return false;
    };

    const saveToStorage = (state) => {
        if (browser && typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    unitSystem: state.unitSystem,
                    weightUnit: state.weightUnit,
                    lengthUnit: state.lengthUnit
                }));
            } catch (error) {
                console.error('Failed to save preferences to storage:', error);
            }
        }
    };

    const updateUnits = (unitSystem) => {
        const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';
        const lengthUnit = unitSystem === 'imperial' ? 'in' : 'cm';
        
        return { unitSystem, weightUnit, lengthUnit };
    };

    return {
        subscribe,
        
        // Initialize preferences with geo-IP detection
        init: async () => {
            // First try to load from storage
            if (loadFromStorage()) {
                return;
            }
            
            // If no stored preferences, detect from geo-IP
            update(state => ({ ...state, isDetecting: true }));
            
            try {
                const detectedSystem = await detectUnitsFromGeoIP();
                const units = updateUnits(detectedSystem);
                
                const newState = {
                    ...units,
                    isDetecting: false,
                    isInitialized: true
                };
                
                set(newState);
                saveToStorage(newState);
            } catch (error) {
                console.error('Failed to detect units:', error);
                
                // Fallback to metric
                const newState = {
                    ...updateUnits('metric'),
                    isDetecting: false,
                    isInitialized: true
                };
                
                set(newState);
                saveToStorage(newState);
            }
        },
        
        // Set unit system (metric or imperial)
        setUnitSystem: (unitSystem) => {
            if (!isValidUnitSystem(unitSystem)) {
                console.error('Invalid unit system:', unitSystem);
                return;
            }
            
            update(state => {
                const units = updateUnits(unitSystem);
                const newState = {
                    ...state,
                    ...units
                };
                
                saveToStorage(newState);
                return newState;
            });
        },
        
        // Set individual weight unit
        setWeightUnit: (weightUnit) => {
            if (weightUnit !== 'kg' && weightUnit !== 'lbs') {
                console.error('Invalid weight unit:', weightUnit);
                return;
            }
            
            update(state => {
                const unitSystem = weightUnit === 'lbs' ? 'imperial' : 'metric';
                const newState = {
                    ...state,
                    unitSystem,
                    weightUnit
                };
                
                saveToStorage(newState);
                return newState;
            });
        },
        
        // Set individual length unit
        setLengthUnit: (lengthUnit) => {
            if (lengthUnit !== 'cm' && lengthUnit !== 'in') {
                console.error('Invalid length unit:', lengthUnit);
                return;
            }
            
            update(state => {
                const unitSystem = lengthUnit === 'in' ? 'imperial' : 'metric';
                const newState = {
                    ...state,
                    unitSystem,
                    lengthUnit
                };
                
                saveToStorage(newState);
                return newState;
            });
        },
        
        // Get current preferences
        getPreferences: () => {
            let currentPrefs = null;
            update(state => {
                currentPrefs = state;
                return state;
            });
            return currentPrefs;
        },
        
        // Reset to default (metric)
        reset: () => {
            const newState = {
                ...updateUnits('metric'),
                isDetecting: false,
                isInitialized: true
            };
            
            set(newState);
            saveToStorage(newState);
        },
        
        // Toggle between metric and imperial
        toggleUnitSystem: () => {
            update(state => {
                const newUnitSystem = state.unitSystem === 'metric' ? 'imperial' : 'metric';
                const units = updateUnits(newUnitSystem);
                const newState = {
                    ...state,
                    ...units
                };
                
                saveToStorage(newState);
                return newState;
            });
        }
    };
}

export const preferences = createPreferencesStore();