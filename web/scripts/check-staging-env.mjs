import { checkEnvironment } from './environment.mjs';

try {
  checkEnvironment('staging');
  console.log('Variables de staging validas. Esto no prueba aislamiento ni conectividad: verifica los recursos en los paneles.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
