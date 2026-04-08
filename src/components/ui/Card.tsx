import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hoverable, children, ...props }, ref) => {
    const base = 'rounded-2xl transition-all duration-200';

    const variants: Record<string, string> = {
      default: 'bg-surface-850 dark:bg-surface-850 border border-surface-800',
      elevated: 'bg-surface-850 shadow-lg shadow-black/20 border border-surface-800',
      outlined: 'bg-transparent border border-surface-700',
      gradient: 'bg-gradient-to-br from-surface-850 to-surface-900 border border-surface-800',
    };

    const paddings: Record<string, string> = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          base,
          variants[variant],
          paddings[padding],
          hoverable && 'hover:border-surface-600 hover:shadow-lg cursor-pointer active:scale-[0.99]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
