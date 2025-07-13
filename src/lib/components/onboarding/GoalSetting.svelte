<script>
    import { onboarding } from '$lib/stores/onboarding.js';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let goals = {
        primaryObjective: '',
        timeline: '',
        frequency: '',
        duration: ''
    };
    
    const objectives = [
        { value: 'strength', label: 'Build Strength', description: 'Focus on increasing muscle strength and power' },
        { value: 'endurance', label: 'Improve Endurance', description: 'Enhance cardiovascular fitness and stamina' },
        { value: 'weight_loss', label: 'Lose Weight', description: 'Reduce body weight and improve body composition' },
        { value: 'muscle_gain', label: 'Build Muscle', description: 'Increase muscle mass and size' },
        { value: 'athletic_performance', label: 'Athletic Performance', description: 'Improve sport-specific performance' }
    ];
    
    const timelines = [
        { value: '3_months', label: '3 Months', description: 'Short-term focused goal' },
        { value: '6_months', label: '6 Months', description: 'Medium-term commitment' },
        { value: '1_year', label: '1 Year', description: 'Long-term transformation' },
        { value: 'ongoing', label: 'Ongoing', description: 'Lifestyle change with no end date' }
    ];
    
    const frequencies = [
        { value: '2_3_times', label: '2-3 times per week', description: 'Perfect for beginners' },
        { value: '3_4_times', label: '3-4 times per week', description: 'Balanced approach' },
        { value: '4_5_times', label: '4-5 times per week', description: 'Dedicated training' },
        { value: '6_plus', label: '6+ times per week', description: 'Serious athlete level' }
    ];
    
    const durations = [
        { value: '30_min', label: '30 minutes', description: 'Quick and efficient' },
        { value: '45_min', label: '45 minutes', description: 'Standard workout length' },
        { value: '60_min', label: '60 minutes', description: 'Full workout session' },
        { value: '90_min', label: '90+ minutes', description: 'Extended training' }
    ];
    
    const isFormValid = () => {
        return goals.primaryObjective && goals.timeline && goals.frequency && goals.duration;
    };
    
    const handleNext = () => {
        if (isFormValid()) {
            onboarding.setGoals(goals);
            onboarding.nextStep();
            dispatch('next');
        }
    };
</script>

<div class="max-w-2xl mx-auto p-6">
    <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">What are your fitness goals?</h2>
        <p class="text-gray-600">Help us understand what you want to achieve so we can create the perfect plan for you.</p>
    </div>
    
    <div class="space-y-8">
        <!-- Primary Objective -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Primary Objective</h3>
            <div class="grid gap-3">
                {#each objectives as objective}
                    <label class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-brand-orange={goals.primaryObjective === objective.value}
                           class:bg-orange-50={goals.primaryObjective === objective.value}>
                        <input
                            type="radio"
                            bind:group={goals.primaryObjective}
                            value={objective.value}
                            class="mt-1 text-brand-orange focus:ring-brand-orange"
                        />
                        <div class="ml-3">
                            <div class="font-medium text-gray-900">{objective.label}</div>
                            <div class="text-sm text-gray-600">{objective.description}</div>
                        </div>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Timeline -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div class="grid grid-cols-2 gap-3">
                {#each timelines as timeline}
                    <label class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-brand-orange={goals.timeline === timeline.value}
                           class:bg-orange-50={goals.timeline === timeline.value}>
                        <input
                            type="radio"
                            bind:group={goals.timeline}
                            value={timeline.value}
                            class="mt-1 text-brand-orange focus:ring-brand-orange"
                        />
                        <div class="ml-3">
                            <div class="font-medium text-gray-900">{timeline.label}</div>
                            <div class="text-sm text-gray-600">{timeline.description}</div>
                        </div>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Frequency -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Workout Frequency</h3>
            <div class="grid gap-3">
                {#each frequencies as frequency}
                    <label class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-brand-orange={goals.frequency === frequency.value}
                           class:bg-orange-50={goals.frequency === frequency.value}>
                        <input
                            type="radio"
                            bind:group={goals.frequency}
                            value={frequency.value}
                            class="mt-1 text-brand-orange focus:ring-brand-orange"
                        />
                        <div class="ml-3">
                            <div class="font-medium text-gray-900">{frequency.label}</div>
                            <div class="text-sm text-gray-600">{frequency.description}</div>
                        </div>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Duration -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Session Duration</h3>
            <div class="grid grid-cols-2 gap-3">
                {#each durations as duration}
                    <label class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-brand-orange={goals.duration === duration.value}
                           class:bg-orange-50={goals.duration === duration.value}>
                        <input
                            type="radio"
                            bind:group={goals.duration}
                            value={duration.value}
                            class="mt-1 text-brand-orange focus:ring-brand-orange"
                        />
                        <div class="ml-3">
                            <div class="font-medium text-gray-900">{duration.label}</div>
                            <div class="text-sm text-gray-600">{duration.description}</div>
                        </div>
                    </label>
                {/each}
            </div>
        </div>
    </div>
    
    <div class="mt-8 flex justify-end">
        <button
            on:click={handleNext}
            disabled={!isFormValid()}
            class="px-6 py-2 bg-brand-orange text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-brand-orange disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Continue
        </button>
    </div>
</div>