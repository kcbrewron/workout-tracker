-- Workout Tracker Database Schema for Supabase PostgreSQL
-- Senior Engineer Design: Comprehensive relational schema for users, workouts, and analytics

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    height_cm INTEGER,
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    primary_goals TEXT[], -- Array of goals like ['lose_weight', 'build_muscle', 'improve_endurance']
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    preferred_sports TEXT[], -- Array of sports/activities
    equipment_access TEXT[], -- Array of available equipment
    workout_frequency_per_week INTEGER DEFAULT 3,
    preferred_workout_duration_minutes INTEGER DEFAULT 45,
    timezone TEXT DEFAULT 'UTC',
    units_system TEXT CHECK (units_system IN ('metric', 'imperial')) DEFAULT 'metric',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Body measurements tracking
CREATE TABLE public.body_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    measurement_date DATE NOT NULL,
    weight_kg DECIMAL(5,2), -- Support up to 999.99 kg
    body_fat_percentage DECIMAL(4,2), -- Support up to 99.99%
    muscle_mass_kg DECIMAL(5,2),
    -- Body measurements in centimeters
    neck_cm DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    left_bicep_cm DECIMAL(5,2),
    right_bicep_cm DECIMAL(5,2),
    left_forearm_cm DECIMAL(5,2),
    right_forearm_cm DECIMAL(5,2),
    left_thigh_cm DECIMAL(5,2),
    right_thigh_cm DECIMAL(5,2),
    left_calf_cm DECIMAL(5,2),
    right_calf_cm DECIMAL(5,2),
    -- Additional measurements
    shoulders_cm DECIMAL(5,2),
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, measurement_date)
);

-- Exercise library
CREATE TABLE public.exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
    description TEXT,
    instructions TEXT[],
    primary_muscle_groups TEXT[] NOT NULL,
    secondary_muscle_groups TEXT[],
    equipment_required TEXT[],
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    exercise_type TEXT CHECK (exercise_type IN ('strength', 'cardio', 'flexibility', 'balance', 'plyometric')) NOT NULL,
    movement_pattern TEXT CHECK (movement_pattern IN ('push', 'pull', 'squat', 'hinge', 'lunge', 'carry', 'rotation', 'isometric')),
    video_url TEXT,
    image_urls TEXT[],
    safety_notes TEXT[],
    variations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Workout templates
CREATE TABLE public.workout_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_minutes INTEGER,
    workout_type TEXT CHECK (workout_type IN ('strength', 'cardio', 'hiit', 'flexibility', 'mixed')) NOT NULL,
    target_muscle_groups TEXT[],
    equipment_required TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Template exercises (exercises within a template)
CREATE TABLE public.template_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    sets INTEGER,
    reps INTEGER[],
    weight_kg DECIMAL(6,2)[],
    duration_seconds INTEGER,
    distance_meters DECIMAL(8,2),
    rest_seconds INTEGER,
    rpe_target INTEGER CHECK (rpe_target >= 1 AND rpe_target <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(template_id, order_index)
);

-- Workout sessions (actual workout instances)
CREATE TABLE public.workout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    workout_date DATE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planned',
    notes TEXT,
    overall_rpe INTEGER CHECK (overall_rpe >= 1 AND overall_rpe <= 10),
    calories_burned INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Session exercises (actual exercise performance)
CREATE TABLE public.session_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    sets_completed INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(session_id, order_index)
);

-- Individual sets within session exercises
CREATE TABLE public.exercise_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_exercise_id UUID REFERENCES public.session_exercises(id) ON DELETE CASCADE NOT NULL,
    set_number INTEGER NOT NULL,
    reps INTEGER,
    weight_kg DECIMAL(6,2),
    duration_seconds INTEGER,
    distance_meters DECIMAL(8,2),
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    rest_seconds INTEGER,
    is_warmup BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(session_exercise_id, set_number)
);

-- Personal records tracking
CREATE TABLE public.personal_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    record_type TEXT CHECK (record_type IN ('max_weight', 'max_reps', 'max_distance', 'best_time', 'max_volume')) NOT NULL,
    value DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL, -- 'kg', 'lbs', 'reps', 'meters', 'seconds', etc.
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
    achieved_date DATE NOT NULL,
    previous_record DECIMAL(10,3),
    improvement DECIMAL(10,3),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, exercise_id, record_type)
);

