# Deploy Guide

## Resumen

Este proyecto se despliega en dos plataformas:

- `client/` en Vercel
- `server/` en Railway

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

### Seed inicial

Si la base de datos arranca vacía:

1. Cambiar temporalmente el `Start Command` a:

```bash
npm run db:deploy && npm run db:seed && npm run start
```

2. Redeploy.
3. Verificar que `/api/flights` devuelve datos.
4. Restaurar el `Start Command` original.

Nota: el seed actual borra datos antes de volver a insertarlos.

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
