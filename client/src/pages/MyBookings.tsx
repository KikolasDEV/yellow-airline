import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AnimatedRoute } from '../components/AnimatedRoute';
import type { Flight } from '../types';

interface Booking {
  id: number;
  userId: number;
  flightId: number;
  adults: number;
  children: number;
  infants: number;
  createdAt: string;
  flight: Flight;
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
          headers: { 'Authorization': `Bearer ${token}` },
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

  if (loading) {
    return <div className="surface-card px-6 py-16 text-center text-lg font-bold text-[var(--text-secondary)]">{t('load_bookings')}</div>;
  }

  return (
    <div className="space-y-6 py-4">
      <section className="surface-card p-6 md:p-8">
        <p className="eyebrow">Passenger Ledger</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title">{t('my_bookings')}</h1>
            <p className="section-copy mt-2 max-w-2xl">Every confirmed route now sits in a calmer ledger with the same premium visual language as the search and booking flow.</p>
          </div>
          <div className="booking-chip booking-chip-strong">{bookings.length} active booking{bookings.length === 1 ? '' : 's'}</div>
        </div>
      </section>

      {bookings.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <p className="text-xl font-semibold text-[var(--text-secondary)]">{t('no_bookings')}</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <motion.article key={booking.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="promo-badge promo-badge-contrast">{t('confirmed')}</span>
                    <span className="booking-chip">#{booking.id}00{booking.flightId}</span>
                  </div>
                  <AnimatedRoute origin={booking.flight.origin} destination={booking.flight.destination} />
                </div>

                <div className="space-y-3 lg:text-right">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">👤 {booking.adults} {t('Adultos')}</p>
                  {booking.children > 0 && <p className="text-sm font-semibold text-[var(--text-secondary)]">🧒 {booking.children} {t('Children')}</p>}
                  {booking.infants > 0 && <p className="text-sm font-semibold text-[var(--text-secondary)]">👶 {booking.infants} {t('Infants')}</p>}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
};
