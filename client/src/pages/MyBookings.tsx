import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { Flight } from '../types';

interface Booking {
  id: number;
  userId: number;   
  flightId: number; 
  adults: number;
  children: number;
  infants: number;
  createdAt: string; // En el front llega como string (ISO date)
  flight: Flight;    // La relación que traemos con el "include" del backend
}

export const MyBookings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error(t('members_only_booking'));
        navigate('/login');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Failed to load bookings');
        }

        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setBookings([]);
        toast.error(t('load_bookings_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, [navigate, t]);

  if (loading) return <div className="text-center py-20 font-bold italic">{t('load_bookings')}</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-black mb-10 italic uppercase tracking-tighter">
        {t("my_bookings")} 🧳
      </h1>

      {bookings.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] text-center shadow-xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">{t('no_bookings')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-8 rounded-3xl shadow-lg border-l-8 border-yellow-airline flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-black leading-none">{booking.flight.origin}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{t('origin_label')}</p>
                </div>
                <span className="text-2xl italic text-yellow-airline font-black">➔</span>
                <div className="text-center">
                  <p className="text-2xl font-black leading-none">{booking.flight.destination}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{t('destination_label')}</p>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end">
                <p className="text-xs font-bold text-gray-400 uppercase">{t('passengers_label')}</p>
                <div className="flex gap-2 text-sm font-bold">
                  <span>👤 {booking.adults} {t("Adultos")}</span>
                  {booking.children > 0 && <span>🧒 {booking.children} {t('Children')}</span>}
                  {booking.infants > 0 && <span>👶 {booking.infants} {t('Infants')}</span>}
                </div>
                <p className="mt-2 text-xs bg-gray-100 px-3 py-1 rounded-full font-bold">
                  {t('confirmed')}: #{booking.id}00{booking.flightId}
                </p>
                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};
