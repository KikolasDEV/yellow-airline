import { useEffect, useState } from 'react';
import { getFlights } from '../services/api';
import { FlightCard } from '../components/FlightCard';
import type { Flight } from '../types';

export const Home = () => {
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => {
    getFlights().then(setFlights);
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Reserva tu próximo destino</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {flights.map(f => <FlightCard key={f.id} flight={f} />)}
      </div>
    </div>
  );
};