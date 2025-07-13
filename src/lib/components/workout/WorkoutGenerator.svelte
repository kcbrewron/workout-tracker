<script>
    import { onMount } from 'svelte';
    import { workout } from '$lib/stores/workout.js';
    import { onboarding } from '$lib/stores/onboarding.js';

    export let onRoutineGenerated = () => {};

    let onboardingData = null;
    let isGenerating = false;
    let generatedRoutine = null;
    let preferences = {
        type: 'mixed',
        duration: '30_45_mins',
        equipment: ['bodyweight']
    };

    // Reactive declarations to ensure UI updates
    $: workoutStore = $workout;
    $: isGenerating = workoutStore?.isGenerating || false;
    $: generatedRoutine = workoutStore?.generatedRoutine || null;

    const workoutTypes = [
        { value: 'strength', label: 'Strength Training', description: 'Build muscle and increase power' },
        { value: 'cardio', label: 'Cardiovascular', description: 'Improve heart health and endurance' },
        { value: 'mixed', label: 'Mixed Training', description: 'Combination of strength and cardio' }
    ];

    const durations = [
        { value: '15_30_mins', label: '15-30 minutes' },
        { value: '30_45_mins', label: '30-45 minutes' },
        { value: '45_60_mins', label: '45-60 minutes' },
        { value: '60_plus_mins', label: '60+ minutes' }
    ];

    const equipmentOptions = [
        { value: 'bodyweight', label: 'Bodyweight Only' },
        { value: 'dumbbells', label: 'Dumbbells' },
        { value: 'barbell', label: 'Barbell' },
        { value: 'resistance_bands', label: 'Resistance Bands' },
        { value: 'yoga_mat', label: 'Yoga Mat' },
        { value: 'pull_up_bar', label: 'Pull-up Bar' },
        { value: 'cable_machine', label: 'Cable Machine' }
    ];

    onMount(() => {
        const unsubscribeOnboarding = onboarding.subscribe((state) => {
            onboardingData = state;
            if (state.preferences?.equipment) {
                preferences = { ...preferences, equipment: state.preferences.equipment };
            }
        });

        return () => {
            unsubscribeOnboarding();
        };
    });

    async function generateWorkout() {
        if (!onboardingData) return;

        try {
            const routine = await workout.generateRoutine(onboardingData, preferences);
            onRoutineGenerated(routine);
        } catch (error) {
            console.error('Failed to generate workout:', error);
        }
    }

    function saveRoutine() {
        if (generatedRoutine) {
            const saved = workout.saveRoutine(generatedRoutine);
            alert(`Routine "${saved.name}" saved successfully!`);
        }
    }

    function toggleEquipment(equipment) {
        if (preferences.equipment.includes(equipment)) {
            preferences = { 
                ...preferences, 
                equipment: preferences.equipment.filter(e => e !== equipment) 
            };
        } else {
            preferences = { 
                ...preferences, 
                equipment: [...preferences.equipment, equipment] 
            };
        }
    }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Generate Your Workout</h2>
    
    <!-- Workout Type Selection -->
    <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">Workout Type</label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            {#each workoutTypes as type}
                <button
                    class="p-4 border-2 rounded-lg text-left transition-all {preferences.type === type.value ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'}"
                    on:click={() => preferences = { ...preferences, type: type.value }}
                >
                    <div class="font-medium text-gray-900">{type.label}</div>
                    <div class="text-sm text-gray-600 mt-1">{type.description}</div>
                </button>
            {/each}
        </div>
    </div>

    <!-- Duration Selection -->
    <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">Workout Duration</label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            {#each durations as duration}
                <button
                    class="p-3 border-2 rounded-lg text-center transition-all {preferences.duration === duration.value ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'}"
                    on:click={() => preferences = { ...preferences, duration: duration.value }}
                >
                    <div class="text-sm font-medium">{duration.label}</div>
                </button>
            {/each}
        </div>
    </div>

    <!-- Equipment Selection -->
    <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">Available Equipment</label>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {#each equipmentOptions as equipment}
                <button
                    class="p-3 border-2 rounded-lg text-center transition-all {preferences.equipment.includes(equipment.value) ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'}"
                    on:click={() => toggleEquipment(equipment.value)}
                >
                    <div class="text-sm font-medium">{equipment.label}</div>
                </button>
            {/each}
        </div>
    </div>

    <!-- Generate Button -->
    <div class="flex justify-center mb-6">
        <button
            class="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            on:click={generateWorkout}
            disabled={isGenerating || !onboardingData}
        >
            {#if isGenerating}
                <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Generating...
            {:else}
                🎯 Generate Workout
            {/if}
        </button>
    </div>

    <!-- Generated Routine Display -->
    {#if generatedRoutine}
        {#key generatedRoutine.id}
            <!-- Medical Disclaimer -->
            <div class="border-t pt-6 mb-6">
                <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">
                                Medical Disclaimer
                            </h3>
                            <div class="mt-2 text-sm text-red-700">
                                <p>
                                    <strong>Consult your physician before starting any new exercise program.</strong> 
                                    This workout plan is for informational purposes only and is not intended as medical advice. 
                                    Exercise involves risk of injury. By using this workout plan, you acknowledge and accept 
                                    these risks and agree that you participate at your own risk. Always listen to your body 
                                    and stop exercising if you feel pain or discomfort.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="border-t pt-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">{generatedRoutine.name}</h3>
                        <p class="text-gray-600 mt-1">{generatedRoutine.description}</p>
                        <div class="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>⏱️ {generatedRoutine.estimatedTime} minutes</span>
                            <span>📈 {generatedRoutine.difficulty}</span>
                            <span>🏃 {generatedRoutine.type}</span>
                        </div>
                    </div>
                    <button
                        class="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-blue-600 transition-colors"
                        on:click={saveRoutine}
                    >
                        💾 Save Routine
                    </button>
                </div>

                <!-- Group exercises by phase -->
                {#each ['warmup', 'main', 'cooldown'] as phase}
                    {@const phaseExercises = generatedRoutine.exercises.filter(ex => ex.phase === phase)}
                    {#if phaseExercises.length > 0}
                        <div class="mb-8">
                            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                {#if phase === 'warmup'}
                                    <span class="text-yellow-500">🔥</span> Warm-Up
                                {:else if phase === 'main'}
                                    <span class="text-blue-500">💪</span> Main Workout
                                {:else if phase === 'cooldown'}
                                    <span class="text-green-500">🧘</span> Cool-Down & Stretching
                                {/if}
                            </h4>
                            
                            <div class="space-y-3">
                                {#each phaseExercises as exercise, index}
                                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 {phase === 'warmup' ? 'border-yellow-400' : phase === 'main' ? 'border-blue-400' : 'border-green-400'}">
                                        <div class="flex justify-between items-start mb-2">
                                            <h5 class="font-medium text-gray-900">{exercise.name}</h5>
                                            <span class="text-xs bg-gray-200 px-2 py-1 rounded">{exercise.difficulty}</span>
                                        </div>
                                        
                                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                                            {#if exercise.sets}
                                                <div><strong>Sets:</strong> {exercise.sets}</div>
                                            {/if}
                                            {#if exercise.reps}
                                                <div><strong>Reps:</strong> {exercise.reps}</div>
                                            {/if}
                                            {#if exercise.duration}
                                                <div><strong>Duration:</strong> {exercise.duration}</div>
                                            {/if}
                                            {#if exercise.intensity}
                                                <div><strong>Intensity:</strong> {exercise.intensity}</div>
                                            {/if}
                                            {#if exercise.restTime && exercise.restTime > 0}
                                                <div><strong>Rest:</strong> {exercise.restTime}s</div>
                                            {/if}
                                            <div><strong>Equipment:</strong> {exercise.equipment.replace('_', ' ')}</div>
                                        </div>
                                        
                                        {#if exercise.notes}
                                            <div class="text-sm text-gray-500 italic">
                                                💡 {exercise.notes}
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        {/key}
    {/if}
</div>