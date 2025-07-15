import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

function createExerciseLibraryStore() {
	const { subscribe, set, update } = writable({
		searchQuery: '',
		selectedMuscleGroups: [],
		selectedEquipment: [],
		selectedDifficulty: [],
		selectedTags: [],
		sortBy: 'name',
		sortOrder: 'asc',
		favorites: [],
		recentlyViewed: []
	});

	return {
		subscribe,
		
		setSearchQuery: (query) => {
			update(state => ({ ...state, searchQuery: query }));
		},

		toggleMuscleGroup: (muscleGroup) => {
			update(state => ({
				...state,
				selectedMuscleGroups: state.selectedMuscleGroups.includes(muscleGroup)
					? state.selectedMuscleGroups.filter(m => m !== muscleGroup)
					: [...state.selectedMuscleGroups, muscleGroup]
			}));
		},

		toggleEquipment: (equipment) => {
			update(state => ({
				...state,
				selectedEquipment: state.selectedEquipment.includes(equipment)
					? state.selectedEquipment.filter(e => e !== equipment)
					: [...state.selectedEquipment, equipment]
			}));
		},

		toggleDifficulty: (difficulty) => {
			update(state => ({
				...state,
				selectedDifficulty: state.selectedDifficulty.includes(difficulty)
					? state.selectedDifficulty.filter(d => d !== difficulty)
					: [...state.selectedDifficulty, difficulty]
			}));
		},

		toggleTag: (tag) => {
			update(state => ({
				...state,
				selectedTags: state.selectedTags.includes(tag)
					? state.selectedTags.filter(t => t !== tag)
					: [...state.selectedTags, tag]
			}));
		},

		setSortBy: (sortBy, sortOrder = 'asc') => {
			update(state => ({ ...state, sortBy, sortOrder }));
		},

		toggleFavorite: (exerciseId) => {
			update(state => {
				const newFavorites = state.favorites.includes(exerciseId)
					? state.favorites.filter(id => id !== exerciseId)
					: [...state.favorites, exerciseId];
				
				if (browser) {
					localStorage.setItem('exercise_favorites', JSON.stringify(newFavorites));
				}
				
				return { ...state, favorites: newFavorites };
			});
		},

		addToRecentlyViewed: (exerciseId) => {
			update(state => {
				const newRecentlyViewed = [
					exerciseId,
					...state.recentlyViewed.filter(id => id !== exerciseId)
				].slice(0, 10);
				
				if (browser) {
					localStorage.setItem('recently_viewed_exercises', JSON.stringify(newRecentlyViewed));
				}
				
				return { ...state, recentlyViewed: newRecentlyViewed };
			});
		},

		clearFilters: () => {
			update(state => ({
				...state,
				searchQuery: '',
				selectedMuscleGroups: [],
				selectedEquipment: [],
				selectedDifficulty: [],
				selectedTags: [],
				sortBy: 'name',
				sortOrder: 'asc'
			}));
		},

		loadUserData: () => {
			if (browser) {
				const favorites = JSON.parse(localStorage.getItem('exercise_favorites') || '[]');
				const recentlyViewed = JSON.parse(localStorage.getItem('recently_viewed_exercises') || '[]');
				
				update(state => ({ ...state, favorites, recentlyViewed }));
			}
		}
	};
}

export const exerciseLibraryStore = createExerciseLibraryStore();

// Simple exercise database for now - will be replaced with proper import
const exerciseDatabase = {
	strength: {
		chest: [
			{ 
				id: 'push_ups', 
				name: 'Push-ups', 
				equipment: 'bodyweight', 
				difficulty: 'beginner',
				primaryMuscles: ['chest', 'triceps'],
				secondaryMuscles: ['shoulders', 'core'],
				instructions: [
					'Start in a plank position with hands shoulder-width apart',
					'Lower your body until chest nearly touches the floor',
					'Push back up to starting position',
					'Keep your core engaged and body in a straight line'
				],
				formCues: ['Keep elbows at 45-degree angle', 'Don\'t let hips sag or pike up'],
				commonMistakes: ['Partial range of motion', 'Poor core engagement'],
				safetyNotes: ['Stop if you feel wrist or shoulder pain'],
				progressions: ['Knee push-ups', 'Incline push-ups', 'Standard push-ups', 'Diamond push-ups'],
				tags: ['bodyweight', 'upper_body', 'compound']
			}
		],
		back: [
			{ 
				id: 'pull_ups', 
				name: 'Pull-ups', 
				equipment: 'pull_up_bar', 
				difficulty: 'intermediate',
				primaryMuscles: ['back'],
				secondaryMuscles: ['biceps', 'shoulders'],
				tags: ['bodyweight', 'upper_body', 'compound']
			}
		],
		legs: [
			{ 
				id: 'squats', 
				name: 'Squats', 
				equipment: 'bodyweight', 
				difficulty: 'beginner',
				primaryMuscles: ['legs'],
				secondaryMuscles: ['glutes', 'core'],
				tags: ['bodyweight', 'lower_body', 'compound']
			}
		]
	},
	cardio: {
		sustained: [
			{
				id: 'running',
				name: 'Running',
				equipment: 'none',
				difficulty: 'beginner',
				type: 'sustained',
				primaryMuscles: ['legs'],
				tags: ['cardio', 'lower_body']
			}
		],
		interval: [
			{
				id: 'jumping_jacks',
				name: 'Jumping Jacks',
				equipment: 'bodyweight',
				difficulty: 'beginner',
				type: 'interval',
				primaryMuscles: ['legs'],
				secondaryMuscles: ['shoulders'],
				tags: ['cardio', 'full_body']
			}
		]
	}
};

