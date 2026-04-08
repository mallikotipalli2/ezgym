import { db } from './db';
import { getAuthHeaders, isAuthenticated } from '@/context/AuthContext';

let syncInProgress = false;

function getApiBase(): string {
  return import.meta.env.VITE_API_URL || '';
}

function notifySynced() {
  window.dispatchEvent(new CustomEvent('ezgym:synced'));
}

export const syncProfileToRemote = async (): Promise<void> => {
  if (!isAuthenticated()) return;

  try {
    const profile = await db.profiles.toCollection().first();
    if (!profile || profile.synced !== false) return;

    const res = await fetch(`${getApiBase()}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        displayName: profile.name || '',
        avatarUrl: profile.avatarUrl || '',
      }),
    });

    if (res.ok) {
      await db.profiles.update(profile.id, { synced: true });
    }
  } catch (err) {
    console.warn('Profile push failed:', err);
  }
};

export const syncProfileFromRemote = async (): Promise<void> => {
  if (!isAuthenticated()) return;

  try {
    const res = await fetch(`${getApiBase()}/api/profile`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) return;

    const { profile: remote } = await res.json();
    if (!remote) return;

    const local = await db.profiles.toCollection().first();

    // Only overwrite if local isn't dirty
    if (!local || local.synced !== false) {
      const mapped = {
        id: local?.id || 'default',
        name: remote.displayName || local?.name || '',
        avatarUrl: remote.avatarUrl || local?.avatarUrl || '',
        theme: local?.theme || ('dark' as const),
        createdAt: remote.createdAt || local?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: true,
      };
      await db.profiles.put(mapped);
    }
  } catch (err) {
    console.warn('Profile pull failed:', err);
  }
};

export const syncToRemote = async (): Promise<void> => {
  if (!isAuthenticated() || syncInProgress) return;

  syncInProgress = true;

  try {
    const unsyncedWorkouts = await db.workouts.filter((w) => w.synced === false).toArray();
    const unsyncedExercises = await db.exercises.filter((e) => e.synced === false).toArray();
    const unsyncedSets = await db.sets.filter((s) => s.synced === false).toArray();
    const unsyncedGymSessions = await db.gymSessions.filter((g) => g.synced === false && g.status !== 'active').toArray();

    const hasUnsynced = unsyncedWorkouts.length || unsyncedExercises.length || unsyncedSets.length || unsyncedGymSessions.length;

    if (!hasUnsynced) {
      await syncProfileToRemote();
      return;
    }

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
        gymSessions: unsyncedGymSessions,
      }),
    });

    if (res.ok) {
      await Promise.all([
        ...unsyncedWorkouts.map((w) => db.workouts.update(w.id, { synced: true })),
        ...unsyncedExercises.map((e) => db.exercises.update(e.id, { synced: true })),
        ...unsyncedSets.map((s) => db.sets.update(s.id, { synced: true })),
        ...unsyncedGymSessions.map((g) => db.gymSessions.update(g.id, { synced: true })),
      ]);
    }

    await syncProfileToRemote();
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

    const { workouts, exercises, sets, gymSessions } = await res.json();

    for (const rw of workouts || []) {
      const mapped = {
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
      const mapped = {
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
      const mapped = {
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

    for (const rg of gymSessions || []) {
      const mapped = {
        id: rg.id,
        userId: rg.user_id,
        startedAt: rg.started_at,
        endedAt: rg.ended_at,
        durationMs: rg.duration_ms,
        status: rg.status,
        synced: true,
      };
      const local = await db.gymSessions.get(rg.id);
      if (!local) {
        await db.gymSessions.add(mapped);
      } else if (local.synced !== false) {
        await db.gymSessions.put(mapped);
      }
    }

    await syncProfileFromRemote();
    notifySynced();
  } catch (err) {
    console.warn('Sync pull failed:', err);
  }
};

export const clearLocalData = async (): Promise<void> => {
  await db.workouts.clear();
  await db.exercises.clear();
  await db.sets.clear();
  await db.profiles.clear();
  await db.gymSessions.clear();
};

export const startAutoSync = (intervalMs = 5000): (() => void) => {
  // Push every 5s
  const pushHandle = setInterval(() => syncToRemote(), intervalMs);
  // Pull every 15s
  const pullHandle = setInterval(() => syncFromRemote(), intervalMs * 3);

  syncToRemote();

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      syncToRemote();
      syncFromRemote();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    clearInterval(pushHandle);
    clearInterval(pullHandle);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
};
