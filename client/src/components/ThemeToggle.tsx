import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1 }}
      onClick={toggleTheme}
      className="icon-button"
      aria-label={isDark ? 'Activate light mode' : 'Activate dark mode'}
    >
      <span className="text-base">{isDark ? '☀' : '☾'}</span>
    </motion.button>
  );
};
