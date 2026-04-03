# Yellow Airline

<p>
  <strong>Aplicación full stack de reservas de vuelos con búsqueda interactiva, autenticación, pagos con Stripe y despliegue real en producción.</strong>
</p>

<p align="center">
  <a href="https://yellow-airline.vercel.app">Ver demo</a>
</p>

## 🌐 Demo

- Frontend: `https://yellow-airline.vercel.app`
- Backend: `https://yellow-airline-production.up.railway.app`

## 🚀 Lo Más Relevante

- Búsqueda de vuelos por origen, destino y fecha.
- Calendario interactivo con resultados rápidos y reservas desde la propia búsqueda.
- Registro, login y persistencia de sesión con JWT.
- Flujo VIP dedicado.
- Selección de pasajeros y asientos antes del pago.
- Integración con Stripe Checkout y webhook.
- Panel `My Bookings` con boarding pass en PDF y QR.
- Soporte bilingüe `es/en` y tema claro/oscuro.
- Despliegue separado en Vercel y Railway.

## 🧰 Stack

### 🔹 Frontend

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_4-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)
![i18next](https://img.shields.io/badge/i18next-26AAE1?style=for-the-badge&logo=i18next&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)

### 🔹 Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-121212?style=for-the-badge)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

### 🔹 DevOps y Calidad

![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Release Please](https://img.shields.io/badge/Release_Please-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

## 🤖 Desarrollo Asistido por IA

Gran parte del desarrollo de Yellow Airline se ha realizado con asistencia de IA usando `OpenCode`, aprovechando flujos de trabajo con agentes, skills y herramientas conectadas para acelerar tareas de implementación, revisión, documentación y automatización.

La IA se ha utilizado como apoyo de ingeniería, no como sustituto del criterio técnico. La arquitectura, las decisiones de integración, la validación de cambios, el despliegue y la resolución de incidencias se han revisado y ajustado manualmente durante el proceso.

## 🏗️ Arquitectura

```text
yellow-airline/
  client/   SPA en React + Vite
  server/   API REST en Express + Prisma
  docs/     documentación funcional y operativa
```

## ✨ Funcionalidades

- Buscar vuelos por origen, destino y fecha.
- Consultar tarifas con precio base, precio final y disponibilidad.
- Registrarse e iniciar sesión.
- Acceder a una experiencia VIP dedicada.
- Seleccionar pasajeros y asientos antes de pagar.
- Iniciar checkout con Stripe.
- Persistir reservas tras `checkout.session.completed`.
- Consultar reservas propias desde `My Bookings`.
- Descargar boarding pass en PDF con QR.

## 🔄 Flujo Principal

```text
Home -> Buscar vuelo -> Reservar -> Personalizar -> Stripe Checkout
-> Webhook -> Reserva PAID -> My Bookings -> Boarding pass PDF
```

## ⚙️ Puesta En Marcha Local

### 1. Instalar dependencias

```bash
cd client && npm install
cd server && npm install
```

### 2. Variables de entorno

#### Backend: `server/.env`

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### Frontend: `client/.env.local`

- `VITE_API_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY`

### 3. Base de datos y seed

```bash
cd server && npm run db:seed
```

> Nota: el seed actual elimina e inserta datos de nuevo. Úsalo con cuidado fuera de desarrollo.

### 4. Ejecutar el proyecto

En dos terminales distintas:

```bash
cd server && npm run dev
cd client && npm run dev
```

### URLs locales

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 🧪 Comandos Útiles

### Frontend

```bash
cd client && npm run dev
cd client && npm run lint
cd client && npm run build
cd client && npm run test:unit
cd client && npm run test:e2e
```

### Backend

```bash
cd server && npm run dev
cd server && npm run build
cd server && npm run test:unit
cd server && npm run db:deploy
cd server && npm run db:seed
```

## ✅ Calidad y CI

El repositorio incluye:

- lint y build en frontend y backend
- unit tests con Vitest
- E2E frontend con Playwright
- CI en PRs hacia `main`
- workflow de seguridad
- release automation con Release Please por componente

## 🚢 Despliegue

- `client/` en Vercel
- `server/` en Railway

La guía completa está en `docs/deploy-guide.md`.

## 📚 Documentación

- `docs/PRD.md`
- `docs/logica-negocio.md`
- `docs/testing.md`
- `docs/versionado.md`
- `docs/deploy-guide.md`

## 📌 Resumen

Yellow Airline reúne búsqueda, reserva, pago, post-compra y despliegue real en una misma base de código, con frontend y backend claramente separados y documentación operativa para entender el proyecto rápido.
