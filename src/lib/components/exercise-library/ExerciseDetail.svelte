<script>
	import { exerciseLibraryStore } from '$lib/stores/exerciseLibrary.js';
	
	export let exercise;
	export let onClose = () => {};
	
	$: isFavorite = $exerciseLibraryStore.favorites.includes(exercise.id);
	
	function toggleFavorite() {
		exerciseLibraryStore.toggleFavorite(exercise.id);
	}
	
	function getDifficultyColor(difficulty) {
		switch (difficulty) {
			case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
			case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" on:click={onClose}>
	<div 
		class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
		on:click|stopPropagation
	>
		<div class="p-6">
			<!-- Header -->
			<div class="flex justify-between items-start mb-6">
				<div class="flex-1">
					<h2 class="text-3xl font-bold text-gray-900 mb-2">{exercise.name}</h2>
					<div class="flex items-center gap-3 text-sm text-gray-600">
						<span class="flex items-center gap-1">
							{getEquipmentIcon(exercise.equipment)}
							<span class="font-medium">{exercise.equipment.replace('_', ' ')}</span>
						</span>
						<span>•</span>
						<span class="px-3 py-1 rounded-full text-sm font-medium border {getDifficultyColor(exercise.difficulty)}">
							{exercise.difficulty}
						</span>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<button
						class="text-2xl hover:scale-110 transition-transform"
						on:click={toggleFavorite}
						title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
					>
						{isFavorite ? '❤️' : '🤍'}
					</button>
					<button
						class="text-gray-500 hover:text-gray-700 text-2xl"
						on:click={onClose}
						title="Close"
					>
						×
					</button>
				</div>
			</div>
			
			<!-- Muscle Groups -->
			<div class="mb-6">
				{#if exercise.primaryMuscles}
					<div class="mb-3">
						<h3 class="font-medium text-gray-900 mb-2">Primary Muscles</h3>
						<div class="flex flex-wrap gap-2">
							{#each exercise.primaryMuscles as muscle}
								<span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
									{muscle}
								</span>
							{/each}
						</div>
					</div>
				{/if}
				
				{#if exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0}
					<div class="mb-3">
						<h3 class="font-medium text-gray-900 mb-2">Secondary Muscles</h3>
						<div class="flex flex-wrap gap-2">
							{#each exercise.secondaryMuscles as muscle}
								<span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
									{muscle}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Instructions -->
			{#if exercise.instructions}
				<div class="mb-6">
					<h3 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
						📋 Instructions
					</h3>
					<ol class="space-y-2">
						{#each exercise.instructions as instruction, index}
							<li class="flex items-start gap-3">
								<span class="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
									{index + 1}
								</span>
								<span class="text-gray-700">{instruction}</span>
							</li>
						{/each}
					</ol>
				</div>
			{/if}
			
			<!-- Form Cues -->
			{#if exercise.formCues}
				<div class="mb-6">
					<h3 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
						✅ Form Cues
					</h3>
					<ul class="space-y-2">
						{#each exercise.formCues as cue}
							<li class="flex items-start gap-3">
								<span class="text-green-500 text-lg">•</span>
								<span class="text-gray-700">{cue}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			
			<!-- Common Mistakes -->
			{#if exercise.commonMistakes}
				<div class="mb-6">
					<h3 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
						⚠️ Common Mistakes
					</h3>
					<ul class="space-y-2">
						{#each exercise.commonMistakes as mistake}
							<li class="flex items-start gap-3">
								<span class="text-red-500 text-lg">•</span>
								<span class="text-gray-700">{mistake}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			
			<!-- Safety Notes -->
			{#if exercise.safetyNotes}
				<div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
					<h3 class="font-medium text-red-900 mb-3 flex items-center gap-2">
						🚨 Safety Notes
					</h3>
					<ul class="space-y-2">
						{#each exercise.safetyNotes as note}
							<li class="flex items-start gap-3">
								<span class="text-red-500 text-lg">•</span>
								<span class="text-red-800">{note}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			
			<!-- Progressions -->
			{#if exercise.progressions}
				<div class="mb-6">
					<h3 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
						📈 Progressions
					</h3>
					<div class="bg-gray-50 rounded-lg p-4">
						<div class="flex items-center gap-2 mb-2">
							<span class="text-sm text-gray-600">Difficulty progression:</span>
						</div>
						<div class="flex flex-wrap gap-2">
							{#each exercise.progressions as progression, index}
								<div class="flex items-center gap-2">
									<span class="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
										{progression}
									</span>
									{#if index < exercise.progressions.length - 1}
										<span class="text-gray-400">→</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Tags -->
			{#if exercise.tags}
				<div class="mb-6">
					<h3 class="font-medium text-gray-900 mb-3">Tags</h3>
					<div class="flex flex-wrap gap-2">
						{#each exercise.tags as tag}
							<span class="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
								{tag.replace('_', ' ')}
							</span>
						{/each}
					</div>
				</div>
			{/if}
			
			<!-- Close Button -->
			<div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
				<button
					class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
					on:click={onClose}
				>
					Close
				</button>
			</div>
		</div>
	</div>
</div>