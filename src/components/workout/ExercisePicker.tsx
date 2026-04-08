import { useState, useMemo } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExercisesForType } from '@/lib/exercises';
import { cn } from '@/lib/utils';
import type { WorkoutType } from '@/types';

interface ExercisePickerProps {
  workoutType: WorkoutType;
  existingExercises: string[];
  onSelect: (name: string, category: string) => void;
  onClose: () => void;
}

export const ExercisePicker = ({
  workoutType,
  existingExercises,
  onSelect,
  onClose,
}: ExercisePickerProps) => {
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');

  const exercises = useMemo(() => {
    const all = getExercisesForType(workoutType);
    const filtered = all.filter(
      (ex) => !existingExercises.includes(ex.name)
    );
    if (!search) return filtered;
    return filtered.filter(
      (ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(search.toLowerCase())
    );
  }, [workoutType, existingExercises, search]);

  const groupedExercises = useMemo(() => {
    const groups: Record<string, typeof exercises> = {};
    for (const ex of exercises) {
      const group = ex.muscleGroup;
      if (!groups[group]) groups[group] = [];
      groups[group].push(ex);
    }
    return groups;
  }, [exercises]);

  const handleAddCustom = () => {
    if (customName.trim()) {
      onSelect(customName.trim(), workoutType);
      setCustomName('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-base"
          autoFocus
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Custom exercise */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add custom exercise..."
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          className="flex-1 bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm"
        />
        <button
          onClick={handleAddCustom}
          disabled={!customName.trim()}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Exercise list */}
      <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1 -mr-1">
        <AnimatePresence>
          {Object.entries(groupedExercises).map(([group, exs]) => (
            <motion.div
              key={group}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                {group}
              </h4>
              <div className="space-y-1">
                {exs.map((ex) => (
                  <motion.button
                    key={ex.name}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(ex.name, ex.muscleGroup)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-xl',
                      'bg-surface-800/50 hover:bg-surface-800 transition-colors text-left'
                    )}
                  >
                    <div>
                      <span className="text-sm font-medium text-white">{ex.name}</span>
                      {ex.equipment && (
                        <span className="text-xs text-surface-500 ml-2">{ex.equipment}</span>
                      )}
                    </div>
                    <Plus size={16} className="text-surface-500" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {exercises.length === 0 && !search && (
          <p className="text-center text-surface-500 py-4 text-sm">
            All exercises added! Use custom to add more.
          </p>
        )}
        {exercises.length === 0 && search && (
          <p className="text-center text-surface-500 py-4 text-sm">
            No matches. Try a different search or add a custom exercise.
          </p>
        )}
      </div>
    </div>
  );
};
