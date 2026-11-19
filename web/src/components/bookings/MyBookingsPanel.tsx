'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { bookingTotal } from '@/lib/seats';

interface BookingItem {
  id: number; bookingReference: string; status: string; finalPrice: number; currency: string;
  totalAmount: number | null; adults: number; children: number; infants: number; selectedSeats: string[];
  flight: { origin: string; destination: string; departureTime: string };
}

export const MyBookingsPanel = () => {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/bookings/my-bookings', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) { setUnauthorized(true); return []; }
        if (!response.ok) throw new Error();
        return response.json();
      }).then(setBookings)
      .catch((failure) => { if (failure.name !== 'AbortError') setError(true); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  const money = (cents: number, currency: string) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(cents / 100);
  const download = async (booking: BookingItem) => {
    try {
      // Load PDF libraries only when requested; QR contains no personal information.
      const [{ jsPDF }, QRCode] = await Promise.all([import('jspdf'), import('qrcode')]);
      const pdf = new jsPDF();
      const qr = await QRCode.toDataURL(booking.bookingReference);
      pdf.setFontSize(22);
      pdf.text(t('pass_title'), 14, 24);
      pdf.setFontSize(11);
      const lines = [
        `${t('reference')}: ${booking.bookingReference}`,
        `${booking.flight.origin} -> ${booking.flight.destination}`,
        `${t('departure')}: ${new Date(booking.flight.departureTime).toISOString()} UTC`,
        `${t('passengers')}: ${booking.adults} / ${booking.children} / ${booking.infants}`,
        `${t('selected_seats')}: ${booking.selectedSeats?.join(', ') || t('legacy_seats')}`,
        `${t('paid_total')}: ${money(bookingTotal(booking), booking.currency)}`,
      ];
      lines.forEach((line, index) => pdf.text(line, 14, 40 + index * 10));
      pdf.addImage(qr, 'PNG', 150, 35, 40, 40);
      pdf.save(`boarding-pass-${booking.bookingReference}.pdf`);
    } catch { toast.error(t('pass_error')); }
  };
  return <div className="space-y-6">
    <section className="section-frame space-y-4 p-8"><p className="eyebrow">Yellow Gold</p><h1 className="section-title text-4xl">{t('my_trips')}</h1><p className="section-copy">{t('bookings_copy')}</p></section>
    {loading && <p role="status">{t('loading')}</p>}
    {unauthorized && <Link className="cta-primary" href="/login">{t('login')}</Link>}
    {error && <p role="alert">{t('bookings_error')}</p>}
    {!loading && !error && !unauthorized && !bookings.length && <p className="surface-card p-8">{t('no_bookings')}</p>}
    {bookings.map((booking) => <article key={booking.id} className="surface-card space-y-4 p-6">
      <p className="micro-label">{booking.bookingReference} · {t(booking.status)}</p>
      <h2 className="section-title text-3xl">{booking.flight.origin} → {booking.flight.destination}</h2>
      <p>{t('departure')}: {new Date(booking.flight.departureTime).toLocaleString(i18n.language, { timeZone: 'UTC' })} UTC</p>
      <p>{t('passengers')}: {booking.adults} {t('adults')} / {booking.children} {t('children')} / {booking.infants} {t('infants')}</p>
      <p>{t('selected_seats')}: {booking.selectedSeats?.join(', ') || t('legacy_seats')}</p>
      <p>{t('unit_price')}: {money(Math.round(booking.finalPrice * 100), booking.currency)}</p>
      <p className="text-xl font-bold">{t('paid_total')}: {money(bookingTotal(booking), booking.currency)}</p>
      {booking.status === 'PAID' && <button className="cta-primary" onClick={() => void download(booking)}>{t('download_pass')}</button>}
    </article>)}
  </div>;
};
