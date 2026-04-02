import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { AnimatedRoute } from '../components/AnimatedRoute';
import type { Booking } from '../types';

const formatCurrency = (amount: number, currency: string, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
};

export const MyBookings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useMemo(() => (i18n.resolvedLanguage?.startsWith('es') ? 'es-ES' : 'en-US'), [i18n.resolvedLanguage]);

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
          headers: { Authorization: `Bearer ${token}` },
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

  const downloadBoardingPass = async (booking: Booking) => {
    try {
      const qrCode = await QRCode.toDataURL(booking.bookingReference, {
        margin: 1,
        width: 240,
      });

      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      pdf.setFontSize(22);
      pdf.text('Yellow Airline Boarding Pass', 14, 20);

      pdf.setFontSize(11);
      pdf.text(`Booking reference: ${booking.bookingReference}`, 14, 32);
      pdf.text(`Booking ID: ${booking.id}`, 14, 39);
      pdf.text(`Status: ${booking.status}`, 14, 46);

      pdf.text(`Route: ${booking.flight.origin} -> ${booking.flight.destination}`, 14, 56);
      pdf.text(`Departure: ${new Date(booking.flight.departureTime).toLocaleString(locale)}`, 14, 63);
      pdf.text(`Passengers: ${booking.adults} adults, ${booking.children} children, ${booking.infants} infants`, 14, 70);
      pdf.text(`Paid price: ${formatCurrency(booking.finalPrice, booking.currency, locale)}`, 14, 77);

      pdf.text('Scan QR at gate', 150, 32);
      pdf.addImage(qrCode, 'PNG', 150, 36, 42, 42);

      pdf.setFontSize(9);
      pdf.text('QR includes booking reference only (no personal data).', 14, 96);

      pdf.save(`boarding-pass-${booking.bookingReference}.pdf`);
    } catch {
      toast.error('No se pudo generar el boarding pass.');
    }
  };

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
            <p className="section-copy mt-2 max-w-2xl">Every confirmed route now includes payment status and boarding pass generation in one place.</p>
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
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="promo-badge promo-badge-contrast">{booking.status}</span>
                    <span className="booking-chip">{booking.bookingReference}</span>
                  </div>
                  <AnimatedRoute origin={booking.flight.origin} destination={booking.flight.destination} />
                  <div className="grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
                    <p>Base: {formatCurrency(booking.basePrice, booking.currency, locale)}</p>
                    <p>Paid: {formatCurrency(booking.finalPrice, booking.currency, locale)}</p>
                    <p>Departure: {new Date(booking.flight.departureTime).toLocaleString(locale)}</p>
                    <p>ID #{booking.id}</p>
                  </div>
                </div>

                <div className="space-y-3 lg:text-right">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">👤 {booking.adults} {t('Adultos')}</p>
                  {booking.children > 0 && <p className="text-sm font-semibold text-[var(--text-secondary)]">🧒 {booking.children} {t('Children')}</p>}
                  {booking.infants > 0 && <p className="text-sm font-semibold text-[var(--text-secondary)]">👶 {booking.infants} {t('Infants')}</p>}

                  {booking.status === 'PAID' && (
                    <button type="button" className="cta-primary" onClick={() => downloadBoardingPass(booking)}>
                      Descargar boarding pass
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
};
