import { authRouteHandlers } from '@/modules/auth/auth.routes';

export async function GET() {
  return authRouteHandlers.session();
}
