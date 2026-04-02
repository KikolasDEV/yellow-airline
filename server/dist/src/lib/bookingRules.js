const toNonNegativeInt = (value) => {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.floor(value));
};
export const calculateRequestedSeats = (adults, children) => {
    return toNonNegativeInt(adults) + toNonNegativeInt(children);
};
export const calculateCurrentSeats = (occupiedAdults, occupiedChildren) => {
    return toNonNegativeInt(occupiedAdults) + toNonNegativeInt(occupiedChildren);
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