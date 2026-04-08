import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, BarChart3, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
      <div className="bg-surface-900/95 backdrop-blur-xl border-t border-surface-800">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="relative flex flex-col items-center gap-0.5 py-2 px-4 min-w-[64px]"
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -inset-2 bg-brand-500/15 rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={22}
                    className={cn(
                      'relative transition-colors duration-200',
                      isActive ? 'text-brand-400' : 'text-surface-500'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    'text-2xs font-medium transition-colors duration-200',
                    isActive ? 'text-brand-400' : 'text-surface-500'
                  )}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
