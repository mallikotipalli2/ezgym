import { useState, useEffect } from 'react';
import { Timer, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getCompletedGymSessions } from '@/lib/db';
import { useSyncListener } from '@/hooks/useSyncListener';
import { formatDate } from '@/lib/utils';
import type { GymSession } from '@/types';

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export const GymTimeCard = () => {
  const [sessions, setSessions] = useState<GymSession[]>([]);

  const load = () => {
    getCompletedGymSessions().then(setSessions);
  };

  useEffect(load, []);
  useSyncListener(load);

  if (sessions.length === 0) return null;

  const totalMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);
  const thisWeekMs = sessions
    .filter((s) => {
      const d = new Date(s.startedAt);
      const now = new Date();
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((sum, s) => sum + s.durationMs, 0);
  const avgMs = sessions.length > 0 ? Math.round(totalMs / sessions.length) : 0;

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <Timer size={16} className="text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold">Time Spent in Gym</h3>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-400">{formatDuration(totalMs)}</p>
          <p className="text-[10px] text-surface-500 uppercase tracking-wide">Total</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-brand-400">{formatDuration(thisWeekMs)}</p>
          <p className="text-[10px] text-surface-500 uppercase tracking-wide">This Week</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-amber-400">{formatDuration(avgMs)}</p>
          <p className="text-[10px] text-surface-500 uppercase tracking-wide">Avg / Visit</p>
        </div>
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-surface-500 font-medium">Recent Sessions</p>
          {sessions.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-1.5 border-t border-surface-800">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-surface-500" />
                <span className="text-xs text-surface-400">{formatDate(s.startedAt)}</span>
              </div>
              <span className="text-xs font-semibold text-white">{formatDuration(s.durationMs)}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-surface-600 text-center">
        {sessions.length} gym visit{sessions.length !== 1 ? 's' : ''} logged
      </p>
    </Card>
  );
};
