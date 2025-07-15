import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { analytics } from '../analytics.js';

vi.mock('$app/environment', () => ({
    browser: false
}));

describe('Analytics Store', () => {
    beforeEach(() => {
        analytics.reset();
    });

    it('should initialize with empty state', () => {
        const state = get(analytics);
        expect(state.bodyMeasurements).toEqual([]);
        expect(state.weightHistory).toEqual([]);
        expect(state.goals).toEqual([]);
        expect(state.analytics.currentWeight).toBeNull();
        expect(state.analytics.weightChange30Days).toBeNull();
        expect(state.analytics.weightTrend).toBe('stable');
    });

    describe('Weight tracking', () => {
        it('should add weight entry', () => {
            analytics.addWeightEntry(70.5, '2025-01-01', 'Morning weigh-in');
            
            const state = get(analytics);
            expect(state.weightHistory).toHaveLength(1);
            expect(state.weightHistory[0]).toMatchObject({
                weight: 70.5,
                date: '2025-01-01',
                notes: 'Morning weigh-in'
            });
            expect(state.analytics.currentWeight).toBe(70.5);
        });

        it('should update weight entry', () => {
            analytics.addWeightEntry(70.5, '2025-01-01');
            const state = get(analytics);
            const entryId = state.weightHistory[0].id;
            
            analytics.updateWeightEntry(entryId, 71.0, '2025-01-01', 'Updated weight');
            
            const updatedState = get(analytics);
            expect(updatedState.weightHistory[0].weight).toBe(71.0);
            expect(updatedState.weightHistory[0].notes).toBe('Updated weight');
            expect(updatedState.analytics.currentWeight).toBe(71.0);
        });

        it('should delete weight entry', () => {
            analytics.addWeightEntry(70.5, '2025-01-01');
            const state = get(analytics);
            const entryId = state.weightHistory[0].id;
            
            analytics.deleteWeightEntry(entryId);
            
            const updatedState = get(analytics);
            expect(updatedState.weightHistory).toHaveLength(0);
            expect(updatedState.analytics.currentWeight).toBeNull();
        });

        it('should calculate weight trend correctly', () => {
            // Add weight entries with 32 days apart to test 30-day change
            const today = new Date();
            const thirtyTwoDaysAgo = new Date(today);
            thirtyTwoDaysAgo.setDate(today.getDate() - 32);
            
            analytics.addWeightEntry(75.0, thirtyTwoDaysAgo.toISOString().split('T')[0]);
            analytics.addWeightEntry(72.0, today.toISOString().split('T')[0]);
            
            const state = get(analytics);
            expect(state.analytics.currentWeight).toBe(72.0);
            expect(state.analytics.weightChange30Days).toBe(-3.0);
            expect(state.analytics.weightTrend).toBe('losing');
        });

        it('should sort weight history by date descending', () => {
            analytics.addWeightEntry(70.0, '2025-01-01');
            analytics.addWeightEntry(71.0, '2025-01-03');
            analytics.addWeightEntry(70.5, '2025-01-02');
            
            const state = get(analytics);
            expect(state.weightHistory[0].date).toBe('2025-01-03');
            expect(state.weightHistory[1].date).toBe('2025-01-02');
            expect(state.weightHistory[2].date).toBe('2025-01-01');
        });
    });

    describe('Body measurements', () => {
        it('should add body measurement', () => {
            const measurements = {
                chest: 100.0,
                waist: 80.0,
                hips: 95.0
            };
            
            analytics.addBodyMeasurement(measurements, '2025-01-01', 'Initial measurements');
            
            const state = get(analytics);
            expect(state.bodyMeasurements).toHaveLength(1);
            expect(state.bodyMeasurements[0]).toMatchObject({
                chest: 100.0,
                waist: 80.0,
                hips: 95.0,
                date: '2025-01-01',
                notes: 'Initial measurements'
            });
        });

        it('should calculate measurement progress', () => {
            const firstMeasurements = { chest: 100.0, waist: 80.0 };
            const secondMeasurements = { chest: 102.0, waist: 78.0 };
            
            analytics.addBodyMeasurement(firstMeasurements, '2025-01-01');
            analytics.addBodyMeasurement(secondMeasurements, '2025-01-08');
            
            const state = get(analytics);
            expect(state.analytics.measurementProgress.chest).toBe(2.0);
            expect(state.analytics.measurementProgress.waist).toBe(-2.0);
        });

        it('should update body measurement', () => {
            const measurements = { chest: 100.0, waist: 80.0 };
            analytics.addBodyMeasurement(measurements, '2025-01-01');
            
            const state = get(analytics);
            const entryId = state.bodyMeasurements[0].id;
            
            analytics.updateBodyMeasurement(entryId, { chest: 101.0, waist: 79.0 }, '2025-01-01', 'Updated');
            
            const updatedState = get(analytics);
            expect(updatedState.bodyMeasurements[0].chest).toBe(101.0);
            expect(updatedState.bodyMeasurements[0].waist).toBe(79.0);
            expect(updatedState.bodyMeasurements[0].notes).toBe('Updated');
        });

        it('should delete body measurement', () => {
            const measurements = { chest: 100.0, waist: 80.0 };
            analytics.addBodyMeasurement(measurements, '2025-01-01');
            
            const state = get(analytics);
            const entryId = state.bodyMeasurements[0].id;
            
            analytics.deleteBodyMeasurement(entryId);
            
            const updatedState = get(analytics);
            expect(updatedState.bodyMeasurements).toHaveLength(0);
        });
    });

    describe('Goals management', () => {
        it('should add goal', () => {
            const goalData = {
                goalType: 'weight_loss',
                targetValue: 65.0,
                currentValue: 70.0,
                unit: 'kg',
                targetDate: '2025-06-01'
            };
            
            analytics.addGoal(goalData);
            
            const state = get(analytics);
            expect(state.goals).toHaveLength(1);
            expect(state.goals[0]).toMatchObject(goalData);
            expect(state.goals[0].status).toBe('active');
        });

        it('should update goal', () => {
            const goalData = {
                goalType: 'weight_loss',
                targetValue: 65.0,
                currentValue: 70.0,
                unit: 'kg'
            };
            
            analytics.addGoal(goalData);
            const state = get(analytics);
            const goalId = state.goals[0].id;
            
            analytics.updateGoal(goalId, { currentValue: 68.0, status: 'achieved' });
            
            const updatedState = get(analytics);
            expect(updatedState.goals[0].currentValue).toBe(68.0);
            expect(updatedState.goals[0].status).toBe('achieved');
        });

        it('should delete goal', () => {
            analytics.addGoal({ goalType: 'weight_loss', targetValue: 65.0, unit: 'kg' });
            const state = get(analytics);
            const goalId = state.goals[0].id;
            
            analytics.deleteGoal(goalId);
            
            const updatedState = get(analytics);
            expect(updatedState.goals).toHaveLength(0);
        });
    });

    describe('Weight history filtering', () => {
        it('should filter weight history by days', () => {
            const today = new Date();
            const twentyDaysAgo = new Date(today);
            twentyDaysAgo.setDate(today.getDate() - 20);
            const fortyDaysAgo = new Date(today);
            fortyDaysAgo.setDate(today.getDate() - 40);
            
            analytics.addWeightEntry(70.0, fortyDaysAgo.toISOString().split('T')[0]);
            analytics.addWeightEntry(71.0, twentyDaysAgo.toISOString().split('T')[0]);
            analytics.addWeightEntry(72.0, today.toISOString().split('T')[0]);
            
            const last30Days = analytics.getWeightHistory(30);
            expect(last30Days).toHaveLength(2);
            expect(last30Days.map(entry => entry.weight)).toEqual([71.0, 72.0]);
        });
    });

    describe('Analytics calculations', () => {
        it('should handle empty data gracefully', () => {
            const state = get(analytics);
            expect(state.analytics.currentWeight).toBeNull();
            expect(state.analytics.weightChange30Days).toBeNull();
            expect(state.analytics.weightTrend).toBe('stable');
            expect(state.analytics.lastMeasurementDate).toBeNull();
            expect(Object.keys(state.analytics.measurementProgress)).toHaveLength(0);
        });

        it('should calculate weight trends correctly', () => {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            // Test gaining weight
            analytics.addWeightEntry(70.0, thirtyDaysAgo.toISOString().split('T')[0]);
            analytics.addWeightEntry(71.0, today.toISOString().split('T')[0]);
            
            let state = get(analytics);
            expect(state.analytics.weightTrend).toBe('gaining');
            
            analytics.reset();
            
            // Test losing weight
            analytics.addWeightEntry(72.0, thirtyDaysAgo.toISOString().split('T')[0]);
            analytics.addWeightEntry(71.0, today.toISOString().split('T')[0]);
            
            state = get(analytics);
            expect(state.analytics.weightTrend).toBe('losing');
            
            analytics.reset();
            
            // Test stable weight
            analytics.addWeightEntry(70.0, thirtyDaysAgo.toISOString().split('T')[0]);
            analytics.addWeightEntry(70.2, today.toISOString().split('T')[0]);
            
            state = get(analytics);
            expect(state.analytics.weightTrend).toBe('stable');
        });
    });
});