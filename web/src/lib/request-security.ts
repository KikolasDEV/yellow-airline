import { createHash } from 'node:crypto';
import { env } from './env';
import { prisma } from './prisma';
import { jsonError } from '@/utils/responses';

export const isSameOrigin = (request: Request) => {
  try {
    return request.headers.get('origin') === env.appUrl()
      && request.headers.get('sec-fetch-site') !== 'cross-site';
  } catch {
    return false;
  }
};

export const mutationGuard = (request: Request) => {
  if (!isSameOrigin(request)) return jsonError('Origen no permitido.', 403);
  if (!env.writesEnabled()) return jsonError('Mantenimiento: las operaciones estan pausadas.', 503);
  return null;
};

// Database-backed, shared across serverless instances; never an in-memory Map.
export const rateLimit = async (scope: string, identity: string, limit: number, seconds = 600) => {
  const now = Date.now();
  const window = Math.floor(now / (seconds * 1000));
  const key = createHash('sha256').update(`${scope}:${identity}:${window}`).digest('hex');
  const result = await prisma.rateLimitBucket.upsert({
    where: { key },
    create: { key, count: 1, expiresAt: new Date((window + 1) * seconds * 1000) },
    update: { count: { increment: 1 } },
  });
  return result.count <= limit;
};

export const requestIdentity = (request: Request) => {
  // Vercel overwrites this header; do not trust arbitrary forwarded headers outside Vercel.
  return process.env.VERCEL === '1'
    ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    : 'local';
};
