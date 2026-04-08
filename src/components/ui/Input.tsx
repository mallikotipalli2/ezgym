import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-surface-300">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white',
              'placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
              'transition-all duration-200 text-base',
              icon ? 'pl-10' : undefined,
              error && 'border-danger-500 focus:ring-danger-500/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
