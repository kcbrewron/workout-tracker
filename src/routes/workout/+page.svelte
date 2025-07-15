<script>
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { workoutSession } from '$lib/stores/workoutSession.js';
    import { workout } from '$lib/stores/workout.js';
    import Header from '$lib/components/Header.svelte';
    import SetRecorder from '$lib/components/workout/SetRecorder.svelte';
    import ConfirmModal from '$lib/components/ConfirmModal.svelte';

    let session = null;
    let isActive = false;
    let activeExerciseIndex = 0;
    let showCancelConfirm = false;
    let showStartMenu = true;
    let savedRoutines = [];
    let sessionTimer = 0;
    let timerInterval = null;

    // Unsubscribe functions
    let unsubscribeSession;
    let unsubscribeWorkout;

    onMount(() => {
        workoutSession.init();
        workout.loadSavedRoutines();

        // Subscribe to workout session
        unsubscribeSession = workoutSession.subscribe(state => {
            session = state.currentSession;
            isActive = state.isActive;
            activeExerciseIndex = state.activeExerciseIndex;
            showStartMenu = !state.isActive;
        });

        // Subscribe to workout store for saved routines
        unsubscribeWorkout = workout.subscribe(state => {
            savedRoutines = state.savedRoutines;
        });

        // Start timer if session is active
        if (isActive && session) {
            startTimer();
        }
    });

    onDestroy(() => {
        if (unsubscribeSession) unsubscribeSession();
        if (unsubscribeWorkout) unsubscribeWorkout();
        if (timerInterval) clearInterval(timerInterval);
    });

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            if (session && session.startedAt) {
                const elapsed = Date.now() - new Date(session.startedAt).getTime();
                sessionTimer = Math.floor(elapsed / 1000);
            }
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    function startWorkout(routine = null) {
        const newSession = workoutSession.startSession(routine);
        showStartMenu = false;
        startTimer();
        
        // Haptic feedback for session start
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    function quickStart() {
        startWorkout(null);
    }

    function navigateToExercise(index) {
        if (!session || index < 0 || index >= session.exercises.length) return;
        workoutSession.setActiveExercise(index);
    }

    function previousExercise() {
        if (activeExerciseIndex > 0) {
            navigateToExercise(activeExerciseIndex - 1);
        }
    }

    function nextExercise() {
        if (activeExerciseIndex < session.exercises.length - 1) {
            navigateToExercise(activeExerciseIndex + 1);
        }
    }

    function recordSet(event) {
        const setData = event.detail;
        const exercise = session.exercises[activeExerciseIndex];
        const nextIncompleteSet = exercise.sets.findIndex(set => !set.completed);
        
        if (nextIncompleteSet !== -1) {
            workoutSession.recordSet(activeExerciseIndex, nextIncompleteSet, setData);
            
            // Auto-advance to next set or exercise
            setTimeout(() => {
                const updatedExercise = session.exercises[activeExerciseIndex];
                const stillHasIncompleteSets = updatedExercise.sets.some(set => !set.completed);
                
                if (!stillHasIncompleteSets) {
                    // Move to next exercise if current is complete
                    if (activeExerciseIndex < session.exercises.length - 1) {
                        nextExercise();
                    }
                }
            }, 1500);
        }
    }

    function pauseSession() {
        workoutSession.pauseSession();
        stopTimer();
    }

    function resumeSession() {
        workoutSession.resumeSession();
        startTimer();
    }

    function finishWorkout() {
        goto('/workout/complete');
    }

    function cancelWorkout() {
        showCancelConfirm = true;
    }
    
    function confirmCancel() {
        workoutSession.cancelSession();
        stopTimer();
        showStartMenu = true;
        showCancelConfirm = false;
    }
    
    function cancelCancelation() {
        showCancelConfirm = false;
    }

    // Current exercise and set data
    $: currentExercise = session?.exercises[activeExerciseIndex];
    $: currentSetIndex = currentExercise?.sets.findIndex(set => !set.completed) ?? 0;
    $: currentSet = currentExercise?.sets[currentSetIndex];
    $: lastSetData = workoutSession.getLastSetData(activeExerciseIndex, currentSetIndex);
    $: exerciseProgress = currentExercise ? 
        `${currentExercise.sets.filter(set => set.completed).length}/${currentExercise.sets.length}` : '0/0';
    $: workoutProgress = session ? 
        `${activeExerciseIndex + 1}/${session.exercises.length}` : '0/0';
</script>

<svelte:head>
    <title>Workout Session | Workout Tracker</title>
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50">
    {#if showStartMenu}
        <!-- Workout Start Menu -->
        <div class="max-w-4xl mx-auto px-4 py-8">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Start Your Workout</h1>
                <p class="text-gray-600">Choose a saved routine or start a quick workout</p>
            </div>

            <!-- Quick Start Section -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Start</h2>
                <button
                    class="quick-start-btn"
                    on:click={quickStart}
                    aria-label="Start a quick workout"
                >
                    <div class="text-4xl mb-2">⚡</div>
                    <div class="font-semibold text-lg">Quick Workout</div>
                    <div class="text-sm opacity-90">Add exercises as you go</div>
                </button>
            </div>

            <!-- Saved Routines Section -->
            {#if savedRoutines.length > 0}
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Saved Routines</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {#each savedRoutines as routine}
                            <button
                                class="routine-btn"
                                on:click={() => startWorkout(routine)}
                                aria-label="Start {routine.name} workout"
                            >
                                <div class="routine-header">
                                    <h3 class="font-semibold text-gray-900">{routine.name}</h3>
                                    <span class="text-sm text-gray-500 capitalize">{routine.type}</span>
                                </div>
                                <div class="routine-details">
                                    <span class="text-sm text-gray-600">
                                        {routine.exercises.length} exercises • ~{routine.estimatedTime}min
                                    </span>
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="text-center py-8">
                    <div class="text-gray-400 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p class="text-gray-600 mb-4">No saved routines yet</p>
                    <button
                        class="text-primary hover:text-orange-600 font-medium"
                        on:click={() => goto('/workout-planner')}
                    >
                        Create your first routine →
                    </button>
                </div>
            {/if}
        </div>

    {:else if session}
        <!-- Active Workout Session -->
        <div class="workout-session">
            <!-- Session Header -->
            <div class="session-header">
                <div class="session-info">
                    <h1 class="text-xl font-bold text-white">{session.routineName}</h1>
                    <div class="session-stats">
                        <span class="stat-item">
                            <span class="stat-label">Time</span>
                            <span class="stat-value">{formatTime(sessionTimer)}</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-label">Exercise</span>
                            <span class="stat-value">{workoutProgress}</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-label">Sets</span>
                            <span class="stat-value">{exerciseProgress}</span>
                        </span>
                    </div>
                </div>

                <div class="session-actions">
                    {#if session.isPaused}
                        <button
                            class="action-btn resume-btn"
                            on:click={resumeSession}
                            aria-label="Resume workout"
                        >
                            ▶️
                        </button>
                    {:else}
                        <button
                            class="action-btn pause-btn"
                            on:click={pauseSession}
                            aria-label="Pause workout"
                        >
                            ⏸️
                        </button>
                    {/if}
                    
                    <button
                        class="action-btn finish-btn"
                        on:click={finishWorkout}
                        aria-label="Finish workout"
                    >
                        ✅
                    </button>
                    
                    <button
                        class="action-btn cancel-btn"
                        on:click={cancelWorkout}
                        aria-label="Cancel workout"
                    >
                        ❌
                    </button>
                </div>
            </div>

            <!-- Exercise Navigation -->
            {#if session.exercises.length > 1}
                <div class="exercise-nav">
                    <button
                        class="nav-btn prev-btn"
                        on:click={previousExercise}
                        disabled={activeExerciseIndex === 0}
                        aria-label="Previous exercise"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>

                    <div class="exercise-indicator">
                        {#each session.exercises as exercise, index}
                            <button
                                class="exercise-dot"
                                class:active={index === activeExerciseIndex}
                                class:completed={exercise.sets.every(set => set.completed)}
                                on:click={() => navigateToExercise(index)}
                                aria-label="Go to {exercise.name}"
                                title={exercise.name}
                            ></button>
                        {/each}
                    </div>

                    <button
                        class="nav-btn next-btn"
                        on:click={nextExercise}
                        disabled={activeExerciseIndex === session.exercises.length - 1}
                        aria-label="Next exercise"
                    >
                        Next
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            {/if}

            <!-- Current Exercise -->
            {#if currentExercise}
                <div class="exercise-content">
                    <SetRecorder
                        exercise={currentExercise}
                        setNumber={currentSetIndex + 1}
                        {lastSetData}
                        disabled={session.isPaused}
                        on:record={recordSet}
                    />
                </div>
            {/if}

            <!-- Quick Add Exercise (for quick start) -->
            {#if session.isQuickStart}
                <div class="quick-add-section">
                    <button
                        class="quick-add-btn"
                        on:click={() => goto('/workout/add-exercise')}
                        aria-label="Add another exercise"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Exercise
                    </button>
                </div>
            {/if}
        </div>
    {/if}
</main>

<style>
    .quick-start-btn {
        @apply w-full p-6 bg-primary text-white rounded-lg;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
        @apply active:scale-95;
        @apply text-center;
    }

    .quick-start-btn:hover {
        @apply bg-orange-600 transform scale-105;
    }

    .routine-btn {
        @apply w-full p-4 bg-white border-2 border-gray-200 rounded-lg;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
        @apply active:scale-95;
        @apply text-left;
    }

    .routine-btn:hover {
        @apply border-primary bg-orange-50;
    }

    .routine-header {
        @apply flex justify-between items-center mb-2;
    }

    .workout-session {
        @apply min-h-screen;
    }

    .session-header {
        @apply bg-primary text-white p-4;
        @apply flex justify-between items-center;
        @apply shadow-lg;
    }

    .session-stats {
        @apply flex gap-4 mt-2;
    }

    .stat-item {
        @apply flex flex-col text-center;
    }

    .stat-label {
        @apply text-xs opacity-90;
    }

    .stat-value {
        @apply font-semibold;
    }

    .session-actions {
        @apply flex gap-2;
    }

    .action-btn {
        @apply w-12 h-12 rounded-full;
        @apply flex items-center justify-center;
        @apply border-2 border-white text-white;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50;
    }

    .action-btn:hover {
        @apply bg-white bg-opacity-10;
    }

    .exercise-nav {
        @apply bg-white border-b border-gray-200 p-4;
        @apply flex justify-between items-center;
    }

    .nav-btn {
        @apply flex items-center gap-2 px-4 py-2;
        @apply bg-gray-100 text-gray-700 rounded-lg;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
        @apply min-h-12; /* Large touch target */
    }

    .nav-btn:not(:disabled):hover {
        @apply bg-gray-200;
    }

    .nav-btn:disabled {
        @apply opacity-50 cursor-not-allowed;
    }

    .exercise-indicator {
        @apply flex gap-2;
    }

    .exercise-dot {
        @apply w-4 h-4 rounded-full border-2;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
    }

    .exercise-dot {
        @apply bg-gray-200 border-gray-300;
    }

    .exercise-dot.active {
        @apply bg-primary border-primary;
    }

    .exercise-dot.completed {
        @apply bg-green-500 border-green-500;
    }

    .exercise-content {
        @apply p-4;
    }

    .quick-add-section {
        @apply p-4 border-t border-gray-200;
    }

    .quick-add-btn {
        @apply w-full py-3 px-4;
        @apply border-2 border-dashed border-gray-300 text-gray-600 rounded-lg;
        @apply transition-all duration-150;
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50;
        @apply flex items-center justify-center gap-2;
    }

    .quick-add-btn:hover {
        @apply border-primary text-primary;
    }

    /* Mobile optimizations */
    @media (max-width: 640px) {
        .session-header {
            @apply flex-col gap-4;
        }

        .session-actions {
            @apply justify-center;
        }

        .exercise-nav {
            @apply flex-col gap-3;
        }

        .nav-btn {
            @apply w-full justify-center;
        }
    }
</style>

<!-- Confirmation Modal -->
<ConfirmModal 
    bind:show={showCancelConfirm}
    title="Cancel Workout"
    message="Are you sure you want to cancel this workout? All progress will be lost."
    confirmText="Cancel Workout"
    cancelText="Keep Training"
    confirmType="danger"
    on:confirm={confirmCancel}
    on:cancel={cancelCancelation}
/>