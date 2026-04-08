import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar = ({ src, name, size = 'md', className }: AvatarProps) => {
  const sizes: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const iconSizes: Record<string, number> = {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
  };

  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-brand-500 to-brand-700 text-white overflow-hidden flex-shrink-0',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : initials ? (
        initials
      ) : (
        <User size={iconSizes[size]} />
      )}
    </div>
  );
};
