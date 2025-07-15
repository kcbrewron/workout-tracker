<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { workoutSession } from '$lib/stores/workoutSession.js';
    import Header from '$lib/components/Header.svelte';

    let session = null;
    let notes = '';
    let isCompleting = false;
    let workoutStats = {
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
        duration: 0
    };

    onMount(() => {
        const unsubscribe = workoutSession.subscribe(state => {
            session = state.currentSession;
            
            if (!session || !state.isActive) {
                // No active session, redirect to workout page
                goto('/workout');
                return;
            }
            
            // Calculate workout statistics
            calculateWorkoutStats();
        });

        return unsubscribe;
    });

    function calculateWorkoutStats() {
        if (!session) return;

        let totalSets = 0;
        let totalReps = 0;
        let totalWeight = 0;

        session.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                if (set.completed) {
                    totalSets++;
                    totalReps += set.reps || 0;
                    totalWeight += (set.weight || 0) * (set.reps || 0);
                }
            });
        });

        const duration = Date.now() - new Date(session.startedAt).getTime();

        workoutStats = {
            totalSets,
            totalReps,
            totalWeight,
            duration: Math.floor(duration / 1000)
        };
    }

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        return `${minutes}m ${secs}s`;
    }

    async function completeWorkout() {
        if (isCompleting) return;
        
        isCompleting = true;
        
        try {
            await workoutSession.completeSession(notes);
            
            // Success feedback
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }
            
            // Redirect to dashboard after brief delay
            setTimeout(() => {
                goto('/dashboard');
            }, 2000);
            
        } catch (error) {
            console.error('Error completing workout:', error);
            isCompleting = false;
        }
    }

    function continueWorkout() {
        goto('/workout');
    }

    // Calculate completion percentage
    $: completionPercentage = session ? (() => {
        const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const completedSets = session.exercises.reduce((sum, ex) => 
            sum + ex.sets.filter(set => set.completed).length, 0);
        return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    })() : 0;

    $: hasCompletedSets = workoutStats.totalSets > 0;
</script>

