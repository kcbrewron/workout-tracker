<script>
	import { exerciseLibraryStore } from '$lib/stores/exerciseLibrary.js';
	
	export let exercise;
	export let showFavorite = true;
	export let onClick = () => {};
	
	$: isFavorite = $exerciseLibraryStore.favorites.includes(exercise.id);
	
	function toggleFavorite(e) {
		e.stopPropagation();
		exerciseLibraryStore.toggleFavorite(exercise.id);
	}
	
	function handleClick() {
		exerciseLibraryStore.addToRecentlyViewed(exercise.id);
		onClick(exercise);
	}
	
	function getDifficultyColor(difficulty) {
		switch (difficulty) {
			case 'beginner': return 'bg-green-100 text-green-800';
			case 'intermediate': return 'bg-yellow-100 text-yellow-800';
			case 'advanced': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
	
	function getEquipmentIcon(equipment) {
		switch (equipment) {
			case 'bodyweight': return '🤸';
			case 'dumbbells': return '🏋️';
			case 'barbell': return '⚖️';
			case 'resistance_bands': return '🔗';
			case 'yoga_mat': return '🧘';
			case 'pull_up_bar': return '🚧';
			case 'cable_machine': return '🔌';
			case 'dip_bars': return '🔧';
			case 'kettlebell': return '🔔';
			case 'medicine_ball': return '⚽';
			default: return '🏃';
		}
	}
</script>

<div 
	class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer relative h-full flex flex-col"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
>
	{#if showFavorite}
		<button
			class="absolute top-2 right-2 text-xl hover:scale-110 transition-transform"
			on:click={toggleFavorite}
			title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
		>
			{isFavorite ? '❤️' : '🤍'}
		</button>
	{/if}
	
	<div class="mb-3">
		<h3 class="font-medium text-gray-900 text-lg mb-1">{exercise.name}</h3>
		<div class="flex items-center gap-2 text-sm text-gray-600">
			<span class="flex items-center gap-1">
				{getEquipmentIcon(exercise.equipment)}
				{exercise.equipment.replace('_', ' ')}
			</span>
			<span>•</span>
			<span class="px-2 py-1 rounded-full text-xs font-medium {getDifficultyColor(exercise.difficulty)}">
				{exercise.difficulty}
			</span>
		</div>
	</div>
	
	{#if exercise.primaryMuscles}
		<div class="mb-3">
			<div class="text-sm text-gray-600 mb-1">Primary muscles:</div>
			<div class="flex flex-wrap gap-1">
				{#each exercise.primaryMuscles as muscle}
					<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
						{muscle}
					</span>
				{/each}
			</div>
		</div>
	{/if}
	
	{#if exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0}
		<div class="mb-3">
			<div class="text-sm text-gray-600 mb-1">Secondary muscles:</div>
			<div class="flex flex-wrap gap-1">
				{#each exercise.secondaryMuscles as muscle}
					<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
						{muscle}
					</span>
				{/each}
			</div>
		</div>
	{/if}
	
	{#if exercise.tags}
		<div class="flex flex-wrap gap-1 mt-2">
			{#each exercise.tags.slice(0, 3) as tag}
				<span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
					{tag.replace('_', ' ')}
				</span>
			{/each}
			{#if exercise.tags.length > 3}
				<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
					+{exercise.tags.length - 3} more
				</span>
			{/if}
		</div>
	{/if}
	
	<!-- Spacer to push footer to bottom -->
	<div class="flex-1"></div>
	
	<div class="mt-4 text-sm text-gray-500 text-center">
		Click to view details →
	</div>
</div>