import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import userEvent from '@testing-library/user-event';
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
        const user = userEvent.setup();
        render(LoginForm);
        
        const emailInput = screen.getByLabelText('Email Address');
        await user.type(emailInput, 'invalid-email');
        
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('should disable submit button when form is invalid', async () => {
        render(LoginForm);
        
        const submitButton = screen.getByRole('button', { name: 'Sign In' });
        expect(submitButton).toBeDisabled();
    });

    it.skip('should enable submit button when form is valid', async () => {
        const user = userEvent.setup();
        render(LoginForm);
        
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        
        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: 'Sign In' });
            expect(submitButton).not.toBeDisabled();
        });
    });

    it.skip('should call auth.login on form submission', async () => {
        const user = userEvent.setup();
        auth.login.mockResolvedValue({ success: true });
        
        const { component } = render(LoginForm);
        const successHandler = vi.fn();
        component.$on('success', successHandler);
        
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        
        await waitFor(async () => {
            const submitButton = screen.getByRole('button', { name: 'Sign In' });
            expect(submitButton).not.toBeDisabled();
            await user.click(submitButton);
        });
        
        expect(auth.login).toHaveBeenCalledWith('test@example.com', 'password123');
        
        await waitFor(() => {
            expect(successHandler).toHaveBeenCalled();
        });
    });
});