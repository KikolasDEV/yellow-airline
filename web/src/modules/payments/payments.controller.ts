import { requireSessionUser } from '@/middleware/auth';
import { parseJsonBody } from '@/utils/http';
import { jsonError, jsonOk } from '@/utils/responses';
import { checkoutSessionSchema } from './payments.schemas';
import { createCheckoutSession, handleStripeWebhook } from './payments.service';

export const checkoutSessionController = async (request: Request) => {
  const body = await parseJsonBody<unknown>(request);
  const parsedBody = checkoutSessionSchema.safeParse(body);

  if (!parsedBody.success) {
    return jsonError('Invalid checkout payload.', 400, parsedBody.error.flatten());
  }

  try {
    const sessionUser = await requireSessionUser();
    const result = await createCheckoutSession({
      ...parsedBody.data,
      userId: sessionUser.userId,
    });

    if ('error' in result && typeof result.error === 'string') {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return jsonError('Acceso denegado. No hay sesion activa.', 401);
    }

    return jsonError('Error al iniciar el checkout con Stripe.', 500);
  }
};

export const webhookController = async (request: Request) => {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return jsonError('Firma de Stripe invalida.', 400);
  }

  try {
    const rawBody = await request.text();
    const result = await handleStripeWebhook(rawBody, signature);

    if ('error' in result && typeof result.error === 'string') {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result);
  } catch {
    return jsonError('Error al procesar webhook de Stripe.', 500);
  }
};
