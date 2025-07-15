<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.js';
    import { onboarding } from '$lib/stores/onboarding.js';
    import { workout } from '$lib/stores/workout.js';
    import { alertStore } from '$lib/stores/alerts.js';
    import { goto } from '$app/navigation';
    import Header from '$lib/components/Header.svelte';
    import WorkoutGenerator from '$lib/components/workout/WorkoutGenerator.svelte';
    import ConfirmModal from '$lib/components/ConfirmModal.svelte';

    let user = null;
    let onboardingData = null;
    let workoutStore = null;
    let showDeleteConfirm = false;
    let routineToDelete = null;
    let activeTab = 'generate';

    onMount(() => {
        auth.init();
        onboarding.init();
        workout.loadSavedRoutines();

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

        const unsubscribeWorkout = workout.subscribe((state) => {
            workoutStore = state;
        });

        return () => {
            unsubscribeAuth();
            unsubscribeOnboarding();
            unsubscribeWorkout();
        };
    });

    function handleRoutineGenerated(routine) {
        console.log('Routine generated:', routine);
    }

    function startWorkout(routine) {
        workout.setCurrentRoutine(routine);
        goto('/workout-session');
    }

    function deleteRoutine(routineId) {
        routineToDelete = routineId;
        showDeleteConfirm = true;
    }
    
    function confirmDelete() {
        if (routineToDelete) {
            workout.deleteRoutine(routineToDelete);
            alertStore.success('Routine deleted successfully');
            routineToDelete = null;
        }
        showDeleteConfirm = false;
    }
    
    function cancelDelete() {
        routineToDelete = null;
        showDeleteConfirm = false;
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }
</script>

<svelte:head>
    <title>Workout Planner | Workout Tracker</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Page Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Workout Planner</h1>
            <p class="text-gray-600 mt-2">Create personalized workout routines tailored to your goals</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="mb-8">
            <nav class="flex space-x-8">
                <button
                    class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'generate' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
                    on:click={() => activeTab = 'generate'}
                >
                    Generate Workout
                </button>
                <button
                    class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
                    on:click={() => activeTab = 'saved'}
                >
                    Saved Routines ({workoutStore?.savedRoutines?.length || 0})
                </button>
            </nav>
        </div>

        <!-- Content -->
        {#if activeTab === 'generate'}
            <WorkoutGenerator onRoutineGenerated={handleRoutineGenerated} />
        {:else if activeTab === 'saved'}
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Your Saved Routines</h2>
                
                {#if workoutStore?.savedRoutines?.length > 0}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {#each workoutStore.savedRoutines as routine}
                            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div class="flex justify-between items-start mb-3">
                                    <h3 class="text-lg font-semibold text-gray-900">{routine.name}</h3>
                                    <button
                                        class="text-gray-400 hover:text-red-500 transition-colors"
                                        on:click={() => deleteRoutine(routine.id)}
                                        title="Delete routine"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                
                                <p class="text-gray-600 text-sm mb-3">{routine.description}</p>
                                
                                <div class="flex flex-wrap gap-2 mb-4 text-xs">
                                    <span class="bg-gray-100 px-2 py-1 rounded">⏱️ {routine.estimatedTime}m</span>
                                    <span class="bg-gray-100 px-2 py-1 rounded">📈 {routine.difficulty}</span>
                                    <span class="bg-gray-100 px-2 py-1 rounded">🏃 {routine.type}</span>
                                    <span class="bg-gray-100 px-2 py-1 rounded">💪 {routine.exercises?.length} exercises</span>
                                </div>
                                
                                <div class="text-xs text-gray-500 mb-4">
                                    Created: {formatDate(routine.createdAt)}
                                </div>
                                
                                <div class="flex gap-2">
                                    <button
                                        class="flex-1 px-3 py-2 bg-primary text-white rounded hover:bg-orange-600 transition-colors text-sm"
                                        on:click={() => startWorkout(routine)}
                                    >
                                        Start Workout
                                    </button>
                                    <button
                                        class="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                                        on:click={() => {
                                            workout.clearGeneratedRoutine();
                                            workout.generateRoutine(onboardingData, {
                                                type: routine.type,
                                                duration: routine.duration
                                            });
                                            activeTab = 'generate';
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="text-center py-12">
                        <div class="text-6xl mb-4">💪</div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No saved routines yet</h3>
                        <p class="text-gray-600 mb-6">Generate your first workout routine to get started</p>
                        <button
                            class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
                            on:click={() => activeTab = 'generate'}
                        >
                            Generate Your First Workout
                        </button>
                    </div>
                {/if}
            </div>
        {/if}
    </main>
</div>

<!-- Confirmation Modal -->
<ConfirmModal 
    bind:show={showDeleteConfirm}
    title="Delete Routine"
    message="Are you sure you want to delete this routine? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    confirmType="danger"
    on:confirm={confirmDelete}
    on:cancel={cancelDelete}
/>