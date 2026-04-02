import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isLoggedIn = !!localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const isSpanish = i18n.resolvedLanguage?.startsWith('es') ?? i18n.language.startsWith('es');
  const navLinks = isLoggedIn
    ? [{ to: '/my-bookings', label: t('my_bookings') }]
    : [
        { to: '/login', label: t('login') },
        { to: '/vip', label: t('become_vip') },
      ];

  const handleLogout = () => {
    localStorage.clear();
    toast.success(t('logout_success'));
    setIsMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const toggleLanguage = () => {
    const newLang = isSpanish ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="sticky top-0 z-30 px-4 py-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3">
        <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,transparent_12%)] px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3 transition-transform hover:scale-[1.01]" onClick={() => setIsMenuOpen(false)}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-lg font-black text-slate-950 shadow-[0_16px_30px_rgba(244,197,28,0.28)]">
              YA
            </span>
            <span className="min-w-0">
              <span className="hidden truncate text-sm font-black tracking-[0.28em] text-[var(--text-muted)] min-[440px]:block md:text-xs">{t('nav_editorial_cabin')}</span>
              <span className="display-title block truncate text-[1.65rem] text-[var(--text-primary)] min-[440px]:text-2xl md:text-[2.15rem]">
                Yellow Airline <span className="text-[var(--accent-strong)]">Gold</span>
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            {navLinks.map((item) => (
              <Link key={item.to} to={item.to} className="nav-link">
                {item.label}
              </Link>
            ))}
            {isLoggedIn && userName && (
              <span className="rounded-full border border-[var(--border-soft)] px-3 py-2 text-xs font-bold text-[var(--text-primary)]">
                {t('greeting')}, {userName.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <button onClick={toggleLanguage} className="icon-button w-auto px-3 text-xs font-black">
              {isSpanish ? 'EN' : 'ES'}
            </button>
            {isLoggedIn ? (
              <div className="hidden lg:block">
                <button onClick={handleLogout} className="cta-secondary px-4 py-3 text-[0.72rem]">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="hidden lg:block">
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

              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-[1.2rem] border border-[var(--border-soft)] px-4 py-3 text-sm font-bold text-[var(--text-primary)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {isLoggedIn ? (
                <button onClick={handleLogout} className="cta-secondary">
                  {t('logout')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/vip');
                  }}
                  className="cta-primary"
                >
                  {t('become_vip')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
