# Yellow Airline

<p align="center">
  <strong>Plataforma full stack de reservas de vuelos con experiencia premium, pagos con Stripe y arquitectura moderna separada en frontend y backend.</strong>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?logo=react">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Base%20de%20datos-4169E1?logo=postgresql&logoColor=white">
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-Pagos-635BFF?logo=stripe&logoColor=white">
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white">
</p>

## ✨ Resumen

**Yellow Airline** es una aplicación web de reservas de vuelos orientada a simular un producto real: búsqueda de vuelos, autenticación, experiencia VIP, selección de asientos, pago con Stripe, panel de reservas y automatización de calidad y releases.

No está planteado como una simple demo visual. El proyecto incluye muchas de las piezas que suelen aparecer en productos profesionales:

- Interfaz moderna y responsive
- Backend con reglas de negocio reales
- Base de datos relacional
- Autenticación con JWT
- Pagos con webhook
- Tests automáticos
- CI/CD
- Versionado automático

## 🚀 Qué permite hacer

- Buscar vuelos por **origen** y **destino**.
- Ver **precios dinámicos** según ocupación y urgencia.
- Registrarse e iniciar sesión.
- Acceder a una experiencia **VIP** dedicada.
- Configurar una reserva con **pasajeros** y **asientos**.
- Pagar mediante **Stripe Checkout**.
- Crear la reserva real tras confirmación por **webhook**.
- Consultar `My Bookings`.
- Descargar un **boarding pass en PDF con QR**.
- Usar la app en **español e inglés**.
- Alternar entre **tema claro y oscuro**.

## 🧱 Arquitectura

```text
yellow-airline/
  client/   -> SPA en React + Vite + TypeScript
  server/   -> API REST en Express + Prisma + PostgreSQL
  docs/     -> PRD, lógica de negocio, testing y versionado
  .github/  -> workflows de CI, seguridad y releases
```

### Frontend

- `React 19` + `Vite`
- `TypeScript`
- `Tailwind CSS`
- `Framer Motion`
- `i18next`
- `react-hook-form` + `Zod`

### Backend

- `Express 5`
- `Prisma`
- `PostgreSQL`
- `JWT`
- `bcrypt`
- `Stripe`

## 🔄 Flujo principal del producto

```text
Home -> Buscar vuelos -> Elegir vuelo -> Personalizar reserva -> Stripe Checkout
-> Webhook de Stripe -> Crear reserva pagada -> My Bookings -> Boarding pass
```

### Reglas importantes

- Un usuario no puede reservar dos veces el mismo vuelo.
- Adultos y niños consumen asiento; infantes no.
- Solo las reservas `PAID` cuentan para ocupación real.
- El precio final depende de precio base, ocupación y cercanía de salida.
- La reserva definitiva se crea en backend tras el webhook, no desde el frontend.

## 🛠️ Stack técnico

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- react-hook-form
- Zod
- i18next
- Vitest
- Playwright

### Backend

- Express 5
- Prisma
- PostgreSQL
- bcrypt
- JWT
- Stripe
- Vitest

### Tooling

- ESLint
- GitHub Actions
- Release Please

## 📦 Puesta en marcha local

### 1. Instalar dependencias

```bash
cd client && npm install
cd server && npm install
```

### 2. Variables de entorno

#### Backend (`server/.env`)

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### Frontend (`client/.env.local`)

- `VITE_STRIPE_PUBLISHABLE_KEY`

### 3. Poblar la base de datos

```bash
cd server && npx prisma db seed
```

### 4. Levantar el proyecto

En dos terminales distintas:

```bash
cd server && npm run dev
cd client && npm run dev
```

### URLs locales

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 🧪 Testing

El proyecto ya cuenta con una base de testing automatizado funcional:

- **Unit tests frontend** con `Vitest`
- **Unit tests backend** con `Vitest`
- **E2E frontend** con `Playwright`

### Flujos E2E cubiertos

- Render de vuelos en Home
- Login
- Reserva autenticada
- Carga de `My Bookings`

### Comandos útiles

#### Frontend

```bash
cd client && npm run lint
cd client && npm run build
cd client && npm run test:unit
cd client && npm run test:e2e
cd client && npm run test
```

#### Backend

```bash
cd server && npm run lint
cd server && npm run build
cd server && npm run test:unit
cd server && npm run test
```

## ⚙️ CI/CD y releases

### CI

Workflow: `.github/workflows/ci.yml`

Valida en PRs a `main`:

- lint
- build
- unit tests
- E2E frontend

### Seguridad

Workflow: `.github/workflows/security.yml`

Lanza una revisión automatizada de seguridad sobre PRs.

### Versionado automático

Workflow: `.github/workflows/release-please.yml`

El proyecto usa **Release Please** con separación por componente:

- `client`
- `server`

Archivos clave:

- `release-please-client-config.json`
- `release-please-server-config.json`
- `.release-please-manifest-client.json`
- `.release-please-manifest-server.json`

## 📝 Convención de commits

Se recomienda usar **Conventional Commits**:

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` documentación
- `test:` tests
- `refactor:` refactor interno
- `ci:` cambios en pipelines
- `chore:` mantenimiento

Ejemplos:

```text
feat: add multilingual booking flow
fix: restore e2e compatibility
docs: update project documentation
ci: split release-please by component
```

## 📚 Documentación adicional

En `docs/` encontrarás documentación más detallada sobre:

- `docs/PRD.md`
- `docs/logica-negocio.md`
- `docs/testing.md`
- `docs/versionado.md`

## ✅ Puntos fuertes del proyecto

- Arquitectura clara de frontend y backend.
- Flujo de pago correctamente modelado con webhook.
- UI responsive, multidioma y con identidad visual fuerte.
- Reglas de negocio explícitas y testeables.
- Base técnica suficientemente seria para seguir creciendo.

## 🔭 Siguientes mejoras lógicas

- Endurecer aún más la seguridad del backend
- Ampliar cobertura de tests backend
- Centralizar mejor el acceso API en frontend
- Evolucionar la propuesta VIP hacia beneficios funcionales más claros
- Añadir herramientas administrativas si el producto crece

## 👀 Estado del repositorio

Yellow Airline ya está por encima de un MVP básico. Tiene una base sólida de producto, arquitectura y automatización, pensada para seguir evolucionando sin necesidad de rehacerlo desde cero.