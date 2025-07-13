<script>
    import { auth } from '$lib/stores/auth.js';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    let name = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let errors = {};
    let isLoading = false;
    
    // Only validate after user has interacted with fields
    $: {
        errors = {};
        if (name && name.length > 0 && name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }
        if (email && email.length > 2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (password && password.length > 0 && password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (confirmPassword && confirmPassword.length > 0 && password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
    }
    
    const isFormValid = () => {
        return name && email && password && confirmPassword && 
               Object.keys(errors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isFormValid()) return;
        
        isLoading = true;
        const result = await auth.register(email, password, name);
        isLoading = false;
        
        if (result.success) {
            dispatch('success');
        } else {
            errors.general = result.error;
        }
    };
</script>

<form on:submit={handleSubmit} class="space-y-6">
    <div>
        <label for="name" class="block text-sm font-medium text-gray-700">
            Full Name
        </label>
        <input
            id="name"
            type="text"
            bind:value={name}
            data-testid="name"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            class:border-red-500={errors.name}
            required
        />
        {#if errors.name}
            <p class="mt-1 text-sm text-red-600">{errors.name}</p>
        {/if}
    </div>

    <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
            Email Address
        </label>
        <input
            id="email"
            type="email"
            bind:value={email}
            data-testid="email"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            class:border-red-500={errors.email}
            required
        />
        {#if errors.email}
            <p class="mt-1 text-sm text-red-600">{errors.email}</p>
        {/if}
    </div>

    <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
            Password
        </label>
        <input
            id="password"
            type="password"
            bind:value={password}
            data-testid="password"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            class:border-red-500={errors.password}
            required
        />
        {#if errors.password}
            <p class="mt-1 text-sm text-red-600">{errors.password}</p>
        {/if}
    </div>

    <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
            Confirm Password
        </label>
        <input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            data-testid="confirmPassword"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            class:border-red-500={errors.confirmPassword}
            required
        />
        {#if errors.confirmPassword}
            <p class="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        {/if}
    </div>

    {#if errors.general}
        <div class="p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-800">{errors.general}</p>
        </div>
    {/if}

    <button
        type="submit"
        disabled={!isFormValid() || isLoading}
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {#if isLoading}
            <span class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
            </span>
        {:else}
            Create Account
        {/if}
    </button>
</form>