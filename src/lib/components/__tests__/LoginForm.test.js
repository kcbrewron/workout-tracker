import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/svelte';
import LoginForm from '../auth/LoginForm.svelte';

// Mock the auth store
vi.mock('$lib/stores/auth.js', () => ({
    auth: {
        login: vi.fn()
    }
}));

import { auth } from '$lib/stores/auth.js';

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render all form fields', () => {
        render(LoginForm);
        
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('should validate email field', async () => {
        render(LoginForm);
        
        const emailInput = screen.getByLabelText('Email Address');
        await fireEvent.input(emailInput, { target: { value: 'invalid-email' } });
        
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('should disable submit button when form is invalid', async () => {
        render(LoginForm);
        
        const submitButton = screen.getByRole('button', { name: 'Sign In' });
        expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', async () => {
        render(LoginForm);
        
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        
        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'password' } });
        
        const submitButton = screen.getByRole('button', { name: 'Sign In' });
        expect(submitButton).not.toBeDisabled();
    });

    it('should call auth.login on form submission', async () => {
        auth.login.mockResolvedValue({ success: true });
        
        const { component } = render(LoginForm);
        const successHandler = vi.fn();
        component.$on('success', successHandler);
        
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Sign In' });
        
        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'password123' } });
        
        await fireEvent.click(submitButton);
        
        expect(auth.login).toHaveBeenCalledWith('test@example.com', 'password123');
        
        await waitFor(() => {
            expect(successHandler).toHaveBeenCalled();
        });
    });
});