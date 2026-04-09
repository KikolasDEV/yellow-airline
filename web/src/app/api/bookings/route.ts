import { bookingsRouteHandlers } from '@/modules/bookings/bookings.routes';

export async function POST() {
  return bookingsRouteHandlers.POST();
}
