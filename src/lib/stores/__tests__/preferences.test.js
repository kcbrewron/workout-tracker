import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { preferences } from '../preferences.js';

// Mock the geo-IP detection
vi.mock('$lib/utils/units.js', () => ({
    detectUnitsFromGeoIP: vi.fn().mockResolvedValue('metric'),
    isValidUnitSystem: vi.fn().mockImplementation((system) => system === 'metric' || system === 'imperial')
}));

vi.mock('$app/environment', () => ({
    browser: false
}));

describe('Preferences Store', () => {
    beforeEach(() => {
        preferences.reset();
    });

    it('should initialize with default values', () => {
        const state = get(preferences);
        expect(state.unitSystem).toBe('metric');
        expect(state.weightUnit).toBe('kg');
        expect(state.lengthUnit).toBe('cm');
        expect(state.isInitialized).toBe(true);
    });

    describe('setUnitSystem', () => {
        it('should set metric system correctly', () => {
            preferences.setUnitSystem('metric');
            
            const state = get(preferences);
            expect(state.unitSystem).toBe('metric');
            expect(state.weightUnit).toBe('kg');
            expect(state.lengthUnit).toBe('cm');
        });

        it('should set imperial system correctly', () => {
            preferences.setUnitSystem('imperial');
            
            const state = get(preferences);
            expect(state.unitSystem).toBe('imperial');
            expect(state.weightUnit).toBe('lbs');
            expect(state.lengthUnit).toBe('in');
        });

        it('should reject invalid unit systems', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            preferences.setUnitSystem('invalid');
            
            expect(consoleSpy).toHaveBeenCalledWith('Invalid unit system:', 'invalid');
            
            const state = get(preferences);
            expect(state.unitSystem).toBe('metric'); // Should remain unchanged
            
            consoleSpy.mockRestore();
        });
    });

    describe('setWeightUnit', () => {
        it('should set weight unit to kg and update system', () => {
            preferences.setWeightUnit('kg');
            
            const state = get(preferences);
            expect(state.weightUnit).toBe('kg');
            expect(state.unitSystem).toBe('metric');
        });

        it('should set weight unit to lbs and update system', () => {
            preferences.setWeightUnit('lbs');
            
            const state = get(preferences);
            expect(state.weightUnit).toBe('lbs');
            expect(state.unitSystem).toBe('imperial');
        });

        it('should reject invalid weight units', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            preferences.setWeightUnit('invalid');
            
            expect(consoleSpy).toHaveBeenCalledWith('Invalid weight unit:', 'invalid');
            
            const state = get(preferences);
            expect(state.weightUnit).toBe('kg'); // Should remain unchanged
            
            consoleSpy.mockRestore();
        });
    });

    describe('setLengthUnit', () => {
        it('should set length unit to cm and update system', () => {
            preferences.setLengthUnit('cm');
            
            const state = get(preferences);
            expect(state.lengthUnit).toBe('cm');
            expect(state.unitSystem).toBe('metric');
        });

        it('should set length unit to in and update system', () => {
            preferences.setLengthUnit('in');
            
            const state = get(preferences);
            expect(state.lengthUnit).toBe('in');
            expect(state.unitSystem).toBe('imperial');
        });

        it('should reject invalid length units', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            preferences.setLengthUnit('invalid');
            
            expect(consoleSpy).toHaveBeenCalledWith('Invalid length unit:', 'invalid');
            
            const state = get(preferences);
            expect(state.lengthUnit).toBe('cm'); // Should remain unchanged
            
            consoleSpy.mockRestore();
        });
    });

    describe('toggleUnitSystem', () => {
        it('should toggle from metric to imperial', () => {
            preferences.setUnitSystem('metric');
            preferences.toggleUnitSystem();
            
            const state = get(preferences);
            expect(state.unitSystem).toBe('imperial');
            expect(state.weightUnit).toBe('lbs');
            expect(state.lengthUnit).toBe('in');
        });

        it('should toggle from imperial to metric', () => {
            preferences.setUnitSystem('imperial');
            preferences.toggleUnitSystem();
            
            const state = get(preferences);
            expect(state.unitSystem).toBe('metric');
            expect(state.weightUnit).toBe('kg');
            expect(state.lengthUnit).toBe('cm');
        });
    });

    describe('getPreferences', () => {
        it('should return current preferences', () => {
            preferences.setUnitSystem('imperial');
            
            const prefs = preferences.getPreferences();
            expect(prefs.unitSystem).toBe('imperial');
            expect(prefs.weightUnit).toBe('lbs');
            expect(prefs.lengthUnit).toBe('in');
        });
    });

    describe('reset', () => {
        it('should reset to default metric system', () => {
            preferences.setUnitSystem('imperial');
            preferences.reset();
            
            const state = get(preferences);
            expect(state.unitSystem).toBe('metric');
            expect(state.weightUnit).toBe('kg');
            expect(state.lengthUnit).toBe('cm');
            expect(state.isInitialized).toBe(true);
        });
    });
});