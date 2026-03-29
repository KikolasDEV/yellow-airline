import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        navigate('/'); // Usamos navigate en lugar de window.location para mejor UX
      } else {
        alert(data.error);
      }
    } catch {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black italic uppercase tracking-tight">Welcome Back</h2>
        <p className="text-gray-500">Accede a tu cuenta VIP de Yellow Airline</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase ml-2 text-gray-400">Email</label>
          <input 
            type="email" 
            required
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-airline outline-none transition-all"
            placeholder="ejemplo@yellow.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase ml-2 text-gray-400">Contraseña</label>
          <input 
            type="password" 
            required
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-airline outline-none transition-all"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full bg-yellow-airline text-black font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 uppercase">
          Despegar ✈️
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Aún no eres miembro?{' '}
          <Link to="/vip" className="text-black font-bold underline hover:text-yellow-600">
            Únete al Club VIP
          </Link>
        </p>
      </form>
    </div>
  );
};