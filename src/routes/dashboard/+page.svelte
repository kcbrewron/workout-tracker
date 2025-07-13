<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.js';
    import { onboarding } from '$lib/stores/onboarding.js';
    import { goto } from '$app/navigation';
    
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

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-gray-900">Workout Tracker</h1>
                </div>
                <div class="flex items-center space-x-4">
                    {#if user}
                        <span class="text-gray-700">Welcome, {user.name}!</span>
                    {/if}
                    <button
                        on:click={handleLogout}
                        class="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    </header>
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard!</h2>
            <p class="text-gray-600 mb-6">
                Congratulations on completing your profile setup. Your personalized workout experience is ready to begin!
            </p>
            
            {#if onboardingData}
                <!-- Profile Summary -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-blue-900 mb-2">Your Goal</h3>
                        <p class="text-blue-700 capitalize">
                            {onboardingData.goals.primaryObjective?.replace('_', ' ')}
                        </p>
                        <p class="text-sm text-blue-600 mt-1">
                            {onboardingData.goals.frequency?.replace('_', '-')} • {onboardingData.goals.duration?.replace('_', ' ')}
                        </p>
                    </div>
                    
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-green-900 mb-2">Experience Level</h3>
                        <p class="text-green-700 capitalize">
                            {onboardingData.experience.level}
                        </p>
                        <p class="text-sm text-green-600 mt-1">
                            {onboardingData.experience.previousExperience?.replace('_', ' ')} experience
                        </p>
                    </div>
                    
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-purple-900 mb-2">Interests</h3>
                        <p class="text-purple-700">
                            {onboardingData.preferences.sports?.length || 0} sports selected
                        </p>
                        <p class="text-sm text-purple-600 mt-1">
                            {onboardingData.preferences.focusType?.replace('_', ' ')} focus
                        </p>
                    </div>
                </div>
            {/if}
            
            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button class="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <div class="text-2xl mb-2">🏋️</div>
                    <div class="font-medium">Start Workout</div>
                    <div class="text-sm opacity-90">Begin your training</div>
                </button>
                
                <button class="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <div class="text-2xl mb-2">📋</div>
                    <div class="font-medium">Plan Workout</div>
                    <div class="text-sm opacity-90">Create a routine</div>
                </button>
                
                <button class="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <div class="text-2xl mb-2">📊</div>
                    <div class="font-medium">View Progress</div>
                    <div class="text-sm opacity-90">Track your gains</div>
                </button>
                
                <button class="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
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
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Reset Onboarding (for testing)
                </button>
            </div>
        </div>
    </main>
</div>