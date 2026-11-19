const getEnvValue = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getOptionalEnvValue = (name: string) => {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
};

export const env = {
  databaseUrl: () => getEnvValue('DATABASE_URL'),
  jwtSecret: () => {
    const value = getEnvValue('JWT_SECRET');
    if (value.length < 32 || /replace[_-]|example/i.test(value)) throw new Error('JWT_SECRET must be a non-placeholder secret of at least 32 characters');
    return value;
  },
  stripeSecretKey: () => getOptionalEnvValue('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: () => getOptionalEnvValue('STRIPE_WEBHOOK_SECRET'),
  appUrl: () => {
    const value = getOptionalEnvValue('APP_URL') ?? getOptionalEnvValue('NEXT_PUBLIC_APP_URL');
    if (!value && process.env.NODE_ENV === 'production') {
      throw new Error('APP_URL is required in production');
    }
    const url = new URL(value ?? 'http://localhost:3000');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('APP_URL must use HTTP/HTTPS');
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
      throw new Error('APP_URL must be an origin');
    }
    if ((['staging', 'production'].includes(process.env.APP_ENV ?? '') || process.env.VERCEL === '1') && url.protocol !== 'https:') {
      throw new Error('APP_URL must use HTTPS');
    }
    return url.origin;
  },
  environment: () => {
    const value = getEnvValue('APP_ENV');
    if (!['development', 'staging', 'production', 'test'].includes(value)) {
      throw new Error('Invalid APP_ENV');
    }
    return value;
  },
  paymentsEnabled: () => process.env.PAYMENTS_ENABLED === 'true',
  settlementsEnabled: () => process.env.SETTLEMENTS_ENABLED === 'true',
  writesEnabled: () => process.env.WRITES_ENABLED === 'true',
  isProduction: () => process.env.NODE_ENV === 'production',
};
