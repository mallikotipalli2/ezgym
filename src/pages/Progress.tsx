import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { WeeklyChart } from '@/components/analytics/WeeklyChart';
import { StreakDisplay } from '@/components/analytics/StreakDisplay';
import { VolumeChart } from '@/components/analytics/VolumeChart';
import { PersonalRecords } from '@/components/analytics/PersonalRecords';
import { GymTimeCard } from '@/components/analytics/GymTimeCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getDaysAgo, getWorkoutTypeIcon, getWorkoutTypeBg, formatDurationShort } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const Progress = () => {
  const {
    loading,
    weeklyData,
    streak,
    totalWorkouts,
    totalVolume,
    totalSets,
    totalReps,
    recentWorkouts,
    getPersonalRecords,
  } = useAnalytics();

  if (loading) {
    return (
      <PageContainer>
        <Header title="Progress" />
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (totalWorkouts === 0) {
    return (
      <PageContainer>
        <Header title="Progress" subtitle="Track your fitness journey" />
        <GymTimeCard />
        <Card padding="lg" className="text-center mt-4">
          <BarChart3 size={48} className="mx-auto text-surface-600 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No workout data yet</h3>
          <p className="text-sm text-surface-400">
            Complete your first workout to start seeing progress analytics.
          </p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <Header title="Progress" subtitle="Your fitness journey" />
        </motion.div>

        <motion.div variants={item}>
          <WeeklyChart data={weeklyData} />
        </motion.div>

        <motion.div variants={item}>
          <StreakDisplay streak={streak} />
        </motion.div>

        <motion.div variants={item}>
          <VolumeChart
            totalWorkouts={totalWorkouts}
            totalVolume={totalVolume}
            totalSets={totalSets}
            totalReps={totalReps}
          />
        </motion.div>

        <motion.div variants={item}>
          <PersonalRecords getRecords={getPersonalRecords} />
        </motion.div>

        <motion.div variants={item}>
          <GymTimeCard />
        </motion.div>

        {/* Workout history */}
        <motion.div variants={item} className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Workout History</h3>
          <div className="space-y-2">
            {recentWorkouts.map((workout) => {
              const duration = workout.completedAt
                ? new Date(workout.completedAt).getTime() - new Date(workout.startedAt).getTime()
                : 0;
              return (
                <Card key={workout.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getWorkoutTypeIcon(workout.type)}</span>
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
      </motion.div>
    </PageContainer>
  );
};
