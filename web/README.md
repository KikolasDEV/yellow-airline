# Yellow Airline Web

Nueva app unificada en Next.js para migrar gradualmente el proyecto desde `client/` + `server/` hacia una sola aplicacion desplegable en Vercel.

## Estado

- `web/` es la nueva base tecnica
- `client/` y `server/` siguen siendo el sistema legacy estable
- Railway se mantiene activo como red de seguridad durante la transicion
- la nueva app debe usar una base PostgreSQL de staging separada

## Variables de entorno

Copia `web/.env.example` a `web/.env.local` y rellena los valores.

Variables requeridas:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Importante:

- no reutilizar la base productiva actual del backend legacy mientras seguimos migrando
- usar claves de Stripe de pruebas para staging
- usar un `JWT_SECRET` distinto al del sistema legacy

## Desarrollo local

```bash
cd web
npm install
npm run db:generate
npm run dev
```

App local:

- `http://localhost:3000`

## Base de datos de staging

Flujo recomendado:

```bash
cd web
npm run db:migrate:dev
npm run db:seed
```

Para aplicar migraciones en un entorno desplegado:

```bash
cd web
npm run db:migrate:deploy
```

## Validacion minima

```bash
cd web
npm run lint
npm run build
```

## Transicion segura

Mientras `web/` no cubra auth, bookings y Stripe de punta a punta:

- no apagar Railway
- no cambiar el webhook productivo de Stripe
- no eliminar `client/` ni `server/`
- no apuntar produccion a la nueva app como unica fuente de verdad

## Vercel staging

La guia operativa para crear el entorno de staging de `web/` en Vercel esta en:

- `docs/vercel-staging-web.md`
- `docs/vercel-staging-checklist.md`

Comando util para validar variables reales de staging antes del deploy o antes de aplicar migraciones:

```bash
cd web
npm run check:staging-env
```
