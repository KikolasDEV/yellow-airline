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
