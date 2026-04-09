import { requireSessionUser } from '@/middleware/auth';
import { jsonError, jsonOk, notImplemented } from '@/utils/responses';
import { getMyBookings } from './bookings.service';

export const getMyBookingsController = async () => {
  try {
    const sessionUser = await requireSessionUser();
    const bookings = await getMyBookings(sessionUser.userId);
    return jsonOk(bookings);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return jsonError('Acceso denegado. No hay sesion activa.', 401);
    }

    return jsonError('Error al obtener tus reservas', 500);
  }
};

export const createBookingController = async () => {
  return notImplemented('bookings.create');
};
