import express from 'express';
import cors from 'cors';
import flightRoutes from './routes/flightRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
    origin: CLIENT_URL
}));
app.use('/api/payments', paymentRoutes);
app.use(express.json());
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send('Yellow Airline API - Despegando...');
});
app.use('/api/flights', flightRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.listen(PORT, () => {
    console.log(`Servidor volando en http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map