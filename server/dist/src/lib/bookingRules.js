const toNonNegativeInt = (value) => {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.floor(value));
};
export const normalizePassengerCount = (value) => {
    return toNonNegativeInt(value);
};
export const normalizeFlightId = (value) => {
    const normalizedValue = Number(value);
    if (!Number.isFinite(normalizedValue)) {
        return 0;
    }
    return Math.max(0, Math.floor(normalizedValue));
};
export const calculateRequestedSeats = (adults, children) => {
    return normalizePassengerCount(adults) + normalizePassengerCount(children);
};
export const calculateCurrentSeats = (occupiedAdults, occupiedChildren) => {
    return normalizePassengerCount(occupiedAdults) + normalizePassengerCount(occupiedChildren);
};
export const hasDuplicateBooking = (existingBooking) => {
    return existingBooking !== null && existingBooking !== undefined;
};
export const hasEnoughCapacity = ({ currentSeats, requestedSeats, capacity, }) => {
    const normalizedCurrentSeats = toNonNegativeInt(currentSeats);
    const normalizedRequestedSeats = toNonNegativeInt(requestedSeats);
    const normalizedCapacity = toNonNegativeInt(capacity);
    return normalizedCurrentSeats + normalizedRequestedSeats <= normalizedCapacity;
};
//# sourceMappingURL=bookingRules.js.map