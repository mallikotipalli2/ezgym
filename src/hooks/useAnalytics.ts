import { useState, useEffect, useCallback } from 'react';
import { getCompletedWorkouts, getAllSets, getExercisesForWorkout } from '@/lib/db';
import { isSameDay, startOfDay } from '@/lib/utils';
import type {
  Workout,
  WorkoutSet,
  DailyActivity,
  PersonalRecord,
  StreakData,
  WeeklyData,
} from '@/types';

export const useAnalytics = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [allSets, setAllSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const completed = await getCompletedWorkouts();
      const sets = await getAllSets();
      setWorkouts(completed);
      setAllSets(sets.filter((s) => s.completed));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalWorkouts = workouts.length;

  const totalVolume = allSets.reduce((sum, s) => sum + s.weight * s.reps, 0);

  const totalSets = allSets.length;

  const totalReps = allSets.reduce((sum, s) => sum + s.reps, 0);

  const streak: StreakData = (() => {
    if (workouts.length === 0) return { current: 0, longest: 0 };

    const sortedDates = workouts
      .filter((w) => w.completedAt)
      .map((w) => startOfDay(new Date(w.completedAt!)).getTime())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b - a);

    if (sortedDates.length === 0) return { current: 0, longest: 0 };

    const today = startOfDay().getTime();
    const oneDay = 86400000;

    let current = 0;
    let longest = 0;
    let tempStreak = 1;

    // Check if most recent workout is today or yesterday
    if (sortedDates[0] === today || sortedDates[0] === today - oneDay) {
      current = 1;
    }

    for (let i = 1; i < sortedDates.length; i++) {
      if (sortedDates[i - 1] - sortedDates[i] === oneDay) {
        tempStreak++;
        if (i === 1 || current > 0) current = tempStreak;
      } else {
        tempStreak = 1;
        if (current === 0) current = 0;
      }
      longest = Math.max(longest, tempStreak);
    }

    longest = Math.max(longest, current, tempStreak);

    return {
      current,
      longest,
      lastWorkoutDate: workouts[0]?.completedAt,
    };
  })();

  const weeklyData: WeeklyData[] = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const shortDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const result: WeeklyData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayWorkouts = workouts.filter(
        (w) => w.completedAt && isSameDay(w.completedAt, date)
      );
      const daySets = allSets.filter(
        (s) => s.completedAt && isSameDay(s.completedAt, date)
      );
      const volume = daySets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      result.push({
        day: days[date.getDay()],
        shortDay: shortDays[date.getDay()],
        workouts: dayWorkouts.length,
        volume,
      });
    }

    return result;
  })();

  const getPersonalRecords = useCallback(async (): Promise<PersonalRecord[]> => {
    const exerciseMap = new Map<string, { maxWeight: number; maxReps: number; maxVolume: number; date: string }>();

    for (const workout of workouts) {
      const exercises = await getExercisesForWorkout(workout.id);
      for (const exercise of exercises) {
        const exerciseSets = allSets.filter(
          (s) => s.exerciseId === exercise.id && s.completed
        );

        for (const set of exerciseSets) {
          const existing = exerciseMap.get(exercise.name);
          const volume = set.weight * set.reps;
          const date = set.completedAt || workout.completedAt || workout.startedAt;

          if (!existing) {
            exerciseMap.set(exercise.name, {
              maxWeight: set.weight,
              maxReps: set.reps,
              maxVolume: volume,
              date,
            });
          } else {
            if (set.weight > existing.maxWeight) {
              existing.maxWeight = set.weight;
              existing.date = date;
            }
            if (set.reps > existing.maxReps) existing.maxReps = set.reps;
            if (volume > existing.maxVolume) existing.maxVolume = volume;
            exerciseMap.set(exercise.name, existing);
          }
        }
      }
    }

    return Array.from(exerciseMap.entries()).map(([name, data]) => ({
      exerciseName: name,
      ...data,
    }));
  }, [workouts, allSets]);

  const recentWorkouts = workouts.slice(0, 10);

  return {
    loading,
    totalWorkouts,
    totalVolume,
    totalSets,
    totalReps,
    streak,
    weeklyData,
    recentWorkouts,
    getPersonalRecords,
    refresh,
  };
};
