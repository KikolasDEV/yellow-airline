import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatedRoute } from './AnimatedRoute';
import { BookingCustomizationSheet } from './BookingCustomizationSheet';
import { apiUrl } from '../lib/api';
import { translatePlaceLabel } from '../lib/places';
import type { Flight, PassengerCount } from '../types';

interface Props {
  flight: Flight;
}

export const FlightCard = ({ flight }: Props) => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isSpanish = i18n.resolvedLanguage?.startsWith('es') ?? i18n.language.startsWith('es');
  const localizedOrigin = translatePlaceLabel(flight.origin, t);
  const localizedDestination = translatePlaceLabel(flight.destination, t);
  const availabilityLabel = t('availability_seats_left', { count: flight.availableSeats });

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
    `${flight.basePrice.toFixed(2)}€ ${t('flight_card_base')}`,
    `${flight.finalPrice.toFixed(2)}€ ${t('flight_card_now')}`,
    availabilityLabel,
  ];

  const handleConfirmBooking = async ({ passengers }: { passengers: PassengerCount; selectedSeats: string[]; extraTotal: number }) => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error(t('members_only_booking'));
      return false;
    }

    try {
      const response = await fetch(apiUrl('/bookings/checkout-session'), {
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

        toast.error(t('booking_checkout_unavailable'));
        return false;
      }

      toast.error(t('booking_failed'));
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
        className="surface-card overflow-hidden p-5 md:p-6"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="promo-badge promo-badge-contrast">{flight.finalPrice.toFixed(2)}€</span>
                <span className="booking-chip">{t('flight_card_premium_chip')}</span>
              </div>
              <div>
                <h3 className="display-title text-4xl text-[var(--text-primary)] md:text-5xl">{localizedDestination}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{t('flight_card_departing_from', { origin: localizedOrigin })}</p>
              </div>
            </div>

            <button type="button" className="icon-button self-end sm:self-auto" onClick={() => setIsExpanded((currentValue) => !currentValue)}>
              {isExpanded ? '−' : '+'}
            </button>
          </div>

          <AnimatedRoute origin={localizedOrigin} destination={localizedDestination} compact />

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
                    <p className="eyebrow">{t('flight_card_departure')}</p>
                    <p className="mt-2 font-bold text-[var(--text-primary)]">{formatDate(flight.departureTime)}</p>
                  </div>
                  <div>
                    <p className="eyebrow">{t('flight_card_seat_strategy')}</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{t('flight_card_seat_strategy_copy')}</p>
                  </div>
                  <div>
                    <p className="eyebrow">{t('flight_card_availability')}</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{t('flight_card_availability_copy', { availability: availabilityLabel })}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3 border-t border-[var(--border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('Salida')}</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{formatDate(flight.departureTime)}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="cta-secondary sm:w-auto" onClick={() => setIsExpanded((currentValue) => !currentValue)}>
                {isExpanded ? t('flight_card_hide') : t('flight_card_expand')}
              </button>
              <button type="button" className="cta-primary sm:w-auto" onClick={() => setIsSheetOpen(true)}>
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
