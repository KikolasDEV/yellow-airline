import { requireSessionUser } from '@/middleware/auth';
import { mutationGuard } from '@/lib/request-security';
import { expireOwnedSession } from '@/modules/payments/payments.service';
import { paymentError } from '@/modules/payments/payments.controller';
import { parseJsonBody } from '@/utils/http';
import { jsonError, jsonOk } from '@/utils/responses';

export async function POST(request: Request) {
  const blocked = mutationGuard(request);
  if (blocked) return blocked;
  try {
    const user = await requireSessionUser();
    const body = await parseJsonBody<{ sessionId?: unknown }>(request);
    if (typeof body?.sessionId !== 'string') return jsonError('Sesion no valida.', 400);
    return jsonOk(await expireOwnedSession(body.sessionId, user.userId));
  } catch (error) { return paymentError(error); }
}
