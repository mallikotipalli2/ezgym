import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createWorkout as dbCreateWorkout,
  updateWorkout as dbUpdateWorkout,
  getActiveWorkout,
  addExercise as dbAddExercise,
  deleteExercise as dbDeleteExercise,
  getExercisesForWorkout,
  addSet as dbAddSet,
  updateSet as dbUpdateSet,
  deleteSet as dbDeleteSet,
  getSetsForExercise,
  getSetsForWorkout,
  discardWorkout as dbDiscardWorkout,
} from '@/lib/db';
import { useSyncListener } from '@/hooks/useSyncListener';
import { generateId } from '@/lib/utils';
import type { Workout, Exercise, WorkoutSet, WorkoutType, WorkoutSummaryData } from '@/types';

export const useWorkout = () => {
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<Record<string, WorkoutSet[]>>({});
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const loadActiveWorkout = useCallback(async () => {
    const isInitial = !initialLoadDone.current;
    if (isInitial) setLoading(true);
    try {
      const workout = await getActiveWorkout();
      if (workout) {
        setActiveWorkout(workout);
        const exs = await getExercisesForWorkout(workout.id);
        setExercises(exs);
        const setsMap: Record<string, WorkoutSet[]> = {};
        for (const ex of exs) {
          setsMap[ex.id] = await getSetsForExercise(ex.id);
        }
        setSets(setsMap);
      } else {
        setActiveWorkout(null);
        setExercises([]);
        setSets({});
      }
    } finally {
      if (isInitial) {
        setLoading(false);
        initialLoadDone.current = true;
      }
    }
  }, []);

  useEffect(() => {
    loadActiveWorkout();
  }, [loadActiveWorkout]);

  useSyncListener(loadActiveWorkout);

  const startWorkout = useCallback(async (type: WorkoutType, name: string) => {
    const workout: Workout = {
      id: generateId(),
      type,
      name,
      startedAt: new Date().toISOString(),
      status: 'active',
      synced: false,
    };
    await dbCreateWorkout(workout);
    setActiveWorkout(workout);
    setExercises([]);
    setSets({});
    return workout;
  }, []);

  const addExerciseToWorkout = useCallback(
    async (name: string, category: string) => {
      if (!activeWorkout) return;
      const exercise: Exercise = {
        id: generateId(),
        workoutId: activeWorkout.id,
        name,
        category,
        order: exercises.length,
        synced: false,
      };
      await dbAddExercise(exercise);
      setExercises((prev) => [...prev, exercise]);
      // Add first empty set
      const firstSet: WorkoutSet = {
        id: generateId(),
        exerciseId: exercise.id,
        workoutId: activeWorkout.id,
        setNumber: 1,
        reps: 0,
        weight: 0,
        unit: 'lbs',
        completed: false,
        synced: false,
      };
      await dbAddSet(firstSet);
      setSets((prev) => ({ ...prev, [exercise.id]: [firstSet] }));
    },
    [activeWorkout, exercises.length]
  );

  const removeExercise = useCallback(async (exerciseId: string) => {
    await dbDeleteExercise(exerciseId);
    setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
    setSets((prev) => {
      const next = { ...prev };
      delete next[exerciseId];
      return next;
    });
  }, []);

  const addSetToExercise = useCallback(
    async (exerciseId: string) => {
      if (!activeWorkout) return;
      const existingSets = sets[exerciseId] || [];
      const lastSet = existingSets[existingSets.length - 1];
      const newSet: WorkoutSet = {
        id: generateId(),
        exerciseId,
        workoutId: activeWorkout.id,
        setNumber: existingSets.length + 1,
        reps: lastSet?.reps || 0,
        weight: lastSet?.weight || 0,
        unit: lastSet?.unit || 'lbs',
        completed: false,
        synced: false,
      };
      await dbAddSet(newSet);
      setSets((prev) => ({
        ...prev,
        [exerciseId]: [...(prev[exerciseId] || []), newSet],
      }));
    },
    [activeWorkout, sets]
  );

  const updateSetData = useCallback(
    async (setId: string, exerciseId: string, changes: Partial<WorkoutSet>) => {
      await dbUpdateSet(setId, changes);
      setSets((prev) => ({
        ...prev,
        [exerciseId]: (prev[exerciseId] || []).map((s) =>
          s.id === setId ? { ...s, ...changes } : s
        ),
      }));
    },
    []
  );

  const toggleSetComplete = useCallback(
    async (setId: string, exerciseId: string) => {
      const exerciseSets = sets[exerciseId] || [];
      const set = exerciseSets.find((s) => s.id === setId);
      if (!set) return;
      const completed = !set.completed;
      const changes: Partial<WorkoutSet> = {
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
      };
      await updateSetData(setId, exerciseId, changes);
    },
    [sets, updateSetData]
  );

  const removeSet = useCallback(async (setId: string, exerciseId: string) => {
    await dbDeleteSet(setId);
    setSets((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || []).filter((s) => s.id !== setId),
    }));
  }, []);

  const completeWorkout = useCallback(async (): Promise<WorkoutSummaryData | null> => {
    if (!activeWorkout) return null;
    const now = new Date().toISOString();
    await dbUpdateWorkout(activeWorkout.id, { status: 'completed', completedAt: now });

    const allSets = await getSetsForWorkout(activeWorkout.id);
    const completedSets = allSets.filter((s) => s.completed);
    const totalVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    const totalReps = completedSets.reduce((sum, s) => sum + s.reps, 0);
    const duration = new Date(now).getTime() - new Date(activeWorkout.startedAt).getTime();

    const summary: WorkoutSummaryData = {
      totalSets: allSets.length,
      completedSets: completedSets.length,
      totalVolume,
      totalReps,
      duration,
      exercises: exercises.length,
    };

    setActiveWorkout(null);
    setExercises([]);
    setSets({});
    return summary;
  }, [activeWorkout, exercises.length]);

  const discardWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    await dbDiscardWorkout(activeWorkout.id);
    setActiveWorkout(null);
    setExercises([]);
    setSets({});
  }, [activeWorkout]);

  return {
    activeWorkout,
    exercises,
    sets,
    loading,
    startWorkout,
    addExerciseToWorkout,
    removeExercise,
    addSetToExercise,
    updateSetData,
    toggleSetComplete,
    removeSet,
    completeWorkout,
    discardWorkout,
    reload: loadActiveWorkout,
  };
};
