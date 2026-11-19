import { jsonError, jsonOk } from '@/utils/responses';
import { listFlightsQuerySchema } from './flights.schemas';
import { listFlights } from './flights.service';

export const getFlightsController = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const parsedQuery = listFlightsQuerySchema.safeParse({
    origin: searchParams.get('origin') ?? undefined,
    destination: searchParams.get('destination') ?? undefined,
    date: searchParams.get('date') ?? undefined,
  });

  if (!parsedQuery.success) {
    return jsonError('Invalid flight filters.', 400, parsedQuery.error.flatten());
  }

  try {
    const flights = await listFlights(parsedQuery.data);
    return jsonOk(flights);
  } catch {
    return jsonError('Error al buscar vuelos', 500);
  }
};
