<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.js';
    import { onboarding } from '$lib/stores/onboarding.js';
    import { goto } from '$app/navigation';
    import Header from '$lib/components/Header.svelte';
    
    let user = null;
    let onboardingData = null;
    
    onMount(() => {
        auth.init();
        onboarding.init();
        
        const unsubscribeAuth = auth.subscribe((authState) => {
            if (!authState.isAuthenticated && !authState.isLoading) {
                goto('/auth');
            } else {
                user = authState.user;
            }
        });
        
        const unsubscribeOnboarding = onboarding.subscribe((onboardingState) => {
            if (!onboardingState.isComplete) {
                goto('/onboarding');
            } else {
                onboardingData = onboardingState;
            }
        });
        
        return () => {
            unsubscribeAuth();
            unsubscribeOnboarding();
        };
    });
    
    const handleLogout = () => {
        auth.logout();
        goto('/auth');
    };
    
    const resetOnboarding = () => {
        onboarding.reset();
        goto('/onboarding');
    };
</script>

<svelte:head>
    <title>Dashboard | Workout Tracker</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50">
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard{#if user}, {user.name}{/if}!</h2>
            <p class="text-gray-600 mb-6">
                Congratulations on completing your profile setup. Your personalized workout experience is ready to begin!
            </p>
            
            {#if onboardingData}
                <!-- Profile Summary -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div class="bg-orange-50 p-4 rounded-lg border-l-4 border-primary">
                        <h3 class="font-semibold text-primary mb-2">Your Goal</h3>
                        <p class="text-gray-800 capitalize font-medium">
                            {onboardingData.goals.primaryObjective?.replace('_', ' ')}
                        </p>
                        <p class="text-sm text-gray-600 mt-1">
                            {onboardingData.goals.frequency?.replace('_', '-')} • {onboardingData.goals.duration?.replace('_', ' ')}
                        </p>
                    </div>
                    
                    <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-secondary">
                        <h3 class="font-semibold text-secondary mb-2">Experience Level</h3>
                        <p class="text-gray-800 capitalize font-medium">
                            {onboardingData.experience.level}
                        </p>
                        <p class="text-sm text-gray-600 mt-1">
                            {onboardingData.experience.previousExperience?.replace('_', ' ')} experience
                        </p>
                    </div>
                    
                    <div class="bg-cyan-50 p-4 rounded-lg border-l-4 border-accent">
                        <h3 class="font-semibold text-accent mb-2">Interests</h3>
                        <p class="text-gray-800 font-medium">
                            {onboardingData.preferences.sports?.length || 0} sports selected
                        </p>
                        <p class="text-sm text-gray-600 mt-1">
                            {onboardingData.preferences.focusType?.replace('_', ' ')} focus
                        </p>
                    </div>
                </div>
            {/if}
            
            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button class="p-4 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors">
                    <div class="text-2xl mb-2">🏋️</div>
                    <div class="font-medium">Start Workout</div>
                    <div class="text-sm opacity-90">Begin your training</div>
                </button>
                
                <button class="p-4 bg-secondary text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <div class="text-2xl mb-2">📋</div>
                    <div class="font-medium">Plan Workout</div>
                    <div class="text-sm opacity-90">Create a routine</div>
                </button>
                
                <button class="p-4 bg-accent text-white rounded-lg hover:bg-cyan-500 transition-colors">
                    <div class="text-2xl mb-2">📊</div>
                    <div class="font-medium">View Progress</div>
                    <div class="text-sm opacity-90">Track your gains</div>
                </button>
                
                <button class="p-4 bg-dark text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <div class="text-2xl mb-2">💪</div>
                    <div class="font-medium">Exercise Library</div>
                    <div class="text-sm opacity-90">Browse exercises</div>
                </button>
            </div>
            
            <!-- Development Actions -->
            <div class="mt-8 pt-6 border-t border-gray-200">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Development Actions</h3>
                <button
                    on:click={resetOnboarding}
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    Reset Onboarding (for testing)
                </button>
            </div>
        </div>
    </main>
</div>