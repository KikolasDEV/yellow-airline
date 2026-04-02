const toNonNegativeInt = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
};

export const normalizePassengerCount = (value: number) => {
  return toNonNegativeInt(value);
};

export const calculateRequestedSeats = (adults: number, children: number) => {
  return normalizePassengerCount(adults) + normalizePassengerCount(children);
};

export const calculateCurrentSeats = (occupiedAdults: number, occupiedChildren: number) => {
  return normalizePassengerCount(occupiedAdults) + normalizePassengerCount(occupiedChildren);
};

export const hasDuplicateBooking = (existingBooking: unknown) => {
  return existingBooking !== null && existingBooking !== undefined;
};

export const hasEnoughCapacity = ({
  currentSeats,
  requestedSeats,
  capacity,
}: {
  currentSeats: number;
  requestedSeats: number;
  capacity: number;
}) => {
  const normalizedCurrentSeats = toNonNegativeInt(currentSeats);
  const normalizedRequestedSeats = toNonNegativeInt(requestedSeats);
  const normalizedCapacity = toNonNegativeInt(capacity);

  return normalizedCurrentSeats + normalizedRequestedSeats <= normalizedCapacity;
};
