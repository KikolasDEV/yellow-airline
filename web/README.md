# Yellow Airline · Next.js

Aplicación unificada para Vercel: interfaz, autenticación con cookie HttpOnly, vuelos, reservas,
asientos persistidos, Stripe Checkout/webhook, estados de compra verificados y PDF con QR.

**No ejecutar migraciones ni reemplazar producción sin seguir
[el runbook](../docs/migration-to-vercel.md).**

## Local

Node 22. Copiar `.env.example` a `.env.local` y usar PostgreSQL y Stripe test independientes.
Configurar explícitamente APP_ENV, APP_URL y ambas conexiones de base de datos.

```powershell
npm ci
npm run check:env
$env:MIGRATION_APPROVED = 'true'
npm run db:migrate:deploy
npm run dev
```

Flags desactivados por defecto. Tras configurar el webhook test, habilitar conscientemente
WRITES_ENABLED, PAYMENTS_ENABLED y SETTLEMENTS_ENABLED. `.env.local` también se carga en scripts Prisma.
No hay migraciones ni seeds en el build.

## Calidad

`npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:e2e`.
Integración local PostgreSQL: `npm run test:integration` con TEST_DATABASE_URL explícita.
Ver [testing](../docs/testing.md).

## Despliegue

Root `web`, Next.js, Node 22, install `npm ci`, build `npm run build`, sin output override.
Base PostgreSQL mediante Vercel Marketplace. Cron diario de conciliación protegido por CRON_SECRET.
Staging y producción separados; Railway se retira solo después del cambio y conciliación.
