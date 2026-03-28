import { useState } from 'react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      // Guardamos el token en localStorage para que la sesión persista
      localStorage.setItem('token', data.token);
      alert(`Bienvenido de nuevo, ${data.user.name}`);
      window.location.href = '/'; // Redirigir a inicio
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <h2 className="text-3xl font-bold mb-6 text-center">Iniciar Sesión VIP</h2>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <input 
          type="email" 
          placeholder="Tu Email" 
          className="w-full p-3 mb-4 border rounded-xl"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          className="w-full p-3 mb-6 border rounded-xl"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-yellow-airline font-bold py-3 rounded-xl"> ENTRAR </button>
      </form>
    </div>
  );
};