import { bookingsRouteHandlers } from '@/modules/bookings/bookings.routes';

export async function GET() {
  return bookingsRouteHandlers.GET_MY_BOOKINGS();
}
