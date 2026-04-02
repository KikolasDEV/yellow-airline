# Yellow Airline

Yellow Airline es una plataforma web full stack para buscar vuelos, gestionar autenticacion de usuarios y crear reservas con una experiencia de cabina mas interactiva. El proyecto esta orientado a MVP real: arquitectura separada frontend/backend, reglas de negocio explicitas, CI automatizada y versionado continuo.

## Que resuelve el proyecto

- Permite buscar vuelos por origen y destino.
- Permite registrar e iniciar sesion de usuarios.
- Permite reservar vuelos siendo usuario autenticado.
- Evita reservas duplicadas para el mismo usuario y vuelo.
- Controla capacidad disponible para evitar sobreventa.
- Ofrece personalizacion de asientos con impacto en tarifa.
- Muestra el historial de reservas del usuario (`My Bookings`).

## Arquitectura

- `client/`: SPA en React 19 + Vite + TypeScript.
- `server/`: API REST en Express 5 + Prisma + PostgreSQL.
- `docs/`: PRD, logica de negocio, testing y versionado.
- `.github/workflows/`: CI y automatizaciones de release.

## Stack tecnologico

- Frontend: React, React Router, Tailwind, i18next, Framer Motion.
- Backend: Express, Prisma, JWT, bcrypt.
- Calidad: ESLint, Vitest, Playwright.
- CI/CD: GitHub Actions.
- Releases: Release Please.

## Flujo funcional principal

1. Usuario entra al buscador y consulta inventario de vuelos.
2. Si no esta autenticado, realiza login o registro.
3. Selecciona vuelo, configura pasajeros y asientos.
4. El backend valida reglas de duplicado/capacidad.
5. Se crea reserva y aparece en `My Bookings`.

## Reglas de negocio clave

- Un usuario no puede reservar dos veces el mismo vuelo.
- Adultos y ninos consumen asiento; infantes no.
- Si no hay capacidad, la reserva se rechaza.
- El total de pricing no debe ser negativo.

## Instalacion local

Instala dependencias en cada app:

```bash
cd client && npm install
cd server && npm install
```

Levanta backend y frontend en dos terminales:

```bash
cd server && npm run dev
cd client && npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Scripts utiles

Frontend:

```bash
cd client && npm run lint
cd client && npm run build
cd client && npm run test:unit
cd client && npm run test:e2e
cd client && npm run test
```

Backend:

```bash
cd server && npm run lint
cd server && npm run build
cd server && npm run test:unit
cd server && npm run test
```

## Testing actual

- Unit frontend: `client/src/lib/pricing.test.ts`.
- Unit backend: `server/src/lib/bookingRules.test.ts`.
- E2E frontend:
  - `client/e2e/home.spec.ts`
  - `client/e2e/login.spec.ts`
  - `client/e2e/booking-authenticated.spec.ts`
  - `client/e2e/my-bookings.spec.ts`

## CI/CD

En cada `push` y `pull_request`, `ci.yml` valida:

- `client`: install, lint, build, unit y E2E.
- `server`: install, lint, build y unit.

Archivo: `.github/workflows/ci.yml`.

## Versionado automatico (Release Please)

Release Please revisa commits en `main`, abre/actualiza PR de release y propone:

- bump de version (`client/package.json` y `server/package.json`)
- changelog automatico

Cuando mergeas esa PR de release, la version queda aplicada.

Archivos:

- `.github/workflows/release-please.yml`
- `release-please-config.json`
- `.release-please-manifest.json`

## Convencion de commits recomendada

Usa Conventional Commits para semver correcto:

- `feat:` nueva funcionalidad (minor)
- `fix:` correccion de bug (patch)
- `feat!:` o `BREAKING CHANGE:` cambio mayor (major)
- `docs:`, `test:`, `chore:`, `ci:` para mantenimiento

## Documentacion

- `docs/PRD.md`
- `docs/logica-negocio.md`
- `docs/testing.md`
- `docs/versionado.md`