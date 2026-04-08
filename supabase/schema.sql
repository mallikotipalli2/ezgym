-- ======================================================
-- EzGym Database Schema (Custom JWT Auth)
-- Run this in your Supabase SQL Editor
-- ======================================================
-- ⚠️  This will DROP existing tables and recreate them.
--     Run this ONCE on a fresh project or to reset.
-- ======================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables (order matters for foreign keys)
DROP TABLE IF EXISTS workout_sets CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (custom auth — NOT using Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workouts table
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('push', 'pull', 'legs', 'cardio', 'custom')),
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discarded')),
  notes TEXT
);

-- Exercises table
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

-- Workout sets table
CREATE TABLE workout_sets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL DEFAULT 1,
  reps INTEGER NOT NULL DEFAULT 0,
  weight DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'lbs' CHECK (unit IN ('kg', 'lbs')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_status ON workouts(status);
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX idx_sets_user_id ON workout_sets(user_id);
CREATE INDEX idx_sets_exercise_id ON workout_sets(exercise_id);
CREATE INDEX idx_sets_workout_id ON workout_sets(workout_id);

-- RLS disabled — access control handled at API layer via JWT
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets DISABLE ROW LEVEL SECURITY;
