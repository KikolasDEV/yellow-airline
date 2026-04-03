# Deploy Guide

## Scope

Este proyecto se despliega en dos plataformas:

- `server/` en Railway
- `client/` en Vercel

El frontend usa `VITE_API_URL` y hace fallback local a `http://localhost:5000/api` en desarrollo.

## URLs de produccion actuales

- Frontend: `https://yellow-airline.vercel.app`
- Backend: `https://yellow-airline-production.up.railway.app`

## Requisitos previos

- Repositorio actualizado en GitHub
- Cuenta en Railway
- Cuenta en Vercel
- Cuenta en Stripe
- Base de datos PostgreSQL creada en Railway

## Deploy del backend en Railway

### 1. Crear el servicio

1. Entrar al proyecto en Railway.
2. Crear un nuevo servicio desde GitHub Repo.
3. Seleccionar este repositorio.
4. Configurar `Root Directory` como `server`.

### 2. Configurar settings del servicio

Usar estos valores:

- `Root Directory`: `server`
- `Build Command`: `npm install && npx prisma generate && npm run build`
- `Start Command`: `npm run db:deploy && npm run start`
- `Pre-deploy Command`: vacio
- `Region`: Europa, preferiblemente la mas cercana
- `Replicas`: `1`

### 3. Variables de entorno del backend

Crear estas variables en Railway sin comillas:

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NODE_ENV=production`
- `NPM_CONFIG_PRODUCTION=false`

Notas:

- `DATABASE_URL` debe ser la URL de PostgreSQL de Railway, no la local.
- `CLIENT_URL` debe ser la URL publica de Vercel.
- `STRIPE_WEBHOOK_SECRET` debe salir del webhook de produccion o test segun el entorno de Stripe usado.
- No usar comillas en Railway.

### 4. Generar dominio publico del backend

1. Entrar al servicio en Railway.
2. Generar dominio publico.
3. Cuando Railway pida el puerto interno, usar el puerto donde la app esta escuchando, por ejemplo `8080` si ese es el detectado por Railway.
4. Usar despues la URL publica sin `:8080`.

Ejemplo:

- Correcto: `https://yellow-airline-production.up.railway.app`
- Incorrecto: `https://yellow-airline-production.up.railway.app:8080`

### 5. Aplicar migraciones

El comando de arranque ya ejecuta:

```bash
npm run db:deploy && npm run start
```

Con eso Railway aplica las migraciones al arrancar.

### 6. Seed inicial de la base de datos

La base de datos de produccion puede arrancar vacia. Para insertar vuelos iniciales:

1. Cambiar temporalmente el `Start Command` a:

```bash
npm run db:deploy && npm run db:seed && npm run start
```

2. Hacer redeploy.
3. Esperar a que el servicio quede online.
4. Comprobar que `GET /api/flights` devuelve datos.
5. Restaurar inmediatamente el `Start Command` original:

```bash
npm run db:deploy && npm run start
```

6. Hacer redeploy de nuevo.

Importante:

- `server/prisma/seed.ts` borra datos antes de insertar.
- No dejar `db:seed` en el `Start Command` de forma permanente.

## Webhook de Stripe

### 1. Crear endpoint

En Stripe, crear un webhook con esta URL:

```txt
https://yellow-airline-production.up.railway.app/api/payments/webhook
```

Escuchar al menos este evento:

```txt
checkout.session.completed
```

### 2. Guardar signing secret

1. Copiar el `Signing secret` que empieza por `whsec_`.
2. Pegar ese valor en Railway como `STRIPE_WEBHOOK_SECRET`.
3. Redeploy del backend si hace falta.

Nota:

- No asumir que el `STRIPE_WEBHOOK_SECRET` local sirve para produccion.
- Cada endpoint de webhook tiene su propio `whsec_...`.

## Deploy del frontend en Vercel

### 1. Importar el repositorio

Importar este repo desde GitHub en Vercel.

### 2. Configuracion de build

Usar estos valores:

- `Application Preset`: `Vite`
- `Root Directory`: `client`
- `Install Command`: `npm install`
- `Build Command`: `npm run build`
- `Output Directory`: `dist`

### 3. Variables de entorno del frontend

Crear estas variables en Vercel sin comillas:

- `VITE_API_URL=https://yellow-airline-production.up.railway.app/api`
- `VITE_STRIPE_PUBLISHABLE_KEY=<pk_test_o_pk_live>`

Notas:

- Las variables `VITE_*` son publicas en el frontend.
- Nunca poner `STRIPE_SECRET_KEY` en Vercel.

### 4. Asociar frontend y backend

Cuando Vercel genere o confirme la URL final del frontend, actualizar `CLIENT_URL` en Railway.

Valor esperado actual:

```txt
https://yellow-airline.vercel.app
```

Esto es necesario para:

- CORS
- `success_url` de Stripe
- `cancel_url` de Stripe

## Comprobaciones post-deploy

### Backend

Comprobar:

```txt
https://yellow-airline-production.up.railway.app/
```

Debe responder algo como:

```txt
Yellow Airline API - Despegando...
```

Comprobar tambien:

```txt
https://yellow-airline-production.up.railway.app/api/flights
```

### Frontend

Comprobar:

```txt
https://yellow-airline.vercel.app
```

Pruebas recomendadas:

1. Registro de usuario
2. Login
3. Carga de vuelos
4. Busqueda por origen y destino
5. Inicio de checkout

## Problemas reales encontrados y solucion

### `tsc: Permission denied` en Railway

Problema:

```txt
sh: 1: tsc: Permission denied
```

Solucion aplicada en `server/package.json`:

```json
"build": "node ./node_modules/typescript/bin/tsc"
```

### `spawn tsx EACCES` al seedear

Problema:

```txt
Error: Command failed with EACCES: tsx prisma/seed.ts
```

Solucion aplicada en `server/package.json`:

```json
"prisma": {
  "seed": "node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts"
}
```

### Dependencias de desarrollo no instaladas en Railway

Problema:

- `prisma`, `tsx` y `typescript` estan en `devDependencies`
- Railway puede omitirlas en produccion

Solucion:

```txt
NPM_CONFIG_PRODUCTION=false
```

### Frontend apuntando a `localhost`

Problema:

- El frontend no podia funcionar en produccion si usaba `http://localhost:5000/api`

Solucion aplicada:

- Nuevo archivo `client/src/lib/api.ts`
- Uso de `VITE_API_URL` en produccion
- Fallback local para desarrollo

### La API devolvia `[]`

Problema:

- La base de datos de Railway estaba vacia

Solucion:

- Ejecutar una vez el seed inicial con `npm run db:seed`

### Buscar `Tokyo` no encontraba el vuelo

Problema:

- En la semilla el destino esta guardado como `Tokio`
- El usuario podia buscar `Tokyo`

Solucion aplicada:

- Normalizacion de nombres de ciudad en `client/src/lib/places.ts`

## Resumen rapido

### Railway

- `Root Directory`: `server`
- `Build Command`: `npm install && npx prisma generate && npm run build`
- `Start Command`: `npm run db:deploy && npm run start`
- Variable extra obligatoria: `NPM_CONFIG_PRODUCTION=false`

### Vercel

- `Root Directory`: `client`
- `Build Command`: `npm run build`
- `Output Directory`: `dist`
- `VITE_API_URL`: URL del backend + `/api`
