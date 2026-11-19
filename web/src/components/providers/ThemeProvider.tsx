'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from '@/hooks/useTheme';
import type { ThemeContextValue } from '@/hooks/useTheme';

const STORAGE_KEY = 'yellow-airline-theme';
const subscribe = (notify: () => void) => {
  window.addEventListener('storage', notify);
  window.addEventListener('theme-changed', notify);
  return () => { window.removeEventListener('storage', notify); window.removeEventListener('theme-changed', notify); };
};
const readTheme = (): 'light' | 'dark' => {
  try { return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'; }
  catch { return 'dark'; }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useSyncExternalStore<'light' | 'dark'>(subscribe, readTheme, () => 'dark');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const value = useMemo<ThemeContextValue>(() => ({
    theme, isDark: theme === 'dark',
    toggleTheme: () => {
      try {
        localStorage.setItem(STORAGE_KEY, theme === 'dark' ? 'light' : 'dark');
        window.dispatchEvent(new Event('theme-changed'));
      } catch { /* Preference storage unavailable. */ }
    },
  }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
