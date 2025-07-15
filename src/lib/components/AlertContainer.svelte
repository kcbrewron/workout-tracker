<script>
    import { alertStore } from '$lib/stores/alerts.js';
    import AlertBanner from './AlertBanner.svelte';
    
    $: alerts = $alertStore;
    
    const handleDismiss = (alertId) => {
        alertStore.dismiss(alertId);
    };
</script>

<!-- Alert Container - Fixed at top of screen -->
<div class="alert-container fixed top-0 left-0 right-0 z-50 pointer-events-none">
    {#each alerts as alert (alert.id)}
        <div class="pointer-events-auto">
            <AlertBanner
                message={alert.message}
                type={alert.type}
                duration={0}
                dismissible={alert.dismissible}
                show={true}
                on:dismiss={() => handleDismiss(alert.id)}
            />
        </div>
    {/each}
</div>

<style>
    .alert-container {
        /* Ensure alerts stack properly */
        display: flex;
        flex-direction: column;
    }
</style>