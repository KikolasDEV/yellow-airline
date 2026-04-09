import { createBookingController, getMyBookingsController } from './bookings.controller';

export const bookingsRouteHandlers = {
  GET_MY_BOOKINGS: getMyBookingsController,
  POST: createBookingController,
};
