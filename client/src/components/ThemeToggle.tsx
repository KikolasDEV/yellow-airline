import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1 }}
      onClick={toggleTheme}
      className="icon-button"
      aria-label={isDark ? t('theme_toggle_light') : t('theme_toggle_dark')}
    >
      <motion.span className="text-base" animate={{ rotate: isDark ? 0 : 180 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
        {isDark ? '☀' : '☾'}
      </motion.span>
    </motion.button>
  );
};
