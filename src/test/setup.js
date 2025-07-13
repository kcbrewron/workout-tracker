import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => null),
        removeItem: vi.fn(() => null),
        clear: vi.fn(() => null),
    },
    writable: true,
});

// Reset localStorage mock before each test
beforeEach(() => {
    const mockLocalStorage = {
        store: {},
        getItem: vi.fn((key) => mockLocalStorage.store[key] || null),
        setItem: vi.fn((key, value) => {
            mockLocalStorage.store[key] = value;
        }),
        removeItem: vi.fn((key) => {
            delete mockLocalStorage.store[key];
        }),
        clear: vi.fn(() => {
            mockLocalStorage.store = {};
        })
    };
    
    Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
    });
});