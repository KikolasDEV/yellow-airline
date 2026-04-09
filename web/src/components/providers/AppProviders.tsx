'use client';

import '@/i18n/client';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './ThemeProvider';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '18px',
            background: 'var(--surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.16)',
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
};
