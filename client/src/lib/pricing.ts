import type { SeatOption } from '../types';

const toNonNegativeNumber = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

export const calculateSeatUpgradeTotal = (selectedSeatIds: string[], seats: SeatOption[]) => {
  const total = selectedSeatIds.reduce((sum, seatId) => {
    const seat = seats.find((entry) => entry.id === seatId);
    return sum + toNonNegativeNumber(seat?.priceModifier ?? 0);
  }, 0);

  return toNonNegativeNumber(total);
};

export const calculateBookingTotal = ({
  basePrice,
  adults,
  children,
  extraTotal,
}: {
  basePrice: number;
  adults: number;
  children: number;
  extraTotal: number;
}) => {
  const payablePassengers = toNonNegativeNumber(adults) + toNonNegativeNumber(children);
  const total = toNonNegativeNumber(basePrice) * Math.max(1, payablePassengers) + toNonNegativeNumber(extraTotal);

  return toNonNegativeNumber(total);
};
