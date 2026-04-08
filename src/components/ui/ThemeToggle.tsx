import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-800 dark:bg-surface-800 border border-surface-700 text-surface-400 hover:text-white transition-all"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </motion.button>
  );
};
