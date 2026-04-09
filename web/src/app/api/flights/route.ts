import { flightsRouteHandlers } from '@/modules/flights/flights.routes';

export async function GET(request: Request) {
  return flightsRouteHandlers.GET(request);
}
