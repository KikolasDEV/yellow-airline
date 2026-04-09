import { authRouteHandlers } from '@/modules/auth/auth.routes';

export async function POST() {
  return authRouteHandlers.logout();
}
