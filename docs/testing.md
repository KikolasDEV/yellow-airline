# Testing en Yellow Airline

## Objetivo

Separar las pruebas por responsabilidad para que la CI sea rapida, mantenible y util.

## Tipos de prueba

### Unit testing

Herramienta: `Vitest`

Sirve para probar logica pura, sin navegador ni backend real.

Casos ideales en este proyecto:

- calculo de precios
- validaciones de pasajeros
- reglas de ocupacion
- transformaciones de datos

Casos implementados ahora:

- `client/src/lib/pricing.test.ts`
- valida que el total de reserva nunca sea negativo
- valida que extras negativos no reduzcan el total por debajo de cero
- `server/src/lib/bookingRules.test.ts`
- valida calculo de asientos solicitados y ocupados
- valida regla de duplicados
- valida regla de capacidad disponible

### E2E testing

Herramienta: `Playwright`

Sirve para probar la aplicacion desde el punto de vista del usuario.

Casos ideales en este proyecto:

- cargar la home y ver vuelos
- buscar por origen y destino
- iniciar sesion
- reservar un vuelo
- consultar `My Bookings`

Casos implementados ahora:

- `client/e2e/home.spec.ts`
- mockea `GET /api/flights`
- abre la home
- verifica que el vuelo se renderiza y que la CTA de reserva aparece
- `client/e2e/login.spec.ts`
- realiza login con API mockeada y verifica persistencia de token
- `client/e2e/booking-authenticated.spec.ts`
- valida flujo de reserva autenticada con seleccion de asiento
- `client/e2e/my-bookings.spec.ts`
- valida carga de reservas del usuario autenticado

## Por que no TestSprite para esta base

TestSprite es util para exploracion y generacion asistida de tests, pero no sustituye bien una base estable de CI dentro del repo.

Para este proyecto, la mejor base permanente es:

- `Vitest` para unit tests
- `Playwright` para E2E
- GitHub Actions para ejecutar todo en cada push

## Comandos

```bash
cd client && npm run test:unit
cd client && npm run test:e2e
cd client && npm run test
cd server && npm run test:unit
cd server && npm run test
```
