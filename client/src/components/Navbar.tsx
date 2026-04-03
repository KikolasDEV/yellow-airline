import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isLoggedIn = !!localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const activeLanguage = i18n.resolvedLanguage?.startsWith('es') ?? i18n.language.startsWith('es') ? 'es' : 'en';

  const jumpToSection = (sectionId: string) => {
    const scrollToTarget = () => {
      window.requestAnimationFrame(() => {
        const target = document.getElementById(sectionId);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };

    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(scrollToTarget, 160);
    } else {
      scrollToTarget();
    }

    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success(t('logout_success'));
    setIsMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const setLanguage = (languageCode: 'es' | 'en') => {
    i18n.changeLanguage(languageCode);
  };

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsMenuOpen(false);
    navigate('/');
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 120);
  };

  return (
    <nav className="navbar-shell fixed inset-x-0 top-0 z-40 px-4 py-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3">
        <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,transparent_12%)] px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3 transition-transform hover:scale-[1.01]" onClick={handleBrandClick}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-lg font-black text-slate-950 shadow-[0_16px_30px_rgba(244,197,28,0.28)]">
              YA
            </span>
            <span className="min-w-0">
              <span className="hidden truncate text-sm font-semibold tracking-[0.18em] text-[var(--text-muted)] min-[440px]:block md:text-xs">{t('nav_editorial_cabin')}</span>
              <span className="display-title block truncate text-[1.5rem] text-[var(--text-primary)] min-[440px]:text-[1.9rem] md:text-[2rem]">
                Yellow Airline <span className="text-[var(--accent-strong)]">Gold</span>
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            <button type="button" className="nav-link" onClick={() => jumpToSection('offers-section')}>
              {t('nav_offers')}
            </button>
            <button type="button" className="nav-link" onClick={() => jumpToSection('inventory-section')}>
              {t('nav_flights')}
            </button>
            {isLoggedIn && userName && (
              <span className="rounded-full border border-[var(--border-soft)] px-3 py-2 text-xs font-bold text-[var(--text-primary)]">
                {t('greeting')}, {userName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <div className="lang-switch" role="group" aria-label="Language selector">
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={activeLanguage === 'es' ? 'lang-flag lang-flag-active' : 'lang-flag'}
                aria-label="Cambiar a español"
              >
                🇪🇸
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={activeLanguage === 'en' ? 'lang-flag lang-flag-active' : 'lang-flag'}
                aria-label="Switch to English"
              >
                🇬🇧
              </button>
            </div>
            {isLoggedIn ? (
              <div className="hidden lg:block">
                <button onClick={handleLogout} className="cta-secondary px-4 py-3 text-[0.72rem]">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <button onClick={() => navigate('/login')} className="cta-secondary px-4 py-3 text-[0.72rem]">
                  {t('login')}
                </button>
                <button onClick={() => navigate('/vip')} className="cta-primary px-4 py-3 text-[0.72rem]">
                  {t('become_vip')}
                </button>
              </div>
            )}
            <div className="lg:hidden">
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                aria-label={t('nav_menu')}
              >
                <span className="text-lg">{isMenuOpen ? '×' : '≡'}</span>
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mobile-menu-panel px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {isLoggedIn && userName && (
                <div className="rounded-[1.25rem] border border-[var(--border-soft)] px-4 py-3 text-sm text-[var(--text-primary)]">
                  {t('greeting')}, <strong>{userName}</strong>
                </div>
              )}

              <button
                type="button"
                className="rounded-[1.2rem] border border-[var(--border-soft)] px-4 py-3 text-left text-sm font-bold text-[var(--text-primary)]"
                onClick={() => jumpToSection('offers-section')}
              >
                {t('nav_offers')}
              </button>

              <button
                type="button"
                className="rounded-[1.2rem] border border-[var(--border-soft)] px-4 py-3 text-left text-sm font-bold text-[var(--text-primary)]"
                onClick={() => jumpToSection('inventory-section')}
              >
                {t('nav_flights')}
              </button>

              {isLoggedIn && (
                <Link
                  to="/my-bookings"
                  className="rounded-[1.2rem] border border-[var(--border-soft)] px-4 py-3 text-sm font-bold text-[var(--text-primary)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('my_bookings')}
                </Link>
              )}

              {isLoggedIn ? (
                <button onClick={handleLogout} className="cta-secondary">
                  {t('logout')}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/login');
                    }}
                    className="cta-secondary"
                  >
                    {t('login')}
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/vip');
                    }}
                    className="cta-primary"
                  >
                    {t('become_vip')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
