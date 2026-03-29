import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  // Comprobamos si hay un token para saber si el usuario está logueado
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <nav className="bg-yellow-airline p-4 shadow-md flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-2xl font-bold text-black tracking-tighter">
          YELLOW AIRLINE ✈️
        </span>
      </Link>
      
      <div className="flex gap-6 items-center">
        <Link to="/" className="font-bold hover:text-gray-700 text-black">Vuelos</Link>
        
        {isLoggedIn ? (
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="bg-black text-white px-4 py-2 rounded-full font-bold text-sm"
          >
            Cerrar Sesión
          </button>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="font-bold text-black border-2 border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all text-sm">
              Iniciar Sesión
            </Link>
            <button 
              onClick={() => navigate('/vip')}
              className="bg-black text-white px-5 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg text-sm"
            >
              Área VIP ⭐
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};