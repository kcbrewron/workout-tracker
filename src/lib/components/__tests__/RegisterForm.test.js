import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/svelte';
import RegisterForm from '../auth/RegisterForm.svelte';

// Mock the auth store
vi.mock('$lib/stores/auth.js', () => ({
    auth: {
        register: vi.fn()
    }
}));

import { auth } from '$lib/stores/auth.js';

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render all form fields', () => {
        render(RegisterForm);
        
        expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should validate name field', async () => {
        render(RegisterForm);
        
        const nameInput = screen.getByLabelText('Full Name');
        await fireEvent.input(nameInput, { target: { value: 'A' } });
        
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });

    it('should validate email field', async () => {
        render(RegisterForm);
        
        const emailInput = screen.getByLabelText('Email Address');
        await fireEvent.input(emailInput, { target: { value: 'invalid-email' } });
        
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('should validate password field', async () => {
        render(RegisterForm);
        
        const passwordInput = screen.getByLabelText('Password');
        await fireEvent.input(passwordInput, { target: { value: '123' } });
        
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('should validate password confirmation', async () => {
        render(RegisterForm);
        
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        
        await fireEvent.input(passwordInput, { target: { value: 'password123' } });
        await fireEvent.input(confirmPasswordInput, { target: { value: 'different' } });
        
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('should disable submit button when form is invalid', async () => {
        render(RegisterForm);
        
        const submitButton = screen.getByRole('button', { name: 'Create Account' });
        expect(submitButton).toBeDisabled();
        
        // Fill in partial form
        const nameInput = screen.getByLabelText('Full Name');
        await fireEvent.input(nameInput, { target: { value: 'Test User' } });
        
        expect(submitButton).toBeDisabled();
    });

    it.skip('should enable submit button when form is valid', async () => {
        render(RegisterForm);
        
        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        
        await fireEvent.input(nameInput, { target: { value: 'Test User' } });
        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'password123' } });
        await fireEvent.input(confirmPasswordInput, { target: { value: 'password123' } });
        
        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: 'Create Account' });
            expect(submitButton).not.toBeDisabled();
        });
    });

    it.skip('should call auth.register on form submission', async () => {
        auth.register.mockResolvedValue({ success: true });
        
        const { component } = render(RegisterForm);
        const successHandler = vi.fn();
        component.$on('success', successHandler);
        
        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        
        await fireEvent.input(nameInput, { target: { value: 'Test User' } });
        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'password123' } });
        await fireEvent.input(confirmPasswordInput, { target: { value: 'password123' } });
        
        await waitFor(async () => {
            const submitButton = screen.getByRole('button', { name: 'Create Account' });
            expect(submitButton).not.toBeDisabled();
            await fireEvent.click(submitButton);
        });
        
        expect(auth.register).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
        
        await waitFor(() => {
            expect(successHandler).toHaveBeenCalled();
        });
    });

    it.skip('should display error message on registration failure', async () => {
        auth.register.mockResolvedValue({ success: false, error: 'Email already exists' });
        
        render(RegisterForm);
        
        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        
        await fireEvent.input(nameInput, { target: { value: 'Test User' } });
        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'password123' } });
        await fireEvent.input(confirmPasswordInput, { target: { value: 'password123' } });
        
        await waitFor(async () => {
            const submitButton = screen.getByRole('button', { name: 'Create Account' });
            expect(submitButton).not.toBeDisabled();
            await fireEvent.click(submitButton);
        });
        
        await waitFor(() => {
            expect(screen.getByText('Email already exists')).toBeInTheDocument();
        });
    });

    it.skip('should show loading state during registration', async () => {
        let resolveRegister;
        const registerPromise = new Promise(resolve => {
            resolveRegister = resolve;
        });
        auth.register.mockReturnValue(registerPromise);
        
        render(RegisterForm);
        
        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        
        await fireEvent.input(nameInput, { target: { value: 'Test User' } });
        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'password123' } });
        await fireEvent.input(confirmPasswordInput, { target: { value: 'password123' } });
        
        await waitFor(async () => {
            const submitButton = screen.getByRole('button', { name: 'Create Account' });
            expect(submitButton).not.toBeDisabled();
            await fireEvent.click(submitButton);
        });
        
        expect(screen.getByText('Creating Account...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeDisabled();
        
        resolveRegister({ success: true });
        
        await waitFor(() => {
            expect(screen.queryByText('Creating Account...')).not.toBeInTheDocument();
        });
    });
});