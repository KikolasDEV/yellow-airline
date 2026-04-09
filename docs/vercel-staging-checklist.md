# Vercel Staging Checklist For `web/`

## 1. Crear el proyecto

En Vercel:

1. `Add New...` -> `Project`
2. Importar este repositorio
3. Seleccionar la rama principal que estes usando para la migracion
4. Configurar:
   - `Framework Preset`: `Next.js`
   - `Root Directory`: `web`
   - `Install Command`: `npm install`
   - `Build Command`: `npm run build`
5. No conectar aun dominios de produccion

## 2. Crear la base PostgreSQL de staging

Opciones recomendadas:

1. `Storage` -> `Create Database` -> `Postgres`
2. O conectar una PostgreSQL externa nueva de staging

Regla:

- nunca reutilizar la base productiva del backend legacy

## 3. Configurar variables de entorno

En `Project` -> `Settings` -> `Environment Variables`, añadir:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Entornos recomendados:

- `Preview`
- `Development`

Valores:

- `DATABASE_URL`: URL de la base nueva de staging
- `JWT_SECRET`: secreto nuevo, no reutilizar legacy
- `NEXT_PUBLIC_APP_URL`: URL preview de Vercel o dominio de staging
- `STRIPE_SECRET_KEY`: clave `sk_test_...`
- `STRIPE_WEBHOOK_SECRET`: se completa despues de crear el webhook

## 4. Lanzar el primer deploy

1. Guardar variables
2. Ejecutar el deploy inicial
3. Esperar a que Vercel genere la URL preview
4. Actualizar `NEXT_PUBLIC_APP_URL` con esa URL si la pusiste temporalmente en blanco o con placeholder
5. Redeploy si cambiaste variables

## 5. Validar variables antes de migrar la base

Con las variables reales disponibles en local o en un shell temporal:

```bash
cd web
npm run check:staging-env
```

Este comando falla si:

- faltan variables
- quedan placeholders
- `NEXT_PUBLIC_APP_URL` apunta a Railway
- `DATABASE_URL` parece seguir apuntando al entorno legacy
- Stripe no usa una clave de test

## 6. Aplicar migraciones en la base de staging

Desde local, apuntando la shell a la `DATABASE_URL` nueva:

```bash
cd web
npm install
npm run db:migrate:deploy
npm run db:seed
```

Si la base ya fue sembrada antes:

```bash
cd web
npm run db:migrate:deploy
```

## 7. Crear webhook de Stripe para staging

En Stripe test mode:

1. `Developers` -> `Webhooks`
2. `Add endpoint`
3. URL:

```txt
https://<tu-staging>.vercel.app/api/payments/webhook
```

4. Evento minimo:

```txt
checkout.session.completed
```

5. Copiar el signing secret a `STRIPE_WEBHOOK_SECRET` en Vercel
6. Redeploy si actualizaste variables

## 8. Prueba funcional minima

Comprobar en staging:

1. `/` carga y muestra vuelos
2. `/vip` registra usuario en la base nueva
3. `/login` inicia sesion y crea cookie
4. `/my-bookings` responde con datos del usuario autenticado
5. checkout abre Stripe en test mode
6. el webhook persiste la reserva pagada
7. `/success` y `/cancel` funcionan

## 9. Lo que no se toca todavia

- Railway
- dominio final de produccion
- webhook productivo de Stripe
- `client/`
- `server/`

## 10. Señal para pasar a la fase siguiente

Solo cuando staging pase de forma estable:

1. auth
2. flights
3. bookings
4. checkout
5. webhook

entonces tiene sentido preparar el cutover a Vercel como plataforma unica.
