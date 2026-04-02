# Testing en Yellow Airline

## Objetivo

Mantener una base de calidad clara y util para el proyecto.

La estrategia actual separa las pruebas por nivel de responsabilidad para evitar dos errores comunes:

- probar demasiado poco y romper flujos importantes
- intentar probarlo todo con E2E y volver el proyecto lento y fragil

## Estado actual

El proyecto ya tiene testing automatizado funcionando en `main`.

### Frontend

- unit tests con `Vitest`
- E2E con `Playwright`

### Backend

- unit tests con `Vitest`

### CI

GitHub Actions ejecuta:

- frontend lint
- frontend build
- frontend unit tests
- frontend E2E
- backend lint
- backend build
- backend unit tests

## Tipos de prueba

## 1. Unit testing

Herramienta: `Vitest`

Sirve para probar lógica pura sin navegador ni backend real.

### Qué se prueba bien con unit tests en este proyecto

- cálculo de precios
- reglas de ocupación y capacidad
- validaciones de pasajeros
- helpers puros

### Casos implementados ahora

#### Frontend

- `client/src/lib/pricing.test.ts`

Valida, entre otras cosas:

- que el total de reserva no quede por debajo de cero
- que extras negativos no generen un total inválido

#### Backend

- `server/src/lib/bookingRules.test.ts`

Valida:

- cálculo de asientos solicitados
- cálculo de asientos ocupados
- prevención de duplicados
- validación de capacidad disponible

### Cuándo usar unit tests

Úsalos cuando la lógica:

- no depende del DOM
- no depende del navegador
- no necesita levantar toda la app
- puede expresarse como función pura

## 2. E2E testing

Herramienta: `Playwright`

Sirve para probar la app como lo haría un usuario real.

### Casos implementados ahora

- `client/e2e/home.spec.ts`
  - mockea `GET /api/flights`
  - abre la home
  - verifica renderizado de vuelo y CTA de reserva

- `client/e2e/login.spec.ts`
  - mockea login
  - hace login
  - verifica persistencia de token y nombre en localStorage

- `client/e2e/booking-authenticated.spec.ts`
  - mockea vuelos y checkout session
  - entra como usuario autenticado
  - abre el flujo de reserva
  - selecciona asiento
  - confirma paso a checkout

- `client/e2e/my-bookings.spec.ts`
  - mockea reservas del usuario
  - abre `My Bookings`
  - verifica contenido de reservas y CTA de boarding pass

### Cómo están planteados los E2E

Los tests E2E del frontend mockean endpoints con `page.route(...)`.

Eso significa que prueban bien:

- flujo de interfaz
- contratos frontend esperados
- navegación
- persistencia local

Pero no prueban el backend real end-to-end completo.

Eso es correcto para esta base, porque:

- hace la suite más rápida
- evita dependencia fuerte de entornos externos
- concentra los E2E en la UX y el contrato visible

## 3. Qué no está cubierto aún

Aunque la base actual ya es buena, todavía no está todo cubierto.

Faltan o podrían ampliarse:

- tests unitarios de más helpers frontend
- tests unitarios de pricing backend
- tests de rutas backend con mocks de Prisma/Stripe
- tests E2E de cambio de idioma
- tests E2E del flujo VIP
- tests E2E del estado `cancel`
- tests E2E del flujo completo con backend real y Stripe simulado a nivel servidor

## Comandos actuales

### Frontend

```bash
cd client && npm run test:unit
cd client && npm run test:e2e
cd client && npm run test
```

### Backend

```bash
cd server && npm run test:unit
cd server && npm run test
```

## Integración en CI

Workflow: `.github/workflows/ci.yml`

### Se ejecuta en

- `pull_request` hacia `main`

### Qué hace

#### Job `client`

1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. `npm run test:unit`
5. instala navegador Playwright
6. `npm run test:e2e`

#### Job `server`

1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. `npm run test:unit`

## Recomendación práctica para trabajar

### Si tocas solo frontend visual

Como mínimo:

- `cd client && npm run lint`
- `cd client && npm run build`

### Si tocas lógica de frontend o flujos

Además:

- `cd client && npm run test:unit`
- `cd client && npm run test:e2e`

### Si tocas backend

Como mínimo:

- `cd server && npm run build`
- `cd server && npm run test:unit`

### Si tocas contrato frontend-backend

Debes validar ambos lados.

## Decisión importante del proyecto

No se ha usado TestSprite como base permanente de testing del repo.

### Por qué

TestSprite puede ayudar a explorar o generar casos, pero la base estable del proyecto debe vivir dentro del propio código y CI.

La base permanente actual es:

- `Vitest` para lógica
- `Playwright` para UX y flujos clave
- `GitHub Actions` para automatización

## Resumen

La estrategia actual de testing del proyecto ya es válida y útil para un producto de este tamaño porque:

- separa niveles de prueba
- protege flujos críticos
- está integrada en CI
- no depende de pruebas manuales para lo básico

La mejora futura no pasa por cambiar de estrategia, sino por ampliar cobertura de forma ordenada.
