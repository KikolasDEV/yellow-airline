import { useState } from 'react';
import type { Flight } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { PassengerSelector } from './PassengerSelector';

interface Props {
  flight: Flight;
}

export const FlightCard = ({ flight }: Props) => {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.resolvedLanguage?.startsWith('es') ?? i18n.language.startsWith('es');
  
  // Estado para el desglose de pasajeros
  const [passengers, setPassengers] = useState({ 
    adults: 1, 
    children: 0, 
    infants: 0 
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isSpanish ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error(t('members_only_booking'), {
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
        // Enviamos el flightId y el desglose de pasajeros
        body: JSON.stringify({ 
          flightId: flight.id,
          ...passengers
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${t("¡Vuelo a")} ${flight.destination} ${t("reservado!")}`, {
          duration: 4000,
          position: 'bottom-center',
        });
      } else {
        // Mostramos el error específico del backend (ej: "Ya tienes este vuelo")
        toast.error(data.error || t('booking_failed'));
      }
    } catch {
      toast.error(t('booking_connection_error'));
    }
  };

  return (
    <div className="group border border-gray-200 rounded-3xl p-6 hover:shadow-2xl transition-all bg-white flex flex-col hover:-translate-y-1">
      {/* Cabecera: Origen y Destino */}
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

      {/* Selector de Pasajeros integrado */}
      <PassengerSelector count={passengers} setCount={setPassengers} />

      {/* Footer: Precio y Botón */}
      <div className="flex justify-between items-end border-t border-gray-50 pt-4 mt-4">
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t("Salida")}</p>
          <p className="text-gray-700 font-bold text-sm">{formatDate(flight.departureTime)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-black mb-2">{flight.price}€</p>
          <button 
            onClick={handleBooking} 
            className="bg-yellow-airline px-6 py-3 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-black hover:text-yellow-airline transition-all shadow-md active:scale-95"
          >
            {t("book_now")}
          </button>
        </div>
      </div>
    </div>
  );
};
