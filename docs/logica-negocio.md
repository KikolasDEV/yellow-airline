# Lógica de Negocio

## Objetivo

Describir las reglas funcionales reales del proyecto en su estado actual.

## Entidades principales

### Usuario

- nombre
- email
- pasaporte
- password hash
- `isVip`

### Vuelo

- origen
- destino
- hora de salida
- precio base
- precio final
- capacidad
- plazas disponibles

### Reserva

- usuario
- vuelo
- adultos
- niños
- infantes
- precio base y final
- moneda
- estado
- referencia
- stripe session id

## Reglas principales

### 1. Búsqueda de vuelos

- Se puede buscar por origen y destino.
- Los resultados se ordenan por salida ascendente.
- El backend devuelve datos enriquecidos: `basePrice`, `finalPrice`, `availableSeats`, `occupancyRate`, `urgencyFactor`.

### 2. Pricing dinámico

El precio final no es fijo. Depende de:

- precio base
- ocupación
- cercanía temporal de la salida

La fuente de verdad del pricing es el backend.

### 3. Capacidad

- adultos ocupan asiento
- niños ocupan asiento
- infantes no ocupan asiento

Solo las reservas `PAID` cuentan para capacidad real.

### 4. Duplicidad

Un usuario no puede reservar el mismo vuelo dos veces.

### 5. Registro y login

- email único
- contraseña almacenada con hash
- login devuelve JWT válido

### 6. Reserva

Flujo real:

1. usuario autenticado elige vuelo
2. selecciona pasajeros y asientos
3. backend valida duplicados y capacidad
4. backend crea Stripe Checkout Session
5. usuario paga en Stripe
6. Stripe llama al webhook
7. backend crea reserva `PAID`

### 7. Boarding pass

Las reservas pagadas pueden descargar un PDF con:

- referencia
- ruta
- salida
- pasajeros
- precio pagado
- QR

El QR debe usar una referencia segura y no datos sensibles.

## Qué hace cada capa

### Frontend

- muestra datos
- captura inputs
- guía el flujo de búsqueda y reserva

### Backend

- valida reglas
- calcula pricing
- controla capacidad
- crea checkout sessions
- persiste reservas tras webhook

### Base de datos

- usuarios
- vuelos
- reservas
- constraints de integridad
