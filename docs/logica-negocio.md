# Lógica de negocio avanzada

## Objetivo
Implementar tres capacidades clave en Yellow Airline:

1. Precios dinámicos según ocupación y urgencia
2. Pago real en modo test con Stripe Checkout
3. Generación de boarding pass en PDF con código QR

## Estado actual del proyecto

### Frontend
- `client/src/pages/Home.tsx`
  - Busca vuelos con `GET /api/flights`
- `client/src/components/FlightCard.tsx`
  - Reserva directamente con `POST /api/bookings`
- `client/src/pages/MyBookings.tsx`
  - Lista reservas del usuario autenticado
- `client/src/types/index.ts`
  - Tiene tipos desalineados con el backend actual

### Backend
- `server/src/routes/flightRoutes.ts`
  - Devuelve vuelos desde Prisma con el precio base
- `server/src/routes/bookingRoutes.ts`
  - Valida duplicados y capacidad
  - Crea la reserva sin flujo de pago
- `server/prisma/schema.prisma`
  - `Flight` tiene `price` base y `capacity`
  - `Booking` no guarda snapshot de precio ni estado de pago
- `server/src/index.ts`
  - Usa `express.json()` global, lo que requiere ajuste para webhooks de Stripe

## Requerimiento 1: Precios dinámicos

### Regla
Precio final:

`PrecioFinal = PrecioBase * (1 + CapacidadOcupacion) * FactorUrgencia`

### Definiciones
- `PrecioBase`: `flight.price`
- `CapacidadOcupacion`: `occupiedSeats / capacity`
- `FactorUrgencia`: multiplicador según cercanía de la salida

### Propuesta de factores de urgencia
- Más de 14 días: `1.0`
- Entre 7 y 14 días: `1.08`
- Entre 3 y 7 días: `1.15`
- Entre 24 y 72 horas: `1.25`
- Menos de 24 horas: `1.4`

### Fuente de verdad
El cálculo debe vivir en el backend.

### Implementación propuesta
Crear una utilidad reutilizable en backend, por ejemplo:

- `server/src/lib/pricing.ts`

Responsabilidades:
- calcular asientos ocupados
- calcular tasa de ocupación
- calcular factor de urgencia
- devolver snapshot de pricing:
  - `basePrice`
  - `occupancyRate`
  - `urgencyFactor`
  - `finalPrice`
  - `availableSeats`

### Uso de esa lógica
- `GET /api/flights`
  - mostrar precio dinámico en búsqueda
- `POST /api/bookings/checkout-session`
  - recalcular el precio real antes de cobrar
- webhook de Stripe
  - usar los datos persistidos o recalcular solo para validación defensiva

## Requerimiento 2: Stripe Checkout en modo test

### Enfoque elegido
Usar `Stripe Checkout`.

### Motivo
- valida tarjetas reales de prueba
- reduce complejidad del formulario
- acelera la implementación
- es más robusto que embebido manual

### Flujo propuesto
1. Usuario elige vuelo y pasajeros
2. Frontend solicita sesión de checkout al backend
3. Backend valida:
   - token
   - duplicado
   - capacidad disponible
   - precio dinámico
4. Backend crea `Stripe Checkout Session`
5. Frontend redirige a Stripe
6. Stripe notifica por webhook
7. Backend crea la reserva confirmada
8. Usuario vuelve a la app
9. Puede ver la reserva en `My Bookings`
10. Puede descargar su boarding pass

### Endpoints nuevos
- `POST /api/bookings/checkout-session`
- `POST /api/payments/webhook`

### Datos a enviar en checkout
- `flightId`
- `adults`
- `children`
- `infants`

### Datos a persistir en la reserva
- `basePrice`
- `finalPrice`
- `currency`
- `status`
- `bookingReference`
- `stripeSessionId`

### Estados recomendados
- `PENDING`
- `PAID`
- `FAILED`
- `CANCELLED`

### Consideraciones del webhook
Stripe necesita acceso al body crudo en la ruta del webhook, por lo que `server/src/index.ts` debe ajustarse para esa ruta antes del `express.json()` global o manejarla de forma específica.

## Requerimiento 3: Boarding pass en PDF con QR

### Objetivo
Una vez confirmada la reserva, el usuario puede descargar una tarjeta de embarque en PDF.

### Ubicación ideal en UI
- `client/src/pages/MyBookings.tsx`

### Librerías propuestas
Frontend:
- `jspdf`
- `qrcode`

