import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
    <nav className="bg-yellow-airline p-4 px-8 shadow-lg flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
        <span className="text-2xl font-black text-black tracking-tighter">
          YELLOW AIRLINE <span className="text-sm align-top italic">GOLD</span>
        </span>
      </Link>
      
      <div className="flex gap-8 items-center">
        <button 
          onClick={toggleLanguage}
          className="bg-black/10 hover:bg-black/20 px-3 py-1 rounded-md text-xs font-bold transition-all"
        >
          {isSpanish ? '🇬🇧 EN' : '🇪🇸 ES'}
        </button>

        {isLoggedIn && (
          <span className="text-xs font-bold text-black border-r border-black/20 pr-4">
            {t('greeting')}, {userName?.toUpperCase()} 👋
          </span>
        )}

        {isLoggedIn && (
          <Link to="/my-bookings" className="font-bold hover:text-gray-700 text-black">
            {t("my_bookings")}
          </Link>
        )}
        
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            className="bg-black text-white px-6 py-2 rounded-full font-bold text-xs hover:bg-gray-800 transition-all"
          >
            {t('logout')}
          </button>
        ) : (
          <div className="flex gap-4 items-center">
            <Link to="/login" className="font-bold text-black text-sm hover:underline">
              {t('login')}
            </Link>
            <button 
              onClick={() => navigate('/vip')}
              className="bg-black text-white px-6 py-2 rounded-full font-black text-xs hover:scale-105 transition-all shadow-lg shadow-black/20"
            >
              {t('become_vip')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
