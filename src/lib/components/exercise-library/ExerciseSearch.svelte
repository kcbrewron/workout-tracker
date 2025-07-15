<script>
	import { exerciseLibraryStore, muscleGroups, equipmentTypes, difficultyLevels, exerciseTags } from '$lib/stores/exerciseLibrary.js';
	
	let showFilters = false;
	let searchInput = '';
	
	$: exerciseLibraryStore.setSearchQuery(searchInput);
	
	function toggleFilter(type, value) {
		switch (type) {
			case 'muscle':
				exerciseLibraryStore.toggleMuscleGroup(value);
				break;
			case 'equipment':
				exerciseLibraryStore.toggleEquipment(value);
				break;
			case 'difficulty':
				exerciseLibraryStore.toggleDifficulty(value);
				break;
			case 'tag':
				exerciseLibraryStore.toggleTag(value);
				break;
		}
	}
	
	function clearFilters() {
		exerciseLibraryStore.clearFilters();
		searchInput = '';
	}
	
	function setSortBy(sortBy) {
		const currentSortBy = $exerciseLibraryStore.sortBy;
		const currentSortOrder = $exerciseLibraryStore.sortOrder;
		
		if (currentSortBy === sortBy) {
			exerciseLibraryStore.setSortBy(sortBy, currentSortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			exerciseLibraryStore.setSortBy(sortBy, 'asc');
		}
	}
	
	function getSortIcon(sortBy) {
		if ($exerciseLibraryStore.sortBy !== sortBy) return '';
		return $exerciseLibraryStore.sortOrder === 'asc' ? '↑' : '↓';
	}
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
	<!-- Search Bar -->
	<div class="flex gap-3 mb-4">
		<div class="flex-1 relative">
			<input
				type="text"
				bind:value={searchInput}
				placeholder="Search exercises by name, muscle group, or tag..."
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pl-10"
			/>
			<div class="absolute left-3 top-2.5 text-gray-400">
				🔍
			</div>
		</div>
		<button
			class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
			on:click={() => showFilters = !showFilters}
		>
			🎛️ Filters
			{#if showFilters}
				<span class="text-xs">▲</span>
			{:else}
				<span class="text-xs">▼</span>
			{/if}
		</button>
	</div>
	
	<!-- Active Filters Summary -->
	{#if $exerciseLibraryStore.searchQuery || $exerciseLibraryStore.selectedMuscleGroups.length > 0 || $exerciseLibraryStore.selectedEquipment.length > 0 || $exerciseLibraryStore.selectedDifficulty.length > 0 || $exerciseLibraryStore.selectedTags.length > 0}
		<div class="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
			<div class="flex flex-wrap gap-2">
				{#if $exerciseLibraryStore.searchQuery}
					<span class="px-2 py-1 bg-primary text-white text-sm rounded-full">
						"{$exerciseLibraryStore.searchQuery}"
					</span>
				{/if}
				{#each $exerciseLibraryStore.selectedMuscleGroups as muscle}
					<span class="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
						{muscle}
					</span>
				{/each}
				{#each $exerciseLibraryStore.selectedEquipment as equipment}
					<span class="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
						{equipment.replace('_', ' ')}
					</span>
				{/each}
				{#each $exerciseLibraryStore.selectedDifficulty as difficulty}
					<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
						{difficulty}
					</span>
				{/each}
				{#each $exerciseLibraryStore.selectedTags as tag}
					<span class="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
						{tag.replace('_', ' ')}
					</span>
				{/each}
			</div>
			<button
				class="text-sm text-gray-600 hover:text-gray-800 underline"
				on:click={clearFilters}
			>
				Clear all
			</button>
		</div>
	{/if}
	
	<!-- Filters Panel -->
	{#if showFilters}
		<div class="space-y-6 border-t border-gray-200 pt-4">
			<!-- Muscle Groups -->
			<div>
				<h3 class="font-medium text-gray-900 mb-3">Muscle Groups</h3>
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
					{#each muscleGroups as muscle}
						<button
							class="px-3 py-2 text-sm border rounded-lg transition-colors {
								$exerciseLibraryStore.selectedMuscleGroups.includes(muscle)
									? 'bg-blue-100 border-blue-300 text-blue-800'
									: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
							}"
							on:click={() => toggleFilter('muscle', muscle)}
						>
							{muscle}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Equipment -->
			<div>
				<h3 class="font-medium text-gray-900 mb-3">Equipment</h3>
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
					{#each equipmentTypes as equipment}
						<button
							class="px-3 py-2 text-sm border rounded-lg transition-colors {
								$exerciseLibraryStore.selectedEquipment.includes(equipment)
									? 'bg-green-100 border-green-300 text-green-800'
									: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
							}"
							on:click={() => toggleFilter('equipment', equipment)}
						>
							{equipment.replace('_', ' ')}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Difficulty -->
			<div>
				<h3 class="font-medium text-gray-900 mb-3">Difficulty</h3>
				<div class="flex gap-2">
					{#each difficultyLevels as difficulty}
						<button
							class="px-3 py-2 text-sm border rounded-lg transition-colors {
								$exerciseLibraryStore.selectedDifficulty.includes(difficulty)
									? 'bg-yellow-100 border-yellow-300 text-yellow-800'
									: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
							}"
							on:click={() => toggleFilter('difficulty', difficulty)}
						>
							{difficulty}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Tags -->
			<div>
				<h3 class="font-medium text-gray-900 mb-3">Tags</h3>
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
					{#each exerciseTags as tag}
						<button
							class="px-3 py-2 text-sm border rounded-lg transition-colors {
								$exerciseLibraryStore.selectedTags.includes(tag)
									? 'bg-orange-100 border-orange-300 text-orange-800'
									: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
							}"
							on:click={() => toggleFilter('tag', tag)}
						>
							{tag.replace('_', ' ')}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Sort Options -->
	<div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
		<span class="text-sm text-gray-600">Sort by:</span>
		<div class="flex gap-2">
			<button
				class="px-3 py-1 text-sm border rounded-lg transition-colors {
					$exerciseLibraryStore.sortBy === 'name'
						? 'bg-primary text-white border-primary'
						: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
				}"
				on:click={() => setSortBy('name')}
			>
				Name {getSortIcon('name')}
			</button>
			<button
				class="px-3 py-1 text-sm border rounded-lg transition-colors {
					$exerciseLibraryStore.sortBy === 'difficulty'
						? 'bg-primary text-white border-primary'
						: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
				}"
				on:click={() => setSortBy('difficulty')}
			>
				Difficulty {getSortIcon('difficulty')}
			</button>
			<button
				class="px-3 py-1 text-sm border rounded-lg transition-colors {
					$exerciseLibraryStore.sortBy === 'muscle'
						? 'bg-primary text-white border-primary'
						: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
				}"
				on:click={() => setSortBy('muscle')}
			>
				Muscle {getSortIcon('muscle')}
			</button>
			<button
				class="px-3 py-1 text-sm border rounded-lg transition-colors {
					$exerciseLibraryStore.sortBy === 'equipment'
						? 'bg-primary text-white border-primary'
						: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
				}"
				on:click={() => setSortBy('equipment')}
			>
				Equipment {getSortIcon('equipment')}
			</button>
		</div>
	</div>
</div>