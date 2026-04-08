import { db } from './db';
import { getAuthHeaders, isAuthenticated } from '@/context/AuthContext';
import type { Workout, Exercise, WorkoutSet } from '@/types';

let syncInProgress = false;

function getApiBase(): string {
  return import.meta.env.VITE_API_URL || '';
}

export const syncToRemote = async (): Promise<void> => {
  if (!isAuthenticated() || syncInProgress) return;

  syncInProgress = true;

  try {
    const unsyncedWorkouts = await db.workouts.filter((w) => w.synced === false).toArray();
    const unsyncedExercises = await db.exercises.filter((e) => e.synced === false).toArray();
    const unsyncedSets = await db.sets.filter((s) => s.synced === false).toArray();

    if (!unsyncedWorkouts.length && !unsyncedExercises.length && !unsyncedSets.length) return;

    const res = await fetch(`${getApiBase()}/api/workouts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        workouts: unsyncedWorkouts,
        exercises: unsyncedExercises,
        sets: unsyncedSets,
      }),
    });

    if (res.ok) {
      await Promise.all([
        ...unsyncedWorkouts.map((w) => db.workouts.update(w.id, { synced: true })),
        ...unsyncedExercises.map((e) => db.exercises.update(e.id, { synced: true })),
        ...unsyncedSets.map((s) => db.sets.update(s.id, { synced: true })),
      ]);
    }
  } catch (err) {
    console.warn('Sync push failed, will retry:', err);
  } finally {
    syncInProgress = false;
  }
};

export const syncFromRemote = async (): Promise<void> => {
  if (!isAuthenticated()) return;

  try {
    const res = await fetch(`${getApiBase()}/api/workouts`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) return;

    const { workouts, exercises, sets } = await res.json();

    for (const rw of workouts || []) {
      const mapped: Workout = {
        id: rw.id,
        userId: rw.user_id,
        type: rw.type,
        name: rw.name,
        startedAt: rw.started_at,
        completedAt: rw.completed_at,
        status: rw.status,
        notes: rw.notes,
        synced: true,
      };
      const local = await db.workouts.get(rw.id);
      if (!local) {
        await db.workouts.add(mapped);
      } else if (local.synced !== false) {
        await db.workouts.put(mapped);
      }
    }

    for (const re of exercises || []) {
      const mapped: Exercise = {
        id: re.id,
        workoutId: re.workout_id,
        name: re.name,
        category: re.category,
        order: re.order,
        notes: re.notes,
        synced: true,
      };
      const local = await db.exercises.get(re.id);
      if (!local) {
        await db.exercises.add(mapped);
      } else if (local.synced !== false) {
        await db.exercises.put(mapped);
      }
    }

    for (const rs of sets || []) {
      const mapped: WorkoutSet = {
        id: rs.id,
        exerciseId: rs.exercise_id,
        workoutId: rs.workout_id,
        setNumber: rs.set_number,
        reps: rs.reps,
        weight: rs.weight,
        unit: rs.unit,
        completed: rs.completed,
        completedAt: rs.completed_at,
        synced: true,
      };
      const local = await db.sets.get(rs.id);
      if (!local) {
        await db.sets.add(mapped);
      } else if (local.synced !== false) {
        await db.sets.put(mapped);
      }
    }
  } catch (err) {
    console.warn('Sync pull failed:', err);
  }
};

export const startAutoSync = (intervalMs = 5000): (() => void) => {
  const handle = setInterval(() => syncToRemote(), intervalMs);
  syncToRemote();

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      syncToRemote();
      syncFromRemote();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    clearInterval(handle);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
};
