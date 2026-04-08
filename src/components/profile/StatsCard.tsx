import { Dumbbell, Flame, Calendar, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { StreakData } from '@/types';

interface StatsCardProps {
  totalWorkouts: number;
  totalVolume: number;
  streak: StreakData;
  memberSince?: string;
}

export const StatsCard = ({ totalWorkouts, totalVolume, streak, memberSince }: StatsCardProps) => {
  const stats = [
    { icon: Dumbbell, label: 'Total Workouts', value: String(totalWorkouts), color: 'text-brand-400' },
    {
      icon: Flame,
      label: 'Total Volume',
      value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : String(totalVolume),
      color: 'text-rose-400',
    },
    { icon: Trophy, label: 'Best Streak', value: `${streak.longest} days`, color: 'text-amber-400' },
    {
      icon: Calendar,
      label: 'Member Since',
      value: memberSince
        ? new Date(memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Today',
      color: 'text-green-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} padding="md">
          <stat.icon size={18} className={stat.color} />
          <p className="text-xl font-bold text-white mt-2">{stat.value}</p>
          <p className="text-xs text-surface-400">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
};
