export type WorkoutType = 'push' | 'pull' | 'legs' | 'cardio' | 'custom';
export type WorkoutStatus = 'active' | 'completed' | 'discarded';
export type ThemeMode = 'dark' | 'light';

export interface Profile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  theme: ThemeMode;
  createdAt: string;
  updatedAt: string;
  synced?: boolean;
}

export interface Workout {
  id: string;
  userId?: string;
  type: WorkoutType;
  name: string;
  startedAt: string;
  completedAt?: string;
  status: WorkoutStatus;
  notes?: string;
  synced?: boolean;
}

export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  category: string;
  order: number;
  notes?: string;
  synced?: boolean;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  workoutId: string;
  setNumber: number;
  reps: number;
  weight: number;
  unit: 'kg' | 'lbs';
  completed: boolean;
  completedAt?: string;
  synced?: boolean;
}

export interface ExerciseDefinition {
  name: string;
  category: WorkoutType[];
  muscleGroup: string;
  equipment?: string;
}

export interface WorkoutSummaryData {
  totalSets: number;
  completedSets: number;
  totalVolume: number;
  totalReps: number;
  duration: number;
  exercises: number;
}

export interface DailyActivity {
  date: string;
  workouts: number;
  volume: number;
  duration: number;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
  date: string;
}

export interface StreakData {
  current: number;
  longest: number;
  lastWorkoutDate?: string;
}

export interface WeeklyData {
  day: string;
  workouts: number;
  volume: number;
  shortDay: string;
}
