import type { Flight } from './flight';

export type BookingStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface Booking {
  id: number;
  userId: number;
  flightId: number;
  adults: number;
  children: number;
  infants: number;
  basePrice: number;
  finalPrice: number;
  currency: string;
  status: BookingStatus;
  bookingReference: string;
  stripeSessionId: string | null;
  createdAt: string;
  flight: Flight;
}
