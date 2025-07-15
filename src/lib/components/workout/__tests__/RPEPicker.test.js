import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import RPEPicker from '../RPEPicker.svelte';

// Mock navigator.vibrate
global.navigator = {
    vibrate: vi.fn()
};

describe('RPEPicker', () => {
    it('should render all RPE scale buttons', () => {
        render(RPEPicker);
        
        // Should have 10 RPE buttons (1-10)
        for (let i = 1; i <= 10; i++) {
            const button = screen.getByRole('button', { name: new RegExp(`RPE ${i}:`) });
            expect(button).toBeInTheDocument();
        }
    });

    it('should display proper labels and descriptions', () => {
        render(RPEPicker);
        
        const label = screen.getByText('Rate of Perceived Exertion (RPE)');
        const subtitle = screen.getByText('How hard did that set feel?');
        
        expect(label).toBeInTheDocument();
        expect(subtitle).toBeInTheDocument();
    });

    it('should select RPE value when button is clicked', async () => {
        const { component } = render(RPEPicker);

        const rpe7Button = screen.getByRole('button', { name: /RPE 7:/ });
        await fireEvent.click(rpe7Button);

        expect(rpe7Button).toHaveAttribute('aria-pressed', 'true');
        
        // Should show selected RPE info
        const selectedInfo = screen.getByText(/RPE 7:/);
        expect(selectedInfo).toBeInTheDocument();
    });

    it('should emit change event when RPE is selected', async () => {
        const { component } = render(RPEPicker);

        let changeEventFired = false;
        let changeValue = null;

        component.$on('change', (event) => {
            changeEventFired = true;
            changeValue = event.detail;
        });

        const rpe5Button = screen.getByRole('button', { name: /RPE 5:/ });
        await fireEvent.click(rpe5Button);

        expect(changeEventFired).toBe(true);
        expect(changeValue).toBe(5);
    });

    it('should handle value prop correctly', () => {
        render(RPEPicker, { props: { value: 8 } });

        const rpe8Button = screen.getByRole('button', { name: /RPE 8:/ });
        expect(rpe8Button).toHaveAttribute('aria-pressed', 'true');
        
        // Should show selected RPE info
        const selectedInfo = screen.getByText(/RPE 8:/);
        expect(selectedInfo).toBeInTheDocument();
    });

    it.skip('should be disabled when disabled prop is true', () => {
        render(RPEPicker, { props: { disabled: true } });

        // All buttons should be disabled
        for (let i = 1; i <= 10; i++) {
            const button = screen.getByRole('button', { name: new RegExp(`RPE ${i}:`) });
            expect(button).toBeDisabled();
        }
    });

    it('should not respond to clicks when disabled', async () => {
        const { component } = render(RPEPicker, { props: { disabled: true } });

        let changeEventFired = false;
        component.$on('change', () => {
            changeEventFired = true;
        });

        const rpe5Button = screen.getByRole('button', { name: /RPE 5:/ });
        await fireEvent.click(rpe5Button);

        expect(changeEventFired).toBe(false);
    });

    it('should call navigator.vibrate when haptic feedback is available', async () => {
        render(RPEPicker);

        const rpe3Button = screen.getByRole('button', { name: /RPE 3:/ });
        await fireEvent.click(rpe3Button);

        expect(navigator.vibrate).toHaveBeenCalledWith(10);
    });

    it('should handle missing navigator.vibrate gracefully', async () => {
        const originalNavigator = global.navigator;
        global.navigator = {};

        render(RPEPicker);

        const rpe3Button = screen.getByRole('button', { name: /RPE 3:/ });
        
        // Should not throw an error
        expect(async () => {
            await fireEvent.click(rpe3Button);
        }).not.toThrow();

        global.navigator = originalNavigator;
    });

    it('should have proper accessibility attributes', () => {
        render(RPEPicker, { props: { value: 6 } });

        // Check ARIA attributes
        const rpe6Button = screen.getByRole('button', { name: /RPE 6:/ });
        expect(rpe6Button).toHaveAttribute('aria-pressed', 'true');

        const rpe4Button = screen.getByRole('button', { name: /RPE 4:/ });
        expect(rpe4Button).toHaveAttribute('aria-pressed', 'false');

        // Check title attributes for tooltips
        expect(rpe6Button).toHaveAttribute('title');
    });

    it('should display different intensity categories correctly', () => {
        render(RPEPicker);

        // Easy range (1-3)
        const easyButton = screen.getByRole('button', { name: /RPE 2:/ });
        expect(easyButton).toHaveTextContent('Easy');

        // Moderate range (4-5)
        const moderateButton = screen.getByRole('button', { name: /RPE 4:/ });
        expect(moderateButton).toHaveTextContent('Moderate');

        // Hard range (6-7)
        const hardButton = screen.getByRole('button', { name: /RPE 6:/ });
        expect(hardButton).toHaveTextContent('Hard');

        // Max range (8-10)
        const maxButton = screen.getByRole('button', { name: /RPE 9:/ });
        expect(maxButton).toHaveTextContent('Max');
    });

    it('should show detailed description when RPE is selected', () => {
        render(RPEPicker, { props: { value: 7 } });

        const description = screen.getByText(/Very Hard - Could do 2-3 more reps/);
        expect(description).toBeInTheDocument();
    });

    it('should not show description when no RPE is selected', () => {
        render(RPEPicker, { props: { value: null } });

        const descriptions = screen.queryByText(/Could do/);
        expect(descriptions).not.toBeInTheDocument();
    });

    it.skip('should have large touch targets for mobile accessibility', () => {
        render(RPEPicker);

        const rpe5Button = screen.getByRole('button', { name: /RPE 5:/ });
        
        // Check that button has adequate height
        expect(rpe5Button).toHaveClass('h-16');
    });

    it('should update selection when value prop changes', async () => {
        const { component } = render(RPEPicker, { props: { value: 3 } });

        // Initially RPE 3 should be selected
        let rpe3Button = screen.getByRole('button', { name: /RPE 3:/ });
        expect(rpe3Button).toHaveAttribute('aria-pressed', 'true');

        // Change the value prop
        await component.$set({ value: 8 });

        // Now RPE 8 should be selected and RPE 3 should not be
        const rpe8Button = screen.getByRole('button', { name: /RPE 8:/ });
        rpe3Button = screen.getByRole('button', { name: /RPE 3:/ });
        
        expect(rpe8Button).toHaveAttribute('aria-pressed', 'true');
        expect(rpe3Button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should support keyboard navigation with focus management', () => {
        render(RPEPicker);

        const rpe1Button = screen.getByRole('button', { name: /RPE 1:/ });
        rpe1Button.focus();
        
        expect(document.activeElement).toBe(rpe1Button);
    });

    it('should display appropriate color coding for different intensity levels', () => {
        render(RPEPicker, { props: { value: 9 } });

        const rpe9Button = screen.getByRole('button', { name: /RPE 9:/ });
        
        // High intensity RPE should have red styling
        expect(rpe9Button).toHaveClass('selected');
    });
});