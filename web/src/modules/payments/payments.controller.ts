import { requireSessionUser } from '@/middleware/auth';
import { mutationGuard, rateLimit } from '@/lib/request-security';
import { parseJsonBody, PayloadTooLargeError, readBoundedBody } from '@/utils/http';
import { jsonError, jsonOk } from '@/utils/responses';
import { checkoutSessionSchema } from './payments.schemas';
import { CheckoutError, createCheckoutSession, handleStripeWebhook } from './payments.service';

export const paymentError = (error: unknown) => {
  if (error instanceof CheckoutError) {
    if (error.status >= 500) console.error('checkout_operation_failed', { status: error.status, reason: error.message });
    return jsonError(error.message, error.status);
  }
  if (error instanceof Error && error.message === 'UNAUTHORIZED') return jsonError('Inicia sesion para continuar.', 401);
  console.error('payment_operation_failed', { type: error instanceof Error ? error.name : 'unknown' });
  return jsonError('No se pudo completar la operacion. No repitas el pago si ya se realizo.', 503);
};

export const checkoutSessionController = async (request: Request) => {
  const blocked = mutationGuard(request);
  if (blocked) return blocked;
  try {
    const user = await requireSessionUser();
    if (!await rateLimit('checkout', String(user.userId), 20)) return jsonError('Demasiados intentos.', 429);
    const body = checkoutSessionSchema.safeParse(await parseJsonBody(request));
    if (!body.success) return jsonError('Revisa pasajeros y asientos.', 400);
    return jsonOk(await createCheckoutSession({ ...body.data, userId: user.userId }), { status: 201 });
  } catch (error) { return paymentError(error); }
};

export const webhookController = async (request: Request) => {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return jsonError('Firma de Stripe invalida.', 400);
  if (Number(request.headers.get('content-length') ?? 0) > 1048576) return jsonError('Payload demasiado grande.', 413);
  try {
    // Never parse/re-serialize the body before signature verification.
    return jsonOk(await handleStripeWebhook(await readBoundedBody(request, 1048576), signature));
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return jsonError('Payload demasiado grande.', 413);
    return paymentError(error);
  }
};
