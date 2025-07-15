import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ExerciseCard from '../ExerciseCard.svelte';
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
		toggleFavorite: vi.fn(),
		addToRecentlyViewed: vi.fn(),
		subscribe: vi.fn((callback) => {
			callback(mockStoreState);
			return () => {};
		})
	}
}));

const mockExercise = {
	id: 'push_ups',
	name: 'Push-ups',
	equipment: 'bodyweight',
	difficulty: 'beginner',
	primaryMuscles: ['chest', 'triceps'],
	secondaryMuscles: ['shoulders', 'core'],
	tags: ['compound', 'upper_body', 'bodyweight']
};

describe('ExerciseCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render exercise information correctly', () => {
		const { getByText } = render(ExerciseCard, {
			props: { exercise: mockExercise }
		});

		expect(getByText('Push-ups')).toBeInTheDocument();
		expect(getByText('beginner')).toBeInTheDocument();
		expect(getByText('chest')).toBeInTheDocument();
		expect(getByText('triceps')).toBeInTheDocument();
		expect(getByText('shoulders')).toBeInTheDocument();
		expect(getByText('core')).toBeInTheDocument();
	});

	it('should display equipment with correct icon', () => {
		const { getByText } = render(ExerciseCard, {
			props: { exercise: mockExercise }
		});

		expect(getByText('bodyweight')).toBeInTheDocument();
	});

	it('should display difficulty with correct styling', () => {
		const { container } = render(ExerciseCard, {
			props: { exercise: mockExercise }
		});

		const difficultyBadge = container.querySelector('.bg-green-100');
		expect(difficultyBadge).toBeInTheDocument();
		expect(difficultyBadge).toHaveTextContent('beginner');
	});

	it('should display primary muscles section', () => {
		const { getByText } = render(ExerciseCard, {
			props: { exercise: mockExercise }
		});

		expect(getByText('Primary muscles:')).toBeInTheDocument();
	});

	it('should display secondary muscles section when present', () => {
		const { getByText } = render(ExerciseCard, {
			props: { exercise: mockExercise }
		});

		expect(getByText('Secondary muscles:')).toBeInTheDocument();
	});

	it('should not display secondary muscles section when empty', () => {
		const exerciseWithoutSecondary = {
			...mockExercise,
			secondaryMuscles: []
		};

		const { queryByText } = render(ExerciseCard, {
			props: { exercise: exerciseWithoutSecondary }
		});

		expect(queryByText('Secondary muscles:')).not.toBeInTheDocument();
	});

	it('should display tags up to limit', () => {
		const { getByText } = render(ExerciseCard, {
			props: { exercise: mockExercise }
		});

		expect(getByText('compound')).toBeInTheDocument();
		expect(getByText('upper body')).toBeInTheDocument();
		expect(getByText('bodyweight')).toBeInTheDocument();
	});

	it('should show +more indicator when more than 3 tags', () => {
		const exerciseWithManyTags = {
			...mockExercise,
			tags: ['compound', 'upper_body', 'bodyweight', 'strength', 'basic']
		};

		const { getByText } = render(ExerciseCard, {
			props: { exercise: exerciseWithManyTags }
		});

		expect(getByText('+2 more')).toBeInTheDocument();
	});

	it('should call onClick when card is clicked', async () => {
		const onClick = vi.fn();
		const { container } = render(ExerciseCard, {
			props: { exercise: mockExercise, onClick }
		});

		const card = container.querySelector('[role="button"]');
		await fireEvent.click(card);

		expect(onClick).toHaveBeenCalledWith(mockExercise);
	});

	it('should add to recently viewed when clicked', async () => {
		const onClick = vi.fn();
		const { container } = render(ExerciseCard, {
			props: { exercise: mockExercise, onClick }
		});

		const card = container.querySelector('[role="button"]');
		await fireEvent.click(card);

		expect(exerciseLibraryStore.addToRecentlyViewed).toHaveBeenCalledWith('push_ups');
	});

	it('should handle keyboard navigation', async () => {
		const onClick = vi.fn();
		const { container } = render(ExerciseCard, {
			props: { exercise: mockExercise, onClick }
		});

		const card = container.querySelector('[role="button"]');
		await fireEvent.keyDown(card, { key: 'Enter' });

		expect(onClick).toHaveBeenCalledWith(mockExercise);
	});

	it('should toggle favorite when favorite button is clicked', async () => {
		const { container } = render(ExerciseCard, {
			props: { exercise: mockExercise, showFavorite: true }
		});

		const favoriteButton = container.querySelector('button[title*="favorite"]');
		await fireEvent.click(favoriteButton);

		expect(exerciseLibraryStore.toggleFavorite).toHaveBeenCalledWith('push_ups');
	});

	it('should not show favorite button when showFavorite is false', () => {
		const { container } = render(ExerciseCard, {
			props: { exercise: mockExercise, showFavorite: false }
		});

		const favoriteButton = container.querySelector('button[title*="favorite"]');
		expect(favoriteButton).not.toBeInTheDocument();
	});

	it('should prevent card click when favorite button is clicked', async () => {
		const onClick = vi.fn();
		const { container } = render(ExerciseCard, {
			props: { exercise: mockExercise, onClick, showFavorite: true }
		});

		const favoriteButton = container.querySelector('button[title*="favorite"]');
		await fireEvent.click(favoriteButton);

		expect(onClick).not.toHaveBeenCalled();
	});

	it('should apply correct difficulty colors', () => {
		const beginnerExercise = { ...mockExercise, difficulty: 'beginner' };
		const { container: beginnerContainer } = render(ExerciseCard, {
			props: { exercise: beginnerExercise }
		});
		expect(beginnerContainer.querySelector('.bg-green-100')).toBeInTheDocument();

		const intermediateExercise = { ...mockExercise, difficulty: 'intermediate' };
		const { container: intermediateContainer } = render(ExerciseCard, {
			props: { exercise: intermediateExercise }
		});
		expect(intermediateContainer.querySelector('.bg-yellow-100')).toBeInTheDocument();

		const advancedExercise = { ...mockExercise, difficulty: 'advanced' };
		const { container: advancedContainer } = render(ExerciseCard, {
			props: { exercise: advancedExercise }
		});
		expect(advancedContainer.querySelector('.bg-red-100')).toBeInTheDocument();
	});

	it('should display correct equipment icons', () => {
		const dumbbellExercise = { ...mockExercise, equipment: 'dumbbells' };
		const { getByText } = render(ExerciseCard, {
			props: { exercise: dumbbellExercise }
		});

		expect(getByText('🏋️')).toBeInTheDocument();
	});

	it('should handle exercises without primary muscles', () => {
		const exerciseWithoutPrimaryMuscles = {
			...mockExercise,
			primaryMuscles: undefined
		};

		const { queryByText } = render(ExerciseCard, {
			props: { exercise: exerciseWithoutPrimaryMuscles }
		});

		expect(queryByText('Primary muscles:')).not.toBeInTheDocument();
	});

	it('should handle exercises without tags', () => {
		const exerciseWithoutTags = {
			...mockExercise,
			tags: undefined
		};

		const { container } = render(ExerciseCard, {
			props: { exercise: exerciseWithoutTags }
		});

		const tagSection = container.querySelector('.bg-orange-100');
		expect(tagSection).not.toBeInTheDocument();
	});
});