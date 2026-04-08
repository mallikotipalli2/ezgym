import { motion } from 'framer-motion';
import { Trophy, Clock, Zap, Layers, Dumbbell, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDuration, formatVolume } from '@/lib/utils';
import type { WorkoutSummaryData } from '@/types';

interface WorkoutSummaryProps {
  summary: WorkoutSummaryData;
  onDone: () => void;
}

export const WorkoutSummary = ({ summary, onDone }: WorkoutSummaryProps) => {
  const stats = [
    { icon: Clock, label: 'Duration', value: formatDuration(summary.duration), color: 'text-blue-400' },
    { icon: Layers, label: 'Sets', value: `${summary.completedSets}/${summary.totalSets}`, color: 'text-green-400' },
    { icon: Dumbbell, label: 'Exercises', value: String(summary.exercises), color: 'text-purple-400' },
    { icon: Zap, label: 'Total Reps', value: String(summary.totalReps), color: 'text-amber-400' },
    { icon: Flame, label: 'Volume', value: `${formatVolume(summary.totalVolume)} lbs`, color: 'text-rose-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-glow-lg"
      >
        <Trophy size={36} className="text-white" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-white">Workout Complete! 🎉</h2>
        <p className="text-surface-400 mt-1">Great job finishing your session</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="bg-surface-850 border border-surface-800 rounded-2xl p-4"
          >
            <stat.icon size={20} className={stat.color} />
            <p className="text-xl font-bold text-white mt-2">{stat.value}</p>
            <p className="text-xs text-surface-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <Button variant="primary" size="xl" fullWidth onClick={onDone}>
        Back to Dashboard
      </Button>
    </motion.div>
  );
};
