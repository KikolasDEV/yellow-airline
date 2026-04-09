import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] grow flex-col px-4 pt-28 pb-6 md:px-6 md:pt-32 md:pb-8 lg:px-8 lg:pt-32 lg:pb-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};
