import { Dumbbell, Layers, Zap, Flame } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatVolume } from '@/lib/utils';

interface VolumeChartProps {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
}

export const VolumeChart = ({ totalWorkouts, totalVolume, totalSets, totalReps }: VolumeChartProps) => {
  const stats = [
    { icon: Dumbbell, label: 'Workouts', value: String(totalWorkouts), color: 'from-brand-500 to-purple-500' },
    { icon: Flame, label: 'Volume', value: `${formatVolume(totalVolume)}`, color: 'from-rose-500 to-orange-500' },
    { icon: Layers, label: 'Sets', value: String(totalSets), color: 'from-green-500 to-emerald-500' },
    { icon: Zap, label: 'Reps', value: String(totalReps), color: 'from-amber-500 to-yellow-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} variant="gradient" padding="md" className="relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-5 rounded-bl-3xl`} />
          <stat.icon size={18} className="text-surface-400 mb-2" />
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="text-xs text-surface-400 mt-0.5">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
};
