import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { 
	exerciseLibraryStore, 
	getAllExercises, 
	getExerciseById, 
	getExercisesByMuscleGroup,
	getExercisesByEquipment,
	getExercisesByDifficulty,
	searchExercises 
} from '../exerciseLibrary.js';

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};

Object.defineProperty(global, 'localStorage', {
	value: localStorageMock
});

// Mock browser environment
vi.mock('$app/environment', () => ({
	browser: true
}));

describe('ExerciseLibrary Store', () => {
	beforeEach(() => {
		// Reset store state
		exerciseLibraryStore.clearFilters();
		localStorageMock.getItem.mockReturnValue('[]');
		localStorageMock.setItem.mockClear();
	});

	describe('Search functionality', () => {
		it('should update search query', () => {
			exerciseLibraryStore.setSearchQuery('push');
			const state = get(exerciseLibraryStore);
			expect(state.searchQuery).toBe('push');
		});

		it('should clear search query when clearing filters', () => {
			exerciseLibraryStore.setSearchQuery('test');
			exerciseLibraryStore.clearFilters();
			const state = get(exerciseLibraryStore);
			expect(state.searchQuery).toBe('');
		});
	});

	describe('Muscle group filtering', () => {
		it('should add muscle group to filter', () => {
			exerciseLibraryStore.toggleMuscleGroup('chest');
			const state = get(exerciseLibraryStore);
			expect(state.selectedMuscleGroups).toContain('chest');
		});

		it('should remove muscle group from filter when toggled again', () => {
			exerciseLibraryStore.toggleMuscleGroup('chest');
			exerciseLibraryStore.toggleMuscleGroup('chest');
			const state = get(exerciseLibraryStore);
			expect(state.selectedMuscleGroups).not.toContain('chest');
		});

		it('should handle multiple muscle groups', () => {
			exerciseLibraryStore.toggleMuscleGroup('chest');
			exerciseLibraryStore.toggleMuscleGroup('back');
			const state = get(exerciseLibraryStore);
			expect(state.selectedMuscleGroups).toContain('chest');
			expect(state.selectedMuscleGroups).toContain('back');
		});
	});

	describe('Equipment filtering', () => {
		it('should add equipment to filter', () => {
			exerciseLibraryStore.toggleEquipment('dumbbells');
			const state = get(exerciseLibraryStore);
			expect(state.selectedEquipment).toContain('dumbbells');
		});

		it('should remove equipment from filter when toggled again', () => {
			exerciseLibraryStore.toggleEquipment('dumbbells');
			exerciseLibraryStore.toggleEquipment('dumbbells');
			const state = get(exerciseLibraryStore);
			expect(state.selectedEquipment).not.toContain('dumbbells');
		});
	});

	describe('Difficulty filtering', () => {
		it('should add difficulty to filter', () => {
			exerciseLibraryStore.toggleDifficulty('beginner');
			const state = get(exerciseLibraryStore);
			expect(state.selectedDifficulty).toContain('beginner');
		});

		it('should remove difficulty from filter when toggled again', () => {
			exerciseLibraryStore.toggleDifficulty('beginner');
			exerciseLibraryStore.toggleDifficulty('beginner');
			const state = get(exerciseLibraryStore);
			expect(state.selectedDifficulty).not.toContain('beginner');
		});
	});

	describe('Tag filtering', () => {
		it('should add tag to filter', () => {
			exerciseLibraryStore.toggleTag('compound');
			const state = get(exerciseLibraryStore);
			expect(state.selectedTags).toContain('compound');
		});

		it('should remove tag from filter when toggled again', () => {
			exerciseLibraryStore.toggleTag('compound');
			exerciseLibraryStore.toggleTag('compound');
			const state = get(exerciseLibraryStore);
			expect(state.selectedTags).not.toContain('compound');
		});
	});

	describe('Sorting', () => {
		it('should set sort by name', () => {
			exerciseLibraryStore.setSortBy('name');
			const state = get(exerciseLibraryStore);
			expect(state.sortBy).toBe('name');
			expect(state.sortOrder).toBe('asc');
		});

		it('should set sort by difficulty with custom order', () => {
			exerciseLibraryStore.setSortBy('difficulty', 'desc');
			const state = get(exerciseLibraryStore);
			expect(state.sortBy).toBe('difficulty');
			expect(state.sortOrder).toBe('desc');
		});
	});

	describe('Favorites', () => {
		it('should add exercise to favorites', () => {
			exerciseLibraryStore.toggleFavorite('push_ups');
			const state = get(exerciseLibraryStore);
			expect(state.favorites).toContain('push_ups');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('exercise_favorites', JSON.stringify(['push_ups']));
		});

		it('should remove exercise from favorites when toggled again', () => {
			exerciseLibraryStore.toggleFavorite('push_ups');
			exerciseLibraryStore.toggleFavorite('push_ups');
			const state = get(exerciseLibraryStore);
			expect(state.favorites).not.toContain('push_ups');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('exercise_favorites', JSON.stringify([]));
		});
	});

	describe('Recently viewed', () => {
		it('should add exercise to recently viewed', () => {
			exerciseLibraryStore.addToRecentlyViewed('push_ups');
			const state = get(exerciseLibraryStore);
			expect(state.recentlyViewed).toContain('push_ups');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('recently_viewed_exercises', JSON.stringify(['push_ups']));
		});

		it('should move existing exercise to front of recently viewed', () => {
			exerciseLibraryStore.addToRecentlyViewed('push_ups');
			exerciseLibraryStore.addToRecentlyViewed('squats');
			exerciseLibraryStore.addToRecentlyViewed('push_ups');
			const state = get(exerciseLibraryStore);
			expect(state.recentlyViewed[0]).toBe('push_ups');
			expect(state.recentlyViewed[1]).toBe('squats');
		});

		it('should limit recently viewed to 10 items', () => {
			for (let i = 0; i < 12; i++) {
				exerciseLibraryStore.addToRecentlyViewed(`exercise_${i}`);
			}
			const state = get(exerciseLibraryStore);
			expect(state.recentlyViewed.length).toBe(10);
		});
	});

	describe('Data loading', () => {
		it('should load favorites from localStorage', () => {
			localStorageMock.getItem.mockReturnValue('["push_ups", "squats"]');
			exerciseLibraryStore.loadUserData();
			const state = get(exerciseLibraryStore);
			expect(state.favorites).toEqual(['push_ups', 'squats']);
		});

		it('should load recently viewed from localStorage', () => {
			localStorageMock.getItem.mockImplementation((key) => {
				if (key === 'recently_viewed_exercises') return '["push_ups", "squats"]';
				return '[]';
			});
			exerciseLibraryStore.loadUserData();
			const state = get(exerciseLibraryStore);
			expect(state.recentlyViewed).toEqual(['push_ups', 'squats']);
		});

		it('should handle invalid localStorage data', () => {
			localStorageMock.getItem.mockReturnValue('invalid json');
			expect(() => exerciseLibraryStore.loadUserData()).not.toThrow();
		});
	});

	describe('Clear filters', () => {
		it('should reset all filters to default state', () => {
			exerciseLibraryStore.setSearchQuery('test');
			exerciseLibraryStore.toggleMuscleGroup('chest');
			exerciseLibraryStore.toggleEquipment('dumbbells');
			exerciseLibraryStore.toggleDifficulty('beginner');
			exerciseLibraryStore.toggleTag('compound');
			exerciseLibraryStore.setSortBy('difficulty', 'desc');
			
			exerciseLibraryStore.clearFilters();
			
			const state = get(exerciseLibraryStore);
			expect(state.searchQuery).toBe('');
			expect(state.selectedMuscleGroups).toEqual([]);
			expect(state.selectedEquipment).toEqual([]);
			expect(state.selectedDifficulty).toEqual([]);
			expect(state.selectedTags).toEqual([]);
			expect(state.sortBy).toBe('name');
			expect(state.sortOrder).toBe('asc');
		});
	});
});

