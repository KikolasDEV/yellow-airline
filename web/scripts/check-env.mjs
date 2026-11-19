import { checkEnvironment } from './environment.mjs';

try {
  checkEnvironment();
  console.log('Variables validas. Verifica aislamiento, conectividad y backups por separado.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
