// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { VipZone } from './pages/VipZone';
import { Login } from './pages/Login';
import { MyBookings } from './pages/MyBookings';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="vip" element={<VipZone />} />
            <Route path="login" element={<Login />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
