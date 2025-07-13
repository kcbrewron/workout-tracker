<script>
    import { onboarding } from '$lib/stores/onboarding.js';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let selectedLevel = '';
    let selectedRoutine = '';
    let selectedPrevExperience = '';
    let selectedInjuries = [];
    
    // Load existing data from store if available
    onboarding.subscribe((state) => {
        if (state.experience.level) {
            selectedLevel = state.experience.level;
            selectedRoutine = state.experience.currentRoutine;
            selectedPrevExperience = state.experience.previousExperience;
            selectedInjuries = [...state.experience.injuries];
        }
    });
    
    // Create reactive experience object
    $: experience = { 
        level: selectedLevel, 
        currentRoutine: selectedRoutine, 
        previousExperience: selectedPrevExperience, 
        injuries: selectedInjuries 
    };
    $: formValid = !!(selectedLevel && selectedRoutine && selectedPrevExperience);
    
    const levels = [
        { value: 'beginner', label: 'Beginner', description: 'New to regular exercise or returning after a long break' },
        { value: 'intermediate', label: 'Intermediate', description: 'Exercise regularly but want to improve technique and results' },
        { value: 'advanced', label: 'Advanced', description: 'Experienced with structured training and advanced techniques' }
    ];
    
    const routines = [
        { value: 'none', label: 'No current routine', description: 'Starting fresh or very inconsistent' },
        { value: 'casual', label: 'Casual activity', description: 'Occasional walks, sports, or gym visits' },
        { value: 'regular', label: 'Regular exercise', description: '2-3 times per week consistently' },
        { value: 'structured', label: 'Structured program', description: 'Following a specific training plan' }
    ];
    
    const experienceOptions = [
        { value: 'none', label: 'No previous experience', description: 'First time with structured fitness' },
        { value: 'some', label: 'Some experience', description: 'Tried different workouts or programs before' },
        { value: 'moderate', label: 'Moderate experience', description: 'Familiar with basic exercises and equipment' },
        { value: 'extensive', label: 'Extensive experience', description: 'Years of training with various methods' }
    ];
    
    const commonInjuries = [
        'Lower back pain',
        'Knee issues',
        'Shoulder problems',
        'Wrist/elbow pain',
        'Ankle problems',
        'Hip issues',
        'Neck pain'
    ];
    
    const toggleInjury = (injury) => {
        if (selectedInjuries.includes(injury)) {
            selectedInjuries = selectedInjuries.filter(i => i !== injury);
        } else {
            selectedInjuries = [...selectedInjuries, injury];
        }
    };
    
    const isFormValid = () => {
        return formValid;
    };
    
    const handleNext = () => {
        if (isFormValid()) {
            onboarding.setExperience(experience);
            onboarding.nextStep();
            dispatch('next');
        }
    };
    
    const handleBack = () => {
        onboarding.previousStep();
        dispatch('back');
    };
</script>

<div class="max-w-2xl mx-auto p-6">
    <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Tell us about your experience</h2>
        <p class="text-gray-600">This helps us create workouts that match your current fitness level and abilities.</p>
    </div>
    
    <div class="space-y-8">
        <!-- Fitness Level -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Current Fitness Level</h3>
            <div class="grid gap-3">
                {#each levels as level}
                    <label class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-primary={selectedLevel === level.value}
                           class:bg-orange-50={selectedLevel === level.value}>
                        <input
                            type="radio"
                            bind:group={selectedLevel}
                            value={level.value}
                            class="mt-1 text-primary focus:ring-primary"
                        />
                        <div class="ml-3">
                            <div class="font-medium text-gray-900">{level.label}</div>
                            <div class="text-sm text-gray-600">{level.description}</div>
                        </div>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Current Routine -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Current Exercise Routine</h3>
            <div class="grid gap-3">
                {#each routines as routine}
                    <label class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-primary={selectedRoutine === routine.value}
                           class:bg-orange-50={selectedRoutine === routine.value}>
                        <input
                            type="radio"
                            bind:group={selectedRoutine}
                            value={routine.value}
                            class="mt-1 text-primary focus:ring-primary"
                        />
                        <div class="ml-3">
                            <div class="font-medium text-gray-900">{routine.label}</div>
                            <div class="text-sm text-gray-600">{routine.description}</div>
                        </div>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Previous Experience -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Previous Training Experience</h3>
            <div class="grid gap-3">
                {#each experienceOptions as exp}
                    <label class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-primary={selectedPrevExperience === exp.value}
                           class:bg-orange-50={selectedPrevExperience === exp.value}>
                        <input
                            type="radio"
                            bind:group={selectedPrevExperience}
                            value={exp.value}
                            class="mt-1 text-primary focus:ring-primary"
                        />
                        <div class="ml-3">
                            <div class="font-medium text-gray-900">{exp.label}</div>
                            <div class="text-sm text-gray-600">{exp.description}</div>
                        </div>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Injuries/Limitations -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Any current injuries or limitations?</h3>
            <p class="text-sm text-gray-600 mb-4">Select any areas where you have ongoing issues or need to be careful (optional):</p>
            <div class="grid grid-cols-2 gap-3">
                {#each commonInjuries as injury}
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-primary={selectedInjuries.includes(injury)}
                           class:bg-orange-50={selectedInjuries.includes(injury)}>
                        <input
                            type="checkbox"
                            checked={selectedInjuries.includes(injury)}
                            on:change={() => toggleInjury(injury)}
                            class="text-primary focus:ring-primary"
                        />
                        <span class="ml-3 text-sm font-medium text-gray-900">{injury}</span>
                    </label>
                {/each}
            </div>
        </div>
    </div>
    
    <div class="mt-8 flex justify-between">
        <button
            on:click={handleBack}
            class="px-6 py-2 bg-accent text-white rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-accent"
        >
            Back
        </button>
        <button
            on:click={handleNext}
            disabled={!formValid}
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 disabled:cursor-not-allowed"
        >
            Continue
        </button>
    </div>
</div>