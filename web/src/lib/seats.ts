export const createSeatLayout = (capacity: number) => Array.from({ length: capacity }, (_, index) => {
  const row = Math.floor(index / 6) + 1;
  return {
    number: `${row}${'ABCDEF'[index % 6]}`,
    // A product rule, not a claim about a real aircraft's emergency exits.
    supplement: row <= 2 ? 1800 : 0,
  };
});

export const calculateSeatSupplement = (capacity: number, seats: string[]) => {
  const layout = new Map(createSeatLayout(capacity).map((seat) => [seat.number, seat.supplement]));
  if (new Set(seats).size !== seats.length || seats.some((seat) => !layout.has(seat))) {
    throw new Error('INVALID_SEATS');
  }
  return seats.reduce((total, seat) => total + layout.get(seat)!, 0);
};

export const bookingTotal = (booking: {
  totalAmount?: number | null;
  finalPrice: number;
  adults: number;
  children: number;
}) => booking.totalAmount ?? Math.round(booking.finalPrice * 100) * (booking.adults + booking.children);
