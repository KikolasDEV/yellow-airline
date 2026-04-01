// Vuelo estandar
export interface Flight {
  id: number;
  number?: string;
  origin: string;
  destination: string;
  departureTime: string;
  price: number;
  availableSeats?: number;
  capacity?: number;
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
  title: string;
  country: string;
  city?: string;
  matchTerms: string[];
  discountLabel: string;
  description: string;
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
