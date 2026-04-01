import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlightCard } from '../components/FlightCard';
import { FlightSkeleton } from '../components/FlightSkeleton';
import type { Flight } from '../types';

export const Home = () => {
  const { t } = useTranslation();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setHasError(false);
      try {
        const url = `http://localhost:5000/api/flights?origin=${origin}&destination=${destination}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Flights request failed');
        }

        const data = await response.json();
        setFlights(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener vuelos:", error);
        setFlights([]);
        setHasError(true);
      } finally {
        // Simulamos un pequeño retraso para que el Skeleton sea visible y no haya parpadeo
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchFlights();
  }, [origin, destination]);

  return (
    <div className="space-y-10">
      <header className="bg-black text-white p-10 rounded-[3rem] shadow-2xl">
        <h1 className="text-5xl font-black mb-6 italic tracking-tighter">{t('welcome')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/10 p-4 rounded-3xl backdrop-blur-md">
          <input 
            type="text" 
            placeholder={t('search_origin_placeholder')}
            className="bg-white text-black p-4 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-airline transition-all"
            onChange={(e) => setOrigin(e.target.value)}
          />
          <input 
            type="text" 
            placeholder={t('search_dest_placeholder')}
            className="bg-white text-black p-4 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-airline transition-all"
            onChange={(e) => setDestination(e.target.value)}
          />
          <div className="flex items-center justify-center font-bold text-yellow-airline text-lg">
            {loading ? t('searching') : `${flights.length} ${t('flights_found')}`}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          // Mostramos 6 esqueletos mientras carga
          Array(6).fill(0).map((_, i) => <FlightSkeleton key={i} />)
        ) : hasError ? (
          <div className="col-span-full rounded-[2rem] border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
            <p className="text-xl font-bold">{t('load_flights_error')}</p>
          </div>
        ) : flights.length > 0 ? (
          flights.map(f => <FlightCard key={f.id} flight={f} />)
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-2xl text-gray-400 font-medium">{t('no_routes')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
