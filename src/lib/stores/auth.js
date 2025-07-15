import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createAuthStore() {
    const { subscribe, set, update } = writable({
        user: null,
        isAuthenticated: false,
        isLoading: false
    });

    return {
        subscribe,
        login: async (email, password) => {
            update(state => ({ ...state, isLoading: true }));
            
            try {
                // Mock authentication - replace with actual API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (email && password) {
                    const user = { id: '1', email, name: email.split('@')[0] };
                    
                    if (browser) {
                        localStorage.setItem('auth_user', JSON.stringify(user));
                    }
                    
                    set({ user, isAuthenticated: true, isLoading: false });
                    return { success: true };
                } else {
                    throw new Error('Invalid credentials');
                }
            } catch (error) {
                set({ user: null, isAuthenticated: false, isLoading: false });
                return { success: false, error: error.message };
            }
        },
        
        register: async (email, password, name) => {
            update(state => ({ ...state, isLoading: true }));
            
            try {
                // Mock registration - replace with actual API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (email && password && name) {
                    const user = { id: Date.now().toString(), email, name };
                    
                    if (browser) {
                        localStorage.setItem('auth_user', JSON.stringify(user));
                    }
                    
                    set({ user, isAuthenticated: true, isLoading: false });
                    return { success: true };
                } else {
                    throw new Error('All fields are required');
                }
            } catch (error) {
                set({ user: null, isAuthenticated: false, isLoading: false });
                return { success: false, error: error.message };
            }
        },
        
        logout: () => {
            if (browser) {
                localStorage.removeItem('auth_user');
            }
            set({ user: null, isAuthenticated: false, isLoading: false });
        },
        
        init: () => {
            if (browser) {
                const storedUser = localStorage.getItem('auth_user');
                if (storedUser) {
                    try {
                        const user = JSON.parse(storedUser);
                        set({ user, isAuthenticated: true, isLoading: false });
                    } catch (error) {
                        localStorage.removeItem('auth_user');
                    }
                }
            }
        },
        
        setDemoUser: () => {
            const demoUser = {
                id: 'demo-user',
                email: 'demo@workouttracker.com',
                name: 'Demo User'
            };
            
            set({
                isAuthenticated: true,
                user: demoUser,
                isLoading: false
            });
            
            if (browser) {
                localStorage.setItem('auth_user', JSON.stringify(demoUser));
            }
            
            return { success: true, user: demoUser };
        }
    };
}

export const auth = createAuthStore();