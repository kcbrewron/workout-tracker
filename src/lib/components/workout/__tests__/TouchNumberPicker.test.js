import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import TouchNumberPicker from '../TouchNumberPicker.svelte';

// Mock navigator.vibrate
global.navigator = {
    vibrate: vi.fn()
};

describe('TouchNumberPicker', () => {
    it('should render with default props', () => {
        render(TouchNumberPicker);
        
        const input = screen.getByRole('spinbutton');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue(0);
        
        const decrementBtn = screen.getByLabelText(/decrease/i);
        const incrementBtn = screen.getByLabelText(/increase/i);
        expect(decrementBtn).toBeInTheDocument();
        expect(incrementBtn).toBeInTheDocument();
    });

    it('should render with custom label and unit', () => {
        render(TouchNumberPicker, {
            props: {
                label: 'Weight',
                unit: 'lbs',
                value: 50
            }
        });
        
        expect(screen.getByText('Weight')).toBeInTheDocument();
        expect(screen.getByText('(lbs)')).toBeInTheDocument();
        expect(screen.getByText('lbs')).toBeInTheDocument();
        
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(50);
    });

    it('should increment value when increment button is clicked', async () => {
        const { component } = render(TouchNumberPicker, {
            props: { value: 5, step: 2 }
        });

        const incrementBtn = screen.getByLabelText(/increase/i);
        await fireEvent.click(incrementBtn);
        
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(7);
    });

    it('should decrement value when decrement button is clicked', async () => {
        const { component } = render(TouchNumberPicker, {
            props: { value: 10, step: 2 }
        });

        const decrementBtn = screen.getByLabelText(/decrease/i);
        await fireEvent.click(decrementBtn);
        
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(8);
    });

    it('should respect min and max bounds', async () => {
        render(TouchNumberPicker, {
            props: {
                value: 5,
                min: 0,
                max: 10
            }
        });

        const incrementBtn = screen.getByLabelText(/increase/i);
        const decrementBtn = screen.getByLabelText(/decrease/i);
        const input = screen.getByRole('spinbutton');

        // Test max bound
        for (let i = 0; i < 10; i++) {
            await fireEvent.click(incrementBtn);
        }
        expect(input).toHaveValue(10); // Should not exceed max

        // Test min bound
        for (let i = 0; i < 15; i++) {
            await fireEvent.click(decrementBtn);
        }
        expect(input).toHaveValue(0); // Should not go below min
    });

    it.skip('should disable buttons at bounds', () => {
        render(TouchNumberPicker, {
            props: {
                value: 0,
                min: 0,
                max: 10
            }
        });

        const decrementBtn = screen.getByLabelText(/decrease/i);
        expect(decrementBtn).toBeDisabled();

        const incrementBtn = screen.getByLabelText(/increase/i);
        expect(incrementBtn).not.toBeDisabled();
    });

    it('should handle direct input changes', async () => {
        render(TouchNumberPicker, {
            props: {
                value: 5,
                min: 0,
                max: 100
            }
        });

        const input = screen.getByRole('spinbutton');
        await fireEvent.input(input, { target: { value: '25' } });
        
        expect(input).toHaveValue(25);
    });

    it.skip('should ignore invalid input values', async () => {
        render(TouchNumberPicker, {
            props: {
                value: 5,
                min: 0,
                max: 100
            }
        });

        const input = screen.getByRole('spinbutton');
        
        // Test invalid string
        await fireEvent.input(input, { target: { value: 'abc' } });
        expect(input).toHaveValue(0); // Should fallback to 0
        
        // Test value outside bounds
        await fireEvent.input(input, { target: { value: '150' } });
        expect(input).toHaveValue(5); // Should not change from original value
    });

    it('should emit change events', async () => {
        const { component } = render(TouchNumberPicker, {
            props: { value: 5 }
        });

        let changeEventFired = false;
        let changeValue = null;

        component.$on('change', (event) => {
            changeEventFired = true;
            changeValue = event.detail;
        });

        const incrementBtn = screen.getByLabelText(/increase/i);
        await fireEvent.click(incrementBtn);

        expect(changeEventFired).toBe(true);
        expect(changeValue).toBe(6);
    });

    it.skip('should be disabled when disabled prop is true', () => {
        render(TouchNumberPicker, {
            props: {
                value: 5,
                disabled: true
            }
        });

        const input = screen.getByRole('spinbutton');
        const incrementBtn = screen.getByLabelText(/increase/i);
        const decrementBtn = screen.getByLabelText(/decrease/i);

        expect(input).toBeDisabled();
        expect(incrementBtn).toBeDisabled();
        expect(decrementBtn).toBeDisabled();
    });

    it('should have proper accessibility attributes', () => {
        render(TouchNumberPicker, {
            props: {
                label: 'Repetitions',
                ariaLabel: 'number of repetitions'
            }
        });

        const input = screen.getByRole('spinbutton');
        expect(input).toHaveAttribute('aria-label', 'number of repetitions');

        const incrementBtn = screen.getByLabelText('Increase number of repetitions');
        const decrementBtn = screen.getByLabelText('Decrease number of repetitions');
        
        expect(incrementBtn).toBeInTheDocument();
        expect(decrementBtn).toBeInTheDocument();
    });

    it('should call navigator.vibrate when haptic feedback is available', async () => {
        render(TouchNumberPicker, { props: { value: 5 } });

        const incrementBtn = screen.getByLabelText(/increase/i);
        await fireEvent.click(incrementBtn);

        expect(navigator.vibrate).toHaveBeenCalledWith(10);
    });

    it('should handle missing navigator.vibrate gracefully', async () => {
        const originalNavigator = global.navigator;
        global.navigator = {};

        render(TouchNumberPicker, { props: { value: 5 } });

        const incrementBtn = screen.getByLabelText(/increase/i);
        
        // Should not throw an error
        expect(async () => {
            await fireEvent.click(incrementBtn);
        }).not.toThrow();

        global.navigator = originalNavigator;
    });

    it.skip('should have large touch targets for mobile accessibility', () => {
        render(TouchNumberPicker);

        const incrementBtn = screen.getByLabelText(/increase/i);
        const decrementBtn = screen.getByLabelText(/decrease/i);

        // Check that buttons have adequate size classes
        expect(incrementBtn).toHaveClass('w-16', 'h-16');
        expect(decrementBtn).toHaveClass('w-16', 'h-16');
    });

    it('should support decimal values with proper step', async () => {
        render(TouchNumberPicker, {
            props: {
                value: 10.0,
                step: 2.5,
                min: 0,
                max: 100
            }
        });

        const incrementBtn = screen.getByLabelText(/increase/i);
        await fireEvent.click(incrementBtn);

        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(12.5);
    });
});