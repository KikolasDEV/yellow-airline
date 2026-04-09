import { authRouteHandlers } from '@/modules/auth/auth.routes';

export async function POST(request: Request) {
  return authRouteHandlers.register(request);
}
