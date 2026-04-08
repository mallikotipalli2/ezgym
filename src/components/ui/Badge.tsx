import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({ children, variant = 'default', size = 'sm', className }: BadgeProps) => {
  const variants: Record<string, string> = {
    default: 'bg-surface-700/60 text-surface-300',
    brand: 'bg-brand-500/15 text-brand-400',
    success: 'bg-success-500/15 text-success-400',
    warning: 'bg-warning-500/15 text-warning-500',
    danger: 'bg-danger-500/15 text-danger-400',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