describe('Exercise utility functions', () => {
	describe('searchExercises', () => {
		it('should find exercises by name', () => {
			const results = searchExercises('push');
			expect(results.some(ex => ex.name.toLowerCase().includes('push'))).toBe(true);
		});

		it('should find exercises by muscle group', () => {
			const results = searchExercises('chest');
			expect(results.length).toBeGreaterThan(0);
		});

		it('should find exercises by category', () => {
			const results = searchExercises('strength');
			expect(results.length).toBeGreaterThan(0);
		});

		it('should be case insensitive', () => {
			const lowerResults = searchExercises('push');
			const upperResults = searchExercises('PUSH');
			expect(lowerResults.length).toBe(upperResults.length);
		});

		it('should return empty array for non-existent terms', () => {
			const results = searchExercises('nonexistentexercise');
			expect(results).toEqual([]);
		});
	});

	describe('getExerciseById', () => {
		it('should find exercise by id', () => {
			const exercise = getExerciseById('push_ups');
			expect(exercise).toBeDefined();
			expect(exercise.id).toBe('push_ups');
		});

		it('should return undefined for non-existent id', () => {
			const exercise = getExerciseById('nonexistent');
			expect(exercise).toBeUndefined();
		});
	});

	describe('getExercisesByMuscleGroup', () => {
		it('should find exercises by primary muscle group', () => {
			const exercises = getExercisesByMuscleGroup('chest');
			expect(exercises.length).toBeGreaterThan(0);
			expect(exercises.some(ex => ex.primaryMuscles?.includes('chest'))).toBe(true);
		});

		it('should find exercises by secondary muscle group', () => {
			const exercises = getExercisesByMuscleGroup('triceps');
			expect(exercises.length).toBeGreaterThan(0);
		});

		it('should return empty array for non-existent muscle group', () => {
			const exercises = getExercisesByMuscleGroup('nonexistent');
			expect(exercises).toEqual([]);
		});
	});

	describe('getExercisesByEquipment', () => {
		it('should find exercises by equipment', () => {
			const exercises = getExercisesByEquipment('bodyweight');
			expect(exercises.length).toBeGreaterThan(0);
			expect(exercises.every(ex => ex.equipment === 'bodyweight')).toBe(true);
		});

		it('should return empty array for non-existent equipment', () => {
			const exercises = getExercisesByEquipment('nonexistent');
			expect(exercises).toEqual([]);
		});
	});

	describe('getExercisesByDifficulty', () => {
		it('should find exercises by difficulty', () => {
			const exercises = getExercisesByDifficulty('beginner');
			expect(exercises.length).toBeGreaterThan(0);
			expect(exercises.every(ex => ex.difficulty === 'beginner')).toBe(true);
		});

		it('should return empty array for non-existent difficulty', () => {
			const exercises = getExercisesByDifficulty('nonexistent');
			expect(exercises).toEqual([]);
		});
	});

	describe('getAllExercises', () => {
		it('should return all exercises with category information', () => {
			const exercises = getAllExercises();
			expect(exercises.length).toBeGreaterThan(0);
			expect(exercises.every(ex => ex.category)).toBe(true);
		});

		it('should include muscle group information for strength exercises', () => {
			const exercises = getAllExercises();
			const strengthExercises = exercises.filter(ex => ex.category === 'strength');
			expect(strengthExercises.every(ex => ex.muscleGroup)).toBe(true);
		});

		it('should include type information for cardio exercises', () => {
			const exercises = getAllExercises();
			const cardioExercises = exercises.filter(ex => ex.category === 'cardio');
			expect(cardioExercises.every(ex => ex.type || ex.category)).toBe(true);
		});
	});
});