import { spawnSync } from 'node:child_process';
import { checkEnvironment } from './environment.mjs';

try {
  checkEnvironment();
  if (process.env.MIGRATION_APPROVED !== 'true') throw new Error('Confirma el destino y usa MIGRATION_APPROVED=true.');
  if (process.env.APP_ENV === 'production' && process.env.MIGRATION_BACKUP_CONFIRMED !== 'true') {
    throw new Error('Produccion requiere backup restaurable: MIGRATION_BACKUP_CONFIRMED=true.');
  }
  const result = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} catch (error) { console.error(error.message); process.exitCode = 1; }
