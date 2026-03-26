import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        <Outlet /> 
      </main>
      <footer className="bg-white border-t p-4 text-center text-gray-400 text-sm">
        © 2026 Yellow Airline - José Francisco González Amarillo - KikolasDEV.
      </footer>
    </div>
  );
};