import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';

const VipZone = lazy(() => import('./pages/VipZone').then((module) => ({ default: module.VipZone })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const MyBookings = lazy(() => import('./pages/MyBookings').then((module) => ({ default: module.MyBookings })));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess').then((module) => ({ default: module.CheckoutSuccess })));
const CheckoutCancel = lazy(() => import('./pages/CheckoutCancel').then((module) => ({ default: module.CheckoutCancel })));

const RouteFallback = () => {
  const { t } = useTranslation();

  return (
    <div className="surface-card px-6 py-16 text-center text-base font-semibold text-[var(--text-secondary)]">
      {t('loading_cabin')}
    </div>
  );
};

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
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="vip" element={<VipZone />} />
              <Route path="login" element={<Login />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/success" element={<CheckoutSuccess />} />
              <Route path="/cancel" element={<CheckoutCancel />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
