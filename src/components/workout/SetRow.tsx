import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkoutSet } from '@/types';

interface SetRowProps {
  set: WorkoutSet;
  exerciseId: string;
  onUpdate: (setId: string, exerciseId: string, changes: Partial<WorkoutSet>) => void;
  onToggle: (setId: string, exerciseId: string) => void;
  onRemove: (setId: string, exerciseId: string) => void;
}

export const SetRow = ({ set, exerciseId, onUpdate, onToggle, onRemove }: SetRowProps) => {
  const [weight, setWeight] = useState(String(set.weight || ''));
  const [reps, setReps] = useState(String(set.reps || ''));
  const [showDelete, setShowDelete] = useState(false);
  const weightRef = useRef<HTMLInputElement>(null);
  const repsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWeight(String(set.weight || ''));
    setReps(String(set.reps || ''));
  }, [set.weight, set.reps]);

  const commitWeight = () => {
    const val = parseFloat(weight) || 0;
    if (val !== set.weight) {
      onUpdate(set.id, exerciseId, { weight: val });
    }
  };

  const commitReps = () => {
    const val = parseInt(reps) || 0;
    if (val !== set.reps) {
      onUpdate(set.id, exerciseId, { reps: val });
    }
  };

  return (
    <motion.div
      className={cn(
        'grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center',
        set.completed && 'opacity-70'
      )}
      onTouchStart={() => setShowDelete(false)}
    >
      {/* Set number */}
      <button
        onDoubleClick={() => onRemove(set.id, exerciseId)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-800 text-surface-400 text-xs font-bold"
        title="Double-tap to remove"
      >
        {set.setNumber}
      </button>

      {/* Weight input */}
      <input
        ref={weightRef}
        type="number"
        inputMode="decimal"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={commitWeight}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitWeight();
            repsRef.current?.focus();
          }
        }}
        placeholder="0"
        className={cn(
          'w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-center text-sm font-medium text-white',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all',
          'placeholder:text-surface-600',
          set.completed && 'bg-success-500/5 border-success-500/20'
        )}
      />

      {/* Reps input */}
      <input
        ref={repsRef}
        type="number"
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={commitReps}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitReps();
            onToggle(set.id, exerciseId);
          }
        }}
        placeholder="0"
        className={cn(
          'w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5 text-center text-sm font-medium text-white',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all',
          'placeholder:text-surface-600',
          set.completed && 'bg-success-500/5 border-success-500/20'
        )}
      />

      {/* Complete toggle */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onToggle(set.id, exerciseId)}
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-xl transition-all',
          set.completed
            ? 'bg-success-500 text-white shadow-md shadow-success-500/30'
            : 'bg-surface-800 text-surface-500 hover:bg-surface-700 border border-surface-700'
        )}
      >
        {set.completed ? <Check size={16} strokeWidth={3} /> : <Check size={16} />}
      </motion.button>
    </motion.div>
  );
};
