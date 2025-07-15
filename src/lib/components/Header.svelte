<script>
    import { auth } from '$lib/stores/auth.js';
    import { goto } from '$app/navigation';
    
    export let showAuthButtons = true;
    
    const handleLogin = () => {
        goto('/auth');
    };
    
    const handleLogout = () => {
        auth.logout();
        goto('/');
    };
</script>

<header class="bg-primary shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
                <a href="/" class="text-2xl font-bold text-white hover:text-gray-100 transition-colors">
                    Workout Tracker
                </a>
            </div>
            
            {#if showAuthButtons}
                <nav class="flex items-center space-x-4">
                    {#if $auth.isAuthenticated}
                        <a href="/dashboard" class="text-white hover:text-gray-200 text-sm">
                            Dashboard
                        </a>
                        <button
                            on:click={handleLogout}
                            class="text-white hover:text-gray-200 text-sm"
                        >
                            Sign Out
                        </button>
                    {:else}
                        <a href="/#features" class="text-white hover:text-gray-200 text-sm">
                            Features
                        </a>
                        <a href="/auth" class="text-white hover:text-gray-200 text-sm">
                            Sign In
                        </a>
                        <button
                            on:click={() => goto('/auth')}
                            class="bg-white text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                            Get Started
                        </button>
                    {/if}
                </nav>
            {/if}
        </div>
    </div>
</header>