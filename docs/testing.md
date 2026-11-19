# Testing

Node.js 22. Ejecutar comandos dentro de cada aplicación; no existe runner raíz.

## web/

```powershell
npm ci
npm run lint
npm run test:unit
npm run build
npx playwright install chromium
npm run test:e2e
```

- Unitarios: reglas de precios/asientos, totales legacy, validación de pasajeros, CSRF, límites de
  cuerpo y separación de audiencias JWT.
- Playwright: servidor Next de producción en 3100, búsqueda/selección/envío de asientos,
  estado de compra verificado, idioma persistente y descarga PDF. Las API están mockeadas.
- Playwright no prueba entrega real de Stripe ni una base remota.
- Los tests `api-guards.spec.ts` sí llaman handlers HTTP reales para probar rechazo de origen,
  mantenimiento, firma ausente y acceso al cron, sin necesitar credenciales de base de datos.

## Integración PostgreSQL

Crear una base **local, aislada, con nombre terminado en `_test`**. No usar recursos productivos.
Preparar su esquema con las migraciones de `web/`, siguiendo los controles de entorno y aprobación
del runbook. Alternativamente, los pasos exactos están automatizados en el job `web` de CI.

```powershell
$env:TEST_DATABASE_URL = 'postgresql://test:local-only@127.0.0.1:5432/yellow_airline_test'
npm run test:integration
```

Se ejecutan bloqueos y transacciones reales en PostgreSQL. Solo se mockea el límite del SDK Stripe.
Cobertura: competencia por asientos/capacidad, doble clic, entrega duplicada concurrente, importes
inconsistentes, retenciones, expiración confirmada, aislamiento de entorno, reservas históricas,
timeout al crear sesión/idempotencia, propiedad de compra, firma inválida, bcrypt y rate limit atómico.
La suite rechaza hosts remotos y no toma DATABASE_URL como destino implícito. Borra solo sus fixtures.

Tests concretos:
```powershell
npm run test:unit -- src/lib/checkout.test.ts
npm run test:integration -- -t "serializes"
npm run test:e2e -- journey.spec.ts
```

## Legacy

En client/: `npm run lint`, `npm run build`, `npm run test:unit`, `npm run test:e2e`.
En server/: `npm run lint`, `npm run build`, `npm run test:unit`.
Sus E2E usan mocks de red, no un backend real.
Para validar server sin modificar dist/ versionado:
`npm run build -- --outDir <directorio-temporal-dedicado>`.

## CI

El job web instala con npm ci, ejecuta lint/unitarios, migra PostgreSQL local de CI, prueba
integración, build, E2E y auditoría runtime. Los jobs legacy siguen activos durante la transición.

## Validación manual obligatoria

Una compra Stripe sandbox real, entrega/reenvío del webhook, cancelación/expiración, PDF y
restauración de datos deben pasar antes del cambio. Seguir `docs/migration-to-vercel.md`.
