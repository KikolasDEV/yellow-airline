import type { Flight } from '../types';
import toast from 'react-hot-toast';

interface Props {
  flight: Flight;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const FlightCard = ({ flight }: Props) => {
  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error("Debes ser miembro VIP para reservar", {
        icon: '🔒',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ flightId: flight.id })
      });

      if (response.ok) {
        toast.success(`¡Vuelo a ${flight.destination} reservado!`, {
          duration: 4000,
          position: 'bottom-center',
        });
      } else {
        toast.error('No se pudo procesar la reserva');
      }
    } catch {
      toast.error("Fallo de conexión con la aerolínea");
    }
  };

  return (
    <div className="group border border-gray-200 rounded-3xl p-6 hover:shadow-2xl transition-all bg-white flex flex-col justify-between hover:-translate-y-1">
      <div className="flex justify-between items-center mb-6">
        <div className="text-center">
          <span className="block text-3xl font-black uppercase leading-none">{flight.origin.substring(0,3)}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">{flight.origin}</span>
        </div>
        <div className="flex-1 flex flex-col items-center px-4">
          <span className="text-yellow-airline text-xl animate-pulse">✈️</span>
          <div className="w-full h-0.5 bg-gray-100 mt-1"></div>
        </div>
        <div className="text-center">
          <span className="block text-3xl font-black uppercase leading-none">{flight.destination.substring(0,3)}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">{flight.destination}</span>
        </div>
      </div>

      <div className="flex justify-between items-end border-t border-gray-50 pt-4">
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Salida</p>
          <p className="text-gray-700 font-bold text-sm">{formatDate(flight.departureTime)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-black mb-2">{flight.price}€</p>
          <button 
            onClick={handleBooking} 
            className="bg-yellow-airline px-6 py-2 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-black hover:text-yellow-airline transition-all shadow-md active:scale-95"
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
};