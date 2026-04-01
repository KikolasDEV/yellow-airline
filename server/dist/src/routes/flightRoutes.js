import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
const router = Router();
// GET: Obtener vuelos con filtros opcionales
router.get('/', async (req, res) => {
    const { origin, destination } = req.query;
    try {
        const flights = await prisma.flight.findMany({
            where: {
                // Si existe el parámetro, filtra; si no, trae todos
                origin: origin ? { contains: String(origin), mode: 'insensitive' } : undefined,
                destination: destination ? { contains: String(destination), mode: 'insensitive' } : undefined,
            },
            orderBy: { departureTime: 'asc' }
        });
        res.json(flights);
    }
    catch (error) {
        res.status(500).json({ error: "Error al buscar vuelos" });
    }
});
// POST: Crear un nuevo vuelo
router.post('/', async (req, res) => {
    const { number, origin, destination, departureTime, price } = req.body;
    try {
        const newFlight = await prisma.flight.create({
            data: {
                number,
                origin,
                destination,
                departureTime: new Date(departureTime),
                price: parseFloat(price)
            }
        });
        res.status(201).json(newFlight);
    }
    catch (error) {
        res.status(400).json({ error: "No se pudo crear el vuelo. Revisa los datos." });
    }
});
// UPDATE: Editar un vuelo existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { number, origin, destination, departureTime, price } = req.body;
    try {
        const updatedFlight = await prisma.flight.update({
            where: { id: Number(id) },
            data: {
                number,
                origin,
                destination,
                departureTime: departureTime ? new Date(departureTime) : undefined,
                price: price ? parseFloat(price) : undefined
            }
        });
        res.json(updatedFlight);
    }
    catch (error) {
        res.status(404).json({ error: "Vuelo no encontrado o datos inválidos" });
    }
});
// DELETE: Cancelar/Eliminar un vuelo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.flight.delete({
            where: { id: Number(id) }
        });
        res.status(204).send(); // 204 significa "Éxito, pero no hay contenido que devolver"
    }
    catch (error) {
        res.status(404).json({ error: "No se pudo eliminar el vuelo. ¿Ya fue eliminado?" });
    }
});
export default router;
//# sourceMappingURL=flightRoutes.js.map