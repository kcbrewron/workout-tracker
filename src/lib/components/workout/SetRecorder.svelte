<script>
    import { createEventDispatcher } from 'svelte';
    import TouchNumberPicker from './TouchNumberPicker.svelte';
    import RPEPicker from './RPEPicker.svelte';
    
    export let exercise = {};
    export let setNumber = 1;
    export let lastSetData = null;
    export let disabled = false;

    const dispatch = createEventDispatcher();

    let reps = null;
    let weight = null;
    let rpe = null;
    let isRecording = false;

    // Quick preset options
    $: sameAsLastPreset = lastSetData ? {
        reps: lastSetData.reps,
        weight: lastSetData.weight,
        rpe: lastSetData.rpe
    } : null;

    $: plusRepsPreset = lastSetData ? {
        reps: (lastSetData.reps || 0) + 1,
        weight: lastSetData.weight,
        rpe: lastSetData.rpe
    } : null;

    $: plusWeightPreset = lastSetData ? {
        reps: lastSetData.reps,
        weight: (lastSetData.weight || 0) + (lastSetData.weight >= 10 ? 2.5 : 1),
        rpe: lastSetData.rpe
    } : null;

    function usePreset(preset) {
        if (disabled || !preset) return;
        
        reps = preset.reps;
        weight = preset.weight;
        rpe = preset.rpe;
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(15);
        }
    }

    function recordSet() {
        if (disabled || isRecording || reps === null) return;
        
        isRecording = true;
        
        const setData = {
            reps: reps,
            weight: weight || 0,
            rpe: rpe
        };
        
        dispatch('record', setData);
        
        // Haptic success feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 50, 50]);
        }
        
        // Reset after brief delay to show success
        setTimeout(() => {
            isRecording = false;
            // Keep values for next set if desired
        }, 1000);
    }

    function clearSet() {
        if (disabled) return;
        
        reps = null;
        weight = null;
        rpe = null;
    }

    // Determine if exercise typically uses weight
    $: usesWeight = exercise.equipment && 
        ['barbell', 'dumbbells', 'cable_machine', 'leg_press_machine'].includes(exercise.equipment);
    
    // Determine weight unit based on exercise
    $: weightUnit = usesWeight ? 'lbs' : '';
    
    // Validation
    $: canRecord = reps !== null && reps > 0;
</script>

