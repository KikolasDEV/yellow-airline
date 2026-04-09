'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface FlightCardData {
  id: number;
  origin: string;
  destination: string;
  departureTime: string;
  basePrice: number;
  finalPrice: number;
  availableSeats: number;
}

export const FlightInventory = () => {
  const router = useRouter();
  const [flights, setFlights] = useState<FlightCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [pendingFlightId, setPendingFlightId] = useState<number | null>(null);

  const handleQuickBooking = async (flightId: number) => {
    setPendingFlightId(flightId);

    try {
      const response = await fetch('/api/payments/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flightId,
          adults: 1,
          children: 0,
          infants: 0,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        toast.error('Inicia sesion en la nueva app para reservar.');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        toast.error(data.error ?? 'No se pudo iniciar la reserva.');
        return;
      }

      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      }
    } catch {
      toast.error('Error de conexion iniciando el checkout.');
    } finally {
      setPendingFlightId(null);
    }
  };

  useEffect(() => {
    const loadFlights = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch('/api/flights', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Failed to load flights');
        }

        const data = await response.json();
        setFlights(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch {
        setHasError(true);
        setFlights([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadFlights();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card p-5">
            <div className="h-5 w-24 rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-40 rounded-full bg-white/10" />
            <div className="mt-8 h-24 rounded-[1rem] bg-white/8" />
          </div>
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="surface-card p-6 text-sm text-[var(--text-secondary)]">
        No se pudo cargar el inventario desde la nueva API de Next.
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="surface-card p-6 text-sm text-[var(--text-secondary)]">
        La nueva base no tiene vuelos cargados todavia.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {flights.map((flight) => (
        <article key={flight.id} className="surface-card p-5">
          <p className="micro-label">Flight #{flight.id}</p>
          <h3 className="section-title mt-3 text-[1.55rem]">
            {flight.origin} <span className="text-[var(--accent-strong)]">→</span> {flight.destination}
          </h3>
          <div className="mt-5 grid gap-3 text-sm text-[var(--text-secondary)]">
            <p>Salida: {new Date(flight.departureTime).toLocaleString('es-ES')}</p>
            <p>Base: {flight.basePrice.toFixed(2)} EUR</p>
            <p>Ahora: {flight.finalPrice.toFixed(2)} EUR</p>
            <p>Plazas disponibles: {flight.availableSeats}</p>
          </div>
          <button
            type="button"
            className="cta-primary mt-6 w-full justify-center"
            onClick={() => handleQuickBooking(flight.id)}
            disabled={pendingFlightId === flight.id}
          >
            {pendingFlightId === flight.id ? 'Conectando...' : 'Reserva rapida'}
          </button>
        </article>
      ))}
    </div>
  );
};
