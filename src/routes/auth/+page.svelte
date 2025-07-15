<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.js';
    import { goto } from '$app/navigation';
    import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
    import LoginForm from '$lib/components/auth/LoginForm.svelte';
    import Header from '$lib/components/Header.svelte';
    
    let isLogin = true;
    
    onMount(() => {
        auth.init();
        
        // Redirect if already authenticated
        const unsubscribe = auth.subscribe((state) => {
            if (state.isAuthenticated) {
                goto('/onboarding');
            }
        });
        
        return unsubscribe;
    });
    
    const handleAuthSuccess = () => {
        goto('/onboarding');
    };
    
    const switchMode = () => {
        isLogin = !isLogin;
    };
    
    const handleDemoMode = () => {
        // Simulate successful login for demo purposes
        auth.setDemoUser();
        goto('/onboarding');
    };
</script>

<svelte:head>
    <title>{isLogin ? 'Sign In' : 'Create Account'} | Workout Tracker</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="text-center">
            <h1 class="text-4xl font-bold text-orange-500 mb-2">Workout Tracker</h1>
            <h2 class="text-2xl font-semibold text-gray-700">
                {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p class="mt-2 text-gray-600">
                {isLogin ? 'Sign in to continue your fitness journey' : 'Join us and start tracking your workouts'}
            </p>
        </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {#if isLogin}
                <LoginForm on:success={handleAuthSuccess} />
            {:else}
                <RegisterForm on:success={handleAuthSuccess} />
            {/if}
            
            <div class="mt-6">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300" />
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                        </span>
                    </div>
                </div>

                <div class="mt-6 space-y-3">
                    <button
                        on:click={switchMode}
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-orange-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        {isLogin ? 'Create new account' : 'Sign in instead'}
                    </button>
                    
                    <button
                        on:click={handleDemoMode}
                        class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        🚀 Try Demo Mode (No Registration)
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>