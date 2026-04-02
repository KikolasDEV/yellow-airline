export declare const calculateOccupiedSeats: ({ adults, children }: {
    adults: number;
    children: number;
}) => number;
export declare const calculateOccupancyRate: ({ occupiedSeats, capacity }: {
    occupiedSeats: number;
    capacity: number;
}) => number;
export declare const calculateUrgencyFactor: (departureTime: Date, now?: Date) => 1 | 1.4 | 1.25 | 1.15 | 1.08;
export declare const calculatePricingSnapshot: ({ basePrice, occupiedSeats, capacity, departureTime, }: {
    basePrice: number;
    occupiedSeats: number;
    capacity: number;
    departureTime: Date;
}) => {
    basePrice: number;
    occupancyRate: number;
    urgencyFactor: number;
    finalPrice: number;
    availableSeats: number;
};
//# sourceMappingURL=pricing.d.ts.map