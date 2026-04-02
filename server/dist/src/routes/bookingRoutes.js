import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateCurrentSeats, calculateRequestedSeats, hasDuplicateBooking, hasEnoughCapacity, normalizeFlightId, normalizePassengerCount, } from '../lib/bookingRules.js';
import { calculatePricingSnapshot } from '../lib/pricing.js';
const router = Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const getStripeClient = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        return null;
    }
    return new Stripe(secretKey);
};
router.get('/my-bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.userId },
            include: { flight: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener tus reservas' });
    }
});
router.post('/checkout-session', authenticateToken, async (req, res) => {
    const { flightId, adults, children, infants } = req.body;
    const normalizedFlightId = normalizeFlightId(Number(flightId));
    const normalizedAdults = normalizePassengerCount(Number(adults));
    const normalizedChildren = normalizePassengerCount(Number(children));
    const normalizedInfants = normalizePassengerCount(Number(infants));
    const requestedSeats = calculateRequestedSeats(normalizedAdults, normalizedChildren);
    const userId = req.user.userId;
    const stripe = getStripeClient();
    if (!stripe) {
        return res.status(500).json({ error: 'Stripe no esta configurado en el servidor.' });
    }
    if (normalizedFlightId < 1) {
        return res.status(400).json({ error: 'Identificador de vuelo no valido.' });
    }
    if (requestedSeats < 1) {
        return res.status(400).json({ error: 'Debes reservar al menos un asiento (adulto o nino).' });
    }
    try {
        const existingBooking = await prisma.booking.findUnique({
            where: { userId_flightId: { userId, flightId: normalizedFlightId } },
        });
        if (hasDuplicateBooking(existingBooking)) {
            return res.status(400).json({ error: 'Ya tienes una reserva para este vuelo.' });
        }
        const flight = await prisma.flight.findUnique({
            where: { id: normalizedFlightId },
        });
        if (!flight) {
            return res.status(404).json({ error: 'Vuelo no encontrado.' });
        }
        const totalOccupied = await prisma.booking.aggregate({
            where: { flightId: normalizedFlightId, status: 'PAID' },
            _sum: { adults: true, children: true },
        });
        const currentSeats = calculateCurrentSeats(totalOccupied._sum.adults || 0, totalOccupied._sum.children || 0);
        if (!hasEnoughCapacity({ currentSeats, requestedSeats, capacity: flight.capacity })) {
            return res.status(400).json({ error: 'Vuelo completo. No hay suficientes asientos.' });
        }
        const pricingSnapshot = calculatePricingSnapshot({
            basePrice: flight.price,
            occupiedSeats: currentSeats,
            capacity: flight.capacity,
            departureTime: flight.departureTime,
        });
        const amountTotal = Math.round(pricingSnapshot.finalPrice * requestedSeats * 100);
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Yellow Airline · ${flight.origin} -> ${flight.destination}`,
                            description: `${requestedSeats} pasajero(s) con asiento`,
                        },
                        unit_amount: Math.round(pricingSnapshot.finalPrice * 100),
                    },
                    quantity: requestedSeats,
                },
            ],
            success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/cancel`,
            metadata: {
                userId: String(userId),
                flightId: String(normalizedFlightId),
                adults: String(normalizedAdults),
                children: String(normalizedChildren),
                infants: String(normalizedInfants),
                basePrice: String(pricingSnapshot.basePrice),
                finalPrice: String(pricingSnapshot.finalPrice),
                currency: 'eur',
            },
        });
        res.status(201).json({
            checkoutUrl: checkoutSession.url,
            sessionId: checkoutSession.id,
            amountTotal,
            currency: 'eur',
            unitPrice: pricingSnapshot.finalPrice,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al iniciar el checkout con Stripe.' });
    }
});
router.post('/', authenticateToken, async (req, res) => {
    res.status(410).json({ error: 'Usa /api/bookings/checkout-session para reservar y pagar.' });
});
export default router;
//# sourceMappingURL=bookingRoutes.js.map