import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn, getWorkoutTypeIcon } from '@/lib/utils';
import type { WorkoutType } from '@/types';

const typeAccents: Record<WorkoutType, { border: string; iconBg: string; text: string }> = {
  push: { border: 'border-rose-500/20 hover:border-rose-500/40', iconBg: 'bg-rose-500/10', text: 'text-rose-400' },
  pull: { border: 'border-blue-500/20 hover:border-blue-500/40', iconBg: 'bg-blue-500/10', text: 'text-blue-400' },
  legs: { border: 'border-emerald-500/20 hover:border-emerald-500/40', iconBg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  cardio: { border: 'border-amber-500/20 hover:border-amber-500/40', iconBg: 'bg-amber-500/10', text: 'text-amber-400' },
  custom: { border: 'border-brand-500/20 hover:border-brand-500/40', iconBg: 'bg-brand-500/10', text: 'text-brand-400' },
};

interface WorkoutCardProps {
  type: WorkoutType;
  label: string;
  description: string;
  onSelect: (type: WorkoutType) => void;
}

export const WorkoutCard = ({ type, label, description, onSelect }: WorkoutCardProps) => {
  const accent = typeAccents[type];

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(type)}
      className={cn(
        'w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200',
        'bg-surface-850 border',
        accent.border,
        'active:bg-surface-800'
      )}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0', accent.iconBg)}>
        {getWorkoutTypeIcon(type)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold">{label}</h3>
        <p className={cn('text-xs mt-0.5', accent.text)}>{description}</p>
      </div>
      <ChevronRight size={18} className="text-surface-500 flex-shrink-0" />
    </motion.button>
  );
};
