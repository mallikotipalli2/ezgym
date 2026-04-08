import { v4 as uuidv4 } from 'uuid';
import type { WorkoutType } from '@/types';

export const generateId = (): string => uuidv4();

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const formatDurationShort = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return volume.toLocaleString();
};

export const getWorkoutTypeColor = (type: WorkoutType): string => {
  const colors: Record<WorkoutType, string> = {
    push: 'from-rose-500 to-orange-500',
    pull: 'from-blue-500 to-cyan-500',
    legs: 'from-green-500 to-emerald-500',
    cardio: 'from-amber-500 to-yellow-500',
    custom: 'from-brand-500 to-purple-500',
  };
  return colors[type];
};

export const getWorkoutTypeIcon = (type: WorkoutType): string => {
  const icons: Record<WorkoutType, string> = {
    push: '💪',
    pull: '🏋️',
    legs: '🦵',
    cardio: '🏃',
    custom: '⚡',
  };
  return icons[type];
};

export const getWorkoutTypeBg = (type: WorkoutType): string => {
  const colors: Record<WorkoutType, string> = {
    push: 'bg-rose-500/10 text-rose-400',
    pull: 'bg-blue-500/10 text-blue-400',
    legs: 'bg-green-500/10 text-green-400',
    cardio: 'bg-amber-500/10 text-amber-400',
    custom: 'bg-brand-500/10 text-brand-400',
  };
  return colors[type];
};

export const getDaysAgo = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
};

export const isSameDay = (a: string | Date, b: string | Date): boolean => {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

export const startOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const cn = (...classes: (string | false | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
