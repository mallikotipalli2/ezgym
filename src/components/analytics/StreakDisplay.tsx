import { Flame, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { StreakData } from '@/types';

interface StreakDisplayProps {
  streak: StreakData;
}

export const StreakDisplay = ({ streak }: StreakDisplayProps) => {
  const hasStreak = streak.current > 0;

  return (
    <Card variant="gradient" padding="md">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              hasStreak
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25'
                : 'bg-surface-800'
            }`}
          >
            <Flame size={26} className={hasStreak ? 'text-white' : 'text-surface-500'} />
          </div>
          {hasStreak && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-2xs font-bold text-white shadow-md">
              {streak.current}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">
              {streak.current} Day{streak.current !== 1 ? 's' : ''}
            </h3>
            {streak.current >= 7 && <span className="text-lg">🔥</span>}
          </div>
          <p className="text-xs text-surface-400">
            {hasStreak ? 'Current Streak' : 'No active streak'}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-surface-400">
            <Trophy size={14} />
            <span className="text-xs font-medium">Best</span>
          </div>
          <p className="text-lg font-bold text-brand-400">{streak.longest}</p>
        </div>
      </div>
    </Card>
  );
};
