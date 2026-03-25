export interface Flight {
  id: string;
  number: string;
  origin: string;
  destination: string;
  departureTime: string; // Usaremos strings por ahora para facilitar
  price: number;
  availableSeats: number;
}