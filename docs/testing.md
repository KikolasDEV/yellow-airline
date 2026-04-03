# Testing

## Estado actual

La estrategia de testing combina unit tests y E2E:

### Frontend

- Unit tests con `Vitest`
- E2E con `Playwright`

### Backend

- Unit tests con `Vitest`

### CI

En PRs a `main`, GitHub Actions ejecuta:

- frontend lint
- frontend build
- frontend unit tests
- frontend E2E
- backend lint
- backend build
- backend unit tests

## Tests existentes

### Frontend

- `client/src/lib/pricing.test.ts`
- `client/e2e/home.spec.ts`
- `client/e2e/login.spec.ts`
- `client/e2e/booking-authenticated.spec.ts`
- `client/e2e/my-bookings.spec.ts`

### Backend

- `server/src/lib/bookingRules.test.ts`

## Qué cubren

### Unit tests

Prueban lógica pura:

- pricing
- cálculo de asientos
- prevención de duplicados
- capacidad disponible

### E2E

Prueban flujos visibles de usuario:

- render de home
- login
- flujo de reserva autenticada
- carga de `My Bookings`

Los E2E del frontend usan mocks de red con `page.route(...)`, así que validan UX y contrato esperado sin depender del backend real.

## Comandos

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

## Recomendación práctica

### Si tocas UI frontend

- `cd client && npm run lint`
- `cd client && npm run build`

### Si tocas lógica o flujos frontend

- `cd client && npm run test:unit`
- `cd client && npm run test:e2e`

### Si tocas backend

- `cd server && npm run build`
- `cd server && npm run test:unit`
