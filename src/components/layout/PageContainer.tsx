import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const PageContainer = ({ children, className, noPadding }: PageContainerProps) => {
  return (
    <main
      className={cn(
        'min-h-screen max-w-lg mx-auto pb-24',
        !noPadding && 'px-4 pt-4',
        className
      )}
    >
      {children}
    </main>
  );
};
