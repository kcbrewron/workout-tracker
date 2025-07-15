import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { alertStore } from '../alerts.js';

describe('Alert Store', () => {
    beforeEach(() => {
        alertStore.clear();
    });

    it('should initialize with empty alerts', () => {
        const alerts = get(alertStore);
        expect(alerts).toEqual([]);
    });

    describe('success alerts', () => {
        it('should add success alert', () => {
            const alertId = alertStore.success('Test success message');
            
            const alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            expect(alerts[0]).toMatchObject({
                id: alertId,
                type: 'success',
                message: 'Test success message',
                duration: 5000,
                dismissible: true
            });
        });

        it('should auto-remove success alert after duration', () => {
            vi.useFakeTimers();
            
            alertStore.success('Test message');
            
            let alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            
            vi.advanceTimersByTime(5000);
            
            alerts = get(alertStore);
            expect(alerts).toHaveLength(0);
            
            vi.useRealTimers();
        });
    });

    describe('error alerts', () => {
        it('should add error alert with longer duration', () => {
            const alertId = alertStore.error('Test error message');
            
            const alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            expect(alerts[0]).toMatchObject({
                id: alertId,
                type: 'error',
                message: 'Test error message',
                duration: 7000,
                dismissible: true
            });
        });

        it('should auto-remove error alert after duration', () => {
            vi.useFakeTimers();
            
            alertStore.error('Test error');
            
            let alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            
            vi.advanceTimersByTime(7000);
            
            alerts = get(alertStore);
            expect(alerts).toHaveLength(0);
            
            vi.useRealTimers();
        });
    });

    describe('warning alerts', () => {
        it('should add warning alert', () => {
            const alertId = alertStore.warning('Test warning message');
            
            const alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            expect(alerts[0]).toMatchObject({
                id: alertId,
                type: 'warning',
                message: 'Test warning message',
                duration: 6000,
                dismissible: true
            });
        });
    });

    describe('info alerts', () => {
        it('should add info alert', () => {
            const alertId = alertStore.info('Test info message');
            
            const alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            expect(alerts[0]).toMatchObject({
                id: alertId,
                type: 'info',
                message: 'Test info message',
                duration: 5000,
                dismissible: true
            });
        });
    });

    describe('alert management', () => {
        it('should dismiss specific alert', () => {
            const alertId1 = alertStore.success('Message 1');
            const alertId2 = alertStore.error('Message 2');
            
            let alerts = get(alertStore);
            expect(alerts).toHaveLength(2);
            
            alertStore.dismiss(alertId1);
            
            alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            expect(alerts[0].id).toBe(alertId2);
        });

        it('should clear all alerts', () => {
            alertStore.success('Message 1');
            alertStore.error('Message 2');
            alertStore.warning('Message 3');
            
            let alerts = get(alertStore);
            expect(alerts).toHaveLength(3);
            
            alertStore.clear();
            
            alerts = get(alertStore);
            expect(alerts).toHaveLength(0);
        });

        it('should handle multiple alerts', () => {
            alertStore.success('Success 1');
            alertStore.error('Error 1');
            alertStore.warning('Warning 1');
            alertStore.info('Info 1');
            
            const alerts = get(alertStore);
            expect(alerts).toHaveLength(4);
            
            const types = alerts.map(a => a.type);
            expect(types).toContain('success');
            expect(types).toContain('error');
            expect(types).toContain('warning');
            expect(types).toContain('info');
        });
    });

    describe('alert convenience method', () => {
        it('should create success alert via alert method', () => {
            alertStore.alert('Test message', 'success');
            
            const alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('success');
        });

        it('should create error alert via alert method', () => {
            alertStore.alert('Test message', 'error');
            
            const alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('error');
        });

        it('should default to info type', () => {
            alertStore.alert('Test message');
            
            const alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('info');
        });
    });

    describe('custom options', () => {
        it('should respect custom duration', () => {
            alertStore.success('Test message', { duration: 10000 });
            
            const alerts = get(alertStore);
            expect(alerts[0].duration).toBe(10000);
        });

        it('should respect dismissible option', () => {
            alertStore.success('Test message', { dismissible: false });
            
            const alerts = get(alertStore);
            expect(alerts[0].dismissible).toBe(false);
        });

        it('should not auto-remove when duration is 0', () => {
            vi.useFakeTimers();
            
            alertStore.success('Test message', { duration: 0 });
            
            let alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            expect(alerts[0].duration).toBe(0);
            
            vi.advanceTimersByTime(10000);
            
            alerts = get(alertStore);
            expect(alerts).toHaveLength(1);
            
            vi.useRealTimers();
        });
    });

    describe('unique alert IDs', () => {
        it('should generate unique IDs for different alerts', () => {
            const id1 = alertStore.success('Message 1');
            const id2 = alertStore.success('Message 2');
            const id3 = alertStore.error('Message 3');
            
            expect(id1).not.toBe(id2);
            expect(id2).not.toBe(id3);
            expect(id1).not.toBe(id3);
        });
    });
});