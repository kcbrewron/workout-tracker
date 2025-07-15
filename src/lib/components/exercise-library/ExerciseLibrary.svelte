<script>
	import { onMount } from 'svelte';
	import { exerciseLibraryStore, filteredExercises } from '$lib/stores/exerciseLibrary.js';
	import ExerciseCard from './ExerciseCard.svelte';
	import ExerciseDetail from './ExerciseDetail.svelte';
	import ExerciseSearch from './ExerciseSearch.svelte';
	
	let selectedExercise = null;
	let showCategories = true;
	
	onMount(() => {
		exerciseLibraryStore.loadUserData();
	});
	
	function handleExerciseClick(exercise) {
		selectedExercise = exercise;
	}
	
	function closeExerciseDetail() {
		selectedExercise = null;
	}
	
	function quickFilterByMuscle(muscle) {
		exerciseLibraryStore.clearFilters();
		exerciseLibraryStore.toggleMuscleGroup(muscle);
		showCategories = false;
	}
	
	function quickFilterByEquipment(equipment) {
		exerciseLibraryStore.clearFilters();
		exerciseLibraryStore.toggleEquipment(equipment);
		showCategories = false;
	}
	
	function quickFilterByDifficulty(difficulty) {
		exerciseLibraryStore.clearFilters();
		exerciseLibraryStore.toggleDifficulty(difficulty);
		showCategories = false;
	}
	
	function showAllExercises() {
		exerciseLibraryStore.clearFilters();
		showCategories = false;
	}
	
	function showCategoryView() {
		exerciseLibraryStore.clearFilters();
		showCategories = true;
	}
	
	$: hasActiveFilters = $exerciseLibraryStore.searchQuery || 
		$exerciseLibraryStore.selectedMuscleGroups.length > 0 || 
		$exerciseLibraryStore.selectedEquipment.length > 0 || 
		$exerciseLibraryStore.selectedDifficulty.length > 0 || 
		$exerciseLibraryStore.selectedTags.length > 0;
	
	$: exerciseCount = $filteredExercises.length;
	
	const quickFilters = {
		muscles: ['chest', 'back', 'shoulders', 'legs', 'arms', 'core'],
		equipment: ['bodyweight', 'dumbbells', 'barbell', 'resistance_bands'],
		difficulty: ['beginner', 'intermediate', 'advanced']
	};
</script>

<div class="mb-8">
	<h1 class="text-3xl font-bold text-gray-900 mb-2">Exercise Library</h1>
	<p class="text-gray-600">Discover exercises with detailed instructions and form guidance</p>
</div>
	
	<!-- Navigation -->
	<div class="flex items-center gap-4 mb-6">
		<button
			class="px-4 py-2 rounded-lg transition-colors {
				showCategories && !hasActiveFilters
					? 'bg-primary text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
			}"
			on:click={showCategoryView}
		>
			📚 Categories
		</button>
		<button
			class="px-4 py-2 rounded-lg transition-colors {
				!showCategories || hasActiveFilters
					? 'bg-primary text-white'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
			}"
			on:click={showAllExercises}
		>
			🔍 All Exercises ({exerciseCount})
		</button>
		
		{#if $exerciseLibraryStore.favorites.length > 0}
			<button
				class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
				on:click={() => {
					exerciseLibraryStore.clearFilters();
					// Filter to show only favorites - this would need custom logic
					showCategories = false;
				}}
			>
				❤️ Favorites ({$exerciseLibraryStore.favorites.length})
			</button>
		{/if}
	</div>
	
	<!-- Category View -->
	{#if showCategories && !hasActiveFilters}
		<div class="space-y-8">
			<!-- Quick Filters -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Filters</h2>
				
				<!-- Muscle Groups -->
				<div class="mb-6">
					<h3 class="font-medium text-gray-900 mb-3">By Muscle Group</h3>
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
						{#each quickFilters.muscles as muscle}
							<button
								class="p-3 border border-gray-200 rounded-lg hover:border-secondary hover:bg-accent hover:bg-opacity-20 transition-colors text-left h-20 flex flex-col justify-center"
								on:click={() => quickFilterByMuscle(muscle)}
							>
								<div class="font-medium text-gray-900 capitalize">{muscle}</div>
								<div class="text-sm text-gray-600">View exercises</div>
							</button>
						{/each}
					</div>
				</div>
				
				<!-- Equipment -->
				<div class="mb-6">
					<h3 class="font-medium text-gray-900 mb-3">By Equipment</h3>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
						{#each quickFilters.equipment as equipment}
							<button
								class="p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-highlight hover:bg-opacity-20 transition-colors text-left h-20 flex flex-col justify-center"
								on:click={() => quickFilterByEquipment(equipment)}
							>
								<div class="font-medium text-gray-900 capitalize">{equipment.replace('_', ' ')}</div>
								<div class="text-sm text-gray-600">View exercises</div>
							</button>
						{/each}
					</div>
				</div>
				
				<!-- Difficulty -->
				<div>
					<h3 class="font-medium text-gray-900 mb-3">By Difficulty</h3>
					<div class="grid grid-cols-3 gap-3">
						{#each quickFilters.difficulty as difficulty}
							<button
								class="p-3 border border-gray-200 rounded-lg hover:border-dark hover:bg-dark hover:bg-opacity-10 transition-colors text-left h-20 flex flex-col justify-center"
								on:click={() => quickFilterByDifficulty(difficulty)}
							>
								<div class="font-medium text-gray-900 capitalize">{difficulty}</div>
								<div class="text-sm text-gray-600">View exercises</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
			
			<!-- Recent Activity -->
			{#if $exerciseLibraryStore.recentlyViewed.length > 0}
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-4">Recently Viewed</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each $exerciseLibraryStore.recentlyViewed.slice(0, 3) as exerciseId}
							{@const exercise = $filteredExercises.find(ex => ex.id === exerciseId)}
							{#if exercise}
								<div class="h-full">
									<ExerciseCard {exercise} onClick={handleExerciseClick} />
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Exercise List View -->
		<div>
			<ExerciseSearch />
			
			<!-- Results Info -->
			<div class="flex items-center justify-between mb-6">
				<div class="text-sm text-gray-600">
					{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} found
				</div>
				{#if hasActiveFilters}
					<button
						class="text-sm text-primary hover:text-orange-600 underline"
						on:click={showCategoryView}
					>
						← Back to categories
					</button>
				{/if}
			</div>
			
			<!-- Exercise Grid -->
			{#if exerciseCount > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each $filteredExercises as exercise}
						<div class="h-full">
							<ExerciseCard {exercise} onClick={handleExerciseClick} />
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<div class="text-gray-400 text-6xl mb-4">🔍</div>
					<h3 class="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
					<p class="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
					<button
						class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
						on:click={() => {
							exerciseLibraryStore.clearFilters();
							showCategories = true;
						}}
					>
						Clear all filters
					</button>
				</div>
			{/if}
		</div>
	{/if}

<!-- Exercise Detail Modal -->
{#if selectedExercise}
	<ExerciseDetail exercise={selectedExercise} onClose={closeExerciseDetail} />
{/if}