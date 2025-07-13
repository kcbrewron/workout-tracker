<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.js';
    import { onboarding } from '$lib/stores/onboarding.js';
    import { goto } from '$app/navigation';
    
    import GoalSetting from '$lib/components/onboarding/GoalSetting.svelte';
    import ExperienceAssessment from '$lib/components/onboarding/ExperienceAssessment.svelte';
    import PreferencesSetting from '$lib/components/onboarding/PreferencesSetting.svelte';
    import Header from '$lib/components/Header.svelte';
    
    let currentStep = 0;
    let isComplete = false;
    
    const steps = [
        { title: 'Goals', component: GoalSetting },
        { title: 'Experience', component: ExperienceAssessment },
        { title: 'Preferences', component: PreferencesSetting }
    ];
    
    onMount(() => {
        auth.init();
        onboarding.init();
        
        // Redirect if not authenticated
        const unsubscribeAuth = auth.subscribe((authState) => {
            if (!authState.isAuthenticated && !authState.isLoading) {
                goto('/auth');
            }
        });
        
        // Track onboarding progress
        const unsubscribeOnboarding = onboarding.subscribe((onboardingState) => {
            currentStep = onboardingState.currentStep;
            isComplete = onboardingState.isComplete;
            
            if (isComplete) {
                goto('/dashboard');
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
    
    const handleNext = () => {
        // Handled by individual components
    };
    
    const handleBack = () => {
        // Handled by individual components
    };
    
    const handleComplete = () => {
        goto('/dashboard');
    };
</script>

<svelte:head>
    <title>Setup Your Profile | Workout Tracker</title>
</svelte:head>

<Header showAuthButtons={false} />

<div class="min-h-screen bg-gray-50">
    
    <!-- Progress Bar -->
    <div class="bg-white border-b">
        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="py-4">
                <div class="flex items-center justify-between mb-2">
                    <h2 class="text-lg font-medium text-gray-900">Setup Your Profile</h2>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</span>
                        <button
                            on:click={handleLogout}
                            class="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
                
                <!-- Progress bar -->
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        class="bg-brand-orange h-2 rounded-full transition-all duration-300"
                        style="width: {((currentStep + 1) / steps.length) * 100}%"
                    ></div>
                </div>
                
                <!-- Step indicators -->
                <div class="flex justify-between mt-4">
                    {#each steps as step, index}
                        <div class="flex flex-col items-center">
                            <div 
                                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200"
                                class:bg-brand-orange={index <= currentStep}
                                class:text-white={index <= currentStep}
                                class:bg-gray-200={index > currentStep}
                                class:text-gray-600={index > currentStep}
                            >
                                {index + 1}
                            </div>
                            <span 
                                class="mt-2 text-xs font-medium"
                                class:text-brand-orange={index <= currentStep}
                                class:text-gray-500={index > currentStep}
                            >
                                {step.title}
                            </span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
    
    <!-- Content -->
    <main class="py-8">
        {#if currentStep < steps.length}
            <svelte:component 
                this={steps[currentStep].component} 
                on:next={handleNext}
                on:back={handleBack}
                on:complete={handleComplete}
            />
        {/if}
    </main>
</div>