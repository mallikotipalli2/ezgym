import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StreakDisplay } from '@/components/analytics/StreakDisplay';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getProfile, getActiveWorkout } from '@/lib/db';
import { getDaysAgo, getWorkoutTypeBg, getWorkoutTypeIcon, formatDurationShort } from '@/lib/utils';
import type { Profile, Workout } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { streak, weeklyData, recentWorkouts, totalWorkouts, totalVolume, refresh } = useAnalytics();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    getProfile().then((p) => setProfile(p || null));
    getActiveWorkout().then((w) => setActiveWorkout(w || null));
    refresh();
  }, [refresh]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const weekWorkouts = weeklyData.reduce((sum, d) => sum + d.workouts, 0);

  return (
    <PageContainer>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* Greeting */}
        <motion.div variants={item}>
          <Header
            title={`${greeting()}${profile?.name ? `, ${profile.name}` : ''}`}
            subtitle={totalWorkouts > 0 ? `${weekWorkouts} workouts this week` : "Let's get started"}
          />
        </motion.div>

        {/* Active workout banner */}
        {activeWorkout && (
          <motion.div variants={item}>
            <Card
              hoverable
              padding="md"
              className="border-brand-500/30 bg-brand-500/5"
              onClick={() => navigate('/workout')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <Dumbbell size={20} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Workout in progress</p>
                    <p className="text-xs text-surface-400">{activeWorkout.name}</p>
                  </div>
                </div>
                <Badge variant="brand">Continue →</Badge>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick start */}
        {!activeWorkout && (
          <motion.div variants={item}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/workout')}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-2xl p-5 text-left shadow-glow transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                    <Dumbbell size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Start Workout</p>
                    <p className="text-sm text-white/70">Choose a workout type</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-white/60" />
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Streak */}
        <motion.div variants={item}>
          <StreakDisplay streak={streak} />
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item}>
          <div className="grid grid-cols-2 gap-3">
            <Card padding="md" hoverable onClick={() => navigate('/progress')}>
              <TrendingUp size={18} className="text-brand-400 mb-2" />
              <p className="text-xl font-bold text-white">{totalWorkouts}</p>
              <p className="text-xs text-surface-400">Total Workouts</p>
            </Card>
            <Card padding="md" hoverable onClick={() => navigate('/progress')}>
              <Clock size={18} className="text-amber-400 mb-2" />
              <p className="text-xl font-bold text-white">
                {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : totalVolume}
              </p>
              <p className="text-xs text-surface-400">Total Volume (lbs)</p>
            </Card>
          </div>
        </motion.div>

        {/* Recent workouts */}
        {recentWorkouts.length > 0 && (
          <motion.div variants={item} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Workouts</h3>
              <button
                onClick={() => navigate('/progress')}
                className="text-xs text-brand-400 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentWorkouts.slice(0, 5).map((workout) => {
                const duration = workout.completedAt
                  ? new Date(workout.completedAt).getTime() - new Date(workout.startedAt).getTime()
                  : 0;
                return (
                  <Card key={workout.id} padding="sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getWorkoutTypeIcon(workout.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{workout.name}</p>
                        <p className="text-xs text-surface-500">
                          {workout.completedAt && getDaysAgo(workout.completedAt)}
                          {duration > 0 && ` · ${formatDurationShort(duration)}`}
                        </p>
                      </div>
                      <Badge size="sm" className={getWorkoutTypeBg(workout.type)}>
                        {workout.type}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {recentWorkouts.length === 0 && (
          <motion.div variants={item}>
            <Card padding="lg" className="text-center">
              <Dumbbell size={40} className="mx-auto text-surface-600 mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">No workouts yet</h3>
              <p className="text-sm text-surface-400">
                Start your first workout and track your gains!
              </p>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
};