export function getAllExercises() {
	const exercises = [];
	
	Object.entries(exerciseDatabase).forEach(([category, categoryData]) => {
		if (category === 'strength') {
			Object.entries(categoryData).forEach(([muscleGroup, muscleExercises]) => {
				exercises.push(...muscleExercises.map(ex => ({ ...ex, category, muscleGroup })));
			});
		} else if (category === 'cardio') {
			Object.entries(categoryData).forEach(([type, typeExercises]) => {
				exercises.push(...typeExercises.map(ex => ({ ...ex, category, type })));
			});
		} else {
			exercises.push(...categoryData.map(ex => ({ ...ex, category })));
		}
	});
	
	return exercises;
}

export function getExerciseById(id) {
	const exercises = getAllExercises();
	return exercises.find(ex => ex.id === id);
}

export function getExercisesByMuscleGroup(muscleGroup) {
	const exercises = getAllExercises();
	return exercises.filter(ex => 
		ex.primaryMuscles?.includes(muscleGroup) || 
		ex.secondaryMuscles?.includes(muscleGroup)
	);
}

export function getExercisesByEquipment(equipment) {
	const exercises = getAllExercises();
	return exercises.filter(ex => ex.equipment === equipment);
}

export function getExercisesByDifficulty(difficulty) {
	const exercises = getAllExercises();
	return exercises.filter(ex => ex.difficulty === difficulty);
}

export function searchExercises(query) {
	const exercises = getAllExercises();
	const lowercaseQuery = query.toLowerCase();
	
	return exercises.filter(ex =>
		ex.name.toLowerCase().includes(lowercaseQuery) ||
		ex.primaryMuscles?.some(muscle => muscle.toLowerCase().includes(lowercaseQuery)) ||
		ex.secondaryMuscles?.some(muscle => muscle.toLowerCase().includes(lowercaseQuery)) ||
		ex.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
		ex.category.toLowerCase().includes(lowercaseQuery)
	);
}

export const filteredExercises = derived(
	exerciseLibraryStore,
	($store) => {
		let exercises = getAllExercises();
		
		if ($store.searchQuery) {
			exercises = searchExercises($store.searchQuery);
		}
		
		if ($store.selectedMuscleGroups.length > 0) {
			exercises = exercises.filter(ex =>
				$store.selectedMuscleGroups.some(muscle =>
					ex.primaryMuscles?.includes(muscle) || ex.secondaryMuscles?.includes(muscle)
				)
			);
		}
		
		if ($store.selectedEquipment.length > 0) {
			exercises = exercises.filter(ex =>
				$store.selectedEquipment.includes(ex.equipment)
			);
		}
		
		if ($store.selectedDifficulty.length > 0) {
			exercises = exercises.filter(ex =>
				$store.selectedDifficulty.includes(ex.difficulty)
			);
		}
		
		if ($store.selectedTags.length > 0) {
			exercises = exercises.filter(ex =>
				ex.tags?.some(tag => $store.selectedTags.includes(tag))
			);
		}
		
		exercises.sort((a, b) => {
			let aVal, bVal;
			
			switch ($store.sortBy) {
				case 'name':
					aVal = a.name.toLowerCase();
					bVal = b.name.toLowerCase();
					break;
				case 'difficulty':
					const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
					aVal = difficultyOrder[a.difficulty] || 0;
					bVal = difficultyOrder[b.difficulty] || 0;
					break;
				case 'muscle':
					aVal = a.primaryMuscles?.[0] || '';
					bVal = b.primaryMuscles?.[0] || '';
					break;
				case 'equipment':
					aVal = a.equipment || '';
					bVal = b.equipment || '';
					break;
				default:
					aVal = a.name.toLowerCase();
					bVal = b.name.toLowerCase();
			}
			
			if ($store.sortOrder === 'desc') {
				return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
			}
			return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
		});
		
		return exercises;
	}
);

export const muscleGroups = [
	'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'calves', 'triceps', 'biceps'
];

export const equipmentTypes = [
	'bodyweight', 'dumbbells', 'barbell', 'resistance_bands', 'yoga_mat', 
	'pull_up_bar', 'cable_machine', 'dip_bars', 'kettlebell', 'medicine_ball'
];

export const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

export const exerciseTags = [
	'compound', 'isolation', 'upper_body', 'lower_body', 'full_body', 
	'strength', 'cardio', 'flexibility', 'core', 'balance', 'explosive'
];