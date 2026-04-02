// Vuelo estandar
export interface Flight {
  id: number;
  origin: string;
  destination: string;
  departureTime: string;
  price: number;
  basePrice: number;
  finalPrice: number;
  availableSeats: number;
  occupancyRate: number;
  urgencyFactor?: number;
  capacity: number;
}

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

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchInsight {
  origin: string;
  destination: string;
  timestamp: number;
}

export interface OfferCard {
  id: string;
  titleKey: string;
  countryLabelKey: string;
  cityLabelKey?: string;
  country: string;
  city?: string;
  matchTerms: string[];
  discountLabel: string;
  descriptionKey: string;
  theme: 'gold' | 'sunset' | 'night';
  destinationPreset?: string;
  originPreset?: string;
}

export interface SeatOption {
  id: string;
  row: number;
  column: string;
  kind: 'window' | 'aisle' | 'middle' | 'exit';
  available: boolean;
  priceModifier: number;
}

// Usuario VIP
export interface User {
  id: number;
  name: string;
  email: string;
  isVip: boolean;
}