<svelte:head>
    <title>Complete Workout | Workout Tracker</title>
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50">
    {#if session}
        <div class="max-w-2xl mx-auto px-4 py-8">
            <div class="text-center mb-8">
                <div class="text-6xl mb-4">🎉</div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Great Work!</h1>
                <p class="text-lg text-gray-600">How did your workout feel?</p>
            </div>

            <!-- Workout Summary -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">{session.routineName}</h2>
                
                <!-- Progress Bar -->
                <div class="mb-6">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Completion</span>
                        <span>{completionPercentage}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div 
                            class="bg-primary h-3 rounded-full transition-all duration-300"
                            style="width: {completionPercentage}%"
                            aria-label="Workout completion: {completionPercentage}%"
                        ></div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-2xl font-bold text-primary">{workoutStats.totalSets}</div>
                        <div class="text-sm text-gray-600">Sets</div>
                    </div>
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-2xl font-bold text-secondary">{workoutStats.totalReps}</div>
                        <div class="text-sm text-gray-600">Reps</div>
                    </div>
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-2xl font-bold text-accent">{workoutStats.totalWeight.toLocaleString()}</div>
                        <div class="text-sm text-gray-600">Total lbs</div>
                    </div>
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">{formatTime(workoutStats.duration)}</div>
                        <div class="text-sm text-gray-600">Duration</div>
                    </div>
                </div>

                <!-- Exercise Summary -->
                <div class="space-y-3">
                    <h3 class="font-medium text-gray-900">Exercises Completed</h3>
                    {#each session.exercises as exercise}
                        {@const completedSets = exercise.sets.filter(set => set.completed).length}
                        {@const totalSets = exercise.sets.length}
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                                <div class="font-medium text-gray-900">{exercise.name}</div>
                                <div class="text-sm text-gray-600">
                                    {completedSets}/{totalSets} sets completed
                                </div>
                            </div>
                            <div class="text-right">
                                {#if completedSets === totalSets}
                                    <span class="text-green-600 font-medium">✓ Complete</span>
                                {:else if completedSets > 0}
                                    <span class="text-yellow-600 font-medium">◐ Partial</span>
                                {:else}
                                    <span class="text-gray-400 font-medium">○ Skipped</span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Notes Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <label for="workout-notes" class="block text-sm font-medium text-gray-700 mb-3">
                    Workout Notes
                    <span class="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                    id="workout-notes"
                    bind:value={notes}
                    placeholder="How did you feel? Any PRs? Notes for next time..."
                    class="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    disabled={isCompleting}
                ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
                {#if hasCompletedSets}
                    <button
                        class="complete-btn"
                        class:completing={isCompleting}
                        on:click={completeWorkout}
                        disabled={isCompleting}
                        aria-label="Complete and save workout"
                    >
                        {#if isCompleting}
                            <span class="loading-spinner" aria-hidden="true"></span>
                            Saving Workout...
                        {:else}
                            Complete Workout
                        {/if}
                    </button>
                {:else}
                    <div class="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                        <p class="text-yellow-800 text-sm">
                            You haven't completed any sets yet. Continue your workout or save as incomplete?
                        </p>
                    </div>
                    
                    <button
                        class="complete-btn incomplete"
                        class:completing={isCompleting}
                        on:click={completeWorkout}
                        disabled={isCompleting}
                        aria-label="Save incomplete workout"
                    >
                        {#if isCompleting}
                            <span class="loading-spinner" aria-hidden="true"></span>
                            Saving...
                        {:else}
                            Save Incomplete Workout
                        {/if}
                    </button>
                {/if}

                <button
                    class="continue-btn"
                    on:click={continueWorkout}
                    disabled={isCompleting}
                    aria-label="Continue workout"
                >
                    Continue Workout
                </button>
            </div>

            <!-- Motivational Message -->
            {#if hasCompletedSets}
                <div class="text-center mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p class="text-green-800 font-medium">
                        {#if completionPercentage === 100}
                            🔥 Perfect workout! You completed every set!
                        {:else if completionPercentage >= 75}
                            💪 Strong effort! You completed most of your workout!
                        {:else if completionPercentage >= 50}
                            👍 Good work! Every set counts towards your goals!
                        {:else}
                            ⭐ Great start! Consistency is key to progress!
                        {/if}
                    </p>
                </div>
            {/if}
        </div>
    {:else}
        <!-- Loading state or redirect -->
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <div class="loading-spinner-large mb-4"></div>
                <p class="text-gray-600">Loading workout session...</p>
            </div>
        </div>
    {/if}
</main>

<style>
    .complete-btn {
        @apply w-full py-4 px-6 bg-primary text-white rounded-lg;
        @apply font-semibold text-lg;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
        @apply flex items-center justify-center gap-2;
        @apply min-h-14; /* Large touch target */
    }

    .complete-btn:not(:disabled):hover {
        @apply bg-orange-600 transform scale-105;
    }

    .complete-btn.completing {
        @apply bg-green-500;
    }

    .complete-btn.incomplete {
        @apply bg-yellow-500;
    }

    .complete-btn.incomplete:not(:disabled):hover {
        @apply bg-yellow-600;
    }

    .complete-btn:disabled {
        @apply cursor-not-allowed opacity-75;
    }

    .continue-btn {
        @apply w-full py-3 px-6 border-2 border-gray-300 text-gray-700 bg-white rounded-lg;
        @apply font-medium;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50;
        @apply min-h-12;
    }

    .continue-btn:not(:disabled):hover {
        @apply bg-gray-50 border-gray-400;
    }

    .continue-btn:disabled {
        @apply cursor-not-allowed opacity-50;
    }

    .loading-spinner {
        @apply w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin;
    }

    .loading-spinner-large {
        @apply w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto;
    }

    /* Mobile optimizations */
    @media (max-width: 640px) {
        .grid {
            @apply grid-cols-2;
        }
    }

    /* Ensure proper contrast for accessibility */
    textarea:focus {
        border-color: #f97316;
        box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .complete-btn,
        .continue-btn {
            @apply border-4;
        }
    }
</style>