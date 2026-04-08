import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Repeat, Flame } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import type { PersonalRecord } from '@/types';

interface PersonalRecordsProps {
  getRecords: () => Promise<PersonalRecord[]>;
}

export const PersonalRecords = ({ getRecords }: PersonalRecordsProps) => {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecords()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [getRecords]);

  if (loading) {
    return (
      <Card variant="gradient" padding="md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-surface-800 rounded w-1/3" />
          <div className="h-12 bg-surface-800 rounded" />
          <div className="h-12 bg-surface-800 rounded" />
        </div>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card variant="gradient" padding="lg" className="text-center">
        <Trophy size={32} className="mx-auto text-surface-600 mb-2" />
        <p className="text-surface-400 text-sm">Complete workouts to see your personal records</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Trophy size={16} className="text-amber-400" />
        Personal Records
      </h3>
      <div className="space-y-2">
        {records.slice(0, 8).map((record) => (
          <Card key={record.exerciseName} padding="sm" className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{record.exerciseName}</p>
              <p className="text-xs text-surface-500">{formatDate(record.date)}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center">
                <div className="flex items-center gap-1 text-amber-400">
                  <TrendingUp size={12} />
                  <span className="text-sm font-bold">{record.maxWeight}</span>
                </div>
                <span className="text-2xs text-surface-500">lbs</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-green-400">
                  <Repeat size={12} />
                  <span className="text-sm font-bold">{record.maxReps}</span>
                </div>
                <span className="text-2xs text-surface-500">reps</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-rose-400">
                  <Flame size={12} />
                  <span className="text-sm font-bold">{record.maxVolume}</span>
                </div>
                <span className="text-2xs text-surface-500">vol</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
