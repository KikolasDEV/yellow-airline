import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PassengerSelector } from './PassengerSelector';
import { SeatMap } from './SeatMap';
import { AnimatedRoute } from './AnimatedRoute';
import { translatePlaceLabel } from '../lib/places';
import { calculateBookingTotal, calculateSeatUpgradeTotal } from '../lib/pricing';
import type { Flight, PassengerCount, SeatOption } from '../types';

interface BookingCustomizationSheetProps {
  flight: Flight;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { passengers: PassengerCount; selectedSeats: string[]; extraTotal: number }) => Promise<boolean> | boolean;
}

const createSeatLayout = () => {
  const columns = ['A', 'B', 'C', 'D'];
  const unavailableSeats = new Set(['2C', '4D', '6A']);

  return Array.from({ length: 6 }, (_, rowIndex) => {
    const row = rowIndex + 1;

    return columns.map<SeatOption>((column) => {
      const seatId = `${row}${column}`;
      const isWindow = column === 'A' || column === 'D';
      const isAisle = column === 'B' || column === 'C';
      const isExitRow = row === 3 || row === 4;

      return {
        id: seatId,
        row,
        column,
        kind: isExitRow ? 'exit' : isWindow ? 'window' : isAisle ? 'aisle' : 'middle',
        available: !unavailableSeats.has(seatId),
        priceModifier: isExitRow ? 18 : 0,
      };
    });
  }).flat();
};

const defaultPassengers: PassengerCount = {
  adults: 1,
  children: 0,
  infants: 0,
};

export const BookingCustomizationSheet = ({ flight, isOpen, onClose, onConfirm }: BookingCustomizationSheetProps) => {
  const { t } = useTranslation();
  const [passengers, setPassengers] = useState<PassengerCount>(defaultPassengers);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const localizedOrigin = translatePlaceLabel(flight.origin, t);
  const localizedDestination = translatePlaceLabel(flight.destination, t);

  const seats = useMemo(() => createSeatLayout(), []);
  const payablePassengers = passengers.adults + passengers.children;
  const extraTotal = calculateSeatUpgradeTotal(selectedSeatIds, seats);

  useEffect(() => {
    if (!isOpen) {
      setPassengers(defaultPassengers);
      setSelectedSeatIds([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedSeatIds((currentSeats) => currentSeats.slice(0, payablePassengers));
  }, [payablePassengers]);

  const toggleSeat = (seatId: string) => {
    setSelectedSeatIds((currentSeats) => {
      if (currentSeats.includes(seatId)) {
        return currentSeats.filter((currentSeatId) => currentSeatId !== seatId);
      }

      if (currentSeats.length >= payablePassengers) {
        return currentSeats;
      }

      return [...currentSeats, seatId];
    });
  };

  const totalPrice = calculateBookingTotal({
    basePrice: flight.finalPrice,
    adults: passengers.adults,
    children: passengers.children,
    extraTotal,
  });
  const canConfirm = payablePassengers === 0 || selectedSeatIds.length === payablePassengers;
  const occupancyLabel = `${selectedSeatIds.length}/${payablePassengers || 0}`;

  const handleConfirm = async () => {
    if (!canConfirm) {
      return;
    }

    setIsSubmitting(true);

    try {
      const canCloseSheet = await onConfirm({
        passengers,
        selectedSeats: selectedSeatIds,
        extraTotal,
      });

      if (canCloseSheet) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="sheet-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="sheet-header-band mb-6">
              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="eyebrow">{t('booking_customize_eyebrow')}</p>
                  <h3 className="section-title text-3xl md:text-5xl">{t('booking_customize_title')}</h3>
                  <p className="section-copy mt-3 max-w-2xl">{t('booking_customize_copy')}</p>
                </div>
                <div className="flex items-center gap-3 self-start md:flex-col md:items-end">
                  <div className="booking-chip booking-chip-strong">{t('booking_seats_label')} {occupancyLabel}</div>
                  <button type="button" className="icon-button" onClick={onClose}>✕</button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
              <div className="space-y-6">
                <section className="surface-card p-5 md:p-6">
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
                    <div className="space-y-4">
                      <div>
                        <p className="eyebrow">{t('booking_selected_route')}</p>
                        <h4 className="display-title text-4xl text-[var(--text-primary)] md:text-5xl">{localizedOrigin} → {localizedDestination}</h4>
                      </div>
                      <AnimatedRoute origin={localizedOrigin} destination={localizedDestination} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      <div className="stat-tile">
                        <p className="stat-kicker">{t('booking_base_fare')}</p>
                        <p className="stat-value mt-3">{flight.basePrice.toFixed(0)}€</p>
                      </div>
                      <div className="stat-tile">
                        <p className="stat-kicker">{t('booking_dynamic_fare')}</p>
                        <p className="stat-value mt-3">{flight.finalPrice.toFixed(0)}€</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="surface-card p-5 md:p-6">
                  <PassengerSelector count={passengers} setCount={setPassengers} />
                </section>

                <section className="surface-card p-5 md:p-6">
                  <SeatMap
                    seats={seats}
                    selectedSeatIds={selectedSeatIds}
                    maxSelectable={payablePassengers}
                    onToggleSeat={toggleSeat}
                  />
                </section>
              </div>

              <div className="surface-card h-fit p-5 md:p-6 xl:sticky xl:top-6">
                <div className="space-y-4">
                  <p className="eyebrow">{t('booking_customize_eyebrow')}</p>
                  <div>
                    <p className="eyebrow">{t('booking_fare_summary')}</p>
                    <h4 className="section-title text-3xl">{t('booking_cabin_stack', { destination: localizedDestination })}</h4>
                    <p className="section-copy mt-2">{t('booking_fare_summary_copy')}</p>
                  </div>

                  <div className="summary-line">
                    <span>{t('booking_base_fare')}</span>
                    <strong>{flight.basePrice.toFixed(2)}€</strong>
                  </div>
                  <div className="summary-line">
                    <span>{t('booking_dynamic_fare')}</span>
                    <strong>{flight.finalPrice.toFixed(2)}€</strong>
                  </div>
                  <div className="summary-line">
                    <span>{t('booking_passengers_with_seats')}</span>
                    <strong>{payablePassengers}</strong>
                  </div>
                  <div className="summary-line">
                    <span>{t('booking_seat_upgrade')}</span>
                    <strong>{extraTotal.toFixed(2)}€</strong>
                  </div>
                  <div className="summary-line">
                    <span>{t('booking_selected_seats')}</span>
                    <strong>{selectedSeatIds.length > 0 ? selectedSeatIds.join(', ') : t('booking_selected_seats_pending')}</strong>
                  </div>

                  <div className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-elevated)_84%,transparent_16%)] p-4 text-sm text-[var(--text-secondary)]">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('booking_cabin_note')}</p>
                    <p className="mt-2 leading-7">{t('booking_cabin_note_copy')}</p>
                  </div>

                  <div className="summary-total">
                    <span>{t('booking_total_estimated')}</span>
                    <strong>{totalPrice.toFixed(2)}€</strong>
                  </div>

                  <button type="button" className="cta-primary w-full justify-center" disabled={!canConfirm || isSubmitting} onClick={handleConfirm}>
                    {isSubmitting ? t('booking_confirming') : t('booking_confirm')}
                  </button>
                  {!canConfirm && (
                    <p className="text-sm text-[var(--text-secondary)]">{t('booking_missing_seats')}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
