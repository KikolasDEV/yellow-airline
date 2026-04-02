# Logica de Negocio de Yellow Airline

## Objetivo

Explicar las reglas funcionales reales del proyecto en su estado actual.

Este documento no describe solo ideas. Describe lo que el sistema ya hace hoy y qué reglas importantes gobiernan su comportamiento.

## 1. Qué resuelve el producto hoy

El producto permite:

- buscar vuelos
- aplicar filtros por origen y destino
- registrarse e iniciar sesión
- mantener usuarios VIP
- reservar vuelos con autenticación
- configurar pasajeros y asientos antes del pago
- pagar mediante Stripe Checkout
- crear la reserva tras confirmación de pago
- consultar reservas propias
- generar boarding pass PDF con QR

## 2. Entidades principales del dominio

## Usuario

Representa a una persona que puede:

- registrarse
- iniciar sesión
- reservar vuelos
- consultar sus reservas

Campos importantes:

- nombre
- email
- pasaporte
- password hash
- `isVip`

## Vuelo

Representa un trayecto reservable.

Campos importantes:

- origen
- destino
- hora de salida
- precio base
- capacidad

## Reserva

Representa una compra real asociada a un usuario y a un vuelo.

Campos importantes:

- usuario
- vuelo
- adultos
- niños
- infantes
- precio base y final
- moneda
- estado
- referencia de reserva
- stripe session id

## 3. Reglas principales de negocio

## 3.1 Búsqueda de vuelos

El sistema permite buscar por:

- origen
- destino

Los resultados se devuelven ordenados por fecha de salida ascendente.

Además, el backend devuelve información enriquecida para cada vuelo:

- `basePrice`
- `finalPrice`
- `availableSeats`
- `occupancyRate`
- `urgencyFactor`

## 3.2 Pricing dinámico

El precio final no es simplemente el precio base.

Se calcula según:

- precio base del vuelo
- ocupación del vuelo
- cercanía temporal de la salida

### Fórmula conceptual

```text
PrecioFinal = PrecioBase * (1 + Ocupacion) * FactorUrgencia
```

### Cómo se interpreta

- un vuelo más lleno puede costar más
- un vuelo más cercano a la salida puede costar más

### Regla importante

La fuente de verdad del pricing es el backend, no el frontend.

## 3.3 Ocupación y capacidad

No todos los pasajeros cuentan igual para capacidad.

### Regla actual

- adultos ocupan asiento
- niños ocupan asiento
- infantes no ocupan asiento

### Otra regla importante

Solo las reservas con estado `PAID` cuentan para ocupación real.

Eso evita bloquear plazas por intentos de compra no completados.

## 3.4 Duplicidad de reservas

Un usuario no puede reservar el mismo vuelo dos veces.

Esta regla se aplica en backend y además existe soporte a nivel de datos con constraint único.

## 3.5 Registro y autenticación

### Registro

El usuario puede registrarse con:

- nombre
- email
- pasaporte
- contraseña

Reglas:

- el email debe ser único
- la contraseña se almacena con hash

### Login

El backend devuelve un JWT válido al autenticarse correctamente.

El frontend usa ese token para acceder a las rutas privadas.

## 3.6 Segmentación VIP

El proyecto ya incluye experiencia VIP en frontend y soporte de `isVip` en backend.

Hoy el producto usa la propuesta VIP como elemento de marca y de experiencia, pero aún no explota al máximo beneficios exclusivos avanzados a nivel funcional.

## 3.7 Flujo de reserva actual

El flujo correcto actual es:

1. usuario autenticado elige un vuelo
2. frontend abre panel de personalización
3. usuario selecciona pasajeros
4. usuario selecciona asientos
5. frontend pide `checkout-session`
6. backend valida duplicados, capacidad y pricing
7. backend crea Stripe Checkout Session
8. usuario paga en Stripe
9. Stripe notifica al webhook
10. backend crea la reserva `PAID`

## 3.8 Creación real de la reserva

La reserva real no la crea directamente el frontend.

La crea el backend tras recibir `checkout.session.completed` desde Stripe.

Esta es una regla de negocio y de arquitectura crítica porque evita inconsistencias entre “intento de pago” y “reserva confirmada”.

## 3.9 Estados de reserva

El modelo contempla estados como:

- `PENDING`
- `PAID`
- `FAILED`
- `CANCELLED`

Hoy el caso principal operativo del proyecto es `PAID` tras el webhook completado correctamente.

## 3.10 Boarding pass en PDF

Una vez la reserva está pagada, el usuario puede descargar un boarding pass.

El PDF incluye información como:

- referencia de reserva
- ruta
- fecha de salida
- pasajeros
- precio pagado
- estado
- QR

### Regla importante

El QR no debe incluir datos personales sensibles. La recomendación actual es usar la referencia de reserva.

## 4. Qué hace cada capa del sistema en estas reglas

## Frontend

Se encarga de:

- mostrar datos
- recoger entradas del usuario
- aplicar validaciones de UX
- redirigir al flujo de pago

## Backend

Se encarga de:

- validar reglas reales
- calcular pricing
- validar capacidad
- validar duplicados
- crear sesiones de pago
- crear reservas tras confirmación de Stripe

## Base de datos

Se encarga de:

- persistir usuarios, vuelos y reservas
- garantizar integridad mediante constraints

## 5. Estado actual frente a versiones anteriores

Este proyecto ya no está en la fase descrita por documentos antiguos donde:

- no había pagos online
- no había selección de asientos
- no existía boarding pass
- la reserva se creaba directamente sin Stripe

Todo eso ya quedó superado.

Hoy el producto ya tiene implementado:

- pricing dinámico
- Stripe Checkout
- webhook
- selección de asientos
- boarding pass PDF con QR
- reservas persistidas tras pago real en modo test

## 6. Riesgos y limitaciones actuales

Aunque la base funcional es buena, todavía hay áreas mejorables:

- el secreto JWT aún tiene fallback por defecto en código
- no hay panel administrativo completo de vuelos
- la propuesta VIP puede reforzarse con beneficios funcionales más claros
- la cobertura de tests puede ampliarse aún más
- el cliente API frontend todavía no está totalmente centralizado

## 7. Roadmap lógico recomendado

### Fase siguiente razonable

- reforzar seguridad y configuración de entorno
- ampliar cobertura de tests backend y frontend
- hacer más explícitos beneficios VIP reales
- añadir herramientas administrativas si el producto evoluciona

### Fase futura

- analítica
- operaciones internas
- comunicaciones transaccionales
- monitorización
- escalado de flujos de producto

## 8. Resumen

La lógica de negocio actual de Yellow Airline ya no es la de un MVP mínimo básico. El sistema ya integra:

- descubrimiento de vuelos
- pricing dinámico
- autenticación
- reserva autenticada
- pago real en modo test con Stripe
- creación de reserva tras webhook
- consulta de reservas
- boarding pass en PDF

La clave conceptual más importante del sistema es esta:

> el frontend guía la experiencia, pero el backend mantiene la verdad del negocio.
