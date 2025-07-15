import { describe, it, expect } from 'vitest';
import { 
    convertWeight, 
    convertLength, 
    formatWeight, 
    formatLength, 
    convertToDisplayUnits, 
    convertToStorageUnits,
    getInputStep,
    getInputPlaceholder,
    isValidUnitSystem
} from '../units.js';

describe('Unit Conversion Utilities', () => {
    describe('Weight conversion', () => {
        it('should convert kg to lbs correctly', () => {
            expect(convertWeight(70, 'kg', 'lbs')).toBeCloseTo(154.32, 2);
            expect(convertWeight(100, 'kg', 'lbs')).toBeCloseTo(220.46, 2);
        });

        it('should convert lbs to kg correctly', () => {
            expect(convertWeight(154.32, 'lbs', 'kg')).toBeCloseTo(70, 2);
            expect(convertWeight(220.46, 'lbs', 'kg')).toBeCloseTo(100, 2);
        });

        it('should return same value for same units', () => {
            expect(convertWeight(70, 'kg', 'kg')).toBe(70);
            expect(convertWeight(150, 'lbs', 'lbs')).toBe(150);
        });

        it('should handle string inputs', () => {
            expect(convertWeight('70.5', 'kg', 'lbs')).toBeCloseTo(155.43, 1);
        });

        it('should handle invalid inputs', () => {
            expect(convertWeight('invalid', 'kg', 'lbs')).toBe('invalid');
            expect(convertWeight(null, 'kg', 'lbs')).toBe(null);
        });
    });

    describe('Length conversion', () => {
        it('should convert cm to in correctly', () => {
            expect(convertLength(100, 'cm', 'in')).toBeCloseTo(39.37, 2);
            expect(convertLength(180, 'cm', 'in')).toBeCloseTo(70.87, 2);
        });

        it('should convert in to cm correctly', () => {
            expect(convertLength(39.37, 'in', 'cm')).toBeCloseTo(100, 1);
            expect(convertLength(70.87, 'in', 'cm')).toBeCloseTo(180, 1);
        });

        it('should return same value for same units', () => {
            expect(convertLength(100, 'cm', 'cm')).toBe(100);
            expect(convertLength(40, 'in', 'in')).toBe(40);
        });

        it('should handle string inputs', () => {
            expect(convertLength('100.5', 'cm', 'in')).toBeCloseTo(39.57, 2);
        });
    });

    describe('Formatting functions', () => {
        it('should format weight correctly', () => {
            expect(formatWeight(70.5, 'kg')).toBe('70.5 kg');
            expect(formatWeight(154.3, 'lbs')).toBe('154.3 lbs');
            expect(formatWeight(70.55, 'kg', 2)).toBe('70.55 kg');
        });

        it('should format length correctly', () => {
            expect(formatLength(100.5, 'cm')).toBe('100.5 cm');
            expect(formatLength(39.4, 'in')).toBe('39.4 in');
            expect(formatLength(100.55, 'cm', 2)).toBe('100.55 cm');
        });

        it('should handle null/undefined values', () => {
            expect(formatWeight(null, 'kg')).toBe('No data');
            expect(formatWeight(undefined, 'kg')).toBe('No data');
            expect(formatLength(null, 'cm')).toBe('No data');
        });
    });

    describe('Display/Storage conversion', () => {
        it('should convert to display units correctly', () => {
            expect(convertToDisplayUnits(70, 'weight', 'imperial')).toBeCloseTo(154.32, 2);
            expect(convertToDisplayUnits(100, 'length', 'imperial')).toBeCloseTo(39.37, 2);
            expect(convertToDisplayUnits(70, 'weight', 'metric')).toBe(70);
            expect(convertToDisplayUnits(100, 'length', 'metric')).toBe(100);
        });

        it('should convert to storage units correctly', () => {
            expect(convertToStorageUnits(154.32, 'weight', 'imperial')).toBeCloseTo(70, 2);
            expect(convertToStorageUnits(39.37, 'length', 'imperial')).toBeCloseTo(100, 2);
            expect(convertToStorageUnits(70, 'weight', 'metric')).toBe(70);
            expect(convertToStorageUnits(100, 'length', 'metric')).toBe(100);
        });
    });

    describe('Input helpers', () => {
        it('should provide correct input steps', () => {
            expect(getInputStep('kg')).toBe('0.1');
            expect(getInputStep('lbs')).toBe('0.5');
            expect(getInputStep('cm')).toBe('0.5');
            expect(getInputStep('in')).toBe('0.25');
        });

        it('should provide correct placeholders', () => {
            expect(getInputPlaceholder('kg')).toBe('70.0');
            expect(getInputPlaceholder('lbs')).toBe('154.5');
            expect(getInputPlaceholder('cm')).toBe('100.0');
            expect(getInputPlaceholder('in')).toBe('39.5');
        });
    });

    describe('Validation', () => {
        it('should validate unit systems', () => {
            expect(isValidUnitSystem('metric')).toBe(true);
            expect(isValidUnitSystem('imperial')).toBe(true);
            expect(isValidUnitSystem('invalid')).toBe(false);
            expect(isValidUnitSystem(null)).toBe(false);
        });
    });
});