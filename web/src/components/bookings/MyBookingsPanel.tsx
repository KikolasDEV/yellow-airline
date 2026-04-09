'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BookingItem {
  id: number;
  bookingReference: string;
  status: string;
  finalPrice: number;
  currency: string;
  flight: {
    origin: string;
    destination: string;
    departureTime: string;
  };
}

export const MyBookingsPanel = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      setHasError(false);
      setIsUnauthorized(false);

      try {
        const response = await fetch('/api/bookings/my-bookings', { cache: 'no-store' });

        if (response.status === 401) {
          setIsUnauthorized(true);
          setBookings([]);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load bookings');
        }

        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setHasError(true);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBookings();
  }, []);

  if (isLoading) {
    return <div className="surface-card px-6 py-12 text-center text-[var(--text-secondary)]">Cargando tus reservas...</div>;
  }

  if (isUnauthorized) {
    return (
      <div className="surface-card space-y-4 px-6 py-12 text-center">
        <p className="section-copy">Inicia sesion en la nueva app para consultar tus reservas con cookie segura.</p>
        <Link href="/login" className="cta-primary">Ir a login</Link>
      </div>
    );
  }

  if (hasError) {
    return <div className="surface-card px-6 py-12 text-center text-[var(--text-secondary)]">No se pudieron cargar tus reservas.</div>;
  }

  if (bookings.length === 0) {
    return <div className="surface-card px-6 py-12 text-center text-[var(--text-secondary)]">No hay reservas para esta sesion todavia.</div>;
  }

  return (
    <div className="grid gap-4">
      {bookings.map((booking) => (
        <article key={booking.id} className="surface-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="micro-label">{booking.bookingReference}</p>
              <h2 className="section-title mt-3 text-[1.8rem]">
                {booking.flight.origin} <span className="text-[var(--accent-strong)]">→</span> {booking.flight.destination}
              </h2>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Salida: {new Date(booking.flight.departureTime).toLocaleString('es-ES')}
              </p>
            </div>
            <div className="text-sm text-[var(--text-secondary)] md:text-right">
              <p>Estado: {booking.status}</p>
              <p className="mt-2">Total: {booking.finalPrice.toFixed(2)} {booking.currency.toUpperCase()}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
