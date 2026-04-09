const requiredVariables = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

const placeholderPatterns = [
  'replace_me',
  'replace-with',
  'example',
  'user:password@host',
  'localhost:3000',
];

const getMissingVariables = () => {
  return requiredVariables.filter((name) => {
    const value = process.env[name]?.trim();
    return !value;
  });
};

const getPlaceholderVariables = () => {
  return requiredVariables.filter((name) => {
    const value = process.env[name]?.trim().toLowerCase();

    if (!value) {
      return false;
    }

    return placeholderPatterns.some((pattern) => value.includes(pattern));
  });
};

const getUnsafeVariables = () => {
  const issues = [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().toLowerCase();
  const databaseUrl = process.env.DATABASE_URL?.trim().toLowerCase();

  if (appUrl?.includes('railway.app')) {
    issues.push('NEXT_PUBLIC_APP_URL no debe apuntar a Railway para el staging de web/.');
  }

  if (databaseUrl?.includes('railway.app')) {
    issues.push('DATABASE_URL no debe reutilizar la base legacy servida desde Railway.');
  }

  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    issues.push('STRIPE_SECRET_KEY deberia ser una clave de test en staging.');
  }

  return issues;
};

const missingVariables = getMissingVariables();
const placeholderVariables = getPlaceholderVariables();
const unsafeIssues = getUnsafeVariables();

if (missingVariables.length > 0) {
  console.error('Faltan variables requeridas para staging:');
  for (const variable of missingVariables) {
    console.error(`- ${variable}`);
  }
  process.exit(1);
}

if (placeholderVariables.length > 0) {
  console.error('Hay variables con valores placeholder que deben reemplazarse:');
  for (const variable of placeholderVariables) {
    console.error(`- ${variable}`);
  }
  process.exit(1);
}

if (unsafeIssues.length > 0) {
  console.error('Se detectaron configuraciones inseguras para staging:');
  for (const issue of unsafeIssues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log('Variables de staging validadas correctamente.');
