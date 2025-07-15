-- Migration: 001_initial_schema.sql
-- Description: Initial database schema setup for workout tracker
-- Run Date: 2025-07-14

-- This migration should be run after setting up Supabase auth
-- Make sure to enable auth in your Supabase project first

-- Create the schema from the main schema file
-- Run this file in your Supabase SQL editor or via migration tools

\i '../schema.sql'

-- Insert some initial exercise data
INSERT INTO public.exercises (name, slug, description, instructions, primary_muscle_groups, secondary_muscle_groups, equipment_required, difficulty_level, exercise_type, movement_pattern) VALUES
('Push-up', 'push-up', 'Classic bodyweight chest exercise', ARRAY['Start in plank position', 'Lower body until chest nearly touches floor', 'Push back up to starting position'], ARRAY['chest', 'triceps'], ARRAY['shoulders', 'core'], ARRAY['bodyweight'], 'beginner', 'strength', 'push'),
('Squat', 'squat', 'Fundamental lower body movement', ARRAY['Stand with feet shoulder-width apart', 'Lower hips back and down', 'Keep chest up and knees over toes', 'Return to standing'], ARRAY['quadriceps', 'glutes'], ARRAY['hamstrings', 'calves', 'core'], ARRAY['bodyweight'], 'beginner', 'strength', 'squat'),
('Deadlift', 'deadlift', 'Hip hinge movement pattern', ARRAY['Stand with feet hip-width apart', 'Hinge at hips, keep back straight', 'Lower weight towards floor', 'Drive hips forward to return to standing'], ARRAY['hamstrings', 'glutes', 'erector_spinae'], ARRAY['quadriceps', 'traps', 'forearms'], ARRAY['barbell', 'dumbbells'], 'intermediate', 'strength', 'hinge'),
('Plank', 'plank', 'Isometric core strengthening exercise', ARRAY['Start in push-up position', 'Hold body in straight line', 'Engage core and breathe normally'], ARRAY['core', 'transverse_abdominis'], ARRAY['shoulders', 'glutes'], ARRAY['bodyweight'], 'beginner', 'strength', 'isometric'),
('Pull-up', 'pull-up', 'Upper body pulling exercise', ARRAY['Hang from bar with palms facing away', 'Pull body up until chin clears bar', 'Lower with control'], ARRAY['latissimus_dorsi', 'biceps'], ARRAY['rhomboids', 'rear_delts', 'forearms'], ARRAY['pull_up_bar'], 'intermediate', 'strength', 'pull'),
('Running', 'running', 'Cardiovascular endurance exercise', ARRAY['Maintain steady pace', 'Land on midfoot', 'Keep posture upright', 'Breathe rhythmically'], ARRAY['cardiovascular_system'], ARRAY['calves', 'quadriceps', 'hamstrings'], ARRAY['none'], 'beginner', 'cardio', NULL),
('Bench Press', 'bench-press', 'Chest pressing movement', ARRAY['Lie on bench with feet flat on floor', 'Grip bar slightly wider than shoulders', 'Lower bar to chest with control', 'Press bar back to starting position'], ARRAY['chest', 'triceps'], ARRAY['shoulders'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'push'),
('Overhead Press', 'overhead-press', 'Shoulder pressing movement', ARRAY['Stand with feet shoulder-width apart', 'Hold bar at shoulder height', 'Press bar overhead', 'Lower with control'], ARRAY['shoulders', 'triceps'], ARRAY['core', 'upper_back'], ARRAY['barbell', 'dumbbells'], 'intermediate', 'strength', 'push'),
('Bent-over Row', 'bent-over-row', 'Pulling movement for back', ARRAY['Hinge at hips with slight knee bend', 'Hold bar with overhand grip', 'Pull bar to lower chest', 'Lower with control'], ARRAY['latissimus_dorsi', 'rhomboids'], ARRAY['biceps', 'rear_delts'], ARRAY['barbell', 'dumbbells'], 'intermediate', 'strength', 'pull'),
('Lunges', 'lunges', 'Single leg strength exercise', ARRAY['Step forward into lunge position', 'Lower back knee toward ground', 'Push through front heel to return', 'Alternate legs'], ARRAY['quadriceps', 'glutes'], ARRAY['hamstrings', 'calves', 'core'], ARRAY['bodyweight', 'dumbbells'], 'beginner', 'strength', 'lunge');

-- Create a basic workout template for new users
INSERT INTO public.workout_templates (name, description, difficulty_level, estimated_duration_minutes, workout_type, target_muscle_groups, equipment_required, is_public) VALUES
('Beginner Full Body', 'A complete beginner-friendly full body workout', 'beginner', 45, 'strength', ARRAY['chest', 'back', 'legs', 'core'], ARRAY['bodyweight'], true),
('Upper Body Strength', 'Focus on building upper body strength', 'intermediate', 60, 'strength', ARRAY['chest', 'back', 'shoulders', 'arms'], ARRAY['barbell', 'dumbbells', 'bench'], true),
('Cardio Blast', 'High intensity cardiovascular workout', 'intermediate', 30, 'cardio', ARRAY['cardiovascular_system'], ARRAY['none'], true);

-- Add exercises to the beginner template
INSERT INTO public.template_exercises (template_id, exercise_id, order_index, sets, reps, rest_seconds, rpe_target) 
SELECT 
    wt.id,
    e.id,
    ord.order_index,
    ord.sets,
    ord.reps,
    ord.rest_seconds,
    ord.rpe_target
FROM public.workout_templates wt
CROSS JOIN (
    VALUES 
    (1, ARRAY[10, 12, 15], 3, 60, 6),
    (2, ARRAY[8, 10, 12], 3, 90, 7),
    (3, ARRAY[30], 3, 60, 6),
    (4, ARRAY[8, 10, 12], 3, 90, 7)
) AS ord(order_index, reps, sets, rest_seconds, rpe_target)
CROSS JOIN public.exercises e
WHERE wt.name = 'Beginner Full Body'
AND (
    (ord.order_index = 1 AND e.slug = 'push-up') OR
    (ord.order_index = 2 AND e.slug = 'squat') OR
    (ord.order_index = 3 AND e.slug = 'plank') OR
    (ord.order_index = 4 AND e.slug = 'lunges')
);

-- Migration complete
-- Next steps:
-- 1. Set up Supabase environment variables in your application
-- 2. Install @supabase/supabase-js in your SvelteKit app
-- 3. Configure authentication
-- 4. Test database connections