# Deploy Guide

> Esta página describe el sistema **legacy**. Para el nuevo despliegue y el cambio productivo,
> seguir [migration-to-vercel.md](migration-to-vercel.md).

## Resumen

Este proyecto se despliega en dos plataformas:

- `client/` en Vercel
- `server/` en Railway

Nota de transicion:

- la nueva app unificada vive en `web/`
- su guia de staging en Vercel esta en `docs/vercel-staging-web.md`
- esta guia sigue describiendo el despliegue legacy actual

URLs de producción actuales:

- Frontend: `https://yellow-airline.vercel.app`
- Backend: `https://yellow-airline-production.up.railway.app`

## Variables de entorno

### Backend (`server`)

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NODE_ENV=production`
- `NPM_CONFIG_PRODUCTION=false`

### Frontend (`client`)

- `VITE_API_URL=https://yellow-airline-production.up.railway.app/api`
- `VITE_STRIPE_PUBLISHABLE_KEY=<pk_test_o_pk_live>`

## Railway: backend

### Configuración recomendada

- `Root Directory`: `server`
- `Build Command`: `npm install && npx prisma generate && npm run build`
- `Start Command`: `npm run db:deploy && npm run start`
- `Region`: una región europea cercana
- `Replicas`: `1`

### Seeds y mantenimiento

No ejecutar seeds durante el arranque. Los seeds nuevos son no destructivos y requieren
entorno no productivo explícito y ALLOW_DEMO_SEED=true. Para producción se restauran datos,
no se generan fixtures.

Controles nuevos del legacy:
- `LEGACY_WRITES_ENABLED=false` bloquea registro, checkout y CRUD durante el cambio.
- `LEGACY_WEBHOOK_ENABLED=false` pausa confirmaciones legacy con 503 para conservar reintentos Stripe.
- `FLIGHT_ADMIN_TOKEN` (mínimo 32 caracteres) es obligatorio para CRUD de vuelos.
- El webhook legacy ignora compras etiquetadas de Next.js.

Estos flags necesitan redeploy y no reemplazan el drenaje/conciliación de pagos abiertos.

### Dominio público

Generar dominio público en Railway y usar la URL sin añadir `:8080` manualmente.

Ejemplo correcto:

```txt
https://yellow-airline-production.up.railway.app
```

## Stripe webhook

Crear endpoint en Stripe:

```txt
https://yellow-airline-production.up.railway.app/api/payments/webhook
```

Evento mínimo:

```txt
checkout.session.completed
```

Guardar el `Signing secret` como `STRIPE_WEBHOOK_SECRET` en Railway.

## Vercel: frontend

### Configuración recomendada

- `Application Preset`: `Vite`
- `Root Directory`: `client`
- `Install Command`: `npm install`
- `Build Command`: `npm run build`
- `Output Directory`: `dist`

### Conexión frontend/backend

Cuando Vercel confirme la URL final del frontend, actualizar en Railway:

```txt
CLIENT_URL=https://yellow-airline.vercel.app
```

Esto afecta a:

- CORS
- `success_url` de Stripe
- `cancel_url` de Stripe

## Problemas ya resueltos

### `tsc: Permission denied` en Railway

Solución aplicada en `server/package.json`:

```json
"build": "node ./node_modules/typescript/bin/tsc"
```

### `spawn tsx EACCES` al seedear

Solución aplicada:

```json
"prisma": {
  "seed": "node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts"
}
```

### Dependencias de desarrollo omitidas en Railway

Solución:

```txt
NPM_CONFIG_PRODUCTION=false
```

### Frontend apuntando a `localhost`

Solución:

- `client/src/lib/api.ts`
- `VITE_API_URL` en producción
- fallback local solo para desarrollo

## Verificación rápida post-deploy

### Backend

- `GET /`
- `GET /api/flights`

### Frontend

- Home carga correctamente
- registro y login
- búsqueda de vuelos
- apertura de checkout
- `My Bookings`
