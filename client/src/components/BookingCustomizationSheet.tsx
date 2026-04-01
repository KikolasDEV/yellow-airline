import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PassengerSelector } from './PassengerSelector';
import { SeatMap } from './SeatMap';
import { AnimatedRoute } from './AnimatedRoute';
import type { Flight, PassengerCount, SeatOption } from '../types';

interface BookingCustomizationSheetProps {
  flight: Flight;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { passengers: PassengerCount; selectedSeats: string[]; extraTotal: number }) => Promise<void> | void;
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
  const [passengers, setPassengers] = useState<PassengerCount>(defaultPassengers);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const seats = useMemo(() => createSeatLayout(), []);
  const payablePassengers = passengers.adults + passengers.children;
  const extraTotal = selectedSeatIds.reduce((total, seatId) => {
    const seat = seats.find((entry) => entry.id === seatId);
    return total + (seat?.priceModifier ?? 0);
  }, 0);

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

  const totalPrice = flight.price * Math.max(1, payablePassengers) + extraTotal;
  const canConfirm = payablePassengers === 0 || selectedSeatIds.length === payablePassengers;

  const handleConfirm = async () => {
    if (!canConfirm) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirm({
        passengers,
        selectedSeats: selectedSeatIds,
        extraTotal,
      });
      onClose();
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Customize booking</p>
                <h3 className="section-title text-2xl">Design your cabin experience</h3>
                <p className="section-copy max-w-2xl">Window, aisle or exit-row. Build a smoother trip before confirming the booking.</p>
              </div>
              <button type="button" className="icon-button" onClick={onClose}>✕</button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
              <div className="space-y-6">
                <section className="surface-card p-5">
                  <div className="space-y-4">
                    <div>
                      <p className="eyebrow">Selected Route</p>
                      <h4 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{flight.origin} to {flight.destination}</h4>
                    </div>
                    <AnimatedRoute origin={flight.origin} destination={flight.destination} />
                  </div>
                </section>

                <section className="surface-card p-5">
                  <PassengerSelector count={passengers} setCount={setPassengers} />
                </section>

                <section className="surface-card p-5">
                  <SeatMap
                    seats={seats}
                    selectedSeatIds={selectedSeatIds}
                    maxSelectable={payablePassengers}
                    onToggleSeat={toggleSeat}
                  />
                </section>
              </div>

              <div className="surface-card h-fit p-5">
                <div className="space-y-4">
                  <div>
                    <p className="eyebrow">Fare Summary</p>
                    <h4 className="text-xl font-black text-[var(--text-primary)]">{flight.destination} cabin stack</h4>
                  </div>

                  <div className="summary-line">
                    <span>Base fare</span>
                    <strong>{flight.price.toFixed(2)}€</strong>
                  </div>
                  <div className="summary-line">
                    <span>Passengers with seats</span>
                    <strong>{payablePassengers}</strong>
                  </div>
                  <div className="summary-line">
                    <span>Seat upgrade</span>
                    <strong>{extraTotal.toFixed(2)}€</strong>
                  </div>
                  <div className="summary-line">
                    <span>Selected seats</span>
                    <strong>{selectedSeatIds.length > 0 ? selectedSeatIds.join(', ') : 'Pending'}</strong>
                  </div>

                  <div className="summary-total">
                    <span>Total estimated</span>
                    <strong>{totalPrice.toFixed(2)}€</strong>
                  </div>

                  <button type="button" className="cta-primary w-full justify-center" disabled={!canConfirm || isSubmitting} onClick={handleConfirm}>
                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                  {!canConfirm && (
                    <p className="text-sm text-[var(--text-secondary)]">Select one seat per adult or child before confirming.</p>
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
