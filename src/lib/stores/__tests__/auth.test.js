import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { auth } from '../auth.js';

// Mock browser environment
vi.mock('$app/environment', () => ({
    browser: true
}));

describe('Auth Store', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        
        // Reset the auth store to initial state
        auth.logout();
    });

    it('should initialize with default state', () => {
        const state = get(auth);
        expect(state.user).toBe(null);
        expect(state.isAuthenticated).toBe(false);
        expect(state.isLoading).toBe(false);
    });

    it('should successfully register a new user', async () => {
        const result = await auth.register('test@example.com', 'password123', 'Test User');
        
        expect(result.success).toBe(true);
        
        const state = get(auth);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual({
            id: expect.any(String),
            email: 'test@example.com',
            name: 'Test User'
        });
        expect(state.isLoading).toBe(false);
    });

    it('should fail registration with missing fields', async () => {
        const result = await auth.register('', '', '');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('All fields are required');
        
        const state = get(auth);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
    });

    it('should successfully login with valid credentials', async () => {
        const result = await auth.login('test@example.com', 'password123');
        
        expect(result.success).toBe(true);
        
        const state = get(auth);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual({
            id: '1',
            email: 'test@example.com',
            name: 'test'
        });
    });

    it('should fail login with invalid credentials', async () => {
        const result = await auth.login('', '');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid credentials');
        
        const state = get(auth);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
    });

    it('should logout successfully', async () => {
        // First login
        await auth.login('test@example.com', 'password123');
        
        // Then logout
        auth.logout();
        
        const state = get(auth);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
        expect(localStorage.getItem('auth_user')).toBe(null);
    });

    it('should restore user from localStorage on init', () => {
        const testUser = { id: '1', email: 'test@example.com', name: 'Test User' };
        localStorage.setItem('auth_user', JSON.stringify(testUser));
        
        auth.init();
        
        const state = get(auth);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(testUser);
    });

    it('should handle corrupted localStorage data', () => {
        localStorage.setItem('auth_user', 'invalid-json');
        
        auth.init();
        
        const state = get(auth);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
        expect(localStorage.getItem('auth_user')).toBe(null);
    });
});