-- Workout analytics and metrics
CREATE TABLE public.workout_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    total_workouts INTEGER DEFAULT 0,
    total_duration_minutes INTEGER DEFAULT 0,
    total_volume_kg DECIMAL(10,2) DEFAULT 0,
    average_rpe DECIMAL(3,2),
    calories_burned INTEGER DEFAULT 0,
    strength_workouts INTEGER DEFAULT 0,
    cardio_workouts INTEGER DEFAULT 0,
    flexibility_workouts INTEGER DEFAULT 0,
    workout_streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Goals and milestones tracking
CREATE TABLE public.user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    goal_type TEXT CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'body_fat', 'measurement')) NOT NULL,
    target_value DECIMAL(10,3) NOT NULL,
    current_value DECIMAL(10,3),
    unit TEXT NOT NULL,
    target_date DATE,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    achieved_date DATE,
    status TEXT CHECK (status IN ('active', 'achieved', 'paused', 'cancelled')) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance optimization
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_body_measurements_user_date ON public.body_measurements(user_id, measurement_date DESC);
CREATE INDEX idx_workout_sessions_user_date ON public.workout_sessions(user_id, workout_date DESC);
CREATE INDEX idx_workout_sessions_status ON public.workout_sessions(status);
CREATE INDEX idx_session_exercises_session ON public.session_exercises(session_id, order_index);
CREATE INDEX idx_exercise_sets_session_exercise ON public.exercise_sets(session_exercise_id, set_number);
CREATE INDEX idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_id, record_type);
CREATE INDEX idx_workout_analytics_user_date ON public.workout_analytics(user_id, date DESC);
CREATE INDEX idx_exercises_muscle_groups ON public.exercises USING GIN(primary_muscle_groups);
CREATE INDEX idx_exercises_type ON public.exercises(exercise_type);
CREATE INDEX idx_user_goals_user_status ON public.user_goals(user_id, status);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data access
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own measurements" ON public.body_measurements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own workout templates" ON public.workout_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public templates" ON public.workout_templates FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage template exercises for own templates" ON public.template_exercises FOR ALL USING (
    template_id IN (SELECT id FROM public.workout_templates WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage own workout sessions" ON public.workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage session exercises for own sessions" ON public.session_exercises FOR ALL USING (
    session_id IN (SELECT id FROM public.workout_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage exercise sets for own sessions" ON public.exercise_sets FOR ALL USING (
    session_exercise_id IN (
        SELECT se.id FROM public.session_exercises se 
        JOIN public.workout_sessions ws ON se.session_id = ws.id 
        WHERE ws.user_id = auth.uid()
    )
);
CREATE POLICY "Users can manage own personal records" ON public.personal_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own analytics" ON public.workout_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON public.user_goals FOR ALL USING (auth.uid() = user_id);

-- Public access to exercises (read-only)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exercises" ON public.exercises FOR SELECT USING (true);

-- Functions for automated analytics updates
CREATE OR REPLACE FUNCTION update_workout_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workout_analytics (user_id, date, total_workouts, total_duration_minutes, average_rpe)
    VALUES (
        NEW.user_id,
        NEW.workout_date,
        1,
        COALESCE(NEW.duration_minutes, 0),
        NEW.overall_rpe
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        total_workouts = workout_analytics.total_workouts + 1,
        total_duration_minutes = workout_analytics.total_duration_minutes + COALESCE(NEW.duration_minutes, 0),
        average_rpe = (workout_analytics.average_rpe * (workout_analytics.total_workouts - 1) + COALESCE(NEW.overall_rpe, 0)) / workout_analytics.total_workouts,
        updated_at = timezone('utc'::text, now());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update analytics when workout is completed
CREATE TRIGGER trigger_update_workout_analytics
    AFTER UPDATE ON public.workout_sessions
    FOR EACH ROW
    WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
    EXECUTE FUNCTION update_workout_analytics();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_body_measurements_updated_at BEFORE UPDATE ON public.body_measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON public.workout_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_analytics_updated_at BEFORE UPDATE ON public.workout_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();