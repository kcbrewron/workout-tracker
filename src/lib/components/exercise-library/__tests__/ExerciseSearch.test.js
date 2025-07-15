import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ExerciseSearch from '../ExerciseSearch.svelte';
import { exerciseLibraryStore } from '$lib/stores/exerciseLibrary.js';

// Mock the store
const mockStoreState = {
	favorites: [],
	recentlyViewed: [],
	searchQuery: '',
	selectedMuscleGroups: [],
	selectedEquipment: [],
	selectedDifficulty: [],
	selectedTags: [],
	sortBy: 'name',
	sortOrder: 'asc'
};

vi.mock('$lib/stores/exerciseLibrary.js', () => ({
	exerciseLibraryStore: {
		setSearchQuery: vi.fn(),
		toggleMuscleGroup: vi.fn(),
		toggleEquipment: vi.fn(),
		toggleDifficulty: vi.fn(),
		toggleTag: vi.fn(),
		setSortBy: vi.fn(),
		clearFilters: vi.fn(),
		subscribe: vi.fn((callback) => {
			callback(mockStoreState);
			return () => {};
		})
	},
	muscleGroups: ['chest', 'back', 'shoulders', 'legs', 'arms', 'core'],
	equipmentTypes: ['bodyweight', 'dumbbells', 'barbell', 'resistance_bands'],
	difficultyLevels: ['beginner', 'intermediate', 'advanced'],
	exerciseTags: ['compound', 'isolation', 'upper_body', 'lower_body']
}));

