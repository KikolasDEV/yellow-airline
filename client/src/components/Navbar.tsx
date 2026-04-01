import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isLoggedIn = !!localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const isSpanish = i18n.resolvedLanguage?.startsWith('es') ?? i18n.language.startsWith('es');

  const handleLogout = () => {
    localStorage.clear();
    toast.success(t('logout_success'));
    navigate('/');
    window.location.reload(); // Recarga limpia de estado
  };

  const toggleLanguage = () => {
    const newLang = isSpanish ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="sticky top-0 z-30 px-4 py-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[1.75rem] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-elevated)_86%,transparent_14%)] px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:px-6">
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.01]">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-lg font-black text-slate-950 shadow-[0_16px_30px_rgba(244,197,28,0.28)]">
            YA
          </span>
          <span className="text-lg font-black tracking-[-0.08em] text-[var(--text-primary)] md:text-2xl">
            YELLOW AIRLINE <span className="text-xs align-top italic text-[var(--accent-strong)] md:text-sm">GOLD</span>
          </span>
        </Link>
      
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <button 
            onClick={toggleLanguage}
            className="icon-button w-auto px-3 text-xs font-black"
          >
            {isSpanish ? '🇬🇧 EN' : '🇪🇸 ES'}
          </button>

          {isLoggedIn && (
            <span className="hidden rounded-full border border-[var(--border-soft)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] md:inline-flex">
              {t('greeting')}, {userName?.toUpperCase()} 👋
            </span>
          )}

          {isLoggedIn && (
            <Link to="/my-bookings" className="hidden font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-strong)] md:inline-flex">
              {t("my_bookings")}
            </Link>
          )}
        
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="cta-secondary px-4 py-3 text-[0.72rem]"
            >
              {t('logout')}
            </button>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/login" className="hidden text-sm font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-strong)] md:inline-flex">
                {t('login')}
              </Link>
              <button 
                onClick={() => navigate('/vip')}
                className="cta-primary px-4 py-3 text-[0.72rem]"
              >
                {t('become_vip')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
