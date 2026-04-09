# Vercel Staging For `web/`

## Objetivo

Levantar un entorno de staging aislado para la nueva app Next.js en `web/` sin tocar:

- el frontend legacy en `client/`
- el backend legacy en `server/`
- Railway como red de seguridad
- la base de datos productiva actual

## Configuración del proyecto en Vercel

Crear un proyecto nuevo en Vercel apuntando a este repositorio con estas opciones:

- `Framework Preset`: `Next.js`
- `Root Directory`: `web`
- `Install Command`: `npm install`
- `Build Command`: `npm run build`

Notas:

- `web/vercel.json` ya fija `framework`, `installCommand` y `buildCommand`
- `postinstall` ejecuta `prisma generate` automaticamente durante la instalacion
- no usar este proyecto para reemplazar produccion todavia

## Base de datos

Crear una PostgreSQL nueva para staging.

Opciones recomendadas:

1. `Vercel Postgres`
2. `Neon` enlazado a Vercel
3. otra PostgreSQL externa separada del entorno legacy

No reutilizar la `DATABASE_URL` actual de Railway mientras la migracion siga en curso.

## Variables de entorno

Configurar en Vercel estas variables para el entorno de `Preview` y, si quieres, tambien `Development`:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Valores recomendados:

- `DATABASE_URL`: cadena de la nueva base PostgreSQL de staging
- `JWT_SECRET`: secreto nuevo y distinto al del sistema legacy
- `NEXT_PUBLIC_APP_URL`: URL preview o dominio de staging de Vercel
- `STRIPE_SECRET_KEY`: clave de Stripe en modo test
- `STRIPE_WEBHOOK_SECRET`: signing secret del webhook de Stripe en modo test

## Orden recomendado de puesta en marcha

1. Crear proyecto en Vercel con `Root Directory = web`
2. Añadir variables de entorno de staging
3. Lanzar primer deploy
4. Aplicar migraciones sobre la base de staging
5. Seedear la base de staging si hace falta
6. Validar login, vuelos, reservas y checkout
7. Crear webhook de Stripe apuntando al entorno de staging

Checklist operativo exacto:

- `docs/vercel-staging-checklist.md`

## Migraciones y seed

Vercel no ofrece un `start command` persistente como Railway, así que no conviene meter migraciones automáticas destructivas en cada build.

Flujo recomendado desde local, apuntando a la `DATABASE_URL` de staging:

```bash
cd web
npm install
npm run db:migrate:deploy
npm run db:seed
```

Si prefieres no seedear siempre:

- ejecuta `npm run db:seed` solo en la primera inicializacion de staging
- despues usa solo `npm run db:migrate:deploy`

## Stripe en staging

Crear un endpoint de webhook en Stripe test mode usando la URL preview o el dominio asignado al staging:

```txt
https://<tu-staging>.vercel.app/api/payments/webhook
```

Evento minimo:

```txt
checkout.session.completed
```

Guardar el `Signing secret` en `STRIPE_WEBHOOK_SECRET` dentro de Vercel.

## Validación mínima después del primer deploy

Comprobar:

- `/` carga correctamente
- `/login` funciona con cookie
- `/vip` registra usuarios en la base de staging
- `/api/flights` devuelve vuelos
- `/my-bookings` responde con 401 sin sesion y con datos con sesion
- checkout crea una session de Stripe en test mode
- webhook puede persistir reservas pagadas en la base de staging

## Qué no hacer todavía

- no apagar Railway
- no cambiar el webhook productivo de Stripe
- no cambiar dominios de produccion
- no borrar `client/` ni `server/`
- no apuntar la app legacy a la base de staging nueva

## Paso siguiente cuando staging esté validado

Cuando `web/` cubra correctamente auth, bookings y Stripe en staging:

1. preparar dominio final en Vercel
2. migrar la base definitiva
3. actualizar webhook productivo de Stripe
4. hacer cutover controlado
5. mantener Railway unas semanas como rollback
