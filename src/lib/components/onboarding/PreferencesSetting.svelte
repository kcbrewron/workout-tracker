<script>
    import { onboarding } from '$lib/stores/onboarding.js';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let selectedSports = [];
    let selectedEquipment = [];
    let selectedFocusType = '';
    let selectedSchedule = [];
    
    // Load existing data from store if available
    onboarding.subscribe((state) => {
        if (state.preferences.sports.length > 0 || state.preferences.focusType) {
            selectedSports = [...state.preferences.sports];
            selectedEquipment = [...state.preferences.equipment];
            selectedFocusType = state.preferences.focusType;
            selectedSchedule = [...state.preferences.schedule];
        }
    });
    
    // Create reactive preferences object
    $: preferences = { 
        sports: selectedSports, 
        equipment: selectedEquipment, 
        focusType: selectedFocusType, 
        schedule: selectedSchedule 
    };
    $: formValid = !!(selectedSports.length > 0 && selectedEquipment.length > 0 && selectedFocusType && selectedSchedule.length > 0);
    
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
        if (selectedSports.includes(sport)) {
            selectedSports = selectedSports.filter(s => s !== sport);
        } else {
            selectedSports = [...selectedSports, sport];
        }
    };
    
    const toggleEquipment = (equip) => {
        if (selectedEquipment.includes(equip)) {
            selectedEquipment = selectedEquipment.filter(e => e !== equip);
        } else {
            selectedEquipment = [...selectedEquipment, equip];
        }
    };
    
    const toggleSchedule = (time) => {
        if (selectedSchedule.includes(time)) {
            selectedSchedule = selectedSchedule.filter(s => s !== time);
        } else {
            selectedSchedule = [...selectedSchedule, time];
        }
    };
    
    const isFormValid = () => {
        return formValid;
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
                           class:border-primary={selectedSports.includes(sport.value)}
                           class:bg-orange-50={selectedSports.includes(sport.value)}>
                        <input
                            type="checkbox"
                            checked={selectedSports.includes(sport.value)}
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
                           class:border-primary={selectedEquipment.includes(equip.value)}
                           class:bg-orange-50={selectedEquipment.includes(equip.value)}>
                        <input
                            type="checkbox"
                            checked={selectedEquipment.includes(equip.value)}
                            on:change={() => toggleEquipment(equip.value)}
                            class="mt-1 text-primary focus:ring-primary"
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
                           class:border-primary={selectedFocusType === focus.value}
                           class:bg-orange-50={selectedFocusType === focus.value}>
                        <input
                            type="radio"
                            bind:group={selectedFocusType}
                            value={focus.value}
                            class="mt-1 text-primary focus:ring-primary"
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
                           class:border-primary={selectedSchedule.includes(schedule.value)}
                           class:bg-orange-50={selectedSchedule.includes(schedule.value)}>
                        <input
                            type="checkbox"
                            checked={selectedSchedule.includes(schedule.value)}
                            on:change={() => toggleSchedule(schedule.value)}
                            class="text-primary focus:ring-primary"
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
            class="px-6 py-2 bg-accent text-white rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-accent"
        >
            Back
        </button>
        <button
            on:click={handleFinish}
            disabled={!formValid}
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 disabled:cursor-not-allowed"
        >
            Complete Setup
        </button>
    </div>
</div>