### Contenido del PDF
- nombre del pasajero o titular
- origen
- destino
- fecha y hora de salida
- localizador (`bookingReference`)
- identificador de reserva
- pasajeros
- precio pagado
- estado de confirmación
- QR generado dinámicamente

### Contenido del QR
Recomendación:
- usar solo `bookingReference`
- no incluir datos personales

### Condición de descarga
Mostrar botón solo si la reserva está `PAID` o confirmada.

## Cambios de modelo de datos

### Prisma: `Booking`
Agregar campos:
- `basePrice Float`
- `finalPrice Float`
- `currency String @default("eur")`
- `status String @default("PENDING")`
- `bookingReference String @unique`
- `stripeSessionId String?`

Opcionales si se quiere enriquecer el boarding pass:
- `seatNumber String?`
- `gate String?`
- `boardingGroup String?`

### Prisma: `Flight`
Mantener:
- `price` como precio base
- `capacity` como capacidad máxima

No es necesario guardar el precio dinámico en `Flight`.

## Cambios por archivo

### Backend

#### `server/prisma/schema.prisma`
- extender `Booking` con precio, estado y Stripe

#### `server/src/lib/pricing.ts`
- nueva utilidad para cálculo de pricing

#### `server/src/routes/flightRoutes.ts`
- devolver:
  - `basePrice`
  - `finalPrice`
  - `availableSeats`
  - `occupancyRate`

#### `server/src/routes/bookingRoutes.ts`
- añadir endpoint:
  - `POST /checkout-session`
- validar capacidad y duplicados antes de generar el checkout

#### `server/src/routes/paymentRoutes.ts` o equivalente
- nuevo webhook Stripe

#### `server/src/index.ts`
- registrar la ruta webhook con manejo correcto del body

### Frontend

#### `client/src/types/index.ts`
Corregir tipos:
- `id` debe ser `number`
- añadir:
  - `basePrice`
  - `finalPrice`
  - `availableSeats`
  - `occupancyRate`
- eliminar campos inexistentes como `number` si no se exponen realmente

#### `client/src/components/FlightCard.tsx`
- reemplazar reserva directa por inicio de checkout
- mostrar precio base y final
- mostrar disponibilidad real

#### `client/src/pages/MyBookings.tsx`
- mostrar estado de pago
- mostrar precio pagado
- añadir botón de descarga de boarding pass

#### Rutas frontend nuevas
- `success`
- `cancel`

## Variables de entorno necesarias

### Backend
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLIENT_URL`
- `JWT_SECRET`
- `DATABASE_URL`

### Frontend
- `VITE_STRIPE_PUBLISHABLE_KEY`

## Dependencias nuevas

### Backend
- `stripe`

### Frontend
- `@stripe/stripe-js`
- `jspdf`
- `qrcode`

## Reglas de negocio clave

1. El precio dinámico solo se calcula en backend.
2. El precio mostrado en frontend es informativo, pero el precio cobrado se recalcula antes de crear la sesión.
3. La reserva definitiva no se confirma antes del pago exitoso.
4. Debe guardarse snapshot del precio pagado en la reserva.
5. No se debe generar boarding pass para reservas no pagadas.
6. El QR no debe incluir datos sensibles.

## Riesgos detectados

1. Tipos frontend y backend desalineados
2. Reserva actual sin estado de pago
3. Posible duplicado si un webhook se procesa más de una vez
4. Inconsistencia si el precio se calcula en frontend
5. Webhook Stripe roto si no se maneja el raw body
6. `@@unique([userId, flightId])` limita reservas repetidas del mismo vuelo por usuario, lo cual hoy parece deseado

## Orden recomendado de implementación

1. Ajustar Prisma y tipos
2. Crear utilidad de pricing
3. Actualizar `GET /api/flights`
4. Crear checkout session
5. Implementar webhook Stripe
6. Actualizar `FlightCard`
7. Actualizar `MyBookings`
8. Implementar PDF con QR
9. Validar build y lint

## Validaciones previstas

### Frontend
- `npm run lint`
- `npm run build`

### Backend
- `npm run build`

### Prueba manual de Stripe
Tarjeta test:
- `4242 4242 4242 4242`

Fecha:
- cualquier fecha futura válida

CVC:
- cualquier 3 dígitos

## Resultado esperado
El usuario podrá:

1. Buscar vuelos con precio dinámico visible
2. Pagar una reserva con Stripe en modo test
3. Ver su reserva confirmada
4. Descargar su boarding pass en PDF con QR