<div class="set-recorder" class:disabled class:recording={isRecording}>
    <div class="set-header">
        <h3 class="text-lg font-semibold text-gray-900">
            {exercise.name} - Set {setNumber}
        </h3>
        {#if exercise.notes}
            <p class="text-sm text-gray-600 mt-1">{exercise.notes}</p>
        {/if}
    </div>

    <!-- Quick Preset Buttons -->
    {#if lastSetData}
        <div class="preset-section">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Quick Presets</h4>
            <div class="preset-buttons">
                <button
                    type="button"
                    class="preset-btn same-as-last"
                    on:click={() => usePreset(sameAsLastPreset)}
                    disabled={disabled}
                    aria-label="Use same as last set"
                >
                    <span class="preset-icon">🔄</span>
                    <div class="preset-text">
                        <div class="preset-label">Same as Last</div>
                        <div class="preset-values">
                            {lastSetData.reps} reps
                            {#if lastSetData.weight && usesWeight}
                                • {lastSetData.weight}{weightUnit}
                            {/if}
                        </div>
                    </div>
                </button>

                <button
                    type="button"
                    class="preset-btn plus-reps"
                    on:click={() => usePreset(plusRepsPreset)}
                    disabled={disabled}
                    aria-label="Add one more rep than last set"
                >
                    <span class="preset-icon">➕</span>
                    <div class="preset-text">
                        <div class="preset-label">+1 Rep</div>
                        <div class="preset-values">
                            {(lastSetData.reps || 0) + 1} reps
                            {#if lastSetData.weight && usesWeight}
                                • {lastSetData.weight}{weightUnit}
                            {/if}
                        </div>
                    </div>
                </button>

                {#if usesWeight && lastSetData.weight}
                    <button
                        type="button"
                        class="preset-btn plus-weight"
                        on:click={() => usePreset(plusWeightPreset)}
                        disabled={disabled}
                        aria-label="Add weight from last set"
                    >
                        <span class="preset-icon">⚡</span>
                        <div class="preset-text">
                            <div class="preset-label">+Weight</div>
                            <div class="preset-values">
                                {lastSetData.reps} reps • {(lastSetData.weight || 0) + (lastSetData.weight >= 10 ? 2.5 : 1)}{weightUnit}
                            </div>
                        </div>
                    </button>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Manual Input Section -->
    <div class="input-section">
        <div class="input-grid">
            <!-- Reps Input -->
            <div class="input-group">
                <TouchNumberPicker
                    bind:value={reps}
                    min={1}
                    max={100}
                    step={1}
                    label="Reps"
                    ariaLabel="repetitions"
                    {disabled}
                    on:change={() => {}}
                />
            </div>

            <!-- Weight Input (if applicable) -->
            {#if usesWeight}
                <div class="input-group">
                    <TouchNumberPicker
                        bind:value={weight}
                        min={0}
                        max={1000}
                        step={exercise.equipment === 'dumbbells' ? 1 : 2.5}
                        label="Weight"
                        unit={weightUnit}
                        ariaLabel="weight in {weightUnit}"
                        {disabled}
                        on:change={() => {}}
                    />
                </div>
            {/if}
        </div>

        <!-- RPE Input -->
        <div class="rpe-section">
            <RPEPicker
                bind:value={rpe}
                {disabled}
                on:change={() => {}}
            />
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
        <button
            type="button"
            class="clear-btn"
            on:click={clearSet}
            disabled={disabled || (!reps && !weight && !rpe)}
            aria-label="Clear current set data"
        >
            Clear
        </button>

        <button
            type="button"
            class="record-btn"
            class:recording={isRecording}
            on:click={recordSet}
            disabled={disabled || !canRecord || isRecording}
            aria-label="Record this set"
        >
            {#if isRecording}
                <span class="recording-spinner" aria-hidden="true"></span>
                Recording...
            {:else}
                Record Set
            {/if}
        </button>
    </div>
</div>

<style>
    .set-recorder {
        @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4;
        @apply space-y-6;
    }

    .set-recorder.disabled {
        @apply opacity-50;
    }

    .set-recorder.recording {
        @apply ring-2 ring-green-500 ring-opacity-50;
    }

    .set-header h3 {
        @apply text-lg font-semibold text-gray-900;
    }

    .preset-section {
        @apply space-y-3;
    }

    .preset-buttons {
        @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3;
    }

    .preset-btn {
        @apply flex items-center p-4 border-2 border-gray-200 rounded-lg;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
        @apply active:scale-95;
        @apply min-h-16; /* Large touch target */
    }

    .preset-btn:not(:disabled):hover {
        @apply border-primary bg-orange-50;
    }

    .preset-btn:not(:disabled):active {
        @apply scale-95 bg-orange-100;
    }

    .preset-btn:focus {
        border-color: #f97316;
        box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
    }

    .preset-btn:disabled {
        @apply cursor-not-allowed opacity-50;
    }

    .preset-icon {
        @apply text-xl mr-3 flex-shrink-0;
    }

    .preset-text {
        @apply flex-1 text-left;
    }

    .preset-label {
        @apply font-medium text-gray-900;
    }

    .preset-values {
        @apply text-sm text-gray-600;
    }

    .input-section {
        @apply space-y-4;
    }

    .input-grid {
        @apply grid grid-cols-1 gap-4;
    }

    /* On larger screens, show inputs side by side */
    @media (min-width: 640px) {
        .input-grid {
            @apply grid-cols-2;
        }
    }

    .input-group {
        @apply space-y-2;
    }

    .rpe-section {
        @apply pt-2;
    }

    .action-buttons {
        @apply flex gap-3;
    }

    .clear-btn {
        @apply flex-1 py-4 px-6;
        @apply border-2 border-gray-300 text-gray-700 bg-white rounded-lg;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50;
        @apply font-medium;
        @apply min-h-12; /* Large touch target */
    }

    .clear-btn:not(:disabled):hover {
        @apply bg-gray-50 border-gray-400;
    }

    .clear-btn:not(:disabled):active {
        @apply bg-gray-100;
    }

    .clear-btn:disabled {
        @apply cursor-not-allowed opacity-50;
    }

    .record-btn {
        @apply flex-[2] py-4 px-6;
        @apply bg-primary text-white rounded-lg border-2 border-primary;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
        @apply font-semibold;
        @apply min-h-12; /* Large touch target */
        @apply flex items-center justify-center gap-2;
    }

    .record-btn:not(:disabled):hover {
        @apply bg-orange-600 border-orange-600;
    }

    .record-btn:not(:disabled):active {
        @apply bg-orange-700 border-orange-700;
    }

    .record-btn.recording {
        @apply bg-green-500 border-green-500;
    }

    .record-btn:disabled {
        @apply cursor-not-allowed opacity-50;
    }

    .recording-spinner {
        @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
    }

    /* Mobile optimizations */
    @media (max-width: 640px) {
        .preset-buttons {
            @apply grid-cols-1 gap-2;
        }
        
        .action-buttons {
            @apply flex-col;
        }
        
        .clear-btn,
        .record-btn {
            @apply w-full;
        }
    }

    /* One-handed navigation support */
    @media (max-width: 640px) and (orientation: portrait) {
        .set-recorder {
            @apply mb-20; /* Extra space for one-handed thumb reach */
        }
        
        .action-buttons {
            @apply fixed bottom-4 left-4 right-4 z-10;
            @apply bg-white border-t border-gray-200 pt-4;
            @apply shadow-lg rounded-t-lg;
        }
    }
</style>