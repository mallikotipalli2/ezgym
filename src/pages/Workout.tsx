import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { ActiveWorkout } from '@/components/workout/ActiveWorkout';
import { WorkoutSummary } from '@/components/workout/WorkoutSummary';
import { useWorkout } from '@/hooks/useWorkout';
import type { WorkoutType, WorkoutSummaryData } from '@/types';

const workoutTypes: { type: WorkoutType; label: string; description: string }[] = [
  { type: 'push', label: 'Push Day', description: 'Chest + Shoulders + Triceps' },
  { type: 'pull', label: 'Pull Day', description: 'Back + Biceps + Rear Delts' },
  { type: 'legs', label: 'Leg Day', description: 'Quads + Hamstrings + Glutes + Calves' },
  { type: 'cardio', label: 'Cardio', description: 'LISS · HIIT · Sports' },
  { type: 'custom', label: 'Custom', description: 'Build your own workout' },
];

export const Workout = () => {
  const navigate = useNavigate();
  const {
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
  } = useWorkout();

  const [summary, setSummary] = useState<WorkoutSummaryData | null>(null);

  const handleSelect = async (type: WorkoutType) => {
    const label = workoutTypes.find((w) => w.type === type)?.label || 'Workout';
    await startWorkout(type, label);
  };

  const handleComplete = async () => {
    const result = await completeWorkout();
    if (result) setSummary(result);
    return result;
  };

  const handleDone = () => {
    setSummary(null);
    navigate('/');
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  // Show summary
  if (summary) {
    return (
      <PageContainer>
        <WorkoutSummary summary={summary} onDone={handleDone} />
      </PageContainer>
    );
  }

  // Active workout view
  if (activeWorkout) {
    return (
      <PageContainer>
        <ActiveWorkout
          workout={activeWorkout}
          exercises={exercises}
          sets={sets}
          onAddExercise={addExerciseToWorkout}
          onRemoveExercise={removeExercise}
          onAddSet={addSetToExercise}
          onUpdateSet={updateSetData}
          onToggleSet={toggleSetComplete}
          onRemoveSet={removeSet}
          onComplete={handleComplete}
          onDiscard={discardWorkout}
        />
      </PageContainer>
    );
  }

  // Workout type selection
  return (
    <PageContainer>
      <Header
        title="Start Workout"
        subtitle="Choose your training focus"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-3"
      >
        {workoutTypes.map((wt, i) => (
          <motion.div
            key={wt.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <WorkoutCard
              type={wt.type}
              label={wt.label}
              description={wt.description}
              onSelect={handleSelect}
            />
          </motion.div>
        ))}
      </motion.div>
    </PageContainer>
  );
};
