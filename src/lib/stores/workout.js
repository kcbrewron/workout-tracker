import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const exerciseDatabase = {
    strength: {
        chest: [
            { id: 'push_ups', name: 'Push-ups', equipment: 'bodyweight', difficulty: 'beginner' },
            { id: 'bench_press', name: 'Bench Press', equipment: 'barbell', difficulty: 'intermediate' },
            { id: 'incline_dumbbell_press', name: 'Incline Dumbbell Press', equipment: 'dumbbells', difficulty: 'intermediate' },
            { id: 'chest_dips', name: 'Chest Dips', equipment: 'dip_bars', difficulty: 'intermediate' }
        ],
        back: [
            { id: 'pull_ups', name: 'Pull-ups', equipment: 'pull_up_bar', difficulty: 'intermediate' },
            { id: 'bent_over_rows', name: 'Bent Over Rows', equipment: 'barbell', difficulty: 'intermediate' },
            { id: 'lat_pulldowns', name: 'Lat Pulldowns', equipment: 'cable_machine', difficulty: 'beginner' },
            { id: 'deadlifts', name: 'Deadlifts', equipment: 'barbell', difficulty: 'advanced' }
        ],
        legs: [
            { id: 'squats', name: 'Squats', equipment: 'bodyweight', difficulty: 'beginner' },
            { id: 'barbell_squats', name: 'Barbell Squats', equipment: 'barbell', difficulty: 'intermediate' },
            { id: 'lunges', name: 'Lunges', equipment: 'bodyweight', difficulty: 'beginner' },
            { id: 'leg_press', name: 'Leg Press', equipment: 'leg_press_machine', difficulty: 'beginner' }
        ],
        shoulders: [
            { id: 'shoulder_press', name: 'Shoulder Press', equipment: 'dumbbells', difficulty: 'beginner' },
            { id: 'lateral_raises', name: 'Lateral Raises', equipment: 'dumbbells', difficulty: 'beginner' },
            { id: 'military_press', name: 'Military Press', equipment: 'barbell', difficulty: 'intermediate' },
            { id: 'face_pulls', name: 'Face Pulls', equipment: 'cable_machine', difficulty: 'beginner' }
        ],
        arms: [
            { id: 'bicep_curls', name: 'Bicep Curls', equipment: 'dumbbells', difficulty: 'beginner' },
            { id: 'tricep_dips', name: 'Tricep Dips', equipment: 'bodyweight', difficulty: 'beginner' },
            { id: 'hammer_curls', name: 'Hammer Curls', equipment: 'dumbbells', difficulty: 'beginner' },
            { id: 'tricep_extensions', name: 'Tricep Extensions', equipment: 'dumbbells', difficulty: 'beginner' }
        ]
    },
    cardio: {
        sustained: [
            { id: 'running', name: 'Running', equipment: 'none', difficulty: 'beginner', type: 'sustained' },
            { id: 'cycling', name: 'Cycling', equipment: 'bike', difficulty: 'beginner', type: 'sustained' },
            { id: 'walking', name: 'Brisk Walking', equipment: 'none', difficulty: 'beginner', type: 'sustained' }
        ],
        interval: [
            { id: 'jumping_jacks', name: 'Jumping Jacks', equipment: 'bodyweight', difficulty: 'beginner', type: 'interval' },
            { id: 'burpees', name: 'Burpees', equipment: 'bodyweight', difficulty: 'intermediate', type: 'interval' },
            { id: 'mountain_climbers', name: 'Mountain Climbers', equipment: 'bodyweight', difficulty: 'beginner', type: 'interval' },
            { id: 'high_knees_cardio', name: 'High Knees', equipment: 'bodyweight', difficulty: 'beginner', type: 'interval' },
            { id: 'jumping_rope', name: 'Jumping Rope', equipment: 'jump_rope', difficulty: 'beginner', type: 'interval' }
        ]
    },
    flexibility: [
        { id: 'yoga_flow', name: 'Yoga Flow', equipment: 'yoga_mat', difficulty: 'beginner' },
        { id: 'static_stretching', name: 'Static Stretching', equipment: 'none', difficulty: 'beginner' },
        { id: 'dynamic_stretching', name: 'Dynamic Stretching', equipment: 'none', difficulty: 'beginner' }
    ],
    warmup: [
        { id: 'light_walking', name: 'Light Walking', equipment: 'none', difficulty: 'beginner', duration: '3-5 minutes' },
        { id: 'arm_circles', name: 'Arm Circles', equipment: 'none', difficulty: 'beginner', duration: '1 minute' },
        { id: 'leg_swings', name: 'Leg Swings', equipment: 'none', difficulty: 'beginner', duration: '1 minute each leg' },
        { id: 'torso_twists', name: 'Torso Twists', equipment: 'none', difficulty: 'beginner', duration: '1 minute' },
        { id: 'jumping_jacks_warmup', name: 'Light Jumping Jacks', equipment: 'none', difficulty: 'beginner', duration: '2 minutes' },
        { id: 'high_knees', name: 'High Knees', equipment: 'none', difficulty: 'beginner', duration: '1 minute' }
    ],
    cooldown: [
        { id: 'walking_cooldown', name: 'Cool Down Walk', equipment: 'none', difficulty: 'beginner', duration: '3-5 minutes' },
        { id: 'quad_stretch', name: 'Quadriceps Stretch', equipment: 'none', difficulty: 'beginner', duration: '30 seconds each leg' },
        { id: 'hamstring_stretch', name: 'Hamstring Stretch', equipment: 'none', difficulty: 'beginner', duration: '30 seconds each leg' },
        { id: 'calf_stretch', name: 'Calf Stretch', equipment: 'none', difficulty: 'beginner', duration: '30 seconds each leg' },
        { id: 'chest_stretch', name: 'Chest Stretch', equipment: 'none', difficulty: 'beginner', duration: '30 seconds' },
        { id: 'shoulder_stretch', name: 'Shoulder Stretch', equipment: 'none', difficulty: 'beginner', duration: '30 seconds each arm' },
        { id: 'spinal_twist', name: 'Seated Spinal Twist', equipment: 'none', difficulty: 'beginner', duration: '30 seconds each side' },
        { id: 'deep_breathing', name: 'Deep Breathing', equipment: 'none', difficulty: 'beginner', duration: '2-3 minutes' }
    ]
};

