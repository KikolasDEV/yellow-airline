import { Router } from 'express';
import type { Flight } from '../models/Flight.js';

const router = Router();

const flights: Flight[] = [
  { id: '1', number: 'YW101', origin: 'Madrid', destination: 'Barcelona', departureTime: '2026-04-15T10:00:00', price: 45, availableSeats: 120 },
  { id: '2', number: 'YW202', origin: 'Sevilla', destination: 'Londres', departureTime: '2026-04-15T15:30:00', price: 89, availableSeats: 50 }
];

router.get('/', (req, res) => {
  res.json(flights);
});

export default router;