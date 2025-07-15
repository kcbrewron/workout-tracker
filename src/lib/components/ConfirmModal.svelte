<script>
    import { createEventDispatcher } from 'svelte';
    
    export let show = false;
    export let title = 'Confirm Action';
    export let message = 'Are you sure you want to proceed?';
    export let confirmText = 'Confirm';
    export let cancelText = 'Cancel';
    export let confirmType = 'danger'; // 'danger', 'warning', 'primary'
    
    const dispatch = createEventDispatcher();
    
    const handleConfirm = () => {
        dispatch('confirm');
        show = false;
    };
    
    const handleCancel = () => {
        dispatch('cancel');
        show = false;
    };
    
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };
    
    const getConfirmButtonClass = (type) => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
            case 'primary':
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
            default:
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
        }
    };
</script>

{#if show}
    <!-- Backdrop -->
    <div 
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        on:click={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
    >
        <!-- Modal -->
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
            <div class="flex items-center justify-between mb-4">
                <h3 id="modal-title" class="text-lg font-semibold text-gray-900">
                    {title}
                </h3>
                <button
                    on:click={handleCancel}
                    class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
                    aria-label="Close"
                >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <div class="mb-6">
                <p id="modal-description" class="text-gray-600">
                    {message}
                </p>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button
                    on:click={handleCancel}
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                    {cancelText}
                </button>
                <button
                    on:click={handleConfirm}
                    class="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors {getConfirmButtonClass(confirmType)}"
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Animation for modal */
    div[role="dialog"] {
        animation: fadeIn 0.2s ease-out;
    }
    
    div[role="dialog"] > div {
        animation: slideIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideIn {
        from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
        }
        to { 
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
</style>