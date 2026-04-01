import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from '../hooks/useTheme';
import type { ThemeContextValue } from '../hooks/useTheme';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'yellow-airline-theme';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => {
      setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark');
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
