import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { SetRow } from './SetRow';
import { cn } from '@/lib/utils';
import type { Exercise, WorkoutSet } from '@/types';

interface ExerciseItemProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  onAddSet: (exerciseId: string) => void;
  onUpdateSet: (setId: string, exerciseId: string, changes: Partial<WorkoutSet>) => void;
  onToggleSet: (setId: string, exerciseId: string) => void;
  onRemoveSet: (setId: string, exerciseId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
}

export const ExerciseItem = ({
  exercise,
  sets,
  onAddSet,
  onUpdateSet,
  onToggleSet,
  onRemoveSet,
  onRemoveExercise,
}: ExerciseItemProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const completedSets = sets.filter((s) => s.completed).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-surface-850 border border-surface-800 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 active:bg-surface-800/50"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-1.5 h-8 rounded-full bg-brand-500 flex-shrink-0" />
          <div className="text-left min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{exercise.name}</h3>
            <p className="text-xs text-surface-400">
              {completedSets}/{sets.length} sets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveExercise(exercise.id);
            }}
            className="p-2 rounded-xl text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
          {collapsed ? (
            <ChevronDown size={18} className="text-surface-400" />
          ) : (
            <ChevronUp size={18} className="text-surface-400" />
          )}
        </div>
      </button>

      {/* Sets */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {/* Column headers */}
          <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 px-1 mb-1">
            <span className="text-2xs font-medium text-surface-500 text-center">SET</span>
            <span className="text-2xs font-medium text-surface-500 text-center">WEIGHT</span>
            <span className="text-2xs font-medium text-surface-500 text-center">REPS</span>
            <span className="text-2xs font-medium text-surface-500 text-center">✓</span>
          </div>

          {sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              exerciseId={exercise.id}
              onUpdate={onUpdateSet}
              onToggle={onToggleSet}
              onRemove={onRemoveSet}
            />
          ))}

          <button
            onClick={() => onAddSet(exercise.id)}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl',
              'bg-surface-800/50 hover:bg-surface-800 text-surface-400 hover:text-white',
              'transition-colors text-sm font-medium'
            )}
          >
            <Plus size={16} />
            Add Set
          </button>
        </div>
      )}
    </motion.div>
  );
};
