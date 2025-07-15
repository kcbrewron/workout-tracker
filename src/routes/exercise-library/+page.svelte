<script>
	import ExerciseLibrary from '$lib/components/exercise-library/ExerciseLibrary.svelte';
	import Header from '$lib/components/Header.svelte';
</script>

<svelte:head>
	<title>Exercise Library - Workout Tracker</title>
	<meta name="description" content="Browse our comprehensive exercise library with detailed instructions, form cues, and safety guidelines." />
</svelte:head>

<Header />

<div class="min-h-screen bg-gray-50">
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<ExerciseLibrary />
	</main>
</div>