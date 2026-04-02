import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
const router = Router();
const getStripeClient = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        return null;
    }
    return new Stripe(secretKey);
};
const createBookingReference = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let value = 'YA-';
    for (let index = 0; index < 8; index += 1) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        value += alphabet[randomIndex];
    }
    return value;
};
const parseMetadataNumber = (metadata, key) => {
    const rawValue = metadata?.[key];
    if (!rawValue) {
        return null;
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
        return null;
    }
    return value;
};
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers['stripe-signature'];
    if (!stripe || !webhookSecret) {
        return res.status(500).json({ error: 'Stripe webhook no configurado.' });
    }
    if (!signature || Array.isArray(signature)) {
        return res.status(400).json({ error: 'Firma de Stripe invalida.' });
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    }
    catch (error) {
        return res.status(400).json({ error: 'No se pudo validar el webhook de Stripe.' });
    }
    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            if (session.payment_status !== 'paid') {
                return res.json({ received: true });
            }
            const existingBookingBySession = await prisma.booking.findUnique({
                where: { stripeSessionId: session.id },
            });
            if (existingBookingBySession) {
                return res.json({ received: true });
            }
            const userId = parseMetadataNumber(session.metadata, 'userId');
            const flightId = parseMetadataNumber(session.metadata, 'flightId');
            const adults = parseMetadataNumber(session.metadata, 'adults') || 0;
            const children = parseMetadataNumber(session.metadata, 'children') || 0;
            const infants = parseMetadataNumber(session.metadata, 'infants') || 0;
            const basePrice = parseMetadataNumber(session.metadata, 'basePrice') || 0;
            const finalPrice = parseMetadataNumber(session.metadata, 'finalPrice') || 0;
            const currency = session.metadata?.currency || 'eur';
            if (!userId || !flightId) {
                return res.status(400).json({ error: 'Metadata incompleta para crear reserva.' });
            }
            const existingBookingByRoute = await prisma.booking.findUnique({
                where: {
                    userId_flightId: {
                        userId,
                        flightId,
                    },
                },
            });
            if (existingBookingByRoute) {
                return res.json({ received: true });
            }
            let reservationCreated = false;
            for (let attempt = 0; attempt < 3 && !reservationCreated; attempt += 1) {
                try {
                    await prisma.booking.create({
                        data: {
                            userId,
                            flightId,
                            adults,
                            children,
                            infants,
                            basePrice,
                            finalPrice,
                            currency,
                            status: 'PAID',
                            bookingReference: createBookingReference(),
                            stripeSessionId: session.id,
                        },
                    });
                    reservationCreated = true;
                }
                catch (error) {
                    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                        continue;
                    }
                    throw error;
                }
            }
            if (!reservationCreated) {
                return res.status(500).json({ error: 'No se pudo asignar un localizador unico.' });
            }
        }
        if (event.type === 'checkout.session.expired') {
            return res.json({ received: true });
        }
        return res.json({ received: true });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error al procesar webhook de Stripe.' });
    }
});
export default router;
//# sourceMappingURL=paymentRoutes.js.map