function createWorkoutStore() {
    const { subscribe, set, update } = writable({
        currentRoutine: null,
        savedRoutines: [],
        generatedRoutine: null,
        isGenerating: false
    });

    return {
        subscribe,

        generateRoutine: async (userProfile, preferences = {}) => {
            update(state => ({ ...state, isGenerating: true, generatedRoutine: null }));

            await new Promise(resolve => setTimeout(resolve, 1000));

            const routine = generatePersonalizedRoutine(userProfile, preferences);
            
            update(state => ({
                ...state,
                generatedRoutine: routine,
                isGenerating: false
            }));

            return routine;
        },

        saveRoutine: (routine) => {
            const savedRoutine = {
                ...routine,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };

            update(state => ({
                ...state,
                savedRoutines: [...state.savedRoutines, savedRoutine]
            }));

            if (browser) {
                const saved = JSON.parse(localStorage.getItem('saved_routines') || '[]');
                saved.push(savedRoutine);
                localStorage.setItem('saved_routines', JSON.stringify(saved));
            }

            return savedRoutine;
        },

        loadSavedRoutines: () => {
            if (browser) {
                const saved = JSON.parse(localStorage.getItem('saved_routines') || '[]');
                update(state => ({ ...state, savedRoutines: saved }));
            }
        },

        setCurrentRoutine: (routine) => {
            update(state => ({ ...state, currentRoutine: routine }));
        },

        clearGeneratedRoutine: () => {
            update(state => ({ ...state, generatedRoutine: null }));
        }
    };
}

