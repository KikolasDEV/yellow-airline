import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Sesión cerrada. ¡Vuelve pronto!");
    navigate('/');
    window.location.reload(); // Recarga limpia de estado
  };

  return (
    <nav className="bg-yellow-airline p-4 px-8 shadow-lg flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
        <span className="text-2xl font-black text-black tracking-tighter">
          YELLOW AIRLINE <span className="text-sm align-top italic">GOLD</span>
        </span>
      </Link>
      
      <div className="flex gap-8 items-center">
        {isLoggedIn && (
          <span className="text-xs font-bold text-black border-r border-black/20 pr-4">
            HOLA, {userName?.toUpperCase()} 👋
          </span>
        )}
        
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            className="bg-black text-white px-6 py-2 rounded-full font-bold text-xs hover:bg-gray-800 transition-all"
          >
            LOGOUT
          </button>
        ) : (
          <div className="flex gap-4 items-center">
            <Link to="/login" className="font-bold text-black text-sm hover:underline">
              Login
            </Link>
            <button 
              onClick={() => navigate('/vip')}
              className="bg-black text-white px-6 py-2 rounded-full font-black text-xs hover:scale-105 transition-all shadow-lg shadow-black/20"
            >
              BECOME VIP ⭐
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};