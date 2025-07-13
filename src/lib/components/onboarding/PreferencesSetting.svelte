<script>
    import { onboarding } from '$lib/stores/onboarding.js';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let preferences = {
        sports: [],
        equipment: [],
        focusType: '',
        schedule: []
    };
    
    const sports = [
        { value: 'running', label: 'Running', icon: '🏃' },
        { value: 'cycling', label: 'Cycling', icon: '🚴' },
        { value: 'swimming', label: 'Swimming', icon: '🏊' },
        { value: 'weightlifting', label: 'Weightlifting', icon: '🏋️' },
        { value: 'crossfit', label: 'CrossFit', icon: '💪' },
        { value: 'yoga', label: 'Yoga', icon: '🧘' },
        { value: 'martial_arts', label: 'Martial Arts', icon: '🥋' },
        { value: 'basketball', label: 'Basketball', icon: '🏀' },
        { value: 'soccer', label: 'Soccer', icon: '⚽' },
        { value: 'tennis', label: 'Tennis', icon: '🎾' },
        { value: 'hiking', label: 'Hiking', icon: '🥾' },
        { value: 'rock_climbing', label: 'Rock Climbing', icon: '🧗' }
    ];
    
    const equipment = [
        { value: 'full_gym', label: 'Full Gym Access', description: 'Complete gym with all equipment' },
        { value: 'home_gym', label: 'Home Gym', description: 'Basic equipment at home' },
        { value: 'bodyweight', label: 'Bodyweight Only', description: 'No equipment needed' },
        { value: 'dumbbells', label: 'Dumbbells', description: 'Set of dumbbells available' },
        { value: 'resistance_bands', label: 'Resistance Bands', description: 'Portable resistance training' },
        { value: 'kettlebells', label: 'Kettlebells', description: 'Kettlebell training setup' }
    ];
    
    const focusTypes = [
        { value: 'competition', label: 'Competition', description: 'Training for specific competitions or events' },
        { value: 'recreational', label: 'Recreational', description: 'Fitness for health and enjoyment' },
        { value: 'rehabilitation', label: 'Rehabilitation', description: 'Recovery and injury prevention focus' },
        { value: 'performance', label: 'Performance', description: 'Maximize athletic performance' }
    ];
    
    const scheduleOptions = [
        { value: 'early_morning', label: 'Early Morning (5-7 AM)', icon: '🌅' },
        { value: 'morning', label: 'Morning (7-10 AM)', icon: '🌤️' },
        { value: 'midday', label: 'Midday (10 AM-2 PM)', icon: '☀️' },
        { value: 'afternoon', label: 'Afternoon (2-6 PM)', icon: '🌇' },
        { value: 'evening', label: 'Evening (6-9 PM)', icon: '🌆' },
        { value: 'night', label: 'Night (9 PM-12 AM)', icon: '🌙' }
    ];
    
    const toggleSport = (sport) => {
        if (preferences.sports.includes(sport)) {
            preferences.sports = preferences.sports.filter(s => s !== sport);
        } else {
            preferences.sports = [...preferences.sports, sport];
        }
    };
    
    const toggleEquipment = (equip) => {
        if (preferences.equipment.includes(equip)) {
            preferences.equipment = preferences.equipment.filter(e => e !== equip);
        } else {
            preferences.equipment = [...preferences.equipment, equip];
        }
    };
    
    const toggleSchedule = (time) => {
        if (preferences.schedule.includes(time)) {
            preferences.schedule = preferences.schedule.filter(s => s !== time);
        } else {
            preferences.schedule = [...preferences.schedule, time];
        }
    };
    
    const isFormValid = () => {
        return preferences.sports.length > 0 && 
               preferences.equipment.length > 0 && 
               preferences.focusType && 
               preferences.schedule.length > 0;
    };
    
    const handleFinish = async () => {
        if (isFormValid()) {
            onboarding.setPreferences(preferences);
            const result = await onboarding.complete();
            if (result.success) {
                dispatch('complete');
            }
        }
    };
    
    const handleBack = () => {
        onboarding.previousStep();
        dispatch('back');
    };
</script>

<div class="max-w-2xl mx-auto p-6">
    <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Your preferences</h2>
        <p class="text-gray-600">Tell us about your favorite activities and preferred workout times to personalize your experience.</p>
    </div>
    
    <div class="space-y-8">
        <!-- Sports & Activities -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Sports & Activities (select all that interest you)</h3>
            <div class="grid grid-cols-3 gap-3">
                {#each sports as sport}
                    <label class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-blue-500={preferences.sports.includes(sport.value)}
                           class:bg-blue-50={preferences.sports.includes(sport.value)}>
                        <input
                            type="checkbox"
                            checked={preferences.sports.includes(sport.value)}
                            on:change={() => toggleSport(sport.value)}
                            class="sr-only"
                        />
                        <div class="text-2xl mb-2">{sport.icon}</div>
                        <div class="text-sm font-medium text-gray-900 text-center">{sport.label}</div>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Equipment Access -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Equipment Access (select all available)</h3>
            <div class="grid gap-3">
                {#each equipment as equip}
                    <label class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-blue-500={preferences.equipment.includes(equip.value)}
                           class:bg-blue-50={preferences.equipment.includes(equip.value)}>
                        <input
                            type="checkbox"
                            checked={preferences.equipment.includes(equip.value)}
                            on:change={() => toggleEquipment(equip.value)}
                            class="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <div class="ml-3">
                            <div class="font-medium text-gray-900">{equip.label}</div>
                            <div class="text-sm text-gray-600">{equip.description}</div>
                        </div>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Focus Type -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Training Focus</h3>
            <div class="grid gap-3">
                {#each focusTypes as focus}
                    <label class="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-blue-500={preferences.focusType === focus.value}
                           class:bg-blue-50={preferences.focusType === focus.value}>
                        <input
                            type="radio"
                            bind:group={preferences.focusType}
                            value={focus.value}
                            class="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <div class="ml-3">
                            <div class="font-medium text-gray-900">{focus.label}</div>
                            <div class="text-sm text-gray-600">{focus.description}</div>
                        </div>
                    </label>
                {/each}
            </div>
        </div>
        
        <!-- Preferred Schedule -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Preferred Workout Times (select all that work)</h3>
            <div class="grid grid-cols-2 gap-3">
                {#each scheduleOptions as schedule}
                    <label class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           class:border-blue-500={preferences.schedule.includes(schedule.value)}
                           class:bg-blue-50={preferences.schedule.includes(schedule.value)}>
                        <input
                            type="checkbox"
                            checked={preferences.schedule.includes(schedule.value)}
                            on:change={() => toggleSchedule(schedule.value)}
                            class="text-blue-600 focus:ring-blue-500"
                        />
                        <div class="ml-3 flex items-center">
                            <span class="text-lg mr-2">{schedule.icon}</span>
                            <span class="text-sm font-medium text-gray-900">{schedule.label}</span>
                        </div>
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
            on:click={handleFinish}
            disabled={!isFormValid()}
            class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Complete Setup
        </button>
    </div>
</div>