function generatePersonalizedRoutine(userProfile, preferences = {}) {
    const { goals, experience, preferences: userPrefs } = userProfile;
    const workoutType = preferences.type || deriveWorkoutType(goals.primaryObjective);
    const duration = preferences.duration || goals.duration || '30_45_mins';
    const difficulty = mapExperienceTodifficulty(experience.level);
    const availableEquipment = userPrefs.equipment || ['bodyweight'];

    let routine = {
        id: `routine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: generateRoutineName(workoutType, goals.primaryObjective),
        type: workoutType,
        duration: duration,
        difficulty: difficulty,
        exercises: [],
        estimatedTime: calculateEstimatedTime(duration),
        description: generateRoutineDescription(workoutType, goals.primaryObjective),
        generatedAt: new Date().toISOString()
    };

    // Generate warm-up
    const warmupExercises = generateWarmupRoutine(difficulty);
    
    // Generate main exercises
    let mainExercises = [];
    if (workoutType === 'strength') {
        mainExercises = generateStrengthRoutine(difficulty, availableEquipment, duration);
    } else if (workoutType === 'cardio') {
        mainExercises = generateCardioRoutine(difficulty, availableEquipment, duration);
    } else if (workoutType === 'mixed') {
        mainExercises = generateMixedRoutine(difficulty, availableEquipment, duration);
    }
    
    // Generate cool-down
    const cooldownExercises = generateCooldownRoutine(difficulty);
    
    // Combine all phases
    routine.exercises = [
        ...warmupExercises,
        ...mainExercises,
        ...cooldownExercises
    ];

    return routine;
}

function deriveWorkoutType(primaryObjective) {
    const typeMap = {
        'lose_weight': 'mixed',
        'build_muscle': 'strength',
        'improve_endurance': 'cardio',
        'general_fitness': 'mixed',
        'increase_strength': 'strength'
    };
    return typeMap[primaryObjective] || 'mixed';
}

function mapExperienceTodifficulty(level) {
    const difficultyMap = {
        'beginner': 'beginner',
        'intermediate': 'intermediate',
        'advanced': 'advanced'
    };
    return difficultyMap[level] || 'beginner';
}

function calculateEstimatedTime(duration) {
    const timeMap = {
        '15_30_mins': 25,
        '30_45_mins': 40,
        '45_60_mins': 55,
        '60_plus_mins': 75
    };
    return timeMap[duration] || 40;
}

function generateRoutineName(type, objective) {
    const names = {
        strength: {
            build_muscle: 'Muscle Building Workout',
            increase_strength: 'Strength Training Session',
            general_fitness: 'Full Body Strength'
        },
        cardio: {
            lose_weight: 'Fat Burning Cardio',
            improve_endurance: 'Endurance Training',
            general_fitness: 'Cardio Blast'
        },
        mixed: {
            lose_weight: 'Weight Loss Circuit',
            general_fitness: 'Total Body Workout',
            improve_endurance: 'Strength & Cardio Mix'
        }
    };
    
    return names[type]?.[objective] || `${type.charAt(0).toUpperCase() + type.slice(1)} Workout`;
}

function generateRoutineDescription(type, objective) {
    const descriptions = {
        strength: 'A focused strength training session designed to build muscle and increase power.',
        cardio: 'A cardiovascular workout to improve heart health and burn calories.',
        mixed: 'A balanced workout combining strength and cardio for overall fitness.'
    };
    return descriptions[type] || 'A personalized workout routine tailored to your goals.';
}

function generateStrengthRoutine(difficulty, equipment, duration) {
    const exercises = [];
    const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms'];
    const exerciseCount = duration === '15_30_mins' ? 4 : duration === '60_plus_mins' ? 8 : 6;

    for (let i = 0; i < exerciseCount; i++) {
        const muscleGroup = muscleGroups[i % muscleGroups.length];
        const availableExercises = exerciseDatabase.strength[muscleGroup].filter(ex => 
            (equipment.includes(ex.equipment) || ex.equipment === 'bodyweight') &&
            isDifficultyAppropriate(ex.difficulty, difficulty)
        );

        if (availableExercises.length > 0) {
            const exercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];
            
            // Determine sets based on exercise type and difficulty
            let sets;
            if (exercise.equipment === 'bodyweight') {
                sets = difficulty === 'beginner' ? 2 : difficulty === 'advanced' ? 4 : 3;
            } else {
                // Weight exercises typically use fewer sets for beginners
                sets = difficulty === 'beginner' ? 3 : difficulty === 'advanced' ? 4 : 3;
            }
            
            // Adjust rest time based on exercise intensity
            let restTime;
            if (['deadlifts', 'barbell_squats', 'bench_press'].includes(exercise.id)) {
                // Compound exercises need more rest
                restTime = difficulty === 'beginner' ? 90 : difficulty === 'advanced' ? 180 : 120;
            } else {
                // Isolation exercises need less rest
                restTime = difficulty === 'beginner' ? 60 : difficulty === 'advanced' ? 90 : 75;
            }
            
            exercises.push({
                ...exercise,
                phase: 'main',
                sets: sets,
                reps: generateRepRange(exercise.id, difficulty),
                restTime: restTime,
                notes: generateExerciseNotes(exercise.id, difficulty)
            });
        }
    }

    return exercises;
}

function generateCardioRoutine(difficulty, equipment, duration) {
    const exercises = [];
    
    // Get available exercises from both sustained and interval categories
    const availableSustained = exerciseDatabase.cardio.sustained.filter(ex => 
        equipment.includes(ex.equipment) || ex.equipment === 'bodyweight' || ex.equipment === 'none'
    );
    
    const availableInterval = exerciseDatabase.cardio.interval.filter(ex => 
        (equipment.includes(ex.equipment) || ex.equipment === 'bodyweight') &&
        isDifficultyAppropriate(ex.difficulty, difficulty)
    );

    // For cardio routines, include one sustained exercise and multiple interval exercises
    if (availableSustained.length > 0) {
        const sustainedExercise = availableSustained[Math.floor(Math.random() * availableSustained.length)];
        exercises.push(generateSustainedCardioExercise(sustainedExercise, difficulty, duration));
    }

    // Add interval exercises
    const intervalCount = duration === '15_30_mins' ? 2 : duration === '60_plus_mins' ? 4 : 3;
    for (let i = 0; i < intervalCount && availableInterval.length > 0; i++) {
        const exercise = availableInterval[i % availableInterval.length];
        exercises.push(generateIntervalCardioExercise(exercise, difficulty));
    }

    return exercises;
}

function generateSustainedCardioExercise(exercise, difficulty, duration) {
    // Realistic durations for sustained cardio
    const sustainedDurations = {
        '15_30_mins': { beginner: 10, intermediate: 12, advanced: 15 },
        '30_45_mins': { beginner: 15, intermediate: 20, advanced: 25 },
        '45_60_mins': { beginner: 20, intermediate: 25, advanced: 30 },
        '60_plus_mins': { beginner: 25, intermediate: 30, advanced: 35 }
    };
    
    const exerciseDuration = sustainedDurations[duration]?.[difficulty] || 15;
    
    return {
        ...exercise,
        phase: 'main',
        duration: `${exerciseDuration} minutes`,
        intensity: difficulty === 'beginner' ? 'Moderate pace' : difficulty === 'advanced' ? 'Vigorous pace' : 'Moderate to vigorous pace',
        restTime: 0,
        notes: exercise.id === 'running' ? 'Maintain steady pace throughout' : 
               exercise.id === 'cycling' ? 'Keep consistent pedaling rhythm' : 
               'Focus on maintaining good form'
    };
}

function generateIntervalCardioExercise(exercise, difficulty) {
    // Realistic sets and reps for interval exercises
    const intervalSpecs = {
        jumping_jacks: {
            beginner: { sets: 3, reps: 25, rest: 60 },
            intermediate: { sets: 4, reps: 35, rest: 45 },
            advanced: { sets: 5, reps: 50, rest: 30 }
        },
        burpees: {
            beginner: { sets: 3, reps: 5, rest: 90 },
            intermediate: { sets: 4, reps: 8, rest: 75 },
            advanced: { sets: 5, reps: 12, rest: 60 }
        },
        mountain_climbers: {
            beginner: { sets: 3, reps: 20, rest: 60 },
            intermediate: { sets: 4, reps: 30, rest: 45 },
            advanced: { sets: 5, reps: 40, rest: 30 }
        },
        high_knees_cardio: {
            beginner: { sets: 3, reps: '30 seconds', rest: 60 },
            intermediate: { sets: 4, reps: '45 seconds', rest: 45 },
            advanced: { sets: 5, reps: '60 seconds', rest: 30 }
        },
        jumping_rope: {
            beginner: { sets: 3, reps: '1 minute', rest: 60 },
            intermediate: { sets: 4, reps: '90 seconds', rest: 45 },
            advanced: { sets: 5, reps: '2 minutes', rest: 30 }
        }
    };
    
    const spec = intervalSpecs[exercise.id] || intervalSpecs.jumping_jacks;
    const levelSpec = spec[difficulty];
    
    return {
        ...exercise,
        phase: 'main',
        sets: levelSpec.sets,
        reps: levelSpec.reps,
        restTime: levelSpec.rest,
        intensity: difficulty === 'beginner' ? 'Moderate effort' : difficulty === 'advanced' ? 'High intensity' : 'Moderate to high effort',
        notes: exercise.id === 'burpees' ? 'Focus on proper form over speed' :
               exercise.id === 'mountain_climbers' ? 'Keep core engaged throughout' :
               'Maintain good form and breathing'
    };
}

function generateMixedRoutine(difficulty, equipment, duration) {
    const strengthExercises = generateStrengthRoutine(difficulty, equipment, '30_45_mins').slice(0, 3);
    const cardioExercises = generateCardioRoutine(difficulty, equipment, '15_30_mins').slice(0, 2);
    
    return [...strengthExercises, ...cardioExercises];
}

function generateWarmupRoutine(difficulty) {
    const warmupExercises = [
        { 
            ...exerciseDatabase.warmup[0], // Light Walking
            phase: 'warmup',
            sets: 1,
            restTime: 0,
            notes: 'Start slow and gradually increase pace'
        },
        { 
            ...exerciseDatabase.warmup[1], // Arm Circles
            phase: 'warmup',
            sets: 1,
            reps: '10 forward, 10 backward',
            restTime: 0
        },
        { 
            ...exerciseDatabase.warmup[2], // Leg Swings
            phase: 'warmup',
            sets: 1,
            reps: '10 each direction',
            restTime: 0
        },
        { 
            ...exerciseDatabase.warmup[3], // Torso Twists
            phase: 'warmup',
            sets: 1,
            reps: '10 each direction',
            restTime: 0
        }
    ];

    if (difficulty !== 'beginner') {
        warmupExercises.push({
            ...exerciseDatabase.warmup[4], // Light Jumping Jacks
            phase: 'warmup',
            sets: 1,
            restTime: 0
        });
    }

    return warmupExercises;
}

function generateCooldownRoutine(difficulty) {
    const cooldownExercises = [
        { 
            ...exerciseDatabase.cooldown[0], // Cool Down Walk
            phase: 'cooldown',
            sets: 1,
            restTime: 0,
            notes: 'Walk slowly to bring heart rate down'
        },
        { 
            ...exerciseDatabase.cooldown[1], // Quad Stretch
            phase: 'cooldown',
            sets: 1,
            restTime: 0
        },
        { 
            ...exerciseDatabase.cooldown[2], // Hamstring Stretch
            phase: 'cooldown',
            sets: 1,
            restTime: 0
        },
        { 
            ...exerciseDatabase.cooldown[3], // Calf Stretch
            phase: 'cooldown',
            sets: 1,
            restTime: 0
        },
        { 
            ...exerciseDatabase.cooldown[4], // Chest Stretch
            phase: 'cooldown',
            sets: 1,
            restTime: 0
        },
        { 
            ...exerciseDatabase.cooldown[5], // Shoulder Stretch
            phase: 'cooldown',
            sets: 1,
            restTime: 0
        },
        { 
            ...exerciseDatabase.cooldown[7], // Deep Breathing
            phase: 'cooldown',
            sets: 1,
            restTime: 0,
            notes: 'Focus on slow, deep breaths to help recovery'
        }
    ];

    return cooldownExercises;
}

function isDifficultyAppropriate(exerciseDifficulty, userDifficulty) {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const userLevel = levels.indexOf(userDifficulty);
    const exerciseLevel = levels.indexOf(exerciseDifficulty);
    
    return exerciseLevel <= userLevel + 1;
}

function generateRepRange(exerciseId, difficulty) {
    // Exercise-specific rep ranges based on exercise type and difficulty
    const exerciseSpecificReps = {
        // Bodyweight exercises
        push_ups: {
            beginner: '8-12',
            intermediate: '15-20',
            advanced: '25-30'
        },
        pull_ups: {
            beginner: '3-5',
            intermediate: '6-10',
            advanced: '12-15'
        },
        squats: {
            beginner: '10-15',
            intermediate: '20-25',
            advanced: '30-35'
        },
        lunges: {
            beginner: '8-10 each leg',
            intermediate: '12-15 each leg',
            advanced: '18-20 each leg'
        },
        tricep_dips: {
            beginner: '6-10',
            intermediate: '12-15',
            advanced: '18-25'
        },
        
        // Weight exercises
        bench_press: {
            beginner: '8-10',
            intermediate: '10-12',
            advanced: '12-15'
        },
        deadlifts: {
            beginner: '5-8',
            intermediate: '8-10',
            advanced: '10-12'
        },
        barbell_squats: {
            beginner: '8-10',
            intermediate: '10-12',
            advanced: '12-15'
        },
        
        // Dumbbell exercises
        bicep_curls: {
            beginner: '10-12',
            intermediate: '12-15',
            advanced: '15-18'
        },
        shoulder_press: {
            beginner: '8-10',
            intermediate: '10-12',
            advanced: '12-15'
        },
        lateral_raises: {
            beginner: '10-12',
            intermediate: '12-15',
            advanced: '15-20'
        }
    };
    
    // Return exercise-specific reps or default ranges
    if (exerciseSpecificReps[exerciseId]) {
        return exerciseSpecificReps[exerciseId][difficulty];
    }
    
    // Default ranges for unlisted exercises
    const defaultRanges = {
        beginner: '8-12',
        intermediate: '10-15',
        advanced: '12-20'
    };
    
    return defaultRanges[difficulty];
}

function generateExerciseNotes(exerciseId, difficulty) {
    const exerciseNotes = {
        push_ups: difficulty === 'beginner' ? 'Start on knees if needed' : 'Keep body in straight line',
        pull_ups: difficulty === 'beginner' ? 'Use assistance band if needed' : 'Focus on controlled movements',
        squats: 'Keep knees behind toes, chest up',
        deadlifts: 'Keep back straight, drive through heels',
        bench_press: 'Control the weight, full range of motion',
        burpees: 'Focus on form over speed',
        mountain_climbers: 'Keep core engaged throughout',
        lunges: 'Step far enough forward for proper form'
    };
    
    return exerciseNotes[exerciseId] || 'Maintain proper form throughout';
}

export const workout = createWorkoutStore();