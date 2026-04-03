import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { AnimatedRoute } from '../components/AnimatedRoute';
import { apiUrl } from '../lib/api';
import { translatePlaceLabel } from '../lib/places';
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
        const response = await fetch(apiUrl('/bookings/my-bookings'), {
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
      const localizedOrigin = translatePlaceLabel(booking.flight.origin, t);
      const localizedDestination = translatePlaceLabel(booking.flight.destination, t);
      const qrCode = await QRCode.toDataURL(booking.bookingReference, {
        margin: 1,
        width: 240,
      });

      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      pdf.setFontSize(22);
      pdf.text(t('pdf_title'), 14, 20);

      pdf.setFontSize(11);
      pdf.text(`${t('pdf_booking_reference')}: ${booking.bookingReference}`, 14, 32);
      pdf.text(`${t('pdf_booking_id')}: ${booking.id}`, 14, 39);
      pdf.text(`${t('pdf_status')}: ${t(`status_${booking.status.toLowerCase()}`)}`, 14, 46);

      pdf.text(`${t('pdf_route')}: ${localizedOrigin} -> ${localizedDestination}`, 14, 56);
      pdf.text(`${t('pdf_departure')}: ${new Date(booking.flight.departureTime).toLocaleString(locale)}`, 14, 63);
      pdf.text(`${t('pdf_passengers')}: ${t('pdf_passenger_line', { adults: booking.adults, children: booking.children, infants: booking.infants })}`, 14, 70);
      pdf.text(`${t('pdf_paid_price')}: ${formatCurrency(booking.finalPrice, booking.currency, locale)}`, 14, 77);

      pdf.text(t('pdf_scan_qr'), 150, 32);
      pdf.addImage(qrCode, 'PNG', 150, 36, 42, 42);

      pdf.setFontSize(9);
      pdf.text(t('pdf_qr_note'), 14, 96);

      pdf.save(`boarding-pass-${booking.bookingReference}.pdf`);
    } catch {
      toast.error(t('boarding_pass_error'));
    }
  };

  if (loading) {
    return <div className="surface-card px-6 py-16 text-center text-lg font-bold text-(--text-secondary)]">{t('load_bookings')}</div>;
  }

  return (
    <div className="space-y-6 py-4">
      <section className="section-frame p-5 md:p-6 lg:p-8">
        <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-end">
          <div>
            <p className="eyebrow">{t('bookings_eyebrow')}</p>
            <div className="mt-3 flex flex-col gap-4">
              <div>
                <h1 className="section-title text-4xl md:text-6xl">{t('my_bookings')}</h1>
                <p className="section-copy mt-3 max-w-2xl">{t('bookings_copy')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="booking-chip booking-chip-strong">{bookings.length === 1 ? t('bookings_active', { count: bookings.length }) : t('bookings_active_plural', { count: bookings.length })}</span>
                <span className="booking-chip">{t('bookings_responsive')}</span>
                <span className="booking-chip">{t('bookings_boarding_pass_ready')}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="stat-tile">
              <p className="stat-kicker">{t('bookings_portfolio')}</p>
              <p className="stat-value mt-3">{String(bookings.length).padStart(2, '0')}</p>
            </div>
            <div className="stat-tile">
              <p className="stat-kicker">{t('bookings_locale')}</p>
              <p className="stat-value mt-3">{locale === 'es-ES' ? 'ES' : 'US'}</p>
            </div>
          </div>
        </div>
      </section>

      {bookings.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <p className="text-xl font-semibold text-(--text-secondary)]">{t('no_bookings')}</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <motion.article key={booking.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="promo-badge promo-badge-contrast">{t(`status_${booking.status.toLowerCase()}`)}</span>
                    <span className="booking-chip">{booking.bookingReference}</span>
                  </div>
                  <AnimatedRoute origin={translatePlaceLabel(booking.flight.origin, t)} destination={translatePlaceLabel(booking.flight.destination, t)} />
                  <div className="grid gap-2 text-sm text-(--text-secondary)] sm:grid-cols-2">
                    <p>{t('bookings_base')}: {formatCurrency(booking.basePrice, booking.currency, locale)}</p>
                    <p>{t('bookings_paid')}: {formatCurrency(booking.finalPrice, booking.currency, locale)}</p>
                    <p>{t('bookings_departure')}: {new Date(booking.flight.departureTime).toLocaleString(locale)}</p>
                    <p>ID #{booking.id}</p>
                  </div>
                </div>

                <div className="space-y-3 lg:text-right">
                  <p className="text-sm font-semibold text-(--text-secondary)]">👤 {booking.adults} {t('Adultos')}</p>
                  {booking.children > 0 && <p className="text-sm font-semibold text-(--text-secondary)]">🧒 {booking.children} {t('Children')}</p>}
                  {booking.infants > 0 && <p className="text-sm font-semibold text-(--text-secondary)]">👶 {booking.infants} {t('Infants')}</p>}

                  {booking.status === 'PAID' && (
                    <button type="button" aria-label="Descargar boarding pass" className="cta-primary lg:ml-auto lg:w-auto" onClick={() => downloadBoardingPass(booking)}>
                      {t('bookings_download_pass')}
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
