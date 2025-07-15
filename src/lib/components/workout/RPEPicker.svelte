<script>
    import { createEventDispatcher } from 'svelte';
    
    export let value = null;
    export let disabled = false;

    const dispatch = createEventDispatcher();

    // RPE Scale with descriptions for accessibility
    const rpeScale = [
        { value: 1, label: '1', description: 'Very Easy - Could continue for hours' },
        { value: 2, label: '2', description: 'Easy - Light effort' },
        { value: 3, label: '3', description: 'Moderate - Starting to feel it' },
        { value: 4, label: '4', description: 'Somewhat Hard - Breathing heavier' },
        { value: 5, label: '5', description: 'Hard - Tough but manageable' },
        { value: 6, label: '6', description: 'Harder - Getting difficult' },
        { value: 7, label: '7', description: 'Very Hard - Could do 2-3 more reps' },
        { value: 8, label: '8', description: 'Extremely Hard - Could do 1-2 more reps' },
        { value: 9, label: '9', description: 'Near Maximum - Could maybe do 1 more rep' },
        { value: 10, label: '10', description: 'Maximum Effort - Could not do another rep' }
    ];

    function selectRPE(rpeValue) {
        if (disabled) return;
        
        value = rpeValue;
        dispatch('change', rpeValue);
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    function getIntensityColor(rpe) {
        if (rpe <= 3) return 'bg-green-100 border-green-300 text-green-800';
        if (rpe <= 5) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        if (rpe <= 7) return 'bg-orange-100 border-orange-300 text-orange-800';
        return 'bg-red-100 border-red-300 text-red-800';
    }

    function getSelectedColor(rpe) {
        if (rpe <= 3) return 'bg-green-500 border-green-600 text-white';
        if (rpe <= 5) return 'bg-yellow-500 border-yellow-600 text-white';
        if (rpe <= 7) return 'bg-orange-500 border-orange-600 text-white';
        return 'bg-red-500 border-red-600 text-white';
    }
</script>

<div class="rpe-picker" class:disabled>
    <label class="block text-sm font-medium text-gray-700 mb-3">
        Rate of Perceived Exertion (RPE)
        <span class="text-gray-500 text-xs block mt-1">How hard did that set feel?</span>
    </label>
    
    <div class="rpe-grid">
        {#each rpeScale as rpe}
            <button
                type="button"
                class="rpe-button"
                class:selected={value === rpe.value}
                class:disabled
                style="--intensity-color: {value === rpe.value ? getSelectedColor(rpe.value) : getIntensityColor(rpe.value)}"
                on:click={() => selectRPE(rpe.value)}
                disabled={disabled}
                aria-label={`RPE ${rpe.value}: ${rpe.description}`}
                aria-pressed={value === rpe.value}
                title={rpe.description}
            >
                <span class="rpe-number">{rpe.label}</span>
                <span class="rpe-desc" aria-hidden="true">
                    {#if rpe.value <= 3}
                        Easy
                    {:else if rpe.value <= 5}
                        Moderate
                    {:else if rpe.value <= 7}
                        Hard
                    {:else}
                        Max
                    {/if}
                </span>
            </button>
        {/each}
    </div>
    
    {#if value}
        <div class="selected-rpe-info mt-3 p-3 rounded-lg border" style="--color: {getIntensityColor(value)}">
            <div class="text-sm font-medium">
                RPE {value}: {rpeScale.find(r => r.value === value)?.description}
            </div>
        </div>
    {/if}
</div>

<style>
    .rpe-picker {
        @apply w-full;
    }

    .rpe-picker.disabled {
        @apply opacity-50;
    }

    .rpe-grid {
        @apply grid grid-cols-5 gap-2;
    }

    .rpe-button {
        @apply flex flex-col items-center justify-center;
        @apply h-16 w-full; /* Large touch targets */
        @apply border-2 rounded-lg;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
        @apply active:scale-95;
        @apply select-none;
        
        /* Apply dynamic colors from CSS variables */
        background-color: var(--intensity-color, rgb(243 244 246));
        border-color: var(--intensity-color, rgb(209 213 219));
        color: var(--intensity-color, rgb(55 65 81));
    }

    .rpe-button:not(.disabled):hover {
        @apply transform scale-105;
        @apply shadow-md;
    }

    .rpe-button:not(.disabled):active {
        @apply scale-95;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .rpe-button.selected {
        @apply shadow-lg;
        @apply ring-2 ring-opacity-50;
    }

    .rpe-button:focus {
        /* High contrast focus indicator for WCAG AA */
        box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.3);
    }

    .rpe-button.disabled {
        @apply cursor-not-allowed opacity-50;
    }

    .rpe-number {
        @apply text-lg font-bold;
    }

    .rpe-desc {
        @apply text-xs font-medium;
        @apply leading-tight;
    }

    .selected-rpe-info {
        background-color: var(--color);
    }

    /* Mobile responsiveness */
    @media (max-width: 640px) {
        .rpe-grid {
            @apply grid-cols-5 gap-1;
        }
        
        .rpe-button {
            @apply h-14;
        }
        
        .rpe-number {
            @apply text-base;
        }
        
        .rpe-desc {
            @apply text-xs;
        }
    }

    /* Support for larger screens - show more descriptive text */
    @media (min-width: 768px) {
        .rpe-grid {
            @apply grid-cols-10 gap-3;
        }
        
        .rpe-button {
            @apply h-20;
        }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .rpe-button {
            @apply border-4;
        }
        
        .rpe-button.selected {
            @apply ring-4;
        }
    }

    /* Ensure text remains readable in different color combinations */
    .rpe-button[style*="bg-green-500"],
    .rpe-button[style*="bg-yellow-500"],
    .rpe-button[style*="bg-orange-500"],
    .rpe-button[style*="bg-red-500"] {
        color: white !important;
    }
</style>