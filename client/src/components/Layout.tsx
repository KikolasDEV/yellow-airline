import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 mx-auto flex w-full max-w-7xl grow flex-col px-4 py-8 md:px-6 lg:px-8">
        <Outlet /> 
      </main>
      <footer className="relative z-10 px-4 pb-6 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-4 text-sm text-[var(--text-secondary)] backdrop-blur-xl">
          <span>© 2026 Yellow Airline Gold</span>
          <span className="hidden md:inline">Cargo-grade routing, polished cabin UX.</span>
        </div>
      </footer>
    </div>
  );
};
