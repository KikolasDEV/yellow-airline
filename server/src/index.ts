import express from 'express';
import cors from 'cors';
import flightRoutes from './routes/flightRoutes.js';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173' 
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Yellow Airline API - Despegando...');
});

app.use('/api/flights', flightRoutes);

app.listen(PORT, () => {
  console.log(`Servidor volando en http://localhost:${PORT}`);
});