describe('ExerciseSearch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render search input', () => {
		const { getByPlaceholderText } = render(ExerciseSearch);
		
		expect(getByPlaceholderText('Search exercises by name, muscle group, or tag...')).toBeInTheDocument();
	});

	it('should call setSearchQuery when typing in search input', async () => {
		const { getByPlaceholderText } = render(ExerciseSearch);
		
		const searchInput = getByPlaceholderText('Search exercises by name, muscle group, or tag...');
		await fireEvent.input(searchInput, { target: { value: 'push' } });
		
		expect(exerciseLibraryStore.setSearchQuery).toHaveBeenCalledWith('push');
	});

	it('should show/hide filters when filters button is clicked', async () => {
		const { getByText, queryByText } = render(ExerciseSearch);
		
		const filtersButton = getByText('🎛️ Filters');
		
		// Initially filters should be hidden
		expect(queryByText('Muscle Groups')).not.toBeInTheDocument();
		
		// Click to show filters
		await fireEvent.click(filtersButton);
		expect(queryByText('Muscle Groups')).toBeInTheDocument();
		
		// Click to hide filters
		await fireEvent.click(filtersButton);
		expect(queryByText('Muscle Groups')).not.toBeInTheDocument();
	});

	it('should render muscle group filter buttons', async () => {
		const { getByText } = render(ExerciseSearch);
		
		// Show filters first
		await fireEvent.click(getByText('🎛️ Filters'));
		
		expect(getByText('Muscle Groups')).toBeInTheDocument();
		expect(getByText('chest')).toBeInTheDocument();
		expect(getByText('back')).toBeInTheDocument();
		expect(getByText('shoulders')).toBeInTheDocument();
	});

	it('should call toggleMuscleGroup when muscle group button is clicked', async () => {
		const { getByText } = render(ExerciseSearch);
		
		await fireEvent.click(getByText('🎛️ Filters'));
		
		const chestButton = getByText('chest');
		await fireEvent.click(chestButton);
		
		expect(exerciseLibraryStore.toggleMuscleGroup).toHaveBeenCalledWith('chest');
	});

	it('should render equipment filter buttons', async () => {
		const { getByText } = render(ExerciseSearch);
		
		await fireEvent.click(getByText('🎛️ Filters'));
		
		expect(getByText('Equipment')).toBeInTheDocument();
		expect(getByText('bodyweight')).toBeInTheDocument();
		expect(getByText('dumbbells')).toBeInTheDocument();
	});

	it('should call toggleEquipment when equipment button is clicked', async () => {
		const { getByText } = render(ExerciseSearch);
		
		await fireEvent.click(getByText('🎛️ Filters'));
		
		const bodyweightButton = getByText('bodyweight');
		await fireEvent.click(bodyweightButton);
		
		expect(exerciseLibraryStore.toggleEquipment).toHaveBeenCalledWith('bodyweight');
	});

	it('should render difficulty filter buttons', async () => {
		const { getByText } = render(ExerciseSearch);
		
		await fireEvent.click(getByText('🎛️ Filters'));
		
		expect(getByText('Difficulty')).toBeInTheDocument();
		expect(getByText('beginner')).toBeInTheDocument();
		expect(getByText('intermediate')).toBeInTheDocument();
		expect(getByText('advanced')).toBeInTheDocument();
	});

	it('should call toggleDifficulty when difficulty button is clicked', async () => {
		const { getByText } = render(ExerciseSearch);
		
		await fireEvent.click(getByText('🎛️ Filters'));
		
		const beginnerButton = getByText('beginner');
		await fireEvent.click(beginnerButton);
		
		expect(exerciseLibraryStore.toggleDifficulty).toHaveBeenCalledWith('beginner');
	});

	it('should render tag filter buttons', async () => {
		const { getByText } = render(ExerciseSearch);
		
		await fireEvent.click(getByText('🎛️ Filters'));
		
		expect(getByText('Tags')).toBeInTheDocument();
		expect(getByText('compound')).toBeInTheDocument();
		expect(getByText('isolation')).toBeInTheDocument();
	});

	it('should call toggleTag when tag button is clicked', async () => {
		const { getByText } = render(ExerciseSearch);
		
		await fireEvent.click(getByText('🎛️ Filters'));
		
		const compoundButton = getByText('compound');
		await fireEvent.click(compoundButton);
		
		expect(exerciseLibraryStore.toggleTag).toHaveBeenCalledWith('compound');
	});

	it('should render sort buttons', () => {
		const { getByText } = render(ExerciseSearch);
		
		expect(getByText('Sort by:')).toBeInTheDocument();
		expect(getByText(/Name/)).toBeInTheDocument();
		expect(getByText(/Difficulty/)).toBeInTheDocument();
		expect(getByText(/Muscle/)).toBeInTheDocument();
		expect(getByText(/Equipment/)).toBeInTheDocument();
	});

	it('should call setSortBy when sort button is clicked', async () => {
		const { getByText } = render(ExerciseSearch);
		
		const difficultyButton = getByText(/Difficulty/);
		await fireEvent.click(difficultyButton);
		
		expect(exerciseLibraryStore.setSortBy).toHaveBeenCalledWith('difficulty', 'asc');
	});

	it('should call clearFilters when clear all button is clicked', async () => {
		const { getByText } = render(ExerciseSearch);
		
		const clearButton = getByText('Clear all');
		await fireEvent.click(clearButton);
		
		expect(exerciseLibraryStore.clearFilters).toHaveBeenCalled();
	});

	it('should display active filters summary', () => {
		// Mock store state with active filters
		const mockStoreState = {
			searchQuery: 'push',
			selectedMuscleGroups: ['chest'],
			selectedEquipment: ['bodyweight'],
			selectedDifficulty: ['beginner'],
			selectedTags: ['compound'],
			sortBy: 'name',
			sortOrder: 'asc'
		};

		// Override the store mock to return our mock state
		exerciseLibraryStore.subscribe.mockImplementation((callback) => {
			callback(mockStoreState);
			return () => {};
		});

		const { getByText } = render(ExerciseSearch);
		
		expect(getByText('"push"')).toBeInTheDocument();
		expect(getByText('chest')).toBeInTheDocument();
		expect(getByText('bodyweight')).toBeInTheDocument();
		expect(getByText('beginner')).toBeInTheDocument();
		expect(getByText('compound')).toBeInTheDocument();
	});

	it('should handle equipment names with underscores', async () => {
		const { getByText } = render(ExerciseSearch);
		
		await fireEvent.click(getByText('🎛️ Filters'));
		
		// resistance_bands should be displayed as 'resistance bands'
		expect(getByText('resistance bands')).toBeInTheDocument();
	});

	it('should handle tag names with underscores', async () => {
		const { getByText } = render(ExerciseSearch);
		
		await fireEvent.click(getByText('🎛️ Filters'));
		
		// upper_body should be displayed as 'upper body'
		expect(getByText('upper body')).toBeInTheDocument();
		expect(getByText('lower body')).toBeInTheDocument();
	});

	it('should show correct arrow indicator for filters button', async () => {
		const { getByText } = render(ExerciseSearch);
		
		const filtersButton = getByText('🎛️ Filters');
		
		// Initially should show down arrow
		expect(getByText('▼')).toBeInTheDocument();
		
		// After clicking should show up arrow
		await fireEvent.click(filtersButton);
		expect(getByText('▲')).toBeInTheDocument();
	});
});