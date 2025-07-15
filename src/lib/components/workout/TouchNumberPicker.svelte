<script>
    import { createEventDispatcher } from 'svelte';
    
    export let value = 0;
    export let min = 0;
    export let max = 999;
    export let step = 1;
    export let label = '';
    export let unit = '';
    export let ariaLabel = '';
    export let disabled = false;

    const dispatch = createEventDispatcher();

    function increment() {
        if (disabled || value >= max) return;
        value = Math.min(max, value + step);
        dispatch('change', value);
    }

    function decrement() {
        if (disabled || value <= min) return;
        value = Math.max(min, value - step);
        dispatch('change', value);
    }

    function handleInput(event) {
        const newValue = parseFloat(event.target.value) || 0;
        if (newValue >= min && newValue <= max) {
            value = newValue;
            dispatch('change', value);
        }
    }

    // Generate haptic feedback on mobile
    function hapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    function handleIncrement() {
        increment();
        hapticFeedback();
    }

    function handleDecrement() {
        decrement();
        hapticFeedback();
    }
</script>

<div class="touch-number-picker" class:disabled>
    {#if label}
        <label class="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {#if unit}
                <span class="text-gray-500">({unit})</span>
            {/if}
        </label>
    {/if}
    
    <div class="flex items-center bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-20">
        <!-- Decrement Button -->
        <button
            type="button"
            class="decrement-btn"
            class:disabled={disabled || value <= min}
            on:click={handleDecrement}
            disabled={disabled || value <= min}
            aria-label={ariaLabel ? `Decrease ${ariaLabel}` : `Decrease ${label || 'value'}`}
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" />
            </svg>
        </button>

        <!-- Value Input -->
        <input
            type="number"
            class="value-input"
            {value}
            {min}
            {max}
            {step}
            {disabled}
            on:input={handleInput}
            aria-label={ariaLabel || label || 'Numeric value'}
            inputmode="decimal"
        />

        <!-- Increment Button -->
        <button
            type="button"
            class="increment-btn"
            class:disabled={disabled || value >= max}
            on:click={handleIncrement}
            disabled={disabled || value >= max}
            aria-label={ariaLabel ? `Increase ${ariaLabel}` : `Increase ${label || 'value'}`}
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
        </button>
    </div>
    
    {#if unit}
        <div class="text-center text-sm text-gray-500 mt-1">{unit}</div>
    {/if}
</div>

<style>
    .touch-number-picker {
        @apply w-full;
    }

    .touch-number-picker.disabled {
        @apply opacity-50;
    }

    .decrement-btn,
    .increment-btn {
        @apply flex items-center justify-center;
        @apply w-16 h-16; /* Large touch targets: minimum 44px, but 64px for gym use */
        @apply text-gray-600;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
        @apply active:scale-95; /* Visual feedback on press */
        @apply select-none;
        
        /* High contrast for WCAG AA compliance */
        border: 2px solid transparent;
    }

    .decrement-btn:not(.disabled):hover,
    .increment-btn:not(.disabled):hover {
        @apply bg-gray-50 text-gray-800;
    }

    .decrement-btn:not(.disabled):active,
    .increment-btn:not(.disabled):active {
        @apply bg-gray-100 scale-95;
        /* Additional visual feedback */
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .decrement-btn:focus,
    .increment-btn:focus {
        /* High contrast focus indicator for WCAG AA */
        border-color: #f97316; /* primary color */
        box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
    }

    .decrement-btn.disabled,
    .increment-btn.disabled {
        @apply text-gray-300 cursor-not-allowed;
    }

    .decrement-btn {
        @apply rounded-l-md border-r border-gray-200;
    }

    .increment-btn {
        @apply rounded-r-md border-l border-gray-200;
    }

    .value-input {
        @apply flex-1 text-center text-xl font-semibold;
        @apply py-4 px-2;
        @apply border-0 focus:outline-none;
        @apply bg-transparent;
        @apply min-w-0; /* Allow input to shrink */
        
        /* Remove default number input styling */
        -moz-appearance: textfield;
    }

    .value-input::-webkit-outer-spin-button,
    .value-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .value-input:focus {
        @apply text-primary;
    }

    .value-input:disabled {
        @apply text-gray-400;
    }

    /* Ensure adequate contrast ratios for WCAG AA */
    @media (prefers-color-scheme: dark) {
        .decrement-btn,
        .increment-btn {
            @apply text-gray-300;
        }
        
        .decrement-btn:not(.disabled):hover,
        .increment-btn:not(.disabled):hover {
            @apply bg-gray-700 text-white;
        }
    }

    /* Support for larger touch targets on mobile */
    @media (max-width: 768px) {
        .decrement-btn,
        .increment-btn {
            @apply w-20 h-20; /* Even larger on mobile */
        }
    }
</style>