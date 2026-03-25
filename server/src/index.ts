import express from 'express';
import cors from 'cors';
import type { Flight } from './models/Flight.js';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173' 
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

const flights: Flight[] = [
  { id: '1', number: 'YW101', origin: 'Madrid', destination: 'Barcelona', departureTime: '2026-04-15T10:00:00', price: 45, availableSeats: 120 },
  { id: '2', number: 'YW202', origin: 'Sevilla', destination: 'Londres', departureTime: '2026-04-15T15:30:00', price: 89, availableSeats: 50 }
];

app.get('/', (req, res) => {
  res.send('Yellow Airline API - Despegando...');
});

app.get('/api/flights', (req, res) => {
  res.json(flights);
});

app.listen(PORT, () => {
  console.log(`Servidor volando en http://localhost:${PORT}`);
});