import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Square, Timer, Trash2 } from 'lucide-react';
import { ExerciseItem } from './ExerciseItem';
import { ExercisePicker } from './ExercisePicker';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn, formatDuration, getWorkoutTypeBg } from '@/lib/utils';
import type { Workout, Exercise, WorkoutSet, WorkoutSummaryData } from '@/types';

interface ActiveWorkoutProps {
  workout: Workout;
  exercises: Exercise[];
  sets: Record<string, WorkoutSet[]>;
  onAddExercise: (name: string, category: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onUpdateSet: (setId: string, exerciseId: string, changes: Partial<WorkoutSet>) => void;
  onToggleSet: (setId: string, exerciseId: string) => void;
  onRemoveSet: (setId: string, exerciseId: string) => void;
  onComplete: () => Promise<WorkoutSummaryData | null>;
  onDiscard: () => void;
}

export const ActiveWorkout = ({
  workout,
  exercises,
  sets,
  onAddExercise,
  onRemoveExercise,
  onAddSet,
  onUpdateSet,
  onToggleSet,
  onRemoveSet,
  onComplete,
  onDiscard,
}: ActiveWorkoutProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const start = new Date(workout.startedAt).getTime();
    const tick = () => setElapsed(Date.now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [workout.startedAt]);

  const totalSets = Object.values(sets).flat();
  const completedSets = totalSets.filter((s) => s.completed);
  const existingNames = exercises.map((e) => e.name);

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete();
    setCompleting(false);
  };

  return (
    <div className="space-y-4">
      {/* Workout header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn('px-3 py-1.5 rounded-xl text-xs font-bold', getWorkoutTypeBg(workout.type))}>
            {workout.type.toUpperCase()}
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">{workout.name}</h2>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="flex items-center justify-between bg-surface-850 border border-surface-800 rounded-2xl p-3">
        <div className="flex items-center gap-2 text-surface-300">
          <Timer size={16} className="text-brand-400" />
          <span className="text-sm font-mono font-semibold">{formatDuration(elapsed)}</span>
        </div>
        <div className="text-sm text-surface-400">
          <span className="text-white font-semibold">{completedSets.length}</span>
          <span>/{totalSets.length} sets</span>
        </div>
      </div>

      {/* Exercises */}
      <AnimatePresence>
        {exercises.map((exercise) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            sets={sets[exercise.id] || []}
            onAddSet={onAddSet}
            onUpdateSet={onUpdateSet}
            onToggleSet={onToggleSet}
            onRemoveSet={onRemoveSet}
            onRemoveExercise={onRemoveExercise}
          />
        ))}
      </AnimatePresence>

      {/* Add exercise */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowPicker(true)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-surface-700 hover:border-brand-500/50 text-surface-400 hover:text-brand-400 transition-colors"
      >
        <Plus size={20} />
        <span className="font-semibold">Add Exercise</span>
      </motion.button>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="danger"
          size="lg"
          onClick={() => setShowDiscard(true)}
          className="flex-1"
        >
          <Trash2 size={18} />
          Discard
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleComplete}
          loading={completing}
          disabled={completedSets.length === 0}
          className="flex-[2]"
        >
          <Square size={18} />
          Finish Workout
        </Button>
      </div>

      {/* Exercise picker modal */}
      <Modal open={showPicker} onClose={() => setShowPicker(false)} title="Add Exercise">
        <ExercisePicker
          workoutType={workout.type}
          existingExercises={existingNames}
          onSelect={async (name, category) => {
            setShowPicker(false);
            await onAddExercise(name, category);
          }}
          onClose={() => setShowPicker(false)}
        />
      </Modal>

      {/* Discard confirmation */}
      <Modal open={showDiscard} onClose={() => setShowDiscard(false)} title="Discard Workout?" size="sm">
        <p className="text-surface-400 text-sm mb-6">
          This will permanently delete this workout session and all logged sets. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowDiscard(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDiscard();
              setShowDiscard(false);
            }}
            className="flex-1"
          >
            Discard
          </Button>
        </div>
      </Modal>
    </div>
  );
};
