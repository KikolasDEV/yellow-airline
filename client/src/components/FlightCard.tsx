import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatedRoute } from './AnimatedRoute';
import { BookingCustomizationSheet } from './BookingCustomizationSheet';
import type { Flight, PassengerCount } from '../types';

interface Props {
  flight: Flight;
}

export const FlightCard = ({ flight }: Props) => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isSpanish = i18n.resolvedLanguage?.startsWith('es') ?? i18n.language.startsWith('es');
  const availabilityLabel = `${flight.availableSeats} seats left`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isSpanish ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const quickFacts = [
    `${formatDate(flight.departureTime)}`,
    `${flight.basePrice.toFixed(2)}€ base`,
    `${flight.finalPrice.toFixed(2)}€ now`,
    availabilityLabel,
  ];

  const handleConfirmBooking = async ({ passengers }: { passengers: PassengerCount; selectedSeats: string[]; extraTotal: number }) => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error(t('members_only_booking'));
      return false;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightId: flight.id,
          ...passengers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.checkoutUrl) {
          window.location.assign(data.checkoutUrl);
          return true;
        }

        toast.error('No se pudo abrir Stripe Checkout.');
        return false;
      }

      toast.error(data.error || t('booking_failed'));
      return false;
    } catch {
      toast.error(t('booking_connection_error'));
      return false;
    }
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="surface-card overflow-hidden p-5"
      >
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="promo-badge promo-badge-contrast">{flight.finalPrice.toFixed(2)}€</span>
                <span className="booking-chip">Premium seat map inside</span>
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-[-0.08em] text-[var(--text-primary)]">{flight.destination}</h3>
                <p className="text-sm text-[var(--text-secondary)]">Departing from {flight.origin} with tactile boarding customization.</p>
              </div>
            </div>

            <button type="button" className="icon-button" onClick={() => setIsExpanded((currentValue) => !currentValue)}>
              {isExpanded ? '−' : '+'}
            </button>
          </div>

          <AnimatedRoute origin={flight.origin} destination={flight.destination} compact />

          <div className="flex flex-wrap gap-2">
            {quickFacts.map((fact) => (
              <span key={fact} className="booking-chip">{fact}</span>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 rounded-[1.5rem] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-elevated)_90%,transparent_10%)] p-4 md:grid-cols-3">
                  <div>
                    <p className="eyebrow">Departure</p>
                    <p className="mt-2 font-bold text-[var(--text-primary)]">{formatDate(flight.departureTime)}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Seat Strategy</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">Window, aisle or exit row with live total before checkout.</p>
                  </div>
                  <div>
                    <p className="eyebrow">Availability</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{availabilityLabel}. Dynamic fare updates before payment.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('Salida')}</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{formatDate(flight.departureTime)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="cta-secondary" onClick={() => setIsExpanded((currentValue) => !currentValue)}>
                {isExpanded ? 'Hide details' : 'Expand card'}
              </button>
              <button type="button" className="cta-primary" onClick={() => setIsSheetOpen(true)}>
                {t('book_now')}
              </button>
            </div>
          </div>
        </div>
      </motion.article>

      <BookingCustomizationSheet
        flight={flight}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onConfirm={handleConfirmBooking}
      />
    </>
  );
};
