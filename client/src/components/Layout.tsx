import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from './Navbar';

export const Layout = () => {
  const { t } = useTranslation();

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] grow flex-col px-4 pt-28 pb-6 md:px-6 md:pt-32 md:pb-8 lg:px-8 lg:pt-32 lg:pb-10">
        <Outlet />
      </main>
      <footer className="relative z-10 px-4 pb-6 md:px-6 md:pb-8 lg:px-8 lg:pb-10">
        <div className="section-frame mx-auto max-w-[1440px] px-5 py-6 md:px-7 md:py-7">
          <div className="relative z-10 grid gap-6 md:grid-cols-[1.3fr_repeat(2,minmax(0,1fr))]">
            <div className="space-y-3">
              <p className="footer-label">Yellow Airline Gold</p>
              <p className="display-title text-[2rem] text-[var(--text-primary)] md:text-[2.35rem]">{t('layout_footer_title')}</p>
              <p className="max-w-xl text-sm leading-7 text-[var(--text-secondary)]">{t('layout_footer_copy')}</p>
            </div>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p className="footer-label">{t('layout_footer_product')}</p>
              <p>{t('layout_footer_product_discovery')}</p>
              <p>{t('layout_footer_product_vip')}</p>
              <p>{t('layout_footer_product_bookings')}</p>
            </div>
            <div className="space-y-2 text-sm text-[var(--text-secondary)] md:text-right">
              <p className="footer-label">{t('layout_footer_edition')}</p>
              <p>{t('layout_footer_responsive')}</p>
              <p>{t('layout_footer_modes')}</p>
              <p>© 2026 Yellow Airline Gold</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
