import { useEffect, useState } from 'react';
import { FlightCard } from '../components/FlightCard';
import type { Flight } from '../types';

export const Home = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  useEffect(() => {
  // Definimos la función AQUÍ dentro
  const fetchFlights = async () => {
    const url = `http://localhost:5000/api/flights?origin=${origin}&destination=${destination}`;
    const response = await fetch(url);
    const data = await response.json();
    setFlights(data);
  };

  fetchFlights();
  }, [origin, destination]);

  return (
    <div className="space-y-10">
      <header className="bg-black text-white p-10 rounded-[3rem] shadow-2xl">
        <h1 className="text-5xl font-black mb-6 italic">¿A dónde volamos hoy?</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/10 p-4 rounded-3xl backdrop-blur-md">
          <input 
            type="text" 
            placeholder="Origen (ej: Madrid)" 
            className="bg-white text-black p-4 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-airline"
            onChange={(e) => setOrigin(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Destino (ej: Paris)" 
            className="bg-white text-black p-4 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-airline"
            onChange={(e) => setDestination(e.target.value)}
          />
          <div className="flex items-center justify-center font-bold text-yellow-airline">
            {flights.length} vuelos encontrados ✈️
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {flights.map(f => <FlightCard key={f.id} flight={f} />)}
      </div>
    </div>
  );
};