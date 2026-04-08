import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { GymToggle } from '@/components/ui/GymToggle';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  hideThemeToggle?: boolean;
  className?: string;
}

export const Header = ({ title, subtitle, action, hideThemeToggle, className }: HeaderProps) => {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-surface-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {action}
        {!hideThemeToggle && <ThemeToggle />}
        <GymToggle />
      </div>
    </div>
  );
};
