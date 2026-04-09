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
  jwtSecret: () => getEnvValue('JWT_SECRET'),
  stripeSecretKey: () => getOptionalEnvValue('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: () => getOptionalEnvValue('STRIPE_WEBHOOK_SECRET'),
  appUrl: () => getOptionalEnvValue('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000',
  isProduction: () => process.env.NODE_ENV === 'production',
};
