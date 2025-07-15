<script>
    import { createEventDispatcher } from 'svelte';
    
    export let message = '';
    export let type = 'success'; // 'success', 'error', 'warning', 'info'
    export let duration = 5000; // Auto-dismiss after 5 seconds
    export let dismissible = true;
    export let show = true;
    
    const dispatch = createEventDispatcher();
    
    let timeoutId;
    
    $: if (show && duration > 0) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            handleDismiss();
        }, duration);
    }
    
    const handleDismiss = () => {
        show = false;
        clearTimeout(timeoutId);
        dispatch('dismiss');
    };
    
    const getTypeStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-green-50 border-green-200 text-green-800';
        }
    };
    
    const getIconForType = (type) => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '✅';
        }
    };
</script>

{#if show}
    <div 
        class="alert-banner fixed top-0 left-0 right-0 z-50 border-b-2 px-4 py-3 shadow-lg transition-all duration-300 ease-in-out {getTypeStyles(type)}"
        role="alert"
        aria-live="polite"
    >
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center">
                <span class="text-lg mr-3" aria-hidden="true">
                    {getIconForType(type)}
                </span>
                <span class="font-medium">
                    {message}
                </span>
            </div>
            
            {#if dismissible}
                <button
                    on:click={handleDismiss}
                    class="ml-4 inline-flex text-sm font-medium hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md p-1 transition-opacity"
                    aria-label="Dismiss alert"
                >
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            {/if}
        </div>
    </div>
{/if}

<style>
    .alert-banner {
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>