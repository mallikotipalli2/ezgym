import Dexie, { type EntityTable } from 'dexie';
import type { Workout, Exercise, WorkoutSet, Profile } from '@/types';

class EzGymDB extends Dexie {
  workouts!: EntityTable<Workout, 'id'>;
  exercises!: EntityTable<Exercise, 'id'>;
  sets!: EntityTable<WorkoutSet, 'id'>;
  profiles!: EntityTable<Profile, 'id'>;

  constructor() {
    super('ezgym');

    this.version(1).stores({
      workouts: 'id, userId, type, status, startedAt, completedAt, synced',
      exercises: 'id, workoutId, name, category, order, synced',
      sets: 'id, exerciseId, workoutId, synced',
      profiles: 'id, synced',
    });
  }
}

export const db = new EzGymDB();

// Workout operations
export const createWorkout = async (workout: Workout): Promise<void> => {
  await db.workouts.add(workout);
};

export const updateWorkout = async (id: string, changes: Partial<Workout>): Promise<void> => {
  await db.workouts.update(id, { ...changes, synced: false });
};

export const getWorkout = async (id: string): Promise<Workout | undefined> => {
  return db.workouts.get(id);
};

export const getActiveWorkout = async (): Promise<Workout | undefined> => {
  return db.workouts.where('status').equals('active').first();
};

export const getCompletedWorkouts = async (): Promise<Workout[]> => {
  return db.workouts
    .where('status')
    .equals('completed')
    .reverse()
    .sortBy('completedAt');
};

export const getAllWorkouts = async (): Promise<Workout[]> => {
  return db.workouts.toArray();
};

// Exercise operations
export const addExercise = async (exercise: Exercise): Promise<void> => {
  await db.exercises.add(exercise);
};

export const updateExercise = async (id: string, changes: Partial<Exercise>): Promise<void> => {
  await db.exercises.update(id, { ...changes, synced: false });
};

export const deleteExercise = async (id: string): Promise<void> => {
  await db.sets.where('exerciseId').equals(id).delete();
  await db.exercises.delete(id);
};

export const getExercisesForWorkout = async (workoutId: string): Promise<Exercise[]> => {
  return db.exercises
    .where('workoutId')
    .equals(workoutId)
    .sortBy('order');
};

// Set operations
export const addSet = async (set: WorkoutSet): Promise<void> => {
  await db.sets.add(set);
};

export const updateSet = async (id: string, changes: Partial<WorkoutSet>): Promise<void> => {
  await db.sets.update(id, { ...changes, synced: false });
};

export const deleteSet = async (id: string): Promise<void> => {
  await db.sets.delete(id);
};

export const getSetsForExercise = async (exerciseId: string): Promise<WorkoutSet[]> => {
  return db.sets
    .where('exerciseId')
    .equals(exerciseId)
    .sortBy('setNumber');
};

export const getSetsForWorkout = async (workoutId: string): Promise<WorkoutSet[]> => {
  return db.sets.where('workoutId').equals(workoutId).toArray();
};

export const getAllSets = async (): Promise<WorkoutSet[]> => {
  return db.sets.toArray();
};

// Profile operations
export const getProfile = async (): Promise<Profile | undefined> => {
  return db.profiles.toCollection().first();
};

export const saveProfile = async (profile: Profile): Promise<void> => {
  const existing = await db.profiles.get(profile.id);
  if (existing) {
    await db.profiles.update(profile.id, { ...profile, synced: false });
  } else {
    await db.profiles.add({ ...profile, synced: false });
  }
};

// Cleanup
export const discardWorkout = async (workoutId: string): Promise<void> => {
  await db.sets.where('workoutId').equals(workoutId).delete();
  await db.exercises.where('workoutId').equals(workoutId).delete();
  await db.workouts.update(workoutId, { status: 'discarded', synced: false });
};

// Unsynced data queries
export const getUnsyncedWorkouts = async (): Promise<Workout[]> => {
  return db.workouts.where('synced').equals(0).toArray();
};

export const getUnsyncedExercises = async (): Promise<Exercise[]> => {
  return db.exercises.where('synced').equals(0).toArray();
};

export const getUnsyncedSets = async (): Promise<WorkoutSet[]> => {
  return db.sets.where('synced').equals(0).toArray();
};
