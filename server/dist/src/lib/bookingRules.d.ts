export declare const normalizePassengerCount: (value: number) => number;
export declare const normalizeFlightId: (value: number) => number;
export declare const calculateRequestedSeats: (adults: number, children: number) => number;
export declare const calculateCurrentSeats: (occupiedAdults: number, occupiedChildren: number) => number;
export declare const hasDuplicateBooking: (existingBooking: unknown) => existingBooking is {};
export declare const hasEnoughCapacity: ({ currentSeats, requestedSeats, capacity, }: {
    currentSeats: number;
    requestedSeats: number;
    capacity: number;
}) => boolean;
//# sourceMappingURL=bookingRules.d.ts.map