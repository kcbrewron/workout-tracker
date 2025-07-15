<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth.js';
    import { workout } from '$lib/stores/workout.js';
    import { alertStore } from '$lib/stores/alerts.js';
    import { goto } from '$app/navigation';
    import Header from '$lib/components/Header.svelte';

    let user = null;
    let currentRoutine = null;
    let sessionData = {
        exercises: [],
        startTime: null,
        isActive: false,
        currentExerciseIndex: 0
    };

    // Reactive declarations
    $: workoutStore = $workout;
    $: currentRoutine = workoutStore?.currentRoutine;
    
    // Reactive variables for UI updates
    $: currentExercise = sessionData.exercises && sessionData.currentExerciseIndex < sessionData.exercises.length 
        ? sessionData.exercises[sessionData.currentExerciseIndex] 
        : null;
    $: completedCount = sessionData.exercises ? sessionData.exercises.filter(ex => ex.completed).length : 0;
    $: totalCount = sessionData.exercises ? sessionData.exercises.length : 0;

    onMount(() => {
        auth.init();

        const unsubscribeAuth = auth.subscribe((authState) => {
            if (!authState.isAuthenticated && !authState.isLoading) {
                goto('/auth');
            } else {
                user = authState.user;
            }
        });

        const unsubscribeWorkout = workout.subscribe((state) => {
            if (state.currentRoutine) {
                initializeSession(state.currentRoutine);
            } else {
                // Redirect back if no current routine
                goto('/workout-planner');
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeWorkout();
        };
    });

    function initializeSession(routine) {
        sessionData = {
            exercises: routine.exercises.map((exercise, index) => ({
                ...exercise,
                completed: false,
                completedSets: [],
                currentSet: 1,
                index: index
            })),
            startTime: new Date(),
            isActive: true,
            currentExerciseIndex: 0
        };
    }

    function completeSet(exerciseIndex) {
        const exercise = sessionData.exercises[exerciseIndex];
        const totalSets = exercise.sets || 1;
        
        if (exercise.currentSet <= totalSets) {
            const newCompletedSet = {
                setNumber: exercise.currentSet,
                completedAt: new Date(),
                reps: exercise.reps,
                weight: null, // Could be expanded for weight tracking
                notes: ''
            };
            
            let updatedExercise;
            if (exercise.currentSet < totalSets) {
                // More sets to go
                updatedExercise = {
                    ...exercise,
                    currentSet: exercise.currentSet + 1,
                    completedSets: [...exercise.completedSets, newCompletedSet]
                };
            } else {
                // Exercise completed
                updatedExercise = {
                    ...exercise,
                    completed: true,
                    completedSets: [...exercise.completedSets, newCompletedSet]
                };
                alertStore.success(`${exercise.name} completed!`);
            }
            
            // Create new exercises array with updated exercise
            const newExercises = sessionData.exercises.map((ex, index) => 
                index === exerciseIndex ? updatedExercise : ex
            );
            
            // Update session data
            sessionData = {
                ...sessionData,
                exercises: newExercises
            };
            
            // Auto-advance to next exercise if this one is completed
            if (updatedExercise.completed) {
                advanceToNextExercise();
            }
        }
    }

    function advanceToNextExercise() {
        // Find the next incomplete exercise
        for (let i = sessionData.currentExerciseIndex + 1; i < sessionData.exercises.length; i++) {
            if (!sessionData.exercises[i].completed) {
                sessionData = {
                    ...sessionData,
                    currentExerciseIndex: i
                };
                return;
            }
        }
        // If no more incomplete exercises, stay at current index
    }

    function skipExercise(exerciseIndex) {
        const exerciseName = sessionData.exercises[exerciseIndex].name;
        
        // Create new exercises array with skipped exercise marked as completed
        const newExercises = sessionData.exercises.map((ex, index) => 
            index === exerciseIndex ? { ...ex, completed: true } : ex
        );
        
        // Update session data
        sessionData = {
            ...sessionData,
            exercises: newExercises
        };
        
        alertStore.info(`${exerciseName} skipped`);
        
        // Auto-advance to next incomplete exercise
        advanceToNextExercise();
    }

    function completeWorkout() {
        const completedExercises = sessionData.exercises.filter(ex => ex.completed).length;
        const totalExercises = sessionData.exercises.length;
        const duration = Math.round((new Date() - sessionData.startTime) / (1000 * 60)); // minutes
        
        if (completedExercises === 0) {
            alertStore.error('Complete at least one exercise before finishing the workout');
            return;
        }

        // Save workout session data (could be expanded to save to database)
        const sessionRecord = {
            routine: currentRoutine,
            completedExercises: completedExercises,
            totalExercises: totalExercises,
            duration: duration,
            completedAt: new Date(),
            exercises: sessionData.exercises.filter(ex => ex.completed)
        };

        alertStore.success(`Workout completed! ${completedExercises}/${totalExercises} exercises done in ${duration} minutes`);
        
        // Clear current routine and navigate back
        workout.setCurrentRoutine(null);
        goto('/dashboard');
    }

    function exitWorkout() {
        if (confirm('Are you sure you want to exit this workout? Your progress will be lost.')) {
            workout.setCurrentRoutine(null);
            goto('/workout-planner');
        }
    }

    function getCurrentExercise() {
        return sessionData.exercises[sessionData.currentExerciseIndex];
    }

    function getNextIncompleteExercise() {
        // First check current exercise index
        if (sessionData.currentExerciseIndex < sessionData.exercises.length) {
            const currentExercise = sessionData.exercises[sessionData.currentExerciseIndex];
            if (!currentExercise.completed) {
                return currentExercise;
            }
        }
        
        // If current exercise is completed, find next incomplete one
        for (let i = sessionData.currentExerciseIndex + 1; i < sessionData.exercises.length; i++) {
            if (!sessionData.exercises[i].completed) {
                return sessionData.exercises[i];
            }
        }
        return null;
    }

    function formatDuration(startTime) {
        if (!startTime) return '0:00';
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Timer update
    let timer;
    let elapsedTime = '0:00';
    
    onMount(() => {
        timer = setInterval(() => {
            if (sessionData.startTime) {
                elapsedTime = formatDuration(sessionData.startTime);
            }
        }, 1000);
        
        return () => clearInterval(timer);
    });
</script>

<svelte:head>
    <title>Workout Session | Workout Tracker</title>
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50">
    {#if currentRoutine && sessionData.isActive}
        <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Session Header -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">{currentRoutine.name}</h1>
                        <p class="text-gray-600">{currentRoutine.description}</p>
                    </div>
                    <button
                        class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        on:click={exitWorkout}
                        title="Exit workout"
                    >
                        ✕
                    </button>
                </div>
                
                <div class="flex justify-between items-center">
                    <div class="flex gap-6 text-sm">
                        <span class="text-gray-600">⏱️ <strong>Time:</strong> {elapsedTime}</span>
                        <span class="text-gray-600">📊 <strong>Progress:</strong> {completedCount}/{totalCount}</span>
                        <span class="text-gray-600">🔥 <strong>Type:</strong> {currentRoutine.type}</span>
                    </div>
                </div>
            </div>

            <!-- Current Exercise Card -->
            {#if currentExercise && !currentExercise.completed}
                {@const currentEx = currentExercise}
                <div class="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-primary">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-xl font-semibold text-gray-900">Current Exercise</h2>
                        <span class="bg-primary text-white px-3 py-1 rounded text-sm">
                            {currentEx.phase}
                        </span>
                    </div>
                    
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">{currentEx.name}</h3>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {#if currentEx.sets}
                            <div class="text-center">
                                <div class="text-2xl font-bold text-primary">{currentEx.currentSet}/{currentEx.sets}</div>
                                <div class="text-sm text-gray-600">Sets</div>
                            </div>
                        {/if}
                        {#if currentEx.reps}
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-600">{currentEx.reps}</div>
                                <div class="text-sm text-gray-600">Reps</div>
                            </div>
                        {/if}
                        {#if currentEx.duration}
                            <div class="text-center">
                                <div class="text-2xl font-bold text-green-600">{currentEx.duration}</div>
                                <div class="text-sm text-gray-600">Duration</div>
                            </div>
                        {/if}
                        {#if currentEx.restTime && currentEx.restTime > 0}
                            <div class="text-center">
                                <div class="text-2xl font-bold text-yellow-600">{currentEx.restTime}s</div>
                                <div class="text-sm text-gray-600">Rest</div>
                            </div>
                        {/if}
                    </div>
                    
                    {#if currentEx.notes}
                        <div class="bg-blue-50 p-3 rounded-lg mb-4">
                            <p class="text-sm text-blue-800">💡 {currentEx.notes}</p>
                        </div>
                    {/if}
                    
                    <div class="flex gap-3">
                        <button
                            class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            on:click={() => completeSet(currentEx.index)}
                        >
                            {#if currentEx.sets && currentEx.currentSet < currentEx.sets}
                                Complete Set {currentEx.currentSet}
                            {:else}
                                Complete Exercise
                            {/if}
                        </button>
                        <button
                            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            on:click={() => skipExercise(currentEx.index)}
                        >
                            Skip
                        </button>
                    </div>
                </div>
            {:else}
                <!-- All exercises completed -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
                    <div class="text-6xl mb-4">🎉</div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Great job!</h2>
                    <p class="text-gray-600 mb-6">You've completed all exercises in this workout!</p>
                    <button
                        class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        on:click={completeWorkout}
                    >
                        Finish Workout
                    </button>
                </div>
            {/if}

            <!-- Exercise List -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">All Exercises</h3>
                
                <div class="space-y-3">
                    {#each sessionData.exercises as exercise, index (exercise.id || index)}
                        <div class="flex items-center justify-between p-3 border rounded-lg {exercise.completed ? 'bg-green-50 border-green-200' : index === sessionData.currentExerciseIndex ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}">
                            <div class="flex items-center gap-3">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center {exercise.completed ? 'bg-green-500 text-white' : index === sessionData.currentExerciseIndex ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}">
                                    {#if exercise.completed}
                                        ✓
                                    {:else}
                                        {index + 1}
                                    {/if}
                                </div>
                                <div>
                                    <div class="font-medium text-gray-900">{exercise.name}</div>
                                    <div class="text-sm text-gray-600">
                                        {#if exercise.sets}{exercise.sets} sets{/if}
                                        {#if exercise.reps} × {exercise.reps}{/if}
                                        {#if exercise.duration} - {exercise.duration}{/if}
                                    </div>
                                </div>
                            </div>
                            
                            {#if exercise.completed}
                                <span class="text-green-600 text-sm font-medium">Completed</span>
                            {:else if index === sessionData.currentExerciseIndex}
                                <span class="text-blue-600 text-sm font-medium">Current</span>
                            {:else}
                                <span class="text-gray-400 text-sm">Pending</span>
                            {/if}
                        </div>
                    {/each}
                </div>
                
                <div class="mt-6 pt-4 border-t">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">
                            {completedCount} of {totalCount} exercises completed
                        </span>
                        <button
                            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
                            on:click={completeWorkout}
                        >
                            Finish Workout
                        </button>
                    </div>
                </div>
            </div>
        </main>
    {:else}
        <!-- Loading or no routine selected -->
        <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center">
                <div class="text-6xl mb-4">💪</div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">No workout selected</h1>
                <p class="text-gray-600 mb-6">Please select a workout from the planner to start your session.</p>
                <button
                    class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
                    on:click={() => goto('/workout-planner')}
                >
                    Go to Workout Planner
                </button>
            </div>
        </main>
    {/if}
</div>