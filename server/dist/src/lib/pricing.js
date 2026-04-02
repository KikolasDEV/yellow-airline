const toNonNegativeNumber = (value) => {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, value);
};
const roundCurrency = (value) => {
    return Math.round(toNonNegativeNumber(value) * 100) / 100;
};
export const calculateOccupiedSeats = ({ adults, children }) => {
    return Math.floor(toNonNegativeNumber(adults)) + Math.floor(toNonNegativeNumber(children));
};
export const calculateOccupancyRate = ({ occupiedSeats, capacity }) => {
    const normalizedCapacity = Math.floor(toNonNegativeNumber(capacity));
    if (normalizedCapacity <= 0) {
        return 1;
    }
    return toNonNegativeNumber(occupiedSeats) / normalizedCapacity;
};
export const calculateUrgencyFactor = (departureTime, now = new Date()) => {
    const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDeparture <= 24) {
        return 1.4;
    }
    if (hoursUntilDeparture <= 72) {
        return 1.25;
    }
    if (hoursUntilDeparture <= 7 * 24) {
        return 1.15;
    }
    if (hoursUntilDeparture <= 14 * 24) {
        return 1.08;
    }
    return 1;
};
export const calculatePricingSnapshot = ({ basePrice, occupiedSeats, capacity, departureTime, }) => {
    const occupancyRate = calculateOccupancyRate({ occupiedSeats, capacity });
    const urgencyFactor = calculateUrgencyFactor(departureTime);
    const availableSeats = Math.max(0, Math.floor(toNonNegativeNumber(capacity)) - Math.floor(toNonNegativeNumber(occupiedSeats)));
    const finalPrice = roundCurrency(toNonNegativeNumber(basePrice) * (1 + occupancyRate) * urgencyFactor);
    return {
        basePrice: roundCurrency(basePrice),
        occupancyRate,
        urgencyFactor,
        finalPrice,
        availableSeats,
    };
};
//# sourceMappingURL=pricing.js.map