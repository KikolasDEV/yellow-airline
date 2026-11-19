import { requireSessionUser } from '@/middleware/auth';
import { getOwnedSession } from '@/modules/payments/payments.service';
import { paymentError } from '@/modules/payments/payments.controller';
import { jsonOk } from '@/utils/responses';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const id = new URL(request.url).searchParams.get('session_id') ?? '';
    return jsonOk(await getOwnedSession(id, user.userId));
  } catch (error) { return paymentError(error); }
}
