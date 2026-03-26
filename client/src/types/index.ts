// Vuelo estandar
export interface Flight {
  id: string;
  number: string;
  origin: string;
  destination: string;
  departureTime: string;
  price: number;
  availableSeats: number;
}

// Usuario VIP
export interface User {
  id: string;
  name: string;
  email: string;
  isVip: boolean;
}