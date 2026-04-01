import { createContext, useContext } from 'react';

type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};
