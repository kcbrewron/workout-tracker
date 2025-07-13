<script>
    import { onboarding } from '$lib/stores/onboarding.js';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let experience = {
        level: '',
        currentRoutine: '',
        previousExperience: '',
        injuries: []
    };
    
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
        if (experience.injuries.includes(injury)) {
            experience.injuries = experience.injuries.filter(i => i !== injury);
        } else {
            experience.injuries = [...experience.injuries, injury];
        }
    };
    
    const isFormValid = () => {
        return experience.level && experience.currentRoutine && experience.previousExperience;
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
                           class:border-blue-500={experience.level === level.value}
                           class:bg-blue-50={experience.level === level.value}>
                        <input
                            type="radio"
                            bind:group={experience.level}
                            value={level.value}
                            class="mt-1 text-blue-600 focus:ring-blue-500"
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
                           class:border-blue-500={experience.currentRoutine === routine.value}
                           class:bg-blue-50={experience.currentRoutine === routine.value}>
                        <input
                            type="radio"
                            bind:group={experience.currentRoutine}
                            value={routine.value}
                            class="mt-1 text-blue-600 focus:ring-blue-500"
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
                           class:border-blue-500={experience.previousExperience === exp.value}
                           class:bg-blue-50={experience.previousExperience === exp.value}>
                        <input
                            type="radio"
                            bind:group={experience.previousExperience}
                            value={exp.value}
                            class="mt-1 text-blue-600 focus:ring-blue-500"
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
                           class:border-blue-500={experience.injuries.includes(injury)}
                           class:bg-blue-50={experience.injuries.includes(injury)}>
                        <input
                            type="checkbox"
                            checked={experience.injuries.includes(injury)}
                            on:change={() => toggleInjury(injury)}
                            class="text-blue-600 focus:ring-blue-500"
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
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            Back
        </button>
        <button
            on:click={handleNext}
            disabled={!isFormValid()}
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Continue
        </button>
    </div>
</div>