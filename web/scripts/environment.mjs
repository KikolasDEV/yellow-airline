import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

export function checkEnvironment(expected = process.env.APP_ENV) {
  const required = ['DATABASE_URL', 'DIRECT_URL', 'JWT_SECRET', 'APP_URL', 'APP_ENV', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'CRON_SECRET'];
  const errors = [];
  for (const key of required) {
    const value = process.env[key]?.trim();
    if (!value || /replace[_-]|example|user:password@/i.test(value)) errors.push(`${key}: ausente o placeholder`);
  }
  if (!['development', 'test', 'staging', 'production'].includes(process.env.APP_ENV)) errors.push('APP_ENV no valido');
  if (expected !== process.env.APP_ENV) errors.push(`APP_ENV debe ser ${expected}`);
  if ((process.env.JWT_SECRET?.length ?? 0) < 32) errors.push('JWT_SECRET: minimo 32 caracteres');
  if ((process.env.CRON_SECRET?.length ?? 0) < 32) errors.push('CRON_SECRET: minimo 32 caracteres');
  try {
    const app = new URL(process.env.APP_URL);
    if (!['http:', 'https:'].includes(app.protocol)) errors.push('APP_URL debe usar HTTP/HTTPS');
    if (app.pathname !== '/' || app.search || app.hash || app.username || app.password) errors.push('APP_URL debe ser un origen');
    if (['staging', 'production'].includes(process.env.APP_ENV) && app.protocol !== 'https:') errors.push('APP_URL debe usar HTTPS');
    const db = new URL(process.env.DATABASE_URL);
    const direct = new URL(process.env.DIRECT_URL);
    if (!['postgres:', 'postgresql:'].includes(db.protocol) || !['postgres:', 'postgresql:'].includes(direct.protocol)) errors.push('PostgreSQL requerido');
    if (db.pathname !== direct.pathname) errors.push('DATABASE_URL y DIRECT_URL deben usar la misma base');
    if (process.env.APP_ENV === 'staging' && /railway/i.test(db.hostname)) errors.push('Staging no debe usar Railway legacy');
    const secureModes = ['require', 'verify-ca', 'verify-full'];
    if (['staging', 'production'].includes(process.env.APP_ENV)
      && (!secureModes.includes(db.searchParams.get('sslmode')) || !secureModes.includes(direct.searchParams.get('sslmode')))) {
      errors.push('Ambas conexiones remotas requieren sslmode=require, verify-ca o verify-full');
    }
  } catch { errors.push('URL de aplicacion o base de datos no valida'); }
  const keyPrefix = process.env.APP_ENV === 'production' ? 'sk_live_' : 'sk_test_';
  if (!process.env.STRIPE_SECRET_KEY?.startsWith(keyPrefix)) errors.push(`Stripe debe usar ${keyPrefix}`);
  if (!process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) errors.push('STRIPE_WEBHOOK_SECRET no valido');
  for (const flag of ['WRITES_ENABLED', 'PAYMENTS_ENABLED', 'SETTLEMENTS_ENABLED']) {
    if (!['true', 'false'].includes(process.env[flag])) errors.push(`${flag} debe ser true o false`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
}
